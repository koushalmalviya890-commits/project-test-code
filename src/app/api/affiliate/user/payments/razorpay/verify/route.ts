import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import crypto from 'crypto'
import { generateAndStoreInvoice } from '@/lib/emailAffliate'
import { addCustomerViaAffiliateLink } from "@/lib/addCustomerViaAffiliateLink"
import { sendServiceProviderNotificationEmail,sendFacilityContactMail  } from '@/lib/email'
import { logToDB } from '@/lib/logToDB'

export async function POST(req: NextRequest) {
  try {
    // Get Razorpay key secret for this request (serverless compatible)
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET
    
    // Check authentication - user must be logged in
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Get payment verification data from request
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      bookingId
    } = await req.json()

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !bookingId) {
      return NextResponse.json(
        { error: 'Missing payment verification details' },
        { status: 400 }
      )
    }
    
    // Check if Razorpay key secret is configured
    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Payment verification service not configured' },
        { status: 500 }
      )
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find the booking
    const booking = await db.collection('bookings').findOne({
      _id: new ObjectId(bookingId),
      razorpayOrderId: razorpay_order_id
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or order ID mismatch' },
        { status: 404 }
      )
    }

    // Verify the payment signature
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    // If signatures don't match, payment is invalid
    if (generatedSignature !== razorpay_signature) {
      // Update booking payment status to failed
      await db.collection('bookings').updateOne(
        { _id: new ObjectId(bookingId) },
        {
          $set: {
            paymentStatus: 'failed',
            paymentDetails: {
              razorpay_payment_id,
              razorpay_order_id,
              verificationError: 'Signature verification failed'
            },
            // Set expiration to 24 hours from now to allow for retry
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            updatedAt: new Date()
          }
        }
      )

      return NextResponse.json(
        { error: 'Payment verification failed', success: false },
        { status: 400 }
      )
    }

    // Payment is valid - update booking status
    await db.collection('bookings').updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          paymentStatus: 'completed',
          // Don't change status to approved automatically - keep it as is
          expiresAt: null, // Remove expiration as payment is complete
          paymentDetails: {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            verifiedAt: new Date()
          },
          updatedAt: new Date()
        }
      }
    )


    

    // Log success
   // console.log(`Payment verified successfully for booking ${bookingId}`);

    try {
      // Send booking notification to service provider
      await createBookingNotification(db, booking);
    } catch (notificationError) {
      console.error(`Error creating booking notification for ${bookingId}:`, notificationError);
      // Continue processing even if notification fails
    }

    // Generate invoice and store it in S3
   // console.log(`Generating invoice for booking ${bookingId}...`);
    try {
      const invoiceUrl = await generateAndStoreInvoice(bookingId);
       await logToDB(db, "info", `Payment verified successfully for booking ${invoiceUrl}`);
      if (!invoiceUrl) {
        await logToDB(db, "info", `Payment verified successfully for booking ${bookingId}`);
        console.error(`Invoice generation returned null for booking ${bookingId}`);

      } else {
        await logToDB(db, "error", `Invoice generation failed for ${bookingId}`, { reason: "invoiceURL is null" });

       // console.log(`Invoice generated successfully for booking ${bookingId}: ${invoiceUrl}`);
      }
    } catch (invoiceError) {
       await logToDB(db, "error", `Invoice error for ${bookingId}`, { error: invoiceError });
      console.error(`Failed to generate invoice for booking ${bookingId}:`, invoiceError);
      // Don't block the payment process if invoice generation fails
    }
  
  //Add customer

  try{
    await addCustomerViaAffiliateLink(booking);
  }catch(e){
        console.error(`Failed to add customer for booking ${bookingId}:`, e);
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully'
    })
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment', success: false },
      { status: 500 }
    )
  }
}

// Helper function to create a notification for the facility provider
// async function createBookingNotification(db: any, booking: any) {
//   try {
//     const facility = await db.collection('Facilities').findOne({
//       _id: booking.facilityId
//     })
    
//     const startup = await db.collection('Startups').findOne({
//       _id: booking.startupId
//     })

//     if (!facility || !startup) return

//     const notification = {
//       userId: booking.incubatorId.toString(),
//       type: 'booking-approved',
//       title: 'New Booking Received',
//       message: `${startup.startupName} has booked ${facility.details.name} for ${booking.rentalPlan}`,
//       relatedId: booking._id.toString(),
//       relatedType: 'booking',
//       isRead: false,
//       createdAt: new Date(),
//       metadata: {
//         facilityName: facility.details.name,
//         startupName: startup.startupName,
//         facilityType: facility.facilityType,
//         startDate: booking.startDate.toISOString(),
//         endDate: booking.endDate.toISOString(),
//         amount: booking.amount
//       }
//     }

//     await db.collection('notifications').insertOne(notification)
//   } catch (error) {
//     console.error('Error creating booking notification:', error)
//     // Don't throw here, just log - this shouldn't prevent the payment verification
//   }
// } 




async function createBookingNotification(db: any, booking: any) {
  try {
   // console.log('🔔 Starting createBookingNotification()...');

    const facility = await db.collection('Facilities').findOne({
      _id: booking.facilityId
    });
   // console.log('🏢 Facility fetched:', facility?.details?.name);

    const startup = await db.collection('AffiliateLinkUsers').findOne({
      mailId: booking.affiliateUserEmail
    });
   // console.log('🚀 Startup fetched:', startup?.contactName);

    const serviceProvider = await db.collection('Users').findOne({
      _id: booking.incubatorId
    });
   // console.log('🏪 Service Provider fetched:', serviceProvider?.email);

    if (!facility || !startup || !serviceProvider) {
      console.warn('❌ Required data missing. Skipping notification.');
      return;
    }

    // Insert into notifications collection
    const notification = {
      userId: serviceProvider._id.toString(),
      type: 'booking-approved',
      title: 'New Booking Approved',
      message: `${startup.startupName} has booked ${facility.details.name} for ${booking.rentalPlan}.`,
      relatedId: booking._id.toString(),
      relatedType: 'booking',
      isRead: false,
      createdAt: new Date(),
      metadata: {
        facilityName: facility.details.name,
        startupName: startup.contactName,
        facilityType: facility.facilityType,
        startDate: new Date(booking.startDate).toISOString().split('T')[0],
        endDate: new Date(booking.endDate).toISOString().split('T')[0]
      }
    };

    await db.collection('notifications').insertOne(notification);
   // console.log('✅ Notification stored in DB');

    // Send service provider email
    await sendServiceProviderNotificationEmail({
      to: serviceProvider.email,
      facilityName: facility.details.name,
      startupName: startup.contactName,
      rentalPlan: booking.rentalPlan,
      startDate: booking.startDate,
      endDate: booking.endDate,
      amount: booking.amount
    });

    await sendFacilityContactMail({
      to: facility.email,
      facilityName: facility.details.name,
      startupName: startup.contactName,
      rentalPlan: booking.rentalPlan,
      startDate: booking.startDate,
      endDate: booking.endDate,
      amount: booking.amount
    });

   // console.log(`📧 Email sent to: ${facility.email}`);
  } catch (error) {
    console.error('❌ Error in createBookingNotification():', error);
  }

  
}
