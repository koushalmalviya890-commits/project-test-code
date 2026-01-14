import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import crypto from 'crypto'

// Import Razorpay
import Razorpay from 'razorpay'

export async function POST(req: NextRequest) {
  try {
    // Get Razorpay keys for this request
    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

    // Check if Razorpay is configured
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      )
    }

    // Initialize Razorpay for this request (avoid singleton in serverless)
    const razorpayClient = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    })

    // Check authentication and ensure user is a startup
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a startup
    if (session.user?.userType !== 'startup') {
      return NextResponse.json(
        { error: 'Only startups can retry bookings' },
        { status: 403 }
      )
    }

    const { bookingId, token } = await req.json()

    if (!bookingId || !ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { error: 'Invalid booking ID' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    
    // Find the booking and validate
    const booking = await db.collection('bookings').findOne({
      _id: new ObjectId(bookingId),
      startupId: new ObjectId(session.user.id)
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or unauthorized' },
        { status: 404 }
      )
    }

    // Check if token is required (for security when accessing via unique link)
    if (token && booking.retryToken !== token) {
      return NextResponse.json(
        { error: 'Invalid retry token' },
        { status: 401 }
      )
    }

    // Validate booking is in a retry-able state
    if (booking.paymentStatus !== 'failed') {
      return NextResponse.json(
        { error: 'This booking is not in a retry-able state' },
        { status: 400 }
      )
    }

    // Check if booking has expired for retry
    if (booking.expiresAt && new Date(booking.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'The retry window for this booking has expired' },
        { status: 410 }
      )
    }

    try {
      // Create a new Razorpay order
      const razorpayOrder = await razorpayClient.orders.create({
        amount: Math.round(booking.amount * 100), // Convert to paise as integer
        currency: 'INR',
        receipt: booking._id.toString(),
        notes: {
          bookingId: booking._id.toString(),
          facilityId: booking.facilityId.toString(),
          startupId: session.user.id,
          rentalPlan: booking.rentalPlan,
          isRetry: 'true'
        },
      })

      // Update booking with new razorpay order ID and tracking retry attempts
      const retryAttempt = {
        razorpayOrderId: razorpayOrder.id,
        attemptedAt: new Date(),
        status: 'pending',
      }
      
      await db.collection('bookings').updateOne(
        { _id: new ObjectId(bookingId) },
        {
          $set: {
            razorpayOrderId: razorpayOrder.id,
            updatedAt: new Date(),
          },
          $unset: {
            retryToken: ""  // Remove the field completely
          },
          $push: {
            paymentRetries: retryAttempt
          }
        }
      )

      // Return order information to client
      return NextResponse.json({
        orderId: razorpayOrder.id,
        bookingId: bookingId,
        amount: booking.amount,
        currency: 'INR',
        keyId: RAZORPAY_KEY_ID,
      })
    } catch (razorpayError: any) {
      return NextResponse.json(
        { error: 'Failed to create retry payment order', details: razorpayError.message },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create retry payment order' },
      { status: 500 }
    )
  }
} 