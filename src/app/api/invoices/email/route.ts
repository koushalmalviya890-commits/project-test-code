export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// Initialize Resend email client (keeping as fallback)
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration for Zoho SMTP
const createEmailTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error('Email credentials (EMAIL_USER, EMAIL_PASS) are not configured in environment variables');
  }

  return nodemailer.createTransport({
    host: 'smtppro.zoho.in',
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development',
  });
};

// Send invoice email using Zoho SMTP
const sendInvoiceEmail = async (
  recipientEmail: string,
  startupName: string,
  facilityName: string,
  facilityLocation: string,
  bookingDates: string,
  facilityType: string,
  bookingId: string,
  amount: number,
  invoiceUrl: string
): Promise<void> => {
  const transporter = createEmailTransporter();

 const mailOptions = {
   from: `"Cumma," <${process.env.EMAIL_FROM}>`,
  to: recipientEmail,
  subject: `Congratulations, Your Booking through Cumma is Confirmed`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Brand Logo -->
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="cid:emailLogo" alt="Cumma Logo" style="height: 60px;" />
      </div>

      <!-- Greeting -->
      <p style="font-size: 16px; color: #333;">Hi ${startupName || 'there'},</p>

      <!-- Confirmation Text -->
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Your booking for <strong>${facilityName || 'N/A'}</strong> on <strong>${bookingDates}</strong> is confirmed.
      </p>

      <!-- Location Info -->
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        <strong>Location:</strong><br />
        ${facilityLocation}
      </p>

      <!-- Value Message -->
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        You’ve just unlocked access to a facility designed to help you create, collaborate, and grow.
        From focused work to big ideas, we’re glad to be part of your journey.
      </p>

      <!-- Note for Arrival -->
      <p style="font-size: 16px; color: #333;">
        When you arrive, please show your booking invoice for access to the space (if asked).
      </p>

      <!-- Invoice Section -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${invoiceUrl}"  style="
          background-color: #4F46E5;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          display: inline-block;
        ">
          📥 View Invoice
        </a>
      </div>

      <!-- Sustainability Line -->
      <p style="font-style: italic; color: #4F46E5; text-align: center;">
        And hey champion, you save at least 3 papers every time you access through Cumma!
      </p>

      <!-- Footer -->
      <div style="margin-top: 40px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
        <p style="color: #333; font-size: 16px; margin: 0 0 10px 0;">
          We’re excited to support your next move. Have a good day!
        </p>
        <p style="color: #666; font-size: 14px;">
          Warm regards,<br />
          Team Cumma<br />
          <a href="https://www.cumma.in" style="color: #4F46E5;">www.cumma.in</a>
        </p>
      </div>
    </div>
  `,
  attachments: [
    {
      filename: 'logo.png',
      path: './public/logo.png',
      cid: 'emailLogo'
    }
  ]
};
 // console.log(`📧 Sending invoice email to ${recipientEmail} for booking ${bookingId}`);

  await transporter.sendMail(mailOptions);
};

export async function POST(req: NextRequest) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email credentials not configured');
      return NextResponse.json(
        { 
          error: 'Email service not configured', 
          details: 'EMAIL_USER and EMAIL_PASS must be set in environment variables' 
        },
        { status: 500 }
      );
    }

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
    const bookingDates = `${formattedStartDate} – ${formattedEndDate}`;
    const facilityLocation = `${facility.city || ''}, ${facility.state || ''}`;

// when building email HTML, replace direct booking.amount usage with safe value:
    const paidAmount = Number(booking?.finalAmount ?? booking?.amount ?? 0);


    // Send the email with the invoice using Zoho SMTP
    let emailSent = false;
    let emailError: any = null;

    try {
      // Primary method: Use Zoho SMTP (nodemailer)
      await sendInvoiceEmail(
        recipientEmail,
        startup.startupName || 'there',
        facility.details?.name || 'N/A',
        facilityLocation,
        bookingDates,
        facility.facilityType || 'N/A',
        booking._id.toString(),
        paidAmount,
        booking.invoiceUrl
      );
      
     // console.log('✅ Invoice email sent successfully via Zoho SMTP to:', recipientEmail);
      emailSent = true;

      if (process.env.NODE_ENV === 'development') {
       // console.log(`📧 Invoice email details:`, {
        //   to: recipientEmail,
        //   startup: startup.startupName,
        //   facility: facility.details?.name,
        //   amount: paidAmount,
        //   bookingId: booking._id.toString()
        // });
      }
    } catch (zohoError) {
      console.error('❌ Failed to send via Zoho SMTP:', zohoError);
      emailError = zohoError;
      
      // Fallback method: Use Resend
      try {
        const { data: emailData, error: resendError } = await resend.emails.send({
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
                <p><strong>Location:</strong> ${facilityLocation}</p>
                <p><strong>Booking Date(s):</strong> ${bookingDates}</p>
                <p><strong>Facility Type:</strong> ${facility.facilityType || 'N/A'}</p>
                <p><strong>Booking ID:</strong> #${booking._id.toString()}</p>

                 <p><strong>Payment Made:</strong> ₹${paidAmount.toLocaleString()}</p>
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

        if (resendError) {
          // Do not throw here — capture the error and continue so we can record it
          console.error('Resend returned an error object:', resendError);
          emailError = resendError;
        } else {
         // console.log('✅ Invoice email sent successfully via Resend (fallback):', emailData);
          emailSent = true;
        }
      } catch (resendError) {
        console.error('❌ Both Zoho and Resend failed:', resendError);
        emailError = resendError;
      }
    }

    // Record that invoice was emailed (even if it failed, for tracking purposes)
    await db.collection('bookings').updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $push: {
          invoiceEmailHistory: {
            sentTo: recipientEmail,
            sentAt: new Date(),
            sentBy: isAutomatedRequest ? 'system' : (userId || 'unknown'),
            status: emailSent ? 'sent' : 'failed',
            error: emailSent ? null : emailError?.message || 'Unknown error'
          },
        },
      }
    );

    // Return response
    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Invoice email sent successfully',
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to send invoice email via both Zoho and Resend',
        details: emailError?.message || 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return NextResponse.json(
      { error: 'Failed to send invoice email' },
      { status: 500 }
    );
  }
}