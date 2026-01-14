import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.userType !== 'startup') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const {
      facilityId,
      rentalPlan,
      unitCount,
      unitLabel,
      // seating,
      bookingSeats,
      bookingUnitLabel,
   startDate,
      endDate,
      contactNumber,
      originalBaseAmount,
      baseAmount,
        perUnitPrice,
        serviceFee,
        gstAmount,
        totalBeforeDiscount,
        discount,
        amount,
      couponApplied
    } = data;

    // Enhanced validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount for payment', details: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Create pending booking with validated data
    const { db } = await connectToDatabase();

    const facility = await db.collection('Facilities').findOne({
      _id: new ObjectId(facilityId),
    });

    if (!facility) {
      return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
    }

    // Create booking document
    const bookingData = {
      facilityId: new ObjectId(facilityId),
      startupId: new ObjectId(session.user.id),
      incubatorId: facility.serviceProviderId,
        rentalPlan: rentalPlan,
      unitCount: unitCount,
      unitLabel: unitLabel,
      // seating: {
        bookingSeats: bookingSeats,
        // type: facility?.details?.bookingPlanType || 'seat',
        label: bookingUnitLabel,
      // },
      // timing: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      // },
      status: 'pending',
      paymentStatus: 'pending',
      // pricing: {
      originalBaseAmount: originalBaseAmount,
        baseAmount: baseAmount,
        perUnitPrice: perUnitPrice,
        serviceFee: serviceFee,
        gstAmount: gstAmount,
        totalBeforeDiscount: totalBeforeDiscount,
        discount: discount,
        amount: amount,
      // },
      whatsappNumber: contactNumber,
      couponApplied: couponApplied || null,
      requestedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Attempt to reuse an existing pending booking to avoid duplicates.
    // Match by startupId, facilityId, startDate, amount and paymentStatus pending.
    const possibleMatchQuery: any = {
      startupId: new ObjectId(session.user.id),
      facilityId: new ObjectId(facilityId),
      paymentStatus: 'pending',
      amount: amount,
    }

    // If startDate was provided, include it in the match criteria.
    if (startDate) {
      try {
        possibleMatchQuery.startDate = new Date(startDate)
      } catch (e) {
        // ignore parse errors and don't include startDate in match
      }
    }

    let bookingId: string
    const existing = await db.collection('bookings').findOne(possibleMatchQuery)
    if (existing) {
      // Update the existing pending booking with the latest data
      // But avoid overwriting existing fields with undefined/null from the incoming bookingData.
      const sanitized: any = {}
      Object.entries(bookingData).forEach(([k, v]) => {
        // Only include keys with non-undefined values. Allow explicit null if intentionally set.
        if (typeof v !== 'undefined') {
          sanitized[k] = v
        }
      })

      // Ensure we always update the updatedAt timestamp
      sanitized.updatedAt = new Date()

      await db.collection('bookings').updateOne(
        { _id: existing._id },
        {
          $set: sanitized,
        }
      )

      bookingId = existing._id.toString()
     // console.log(`Reusing existing pending booking ${bookingId}`)
    } else {
      const result = await db.collection('bookings').insertOne(bookingData)
      bookingId = result.insertedId.toString()
    }

    // Create Razorpay order
    try {
      // Convert amount to paise and ensure it's a whole number
        const amountInPaise = Math.round(amount);
  
  const nodeRes = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/api/facility-bookings/payments/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.API_SECRET_KEY}`
    },
    body: JSON.stringify({
      bookingId,
      totalAmount: amountInPaise, // Changed from 'amount' to 'totalAmount'
      currency: 'INR',
      receipt: bookingId,
      notes: {
        bookingId,
        facilityId,
        startupId: session.user.id,
        // durationType: duration.type,
        // durationUnits: duration.units,
        rentalPlan: rentalPlan,
      unitCount: unitCount,
        bookingSeats: bookingSeats,
        amount: amount // Adding original amount for reference
      },
    }),
  });

      if (!nodeRes.ok) {
        const errorText = await nodeRes.text();
        console.error('Payment API Error:', errorText);
        
        // Clean up the booking on error
        await db.collection('bookings').deleteOne({ _id: new ObjectId(bookingId) });
        
        return NextResponse.json({
          error: 'Failed to create payment order',
          details: errorText
        }, { status: nodeRes.status });
      }

      const nodeData = await nodeRes.json();

      // Update booking with Razorpay order ID
      await db.collection('bookings').updateOne(
        { _id: new ObjectId(bookingId) },
        {
          $set: {
            razorpayOrderId: nodeData.order.id,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        orderId: nodeData.order.id,
        bookingId,
        amount: amountInPaise,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
      });

    } catch (err) {
      console.error('Payment service error:', err);
      // Clean up the booking on error
      await db.collection('bookings').deleteOne({ _id: new ObjectId(bookingId) });
      
      return NextResponse.json({
        error: 'Payment service unreachable',
        details: err instanceof Error ? err.message : 'Unknown error'
      }, { status: 503 });
    }
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}