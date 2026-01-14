
// import { NextRequest, NextResponse } from 'next/server'
// import { connectToDatabase } from '@/lib/mongodb'
// import { ObjectId } from 'mongodb'

// // Import Razorpay
// import Razorpay from 'razorpay'

// export async function POST(req: NextRequest) {
//   try {
//     // Get Razorpay keys for this request
//     const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
//     const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

//     // Check if Razorpay is configured
//     if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
//       return NextResponse.json(
//         { error: 'Payment service not configured' },
//         { status: 500 }
//       )
//     }

//     // Initialize Razorpay for this request (avoid singleton in serverless)
//     const razorpayClient = new Razorpay({
//       key_id: RAZORPAY_KEY_ID,
//       key_secret: RAZORPAY_KEY_SECRET,
//     })

//     // Check authentication and ensure user is a startup
//     // const session = await getServerSession(authOptions)
//     // if (!session?.user?.id) {
//     //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     // }

//     // // Verify user is a startup
//     // if (session.user?.userType !== 'startup') {
//     //   return NextResponse.json(
//     //     { error: 'Only startups can make bookings' },
//     //     { status: 403 }
//     //   )
//     // }

//     // Get request data
//     const requestData = await req.json()
    
//     // For clarity, extract values from the request
//     const { 
//       email,
//       facilityId, 
//       rentalPlan, 
//       amount, // This is now baseAmount (original base price × units + fixed fee) 
//       originalBaseAmount, // Original base price × units (without service fee)
//       serviceFee, // Fixed service fee
//       gstAmount, 
//       totalAmount, 
//       startDate, 
//       endDate, 
//       contactNumber,
//       unitCount,
//       bookingSeats, // Number of booking slots selected
//     } = requestData

//     // Validate required fields
//     if (
//       !facilityId ||
//       !rentalPlan ||
//       typeof amount !== 'number' ||
//       typeof totalAmount !== 'number' ||
//       !startDate ||
//       !endDate ||
//       !contactNumber
      
//     ) {
//       return NextResponse.json(
//         { error: 'Missing required fields for booking' },
//         { status: 400 }
//       )
//     }

//     const { db } = await connectToDatabase()

//     // Get the facility to find the service provider ID
//     const facility = await db.collection('Facilities').findOne({
//       _id: new ObjectId(facilityId),
//     })

//     const affiliate = await db.collection('AffiliateLinkUsers').findOne({
//       mailId: email,
//     })

//    // console.log("affiliate", affiliate?.mailId)

// const startupId = affiliate?._id

//     if (!facility) {
//       return NextResponse.json(
//         { error: 'Facility not found' },
//         { status: 404 }
//       )
//     }

//     // Create a pending booking
//     const bookingData = {
//       facilityId: new ObjectId(facilityId),
//       startupId: new ObjectId(startupId),
//       incubatorId: facility.serviceProviderId,
//       rentalPlan,
//       status: 'pending',
//       paymentStatus: 'pending',
//       amount: totalAmount, // Store the total amount (base amount with service fee)
//       baseAmount: originalBaseAmount, // Store the base amount with service fee
//       originalBaseAmount: originalBaseAmount || undefined, // Store original base amount (without service fee)
//       serviceFee: serviceFee || undefined, // Store the service fee separately
//       gstAmount:gstAmount , // GST is set to 0
//       startDate: new Date(startDate),
//       endDate: new Date(endDate),
//       whatsappNumber: contactNumber,
//       unitCount: unitCount || 1,
//       requestedAt: new Date(),
//       // Add expiration time - 30 minutes from now
//       expiresAt: new Date(Date.now() + 30 * 60 * 1000),
//       paymentRetries: [],
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       bookingSeats: bookingSeats || 1, // Store the number of booking slots
//     }

//     // Insert booking record
//     const result = await db.collection('bookings').insertOne(bookingData)
//     const bookingId = result.insertedId

//     try {
//       // Create Razorpay order
//       // The amount needs to be in the smallest currency unit (paise for INR)
//       const razorpayOrder = await razorpayClient.orders.create({
//         amount: Math.round(totalAmount * 100), // Convert to paise as integer
//         currency: 'INR',
//         receipt: bookingId.toString(),
//         notes: {
//           bookingId: bookingId.toString(),
//           facilityId,
//           startupId: (startupId?.toString() ?? ''),
//           rentalPlan,
//         },
//       })

//       // Update booking with razorpay order ID
//       await db.collection('bookings').updateOne(
//         { _id: bookingId },
//         {
//           $set: {
//             razorpayOrderId: razorpayOrder.id,
//             updatedAt: new Date(),
//           },
//         }
//       )

      

//       // Return order information to client
//       return NextResponse.json({
//         orderId: razorpayOrder.id,
//         bookingId: bookingId.toString(),
//         amount: totalAmount,
//         currency: 'INR',
//         keyId: RAZORPAY_KEY_ID,
//       })
//     } catch (razorpayError: any) {
//       // If Razorpay order creation fails, clean up the booking
//       await db.collection('bookings').deleteOne({ _id: bookingId })
      
//       return NextResponse.json(
//         { error: 'Failed to create payment order', details: razorpayError.message },
//         { status: 500 }
//       )
//     }
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Failed to create payment order' },
//       { status: 500 }
//     )
//   }
// } 
    // Get the facility

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import Razorpay from 'razorpay';
import mongoose from 'mongoose';
import User from '@/models/User'; // Adjust path to your User model

export async function POST(req: NextRequest) {
  try {
    // Get Razorpay keys
    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    // Initialize Razorpay
    const razorpayClient = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    // Get request data
    const requestData = await req.json();
    const {
      email,
      facilityId,
      rentalPlan,
      amount,
      originalBaseAmount,
      serviceFee,
      gstAmount,
      totalAmount,
      startDate,
      endDate,
      contactNumber,
      unitCount,
      bookingSeats,
    } = requestData;

    // Validate required fields
    if (
      !email ||
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
      );
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    // Ensure Mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!); // Ensure MONGODB_URI is set in .env
    }

    // Check if user exists, create if not
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        userType: 'startup',
        // Other fields (e.g., invoiceType, isEmailVerified) use schema defaults
      });
    }
    const startupId = user._id;

    // Get the facility
    const facility = await db.collection('Facilities').findOne({
      _id: new ObjectId(facilityId),
    });

    if (!facility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    // Create a pending booking
    const bookingData = {
      facilityId: new ObjectId(facilityId),
      startupId: new ObjectId(startupId),
      incubatorId: facility.serviceProviderId,
      affiliateUserEmail: email || null,
      rentalPlan,
      status: 'pending',
      paymentStatus: 'pending',
      amount: totalAmount,
      baseAmount: originalBaseAmount,
      originalBaseAmount: originalBaseAmount || undefined,
      serviceFee: serviceFee || undefined,
      gstAmount: gstAmount,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      whatsappNumber: contactNumber,
      unitCount: unitCount || 1,
      requestedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      paymentRetries: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      bookingSeats: bookingSeats || 1,
    };

    // Insert booking record
    const result = await db.collection('bookings').insertOne(bookingData);
    const bookingId = result.insertedId;

    try {
      // Create Razorpay order
      const razorpayOrder = await razorpayClient.orders.create({
        amount: Math.round(totalAmount * 100), // Convert to paise
        currency: 'INR',
        receipt: bookingId.toString(),
        notes: {
          bookingId: bookingId.toString(),
          facilityId,
          startupId: startupId.toString(),
          rentalPlan,
        },
      });

      // Update booking with Razorpay order ID
      await db.collection('bookings').updateOne(
        { _id: bookingId },
        {
          $set: {
            razorpayOrderId: razorpayOrder.id,
            updatedAt: new Date(),
          },
        }
      );

      // Return order information to client
      return NextResponse.json({
        orderId: razorpayOrder.id,
        bookingId: bookingId.toString(),
        amount: totalAmount,
        currency: 'INR',
        keyId: RAZORPAY_KEY_ID,
      });
    } catch (razorpayError: any) {
      // Clean up booking if Razorpay fails
      await db.collection('bookings').deleteOne({ _id: bookingId });
      return NextResponse.json(
        { error: 'Failed to create payment order', details: razorpayError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in booking creation:', error);
    return NextResponse.json(
      { error: 'Failed to create booking', details: error.message },
      { status: 500 }
    );
  }
}