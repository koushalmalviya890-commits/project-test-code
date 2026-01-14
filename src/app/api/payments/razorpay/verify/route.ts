import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { generateAndStoreInvoice } from '@/lib/invoice';
import { sendServiceProviderNotificationEmail, sendFacilityContactMail } from '@/lib/email';
import { logToDB } from '@/lib/logToDB';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } = await req.json();

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !bookingId) {
    return NextResponse.json({ error: 'Missing payment verification details' }, { status: 400 });
  }

  const { db } = await connectToDatabase();

  const booking = await db.collection('bookings').findOne({
    _id: new ObjectId(bookingId),
    razorpayOrderId: razorpay_order_id,
  });

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found or order ID mismatch' }, { status: 404 });
  }

  // Forward to Node.js to verify signature
  try {
    const nodeRes = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/api/facility-bookings/payments/verify-signature`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_SECRET_KEY}` // Add API key
      },
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        bookingId, // Add bookingId to verification request
      }),
    });

    if (!nodeRes.ok) {
      console.error('Verification API Error:', await nodeRes.text());
      
      // Update booking with error details
      await db.collection('bookings').updateOne(
        { _id: new ObjectId(bookingId) },
        {
          $set: {
            paymentStatus: 'failed',
            paymentDetails: {
              razorpay_payment_id,
              razorpay_order_id,
              razorpay_signature,
              verificationError: `API Error: ${nodeRes.status}`,
              errorTimestamp: new Date()
            },
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({ 
        error: 'Payment verification failed', 
        details: await nodeRes.text(),
        success: false 
      }, { status: nodeRes.status });
    }

    const nodeData = await nodeRes.json();

    if (!nodeData.isValid) {
      // Mark payment as failed
      await db.collection('bookings').updateOne(
        { _id: new ObjectId(bookingId) },
        {
          $set: {
            paymentStatus: 'failed',
            paymentDetails: {
              razorpay_payment_id,
              razorpay_order_id,
              verificationError: 'Signature verification failed',
            },
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Allow retry
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({ error: 'Payment verification failed', success: false }, { status: 400 });
    }

    // ✅ Payment verified — update booking
    await db.collection('bookings').updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          paymentStatus: 'completed',
          expiresAt: null,
          paymentDetails: {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            verifiedAt: new Date(),
          },
          updatedAt: new Date(),
        },
      }
    );

    // Send response immediately
    const response = NextResponse.json({ success: true, message: 'Payment verified successfully' });

    // Schedule background tasks to run after response
    setImmediate(async () => {
      try {
        // 🔔 Send notification to service provider
        await createBookingNotification(db, booking);
      } catch (err) {
        console.error('Background notification failed:', err);
      }

      // 🧾 Generate invoice
      try {
        const invoiceUrl = await generateAndStoreInvoice(bookingId);
       if (invoiceUrl) {
          await logToDB(db, 'info', `Invoice generated for booking ${bookingId}`, { invoiceUrl });
         // console.log(`✅ Invoice generated successfully: ${invoiceUrl}`);
        } else {
          await logToDB(db, 'error', `Invoice generation returned null for ${bookingId}`);
          console.error(`❌ Invoice generation failed for ${bookingId}`);
        }
      } catch (err) {
        await logToDB(db, 'error', `Invoice generation failed for ${bookingId}`, { error: err });
        console.error(`❌ Invoice generation error for ${bookingId}:`, err);
      }
    }).unref(); // Prevent timer from keeping server alive

    return response;
  } catch (err) {
    console.error('Payment verification error:', err);
    
    // Update booking with error details
    await db.collection('bookings').updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          paymentStatus: 'verification_failed',
          paymentDetails: {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            verificationError: err instanceof Error ? err.message : 'Unknown error',
            errorTimestamp: new Date()
          },
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ 
      error: 'Payment verification service unreachable',
      details: err instanceof Error ? err.message : 'Unknown error',
      success: false
    }, { status: 503 });
  }
}

// Helper: Create notification and send emails
async function createBookingNotification(db: any, booking: any) {
  const [facility, startup, serviceProvider] = await Promise.all([
    db.collection('Facilities').findOne({ _id: booking.facilityId }),
    db.collection('Startups').findOne({ userId: booking.startupId }),
    db.collection('Users').findOne({ _id: booking.incubatorId }),
  ]);

  if (!facility || !startup || !serviceProvider) return;
// Safely derive values used by email/notification helpers
  const amount = (booking?.finalAmount ?? booking?.amount ?? 0);
  const startDate = booking?.startDate ?? booking?.startDate ?? null;
  const endDate = booking?.endDate ?? booking?.endDate ?? null;
  const rentalPlan = booking?.rentalPlan ?? '';
  const durationUnits = booking?.unitCount;
  const durationLabel = booking?.unitLabel ?? '';


  const notification = {
    userId: serviceProvider._id.toString(),
    type: 'booking-approved',
    title: 'New Booking Approved',
    message: `${startup.startupName} has booked ${facility.details?.name || 'your facility'} for ${rentalPlan} (${durationUnits} ${durationLabel}).`,
    relatedId: booking._id.toString(),
    relatedType: 'booking',
    isRead: false,
    createdAt: new Date(),
    metadata: {
      facilityName: facility.details?.name || null,
      startupName: startup.startupName,
      facilityType: facility.facilityType,
      startDate,
      endDate,
      amount: Number(amount || 0),
      rentalPlan: booking.rentalPlan,
      bookingSeats: booking.bookingSeats,
    },
  };

  await db.collection('notifications').insertOne(notification).catch((e: any) => {
    console.error('Failed to insert notification:', e);
  });

  try {
    await sendServiceProviderNotificationEmail({
      to: serviceProvider.email,
      facilityName: facility.details?.name || '',
      startupName: startup.startupName,
      rentalPlan,
      startDate,
      endDate,
      amount: Number(amount || 0),
    });
  } catch (e) {
    console.error('Failed to send service provider notification email:', e);
  }

  try {
    await sendFacilityContactMail({
      to: facility.email || '',
      facilityName: facility.details?.name || '',
      startupName: startup.startupName,
      rentalPlan,
      startDate,
      endDate,
      amount: Number(amount || 0),
    });
  } catch (e) {
    console.error('Failed to send facility contact mail:', e);
  }
}
