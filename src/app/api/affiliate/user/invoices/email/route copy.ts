import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Resend } from 'resend';

// Initialize Resend email client
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    // Get the raw request body for signature verification
    const data = await req.json();
    const { bookingId, automated, recipientEmail: automatedRecipient } = data;

    // Check for automation header for internal system requests
    const automationSecret = req.headers.get('X-Invoice-Automation');
    const isAutomatedRequest = 
      automationSecret === process.env.EMAIL_WEBHOOK_SECRET && 
      automated === true;

    // For regular user requests, verify authentication
    let userId: string | null = null;
    if (!isAutomatedRequest) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = session.user.id;
    }

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Missing booking ID' },
        { status: 400 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Find the booking
    const booking = await db.collection('bookings').findOne({
      _id: new ObjectId(bookingId),
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // For regular requests, check if the user is authorized to access this booking
    if (!isAutomatedRequest && userId) {
      if (
        booking.startupId.toString() !== userId &&
        booking.incubatorId.toString() !== userId
      ) {
        return NextResponse.json(
          { error: 'Not authorized to access this booking' },
          { status: 403 }
        );
      }
    }

    // Check if booking has an invoice URL
    if (!booking.invoiceUrl) {
      return NextResponse.json(
        { error: 'Invoice not available for this booking' },
        { status: 400 }
      );
    }

    // Check for duplicate emails - prevent sending multiple emails in a short time frame
    // Only if not explicitly forced by the user
    if (booking.invoiceEmailHistory && booking.invoiceEmailHistory.length > 0 && !data.forceSend) {
      // Define the type for email history items
      interface EmailHistoryItem {
        sentTo: string;
        sentAt: Date | string;
        sentBy: string;
      }
      
      // Get the most recent email sent to the same recipient
      const recentEmails = booking.invoiceEmailHistory
        .filter((history: EmailHistoryItem) => {
          // Check if the email was sent to the same recipient
          if (isAutomatedRequest && automatedRecipient) {
            return history.sentTo === automatedRecipient;
          } else if (userId && booking.startupId.toString() === userId) {
            // For startup user, check if sent to startup email
            return history.sentTo === (startup?.startupMailId || startup?.email);
          }
          return false;
        })
        .sort((a: EmailHistoryItem, b: EmailHistoryItem) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

      if (recentEmails.length > 0) {
        const lastSentTime = new Date(recentEmails[0].sentAt).getTime();
        const now = new Date().getTime();
        const minutesSinceLastEmail = Math.floor((now - lastSentTime) / (1000 * 60));
        
        // If an email was sent in the last 5 minutes, don't send another one
        if (minutesSinceLastEmail < 5) {
         // console.log(`Skipping duplicate email send: Last email was sent ${minutesSinceLastEmail} minutes ago to ${recentEmails[0].sentTo}`);
          return NextResponse.json({
            success: true,
            message: 'Email was sent recently, skipping duplicate send',
            minutesSinceLastEmail
          });
        }
      }
    }

    // Look up related data
    const [startup, facility] = await Promise.all([
      db.collection('Startups').findOne({ userId: booking.startupId }),
      db.collection('Facilities').findOne({ _id: booking.facilityId }),
    ]);

    if (!startup || !facility) {
      console.error(`Failed to find related data for booking ${bookingId}. Startup: ${!!startup}, Facility: ${!!facility}`);
      return NextResponse.json(
        { error: 'Failed to find related data' },
        { status: 500 }
      );
    }

    // Get the recipient email
    let recipientEmail = '';
    
    if (isAutomatedRequest && automatedRecipient) {
      // For automated requests, use the provided recipient
      recipientEmail = automatedRecipient;
    } else if (userId) {
      // For user-initiated requests
      if (booking.startupId.toString() === userId) {
        // Use startupMailId instead of email for the startup
        recipientEmail = startup.startupMailId || startup.email || '';
        if (!recipientEmail) {
          console.error(`No startupMailId or email found for startup ${startup._id}`);
        }
      } else {
        // If the requester is the service provider, look up their email
        const serviceProvider = await db.collection('Service Provider').findOne({
          userId: booking.incubatorId,
        });
        recipientEmail = serviceProvider?.primaryEmailId || '';
      }
    }

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Recipient email not found' },
        { status: 400 }
      );
    }

    // Format dates for display
    const formattedStartDate = new Date(booking.startDate).toLocaleDateString();
    const formattedEndDate = new Date(booking.endDate).toLocaleDateString();

    // Send the email with the invoice
    try {
      // Use Resend to send the actual email
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: `Cumma <${process.env.EMAIL_FROM || 'noreply@cumma.in'}>`,
        to: recipientEmail,
        subject: `Congratulations - Your Facility Booking is Confirmed – Here's Your Invoice from cumma`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.5;">
            <p>Hi ${startup.startupName || 'there'},</p>

            <p>Thank you for booking through Cumma! 🎉<br>
            We're excited to support your startup journey by connecting you with the right space and infrastructure.</p>

            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Here are your booking details:</h3>
              <p><strong>Facility Name:</strong> ${facility.details?.name || 'N/A'}</p>
              <p><strong>Location:</strong> ${facility.city || ''}, ${facility.state || ''}</p>
              <p><strong>Booking Date(s):</strong> ${formattedStartDate} – ${formattedEndDate}</p>
              <p><strong>Facility Type:</strong> ${facility.facilityType || 'N/A'}</p>
              <p><strong>Booking ID:</strong> #${booking._id.toString()}</p>
              <p><strong>Payment Made:</strong> ₹${booking.amount.toLocaleString()}</p>
            </div>

            <p>Your invoice is attached to this email for your reference.</p>
            
            <p style="margin: 20px 0;">
              <a href="${booking.invoiceUrl}" style="background-color: #4F46E5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">
                View Invoice
              </a>
            </p>

            <p>If you have any questions or need help with your booking, reply to this email or contact us at support@cumma.in.</p>

            <p>Thanks for choosing Cumma —<br>
            Let's build, together.</p>

            <p>Warm regards,<br>
            Team Cumma<br>
            <a href="https://www.cumma.in">www.cumma.in</a></p>
          </div>
        `,
      });

      if (emailError) {
        throw new Error(emailError.message);
      }

     // console.log('Email sent successfully:', emailData);
    } catch (emailError) {
      console.error('Error sending email via Resend:', emailError);
      // Continue processing - we'll still record the attempt
    }

    // Record that invoice was emailed
    await db.collection('bookings').updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $push: {
          invoiceEmailHistory: {
            sentTo: recipientEmail,
            sentAt: new Date(),
            sentBy: isAutomatedRequest ? 'system' : (userId || 'unknown'),
          },
        },
      }
    );

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Invoice email sent successfully',
    });
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return NextResponse.json(
      { error: 'Failed to send invoice email' },
      { status: 500 }
    );
  }
} 