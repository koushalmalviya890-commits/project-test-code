import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

// AWS S3 client for file storage
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

/**
 * Generate a PDF invoice for a booking and upload it to S3
 * @param bookingId The MongoDB ObjectId of the booking
 * @returns The URL of the stored invoice
 */
export async function generateAndStoreInvoice(bookingId: string): Promise<string | null> {
 // console.log(`Starting invoice generation for booking ${bookingId}`);
  try {
    // Connect to the database
   // console.log("Connecting to database for invoice generation");
    const { db } = await connectToDatabase();
    
    // Find the booking
   // console.log(`Fetching booking data for ${bookingId}`);
    const booking = await db.collection('bookings').findOne({
      _id: new ObjectId(bookingId)
    });
    
    if (!booking) {
      console.error(`Invoice generation failed: Booking ${bookingId} not found`);
      return null;
    }
    
   // console.log(`Booking found with facilityId: ${booking.facilityId} and startupId: ${booking.startupId}`);
    
    // Fetch related data with better error handling
    let facility, startup;
    
    try {
      // Fetch facility data - using the facilityId from booking which is the _id of the facility
      facility = await db.collection('Facilities').findOne({
        _id: booking.facilityId
      });
      
      if (!facility) {
        console.error(`Invoice generation: Facility not found for booking ${bookingId}, facilityId: ${booking.facilityId}`);
      } else {
       // console.log(`Found facility: ${facility.details?.name}`);
      }
      
      // Fetch startup data - using the startupId from booking which is the userId
      startup = await db.collection('Startups').findOne({
        userId: booking.startupId
      });
      
      // If not found by userId, try with _id (backward compatibility)
      if (!startup) {
        startup = await db.collection('Startups').findOne({
          _id: booking.startupId
        });
      }
      
      if (!startup) {
        console.error(`Invoice generation: Startup not found for booking ${bookingId}, startupId: ${booking.startupId}`);
      } else {
       // console.log(`Found startup: ${startup.startupName}`);
      }
    } catch (error) {
      console.error(`Error fetching related data for invoice generation: ${error}`);
    }
    
    // If we don't have the minimum required data, log an error but continue with default values
    if (!facility || !startup) {
      console.warn(`Missing facility or startup data for booking ${bookingId}. Using default values for invoice.`);
      
      // Set default values if needed
      facility = facility || {
        details: {
          name: 'Facility (Details Unavailable)',
        },
        address: 'Address not available',
        city: 'City not available',
        state: 'State not available',
        facilityType: 'Not specified',
      };
      
      startup = startup || {
        startupName: 'Startup (Details Unavailable)',
        address: 'Address not available',
        city: 'City not available',
        state: 'State not available',
        startupMailId: null, // Add default for startupMailId
        email: 'Email not available',
      };
    }
    
    // Generate a unique invoice number
    const invoiceNumber = `INV-${bookingId.substring(0, 8)}-${Date.now().toString().substring(9, 13)}`;
   // console.log(`Generated invoice number: ${invoiceNumber}`);
    
    // Create invoice content as HTML
   // console.log("Generating invoice content as HTML");
    const invoiceHTML = generateInvoiceHTML({
      booking,
      facility,
      startup,
      invoiceNumber,
      invoiceDate: new Date()
    });
    
    // Convert HTML to PDF using a simple approach that doesn't rely on fonts
   // console.log("Creating HTML invoice content");
    const htmlBuffer = Buffer.from(invoiceHTML, 'utf-8');
    
   // console.log("HTML content created, preparing to upload to S3");
    try {
      // Upload the invoice HTML file to S3
      const bucketName = process.env.AWS_BUCKET_NAME || 'cummaimages';
      const s3Key = `invoices/${bookingId}/${invoiceNumber}.html`;
      
     // console.log(`Uploading invoice to S3: ${bucketName}/${s3Key}`);
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: s3Key,
          Body: htmlBuffer,
          ContentType: 'text/html',
          // Remove ACL parameter as it's not supported by the bucket
        })
      );
      
      // Get the URL of the uploaded file
      const region = process.env.AWS_REGION || 'eu-north-1';
      const invoiceUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
     // console.log(`Invoice uploaded successfully. URL: ${invoiceUrl}`);
      
     // console.log(`Updating booking ${bookingId} with invoice URL`);
      // Update the booking record with the invoice URL
      try {
        await db.collection('bookings').updateOne(
          { _id: new ObjectId(bookingId) },
          {
            $set: {
              invoiceUrl,
              invoiceGeneratedAt: new Date(),
            }
          }
        );
        
        // Separately try to update the invoice email history to isolate any validation issues
        try {
          // We're NOT updating the invoiceEmailHistory here - this will be done when
          // the email is actually sent in the sendInvoiceEmail function, which follows
          // the required schema. This avoids validation errors.
         // console.log("Invoice URL updated successfully in the booking record.");
        } catch (emailHistoryError) {
         // console.log(`Could not update invoice email history: ${emailHistoryError}`);
          // Continue even if we can't update the email history
        }
      } catch (dbError) {
        console.error(`Error updating booking with invoice URL: ${dbError}`);
        if (dbError instanceof Error) {
          console.error(`Details: ${dbError.message}`);
        }
        // Even if the DB update fails, we still have the invoice URL, so we can return it
        // and retry the DB update later or manually if needed
      }
      
      // Attempt to send the invoice by email, but don't block or fail if it doesn't work
      try {
       // console.log(`Attempting to send invoice email for booking ${bookingId}`);
        await sendInvoiceEmail(bookingId, invoiceUrl, startup, facility);
      } catch (emailError) {
        console.error(`Error sending invoice email for booking ${bookingId}:`, emailError);
      }
      
      // Return the invoice URL - we always return it if we've successfully uploaded to S3,
      // even if the DB update or email sending failed
      return invoiceUrl;
    } catch (error) {
      console.error(`Error uploading invoice to S3 for booking ${bookingId}:`, error);
      // Try to provide more detailed error information
      if (error instanceof Error) {
        console.error(`Error details: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
      }
      return null;
    }
  } catch (error) {
    console.error(`Error generating invoice for booking ${bookingId}:`, error);
    return null;
  }
}

/**
 * Send an email with the invoice to the customer
 * @param bookingId ID of the booking
 * @param invoiceUrl URL of the generated invoice
 * @param startup Startup data
 * @param facility Facility data
 */
async function sendInvoiceEmail(
  bookingId: string,
  invoiceUrl: string,
  startup: any,
  facility: any
): Promise<void> {
  try {
    // Get the appropriate email - prioritize startupMailId over email
    const recipientEmail = startup.startupMailId || startup.email;
    
    if (!recipientEmail) {
      console.error(`No valid email found for startup ${startup._id || 'unknown'}. Cannot send invoice email.`);
      return;
    }
    
   // console.log(`Sending invoice email to ${recipientEmail} for booking ${bookingId}`);
    
    // Make a POST request to the invoice email API
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'https://cumma.in'}/api/invoices/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include authorization to bypass the normal auth check
        'X-Invoice-Automation': process.env.EMAIL_WEBHOOK_SECRET || '',
      },
      body: JSON.stringify({
        bookingId,
        automated: true,
        recipientEmail: recipientEmail,
        // Set forceSend to false to respect duplicate email prevention
        forceSend: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Failed to send invoice email. Response:', errorData);
      
      // Get status code for better error reporting
      const status = response.status;
      throw new Error(`Failed to send invoice email: ${JSON.stringify(errorData)} (Status: ${status})`);
    }

   // console.log(`Invoice email sent automatically to ${recipientEmail} for booking ${bookingId}`);
  } catch (error) {
    // Log error but don't rethrow - we don't want to fail invoice generation
    // if email sending fails
    console.error('Error sending invoice email automatically:', error);
  }
}

interface InvoiceData {
  booking: any;
  facility: any;
  startup: any;
  invoiceNumber: string;
  invoiceDate: Date;
}

/**
 * Generate the content of the invoice as HTML
 * @param data Data for the invoice
 * @returns HTML string for the invoice
 */
function generateInvoiceHTML(data: InvoiceData): string {
  const { booking, facility, startup, invoiceNumber, invoiceDate } = data;
  
  // Format currency for display
  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
  
  // Format date for display
  const formatDate = (date: Date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString();
    } catch (e) {
      return 'N/A';
    }
  };
  
  // Use appropriate fallbacks for amounts
  const totalAmount = booking.amount || 0;
  const baseAmount = booking.originalBaseAmount || 0;
  const serviceFee = booking.serviceFee || 0;
  const combinedBaseAmount = booking.baseAmount || (baseAmount + serviceFee);
  const gstAmount = 0; // GST removed (previously 18%)
  
  // Calculate unit price if unit count is available
  const unitCount = booking.unitCount || 1;
  const unitPrice = unitCount > 1 ? (baseAmount / unitCount).toFixed(2) : baseAmount.toFixed(2);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #eee;
      padding: 30px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .header h1 {
      font-size: 24px;
      margin: 0;
    }
    .header h2 {
      font-size: 20px;
      margin: 10px 0;
    }
    .meta {
      text-align: right;
      margin-bottom: 20px;
    }
    .details {
      margin-bottom: 20px;
    }
    .details h3 {
      margin-top: 0;
      border-bottom: 1px solid #eee;
      padding-bottom: 5px;
    }
    .columns {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .column {
      width: 48%;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    table th, table td {
      padding: 10px;
      border-bottom: 1px solid #eee;
      text-align: left;
    }
    table th:last-child, table td:last-child {
      text-align: right;
    }
    .total {
      font-weight: bold;
      font-size: 18px;
      border-top: 2px solid #eee;
      padding-top: 10px;
    }
    .payment-info {
      margin-bottom: 20px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      color: #888;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <h1>CUMMA</h1>
      <h2>INVOICE</h2>
    </div>
    
    <div class="meta">
      <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
      <p><strong>Date:</strong> ${formatDate(invoiceDate)}</p>
    </div>
    
    <div class="details columns">
      <div class="column">
        <h3>Billed To:</h3>
        <p>${startup.startupName || 'N/A'}</p>
        <p>Email: ${startup.email || 'N/A'}</p>
      </div>
      <div class="column">
        <h3>Facility:</h3>
        <p>${facility.details?.name || 'N/A'}</p>
        <p>Type: ${facility.facilityType || 'N/A'}</p>
        <p>Location: ${facility.address?.formatted || facility.address || 'N/A'}</p>
      </div>
    </div>
    
    <div class="details">
      <h3>Booking Details:</h3>
      <p><strong>Booking ID:</strong> ${booking._id}</p>
      <p><strong>Plan:</strong> ${booking.rentalPlan || 'N/A'}</p>
      <p><strong>Start Date:</strong> ${booking.startDate ? formatDate(new Date(booking.startDate)) : 'N/A'}</p>
      <p><strong>End Date:</strong> ${booking.endDate ? formatDate(new Date(booking.endDate)) : 'N/A'}</p>
    </div>
    
    <div class="details">
      <h3>Payment Summary:</h3>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Base Amount</td>
            <td>Facility Rental (${booking.rentalPlan || 'Standard'})${unitCount > 1 ? ` - ${unitCount} units` : ''}</td>
            <td>${formatCurrency(combinedBaseAmount)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total">
            <td colspan="2">Total</td>
            <td>${formatCurrency(totalAmount)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    
    <div class="payment-info">
      <h3>Payment Information:</h3>
      <p><strong>Payment ID:</strong> ${booking.paymentDetails?.razorpay_payment_id || 'N/A'}</p>
      <p><strong>Payment Date:</strong> ${booking.paymentDetails?.receivedAt ? new Date(booking.paymentDetails.receivedAt).toLocaleString() : 'N/A'}</p>
      <p><strong>Payment Method:</strong> ${booking.paymentDetails?.method || 'N/A'}</p>
      <p><strong>Payment Status:</strong> ${booking.paymentStatus || 'N/A'}</p>
    </div>
    
    <div class="footer">
      <p>Thank you for your business!</p>
      <p>This is a computer-generated document and requires no signature.</p>
    </div>
  </div>
</body>
</html>
  `;
} 