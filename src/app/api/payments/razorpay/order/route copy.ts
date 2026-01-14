import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'

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
        { error: 'Only startups can make bookings' },
        { status: 403 }
      )
    }

    // Get request data
    const requestData = await req.json()
    
    // For clarity, extract values from the request
    const { 
      facilityId, 
      rentalPlan, 
      amount, // This is now baseAmount (original base price × units + fixed fee) 
      originalBaseAmount, // Original base price × units (without service fee)
      serviceFee, // Fixed service fee
      gstAmount, 
      totalAmount, 
      startDate, 
      endDate, 
      contactNumber,
      unitCount,
      bookingSeats, // Number of booking slots selected
    } = requestData

    // Validate required fields
    if (
      !facilityId ||
      !rentalPlan ||
      typeof amount !== 'number' ||
      typeof totalAmount !== 'number' ||
      !startDate ||
      !endDate ||
      !contactNumber
      
    ) {
      return NextResponse.json(
        { error: 'Missing required fields for booking' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Get the facility to find the service provider ID
    const facility = await db.collection('Facilities').findOne({
      _id: new ObjectId(facilityId),
    })

    if (!facility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      )
    }

    // Create a pending booking
    const bookingData = {
      facilityId: new ObjectId(facilityId),
      startupId: new ObjectId(session.user.id),
      incubatorId: facility.serviceProviderId,
      rentalPlan,
      status: 'pending',
      paymentStatus: 'pending',
      amount: totalAmount, // Store the total amount (base amount with service fee)
      baseAmount: originalBaseAmount, // Store the base amount with service fee
      originalBaseAmount: originalBaseAmount || undefined, // Store original base amount (without service fee)
      serviceFee: serviceFee || undefined, // Store the service fee separately
      gstAmount:gstAmount , // GST is set to 0
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      whatsappNumber: contactNumber,
      unitCount: unitCount || 1,
      requestedAt: new Date(),
      // Add expiration time - 30 minutes from now
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      paymentRetries: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      bookingSeats: bookingSeats || 1, // Store the number of booking slots
    }

    // Insert booking record
    const result = await db.collection('bookings').insertOne(bookingData)
    const bookingId = result.insertedId

    try {
      // Create Razorpay order
      // The amount needs to be in the smallest currency unit (paise for INR)
      const razorpayOrder = await razorpayClient.orders.create({
        amount: Math.round(totalAmount * 100), // Convert to paise as integer
        currency: 'INR',
        receipt: bookingId.toString(),
        notes: {
          bookingId: bookingId.toString(),
          facilityId,
          startupId: session.user.id,
          rentalPlan,
        },
      })

      // Update booking with razorpay order ID
      await db.collection('bookings').updateOne(
        { _id: bookingId },
        {
          $set: {
            razorpayOrderId: razorpayOrder.id,
            updatedAt: new Date(),
          },
        }
      )

      

      // Return order information to client
      return NextResponse.json({
        orderId: razorpayOrder.id,
        bookingId: bookingId.toString(),
        amount: totalAmount,
        currency: 'INR',
        keyId: RAZORPAY_KEY_ID,
      })
    } catch (razorpayError: any) {
      // If Razorpay order creation fails, clean up the booking
      await db.collection('bookings').deleteOne({ _id: bookingId })
      
      return NextResponse.json(
        { error: 'Failed to create payment order', details: razorpayError.message },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    )
  }
} 