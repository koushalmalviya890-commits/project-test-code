import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import crypto from 'crypto'
import { generateAndStoreInvoice } from '@/lib/invoice'

export async function POST(req: NextRequest) {
  try {
    // Get environment variables within function scope for serverless
    const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET
    
    // Get the raw request body for signature verification
    const rawBody = await req.text()
    const bodyData = JSON.parse(rawBody)

    // Get the Razorpay signature from headers
    const razorpaySignature = req.headers.get('x-razorpay-signature')

    // Verify the webhook signature
    if (!verifyWebhookSignature(rawBody, razorpaySignature || '', RAZORPAY_WEBHOOK_SECRET)) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Process the webhook event based on event type
    const event = bodyData.event

    // Connect to the database
    const { db } = await connectToDatabase()

    switch (event) {
      case 'payment.authorized':
        await handlePaymentAuthorized(bodyData.payload.payment.entity, db)
        break
      
      case 'payment.failed':
        await handlePaymentFailed(bodyData.payload.payment.entity, db)
        break
      
      case 'refund.created':
        await handleRefundCreated(bodyData.payload.refund.entity, db)
        break
      
      default:
        // Log other events but don't process them
       // console.log(`Unhandled webhook event: ${event}`)
    }

    // Return a successful response
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing Razorpay webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

// Utility to verify the webhook signature from Razorpay
function verifyWebhookSignature(rawBody: string, signature: string, webhookSecret: string | undefined): boolean {
  if (!webhookSecret) {
    console.error('RAZORPAY_WEBHOOK_SECRET environment variable is not configured');
    return false;
  }
  
  // Clean potential whitespace or commas from the webhook secret
  const cleanSecret = webhookSecret.trim().replace(/,$/, '');
  
  try {
    const expectedSignature = crypto
      .createHmac('sha256', cleanSecret)
      .update(rawBody)
      .digest('hex');
    
    // Debug logs (only in development)
    if (process.env.NODE_ENV === 'development') {
     // console.log('Webhook signature received:', signature);
     // console.log('Expected signature:', expectedSignature);
     // console.log('Signatures match:', expectedSignature === signature);
    }
    
    // For security best practices, use timingSafeEqual to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

// Handle payment.authorized event
async function handlePaymentAuthorized(payment: any, db: any) {
  try {
    const orderId = payment.order_id
    if (!orderId) {
      console.error('No order ID in payment.authorized webhook');
      return;
    }

    // Find the booking associated with this order
    const booking = await db.collection('bookings').findOne({
      razorpayOrderId: orderId
    })

    if (!booking) {
      console.error(`No booking found for order ${orderId} in payment.authorized webhook`);
      return;
    }

   // console.log(`Processing payment.authorized webhook for booking ${booking._id}, order ${orderId}`);

    // Update booking with payment status and details
    await db.collection('bookings').updateOne(
      { _id: booking._id },
      {
        $set: {
          paymentStatus: 'completed',
          expiresAt: null, // Remove expiration as payment is complete
          paymentDetails: {
            razorpay_payment_id: payment.id,
            razorpay_order_id: orderId,
            method: payment.method,
            amount: payment.amount / 100, // Convert back from paise to rupees
            currency: payment.currency,
            status: payment.status,
            receivedAt: new Date(),
          },
          updatedAt: new Date()
        }
      }
    )

    // Create notification for the service provider about the new booking
    try {
      await createBookingNotification(db, booking);
     // console.log(`Notification created for booking ${booking._id}`);
    } catch (notificationError) {
      console.error(`Error creating notification for booking ${booking._id}:`, notificationError);
    }
    
    // Generate and store invoice for the completed booking
    try {
     // console.log(`Generating invoice for booking ${booking._id} from webhook...`);
      const invoiceUrl = await generateAndStoreInvoice(booking._id.toString());
      
      if (!invoiceUrl) {
        console.error(`Invoice generation returned null for booking ${booking._id} from webhook`);
      } else {
       // console.log(`Invoice generated successfully from webhook for booking ${booking._id}: ${invoiceUrl}`);
      }
    } catch (invoiceError) {
      console.error(`Error generating invoice for booking ${booking._id} from webhook:`, invoiceError);
    }
  } catch (error) {
    console.error('Error handling payment.authorized webhook:', error);
  }
}

// Handle payment.failed event
async function handlePaymentFailed(payment: any, db: any) {
  try {
    const orderId = payment.order_id
    if (!orderId) return

    // Find the booking associated with this order
    const booking = await db.collection('bookings').findOne({
      razorpayOrderId: orderId
    })

    if (!booking) {
      console.error(`No booking found for order ${orderId}`)
      return
    }

    // Update booking with failed payment status
    await db.collection('bookings').updateOne(
      { _id: booking._id },
      {
        $set: {
          paymentStatus: 'failed',
          // Set expiration to 24 hours from now to allow for retry
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          paymentDetails: {
            razorpay_payment_id: payment.id,
            razorpay_order_id: orderId,
            method: payment.method,
            amount: payment.amount / 100,
            currency: payment.currency,
            status: payment.status,
            failureReason: payment.error_description || payment.error_code,
            failedAt: new Date(),
          },
          updatedAt: new Date()
        }
      }
    )
  } catch (error) {
    console.error('Error handling payment.failed webhook:', error)
  }
}

// Handle refund.created event
async function handleRefundCreated(refund: any, db: any) {
  try {
    const paymentId = refund.payment_id
    if (!paymentId) return

    // Find the booking associated with this payment
    const booking = await db.collection('bookings').findOne({
      'paymentDetails.razorpay_payment_id': paymentId
    })

    if (!booking) {
      console.error(`No booking found for payment ${paymentId}`)
      return
    }

    // Update booking with refund details
    await db.collection('bookings').updateOne(
      { _id: booking._id },
      {
        $set: {
          refundStatus: 'completed',
          refundDetails: {
            razorpay_refund_id: refund.id,
            razorpay_payment_id: paymentId,
            amount: refund.amount / 100,
            currency: refund.currency,
            status: refund.status,
            reason: refund.notes?.reason || 'Not specified',
            refundedAt: new Date(),
          },
          updatedAt: new Date()
        }
      }
    )
  } catch (error) {
    console.error('Error handling refund.created webhook:', error)
  }
}

// Helper function to create a notification for the facility provider
async function createBookingNotification(db: any, booking: any) {
  try {
    const facility = await db.collection('Facilities').findOne({
      _id: booking.facilityId
    })
    
    const startup = await db.collection('Startups').findOne({
      _id: booking.startupId
    })

    if (!facility || !startup) return

    const notification = {
      userId: booking.incubatorId.toString(),
      type: 'booking-approved',
      title: 'New Booking Received',
      message: `${startup.startupName} has booked ${facility.details.name} for ${booking.rentalPlan}`,
      relatedId: booking._id.toString(),
      relatedType: 'booking',
      isRead: false,
      createdAt: new Date(),
      metadata: {
        facilityName: facility.details.name,
        startupName: startup.startupName,
        facilityType: facility.facilityType,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        amount: booking.amount
      }
    }

    await db.collection('notifications').insertOne(notification)
  } catch (error) {
    console.error('Error creating booking notification:', error)
  }
} 