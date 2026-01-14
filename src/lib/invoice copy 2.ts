// import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
// import { connectToDatabase } from './mongodb';
// import { ObjectId } from 'mongodb';
// import jsPDF from 'jspdf';

// // AWS S3 client for file storage
// const s3Client = new S3Client({
//   region: process.env.AWS_REGION || 'eu-north-1',
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
//   },
// });

// export async function generateAndStoreInvoice(bookingId: string): Promise<string | null> {
//  // console.log(`Starting invoice generation for booking ${bookingId}`);
//   try {
//     const { db } = await connectToDatabase();
//     const booking = await db.collection('bookings').findOne({ _id: new ObjectId(bookingId) });
//     if (!booking) return null;

//     let facility = await db.collection('Facilities').findOne({ _id: booking.facilityId });
//     let startup = await db.collection('Startups').findOne({ userId: booking.startupId }) || await db.collection('Startups').findOne({ _id: booking.startupId });
//     let serviceProviderUser = await db.collection('Users').findOne({ _id: new ObjectId(booking.incubatorId) });
//     const invoiceType = serviceProviderUser?.invoiceType || 'self';

//     if (!facility) facility = { _id: new ObjectId(), details: { name: 'N/A' }, address: 'N/A', city: 'N/A', state: 'N/A', facilityType: 'N/A' };
//     if (!startup) startup = { _id: new ObjectId(), startupName: 'N/A', address: 'N/A', city: 'N/A', state: 'N/A', startupMailId: null, email: 'N/A' };

//     const invoiceNumber = `INV-${bookingId.substring(0, 8)}-${Date.now().toString().substring(9, 13)}`;
//     const invoiceHTML = generateInvoiceHTML({ booking, facility, startup, invoiceNumber, invoiceDate: new Date(), invoiceType });
    
//     // Generate PDF from HTML
//     const pdfBuffer = await generatePDFFromHTML(invoiceHTML);
    
//     const bucketName = process.env.AWS_BUCKET_NAME || 'cummaimages';
//     const s3Key = `invoices/${bookingId}/${invoiceNumber}.pdf`;
    
//     // Upload PDF to S3
//     await s3Client.send(new PutObjectCommand({
//       Bucket: bucketName,
//       Key: s3Key,
//       Body: pdfBuffer,
//       ContentType: 'application/pdf',
//       ContentDisposition: `attachment; filename="${invoiceNumber}.pdf"`
//     }));

//     const region = process.env.AWS_REGION || 'eu-north-1';
//     const invoiceUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;

//     await db.collection('bookings').updateOne(
//       { _id: new ObjectId(bookingId) },
//       { $set: { invoiceUrl, invoiceGeneratedAt: new Date() } }
//     );

//     await sendInvoiceEmail(bookingId, invoiceUrl, startup, facility, invoiceType);

//     return invoiceUrl;
//   } catch (error) {
//     console.error(`Error generating invoice:`, error);
//     return null;
//   }
// }

// // Enhanced PDF generation with better formatting
// async function generatePDFFromHTML(html: string): Promise<Buffer> {
//   try {
//     const doc = new jsPDF();
    
//     // Extract data from the HTML (you can pass this data directly instead)
//     const invoiceData = parseHTMLData(html);
    
//     // Header
//     doc.setFontSize(24);
//     doc.setTextColor(40, 40, 40);
//     doc.text(invoiceData.type === 'cumma' ? 'CUMMA INVOICE' : 'SELF INVOICE', 20, 30);
    
//     // Invoice Details
//     doc.setFontSize(12);
//     doc.setTextColor(60, 60, 60);
//     doc.text(`Invoice Number: ${invoiceData.invoiceNumber}`, 20, 50);
//     doc.text(`Date: ${invoiceData.date}`, 20, 65);
//     doc.text(`Facility: ${invoiceData.facility}`, 20, 80);
//     doc.text(`Startup: ${invoiceData.startup}`, 20, 95);
    
//     // Table Header
//     doc.setFontSize(14);
//     doc.setTextColor(40, 40, 40);
//     doc.text('Payment Summary', 20, 120);
    
//     // Table
//     doc.setFontSize(11);
//     doc.setTextColor(60, 60, 60);
    
//     // Table headers
//     doc.text('Item', 20, 140);
//     doc.text('Description', 60, 140);
//     doc.text('Amount', 150, 140);
    
//     // Table line
//     doc.line(20, 145, 180, 145);
    
//     // Table content
//     doc.text('Base Amount', 20, 160);
//     doc.text(invoiceData.description, 60, 160);
//     doc.text(`₹${invoiceData.amount}`, 150, 160);
    
//     // Total line
//     doc.line(20, 170, 180, 170);
//     doc.setFontSize(12);
//     doc.setTextColor(40, 40, 40);
//     doc.text('Total', 20, 185);
//     doc.text(`₹${invoiceData.amount}`, 150, 185);
    
//     // Footer
//     doc.setFontSize(10);
//     doc.setTextColor(100, 100, 100);
//     doc.text(`This is a ${invoiceData.type === 'cumma' ? 'CUMMA' : 'Self'}-generated invoice.`, 20, 220);
    
//     return Buffer.from(doc.output('arraybuffer'));
//   } catch (error) {
//     console.error('Error generating PDF with jsPDF:', error);
//     throw error;
//   }
// }

// // Helper function to parse HTML data
// function parseHTMLData(html: string) {
//   return {
//     type: html.includes('CUMMA INVOICE') ? 'cumma' : 'self',
//     invoiceNumber: extractInvoiceNumber(html),
//     date: extractDate(html),
//     facility: extractFacility(html),
//     startup: extractStartup(html),
//     description: extractDescription(html),
//     amount: extractAmount(html)
//   };
// }

// function extractDate(html: string): string {
//   const match = html.match(/Date:<\/strong>\s*([^<]+)/);
//   return match ? match[1].trim() : new Date().toLocaleDateString();
// }

// function extractFacility(html: string): string {
//   const match = html.match(/Facility:<\/strong>\s*([^<]+)/);
//   return match ? match[1].trim() : 'N/A';
// }

// function extractStartup(html: string): string {
//   const match = html.match(/Startup:<\/strong>\s*([^<]+)/);
//   return match ? match[1].trim() : 'N/A';
// }

// function extractDescription(html: string): string {
//   const match = html.match(/Facility Rental \(([^)]+)\)/);
//   return match ? `Facility Rental (${match[1]})` : 'Facility Rental';
// }



// // Helper functions
// function extractInvoiceNumber(html: string): string {
//   const match = html.match(/Invoice Number:<\/strong>\s*([^<]+)/);
//   return match ? match[1].trim() : 'N/A';
// }

// function extractAmount(html: string): string {
//   const match = html.match(/₹([\d,]+\.?\d*)/);
//   return match ? match[1] : '0';
// }


// async function sendInvoiceEmail(bookingId: string, invoiceUrl: string, startup: any, facility: any, invoiceType: string): Promise<void> {
//   try {
//     const recipientEmail = startup.startupMailId || startup.email;
//     if (!recipientEmail) return;

//     const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/invoices/email`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-Invoice-Automation': process.env.EMAIL_WEBHOOK_SECRET || ''
//       },
//       body: JSON.stringify({ bookingId, automated: true, recipientEmail, forceSend: false, invoiceType })
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
//       console.error('Failed to send invoice email:', errorData);
//     }
//   } catch (error) {
//     console.error('Error sending invoice email automatically:', error);
//   }
// }

// interface InvoiceData {
//   booking: any;
//   facility: any;
//   startup: any;
//   invoiceNumber: string;
//   invoiceDate: Date;
//   invoiceType: string;
// }

// function generateInvoiceHTML(data: InvoiceData): string {
//   const { booking, facility, startup, invoiceNumber, invoiceDate, invoiceType } = data;

//   const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
//   const formatDate = (date: Date) => date ? new Date(date).toLocaleDateString() : 'N/A';

//   const totalAmount = booking.amount || 0;
//   const baseAmount = booking.originalBaseAmount || 0;
//   const serviceFee = booking.serviceFee || 0;
//   const combinedBaseAmount = booking.baseAmount || (baseAmount + serviceFee);
//   const unitCount = booking.unitCount || 1;

//   const commonHTML = `
//     <div class="details">
//       <h3>Payment Summary:</h3>
//       <table>
//         <thead><tr><th>Item</th><th>Description</th><th>Amount</th></tr></thead>
//         <tbody>
//           <tr><td>Base Amount</td><td>Facility Rental (${booking.rentalPlan || 'Standard'})${unitCount > 1 ? ` - ${unitCount} units` : ''}</td><td>${formatCurrency(combinedBaseAmount)}</td></tr>
//         </tbody>
//         <tfoot>
//           <tr class="total"><td colspan="2">Total</td><td>${formatCurrency(totalAmount)}</td></tr>
//         </tfoot>
//       </table>
//     </div>`;

//   const styles = `
//     <style>
//       body { font-family: Arial, sans-serif; margin: 20px; }
//       h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
//       h3 { color: #666; }
//       table { width: 100%; border-collapse: collapse; margin: 20px 0; }
//       th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//       th { background-color: #f2f2f2; }
//       .total { font-weight: bold; background-color: #f9f9f9; }
//     </style>
//   `;

//   if (invoiceType === 'cumma') {
//     return `<!DOCTYPE html><html><head><title>CUMMA Invoice</title>${styles}</head><body>
//       <h1>CUMMA INVOICE</h1>
//       <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
//       <p><strong>Date:</strong> ${formatDate(invoiceDate)}</p>
//       <p><strong>Facility:</strong> ${facility.details?.name || 'N/A'}</p>
//       <p><strong>Startup:</strong> ${startup.startupName || 'N/A'}</p>
//       ${commonHTML}
//       <p>This is a CUMMA-generated invoice.</p>
//     </body></html>`;
//   } else {
//     return `<!DOCTYPE html><html><head><title>Self Invoice</title>${styles}</head><body>
//       <h1>SELF INVOICE</h1>
//       <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
//       <p><strong>Date:</strong> ${formatDate(invoiceDate)}</p>
//       <p><strong>Facility:</strong> ${facility.details?.name || 'N/A'}</p>
//       <p><strong>Startup:</strong> ${startup.startupName || 'N/A'}</p>
//       ${commonHTML}
//       <p>This is a Self-generated invoice.</p>
//     </body></html>`;
//   }
// }

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';
import puppeteer from 'puppeteer';

// AWS S3 client for file storage
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function generateAndStoreInvoice(bookingId: string): Promise<string | null> {
 // console.log(`Starting invoice generation for booking ${bookingId}`);
  try {
    const { db } = await connectToDatabase();
    const booking = await db.collection('bookings').findOne({ _id: new ObjectId(bookingId) });
    if (!booking) return null;

    let facility = await db.collection('Facilities').findOne({ _id: booking.facilityId });
    let startup = await db.collection('Startups').findOne({ userId: booking.startupId }) || await db.collection('Startups').findOne({ _id: booking.startupId });
    let serviceProviderUser = await db.collection('Users').findOne({ _id: new ObjectId(booking.incubatorId) });
    const invoiceType = serviceProviderUser?.invoiceType || 'self';

    if (!facility) facility = { _id: new ObjectId(), details: { name: 'N/A' }, address: 'N/A', city: 'N/A', state: 'N/A', facilityType: 'N/A' };
    if (!startup) startup = { _id: new ObjectId(), startupName: 'N/A', address: 'N/A', city: 'N/A', state: 'N/A', startupMailId: null, email: 'N/A' };

    const invoiceNumber = `INV-${bookingId.substring(0, 8)}-${Date.now().toString().substring(9, 13)}`;
    const invoiceHTML = generateInvoiceHTML({ booking, facility, startup, serviceProviderUser, invoiceNumber, invoiceDate: new Date(), invoiceType });
    
    // Generate PDF from HTML
    const pdfBuffer = await generatePDFFromHTML(invoiceHTML);
    
    const bucketName = process.env.AWS_BUCKET_NAME || 'cummaimages';
    const s3Key = `invoices/${bookingId}/${invoiceNumber}.pdf`;
    
    // Upload PDF to S3
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
      ContentDisposition: `attachment; filename="${invoiceNumber}.pdf"`
    }));

    const region = process.env.AWS_REGION || 'eu-north-1';
    const invoiceUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;

    await db.collection('bookings').updateOne(
      { _id: new ObjectId(bookingId) },
      { $set: { invoiceUrl, invoiceGeneratedAt: new Date() } }
    );

    await sendInvoiceEmail(bookingId, invoiceUrl, startup, facility, invoiceType);

    return invoiceUrl;
  } catch (error) {
    console.error(`Error generating invoice:`, error);
    return null;
  }
}

// Enhanced PDF generation with better formatting
async function generatePDFFromHTML(html: string): Promise<Buffer> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Load the HTML content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF as a buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF with Puppeteer:', error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

// Helper function to parse HTML data
function parseHTMLData(html: string) {
  return {
    type: html.includes('CUMMA INVOICE') ? 'cumma' : html.includes('Self Invoice') ? 'self' : 'unknown',
    invoiceNumber: extractInvoiceNumber(html),
    date: extractDate(html),
    facility: extractFacility(html),
    startup: extractStartup(html),
    description: extractDescription(html),
    amount: extractAmount(html)
  };
}

function extractDate(html: string): string {
  const match = html.match(/Date:<\/strong>\s*([^<]+)/);
  return match ? match[1].trim() : new Date().toLocaleDateString();
}

function extractFacility(html: string): string {
  const match = html.match(/Facility:<\/strong>\s*([^<]+)/);
  return match ? match[1].trim() : 'N/A';
}

function extractStartup(html: string): string {
  const match = html.match(/Startup:<\/strong>\s*([^<]+)/);
  return match ? match[1].trim() : 'N/A';
}

function extractDescription(html: string): string {
  const match = html.match(/Facility Rental \(([^)]+)\)/);
  return match ? `Facility Rental (${match[1]})` : 'Facility Rental';
}

// Helper functions
function extractInvoiceNumber(html: string): string {
  const match = html.match(/Invoice Number:<\/strong>\s*([^<]+)/);
  return match ? match[1].trim() : 'N/A';
}

function extractAmount(html: string): string {
  const match = html.match(/₹([\d,]+\.?\d*)/);
  return match ? match[1] : '0';
}

async function sendInvoiceEmail(bookingId: string, invoiceUrl: string, startup: any, facility: any, invoiceType: string): Promise<void> {
  try {
    const recipientEmail = startup.startupMailId || startup.email;
    if (!recipientEmail) return;

    const response = await fetch(`${process.env.NEXTAUTH_URL || 'https://cumma.in'}/api/invoices/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Invoice-Automation': process.env.EMAIL_WEBHOOK_SECRET || ''
      },
      body: JSON.stringify({ bookingId, automated: true, recipientEmail, forceSend: false, invoiceType })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Failed to send invoice email:', errorData);
    }
  } catch (error) {
    console.error('Error sending invoice email automatically:', error);
  }
}

interface InvoiceData {
  booking: any;
  facility: any;
  startup: any;
  serviceProviderUser: any;
  invoiceNumber: string;
  invoiceDate: Date;
  invoiceType: string;
}

function generateInvoiceHTML(data: InvoiceData): string {
  const { booking, facility, startup, serviceProviderUser, invoiceNumber, invoiceDate, invoiceType } = data;

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
  const formatDate = (date: Date) => date ? new Date(date).toLocaleDateString('en-IN') : 'N/A';

  const totalAmount = booking.amount || 0;
  const baseAmount = booking.originalBaseAmount || 0;
  const serviceFee = booking.serviceFee || 0;
  const combinedBaseAmount = booking.baseAmount || (baseAmount + serviceFee);
  const unitCount = booking.unitCount || 1;

  // For self invoices, use the CIIC template design
  if (invoiceType === 'self') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Self Invoice</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: white;
            padding: 20px;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 20px;
            background: white;
        }
        
        .note-section {
            background: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #007bff;
            margin-bottom: 20px;
            font-size: 11px;
        }
        
        .note-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .invoice-header {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 30px;
            text-decoration: underline;
        }
        
        .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        
        .from-section, .to-section {
            width: 48%;
        }
        
        .from-section h3, .to-section h3 {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .company-info {
            line-height: 1.6;
        }
        
        .invoice-meta {
            text-align: right;
            margin-bottom: 30px;
        }
        
        .invoice-meta div {
            margin-bottom: 5px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        .items-table th,
        .items-table td {
            border: 1px solid #333;
            padding: 10px;
            text-align: left;
        }
        
        .items-table th {
            background: #f8f9fa;
            font-weight: bold;
            text-align: center;
        }
        
        .items-table .amount-col {
            text-align: right;
        }
        
        .total-section {
            text-align: right;
            margin-bottom: 30px;
        }
        
        .total-row {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 10px;
        }
        
        .total-label {
            width: 100px;
            font-weight: bold;
            text-align: right;
            margin-right: 20px;
        }
        
        .total-amount {
            width: 120px;
            text-align: right;
            font-weight: bold;
        }
        
        .bank-details {
            background: #f8f9fa;
            padding: 15px;
            border: 1px solid #ddd;
            margin-bottom: 20px;
        }
        
        .bank-details h4 {
            margin-bottom: 10px;
            font-size: 14px;
        }
        
        .bank-info {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .bank-info div {
            flex: 1;
            min-width: 200px;
        }
        
        .company-ids {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
        }
        
        @media print {
            body {
                padding: 0;
            }
            
            .invoice-container {
                border: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Note Section -->
        <div class="note-section">
            <div class="note-title">Note:</div>
            <div>
                This is a self-generated invoice for facility rental services. Please remit the full consideration amount as per the booking agreement.
            </div>
        </div>
        
        <!-- Invoice Header -->
        <div class="invoice-header">Self Invoice</div>
        
        <!-- From and To Section -->
        <div class="invoice-details">
            <div class="from-section">
                <h3>From</h3>
                <div class="company-info">
                    <div>${serviceProviderUser?.companyName || serviceProviderUser?.name || 'Service Provider'}</div>
                    <div>${serviceProviderUser?.address || 'Address not available'}</div>
                    <div>${serviceProviderUser?.city || ''}, ${serviceProviderUser?.state || ''} ${serviceProviderUser?.pincode || ''}</div>
                    <div>${serviceProviderUser?.phone || serviceProviderUser?.email || ''}</div>
                </div>
            </div>
            
            <div class="to-section">
                <h3>To</h3>
                <div class="company-info">
                    <div>${startup.startupName || 'N/A'}</div>
                    <div>${startup.address || 'Address not available'}</div>
                    <div>${startup.city || ''}, ${startup.state || ''} ${startup.pincode || ''}</div>
                    <div>${startup.startupMailId || startup.email || ''}</div>
                </div>
            </div>
        </div>
        
        <!-- Invoice Meta -->
        <div class="invoice-meta">
            <div><strong>Invoice No:</strong> ${invoiceNumber}</div>
            <div><strong>Dated:</strong> ${formatDate(invoiceDate)}</div>
        </div>
        
        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Facility Rental - ${facility.details?.name || 'N/A'} (${booking.rentalPlan || 'Standard'})</td>
                    <td class="amount-col">${formatCurrency(combinedBaseAmount)}</td>
                    <td class="amount-col">${unitCount}</td>
                    <td class="amount-col">${formatCurrency(totalAmount)}</td>
                </tr>
            </tbody>
        </table>
        
        <!-- Total Section -->
        <div class="total-section">
            <div class="total-row">
                <div class="total-label">TOTAL</div>
                <div class="total-amount">${formatCurrency(totalAmount)}</div>
            </div>
        </div>
        
        <!-- Bank Details -->
        <div class="bank-details">
            <h4>Payment Details</h4>
            <div class="bank-info">
                <div>
                    <strong>Account Name:</strong> ${serviceProviderUser?.accountName || serviceProviderUser?.companyName || 'N/A'}<br>
                    <strong>Bank:</strong> ${serviceProviderUser?.bankName || 'N/A'}<br>
                    <strong>Branch:</strong> ${serviceProviderUser?.branchName || 'N/A'}
                </div>
                <div>
                    <strong>A/c No:</strong> ${serviceProviderUser?.accountNumber || 'N/A'}<br>
                    <strong>IFSC:</strong> ${serviceProviderUser?.ifscCode || 'N/A'}
                </div>
            </div>
        </div>
        
        <!-- Company IDs -->
        <div class="company-ids">
            <div><strong>GST:</strong> ${serviceProviderUser?.gstNumber || 'N/A'}</div>
            <div><strong>PAN:</strong> ${serviceProviderUser?.panNumber || 'N/A'}</div>
            <div><strong>CIN:</strong> ${serviceProviderUser?.cinNumber || 'N/A'}</div>
        </div>
    </div>
</body>
</html>`;
  } else {
    // For CUMMA invoices, use the original simple template
    const commonHTML = `
      <div class="details">
        <h3>Payment Summary:</h3>
        <table>
          <thead><tr><th>Item</th><th>Description</th><th>Amount</th></tr></thead>
          <tbody>
            <tr><td>Base Amount</td><td>Facility Rental (${booking.rentalPlan || 'Standard'})${unitCount > 1 ? ` - ${unitCount} units` : ''}</td><td>${formatCurrency(combinedBaseAmount)}</td></tr>
          </tbody>
          <tfoot>
            <tr class="total"><td colspan="2">Total</td><td>${formatCurrency(totalAmount)}</td></tr>
          </tfoot>
        </table>
      </div>`;

    const styles = `
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
        h3 { color: #666; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .total { font-weight: bold; background-color: #f9f9f9; }
      </style>
    `;

    return `<!DOCTYPE html><html><head><title>CUMMA Invoice</title>${styles}</head><body>
      <h1>CUMMA INVOICE</h1>
      <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
      <p><strong>Date:</strong> ${formatDate(invoiceDate)}</p>
      <p><strong>Facility:</strong> ${facility.details?.name || 'N/A'}</p>
      <p><strong>Startup:</strong> ${startup.startupName || 'N/A'}</p>
      ${commonHTML}
      <p>This is a CUMMA-generated invoice.</p>
    </body></html>`;
  }
}