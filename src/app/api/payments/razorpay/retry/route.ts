import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.userType !== 'startup') {
    return NextResponse.json({ error: 'Only startups can retry bookings' }, { status: 403 });
  }

  const { bookingId, token } = await req.json();

  if (!bookingId || !ObjectId.isValid(bookingId)) {
    return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
  }

  const { db } = await connectToDatabase();

  const booking = await db.collection('bookings').findOne({
    _id: new ObjectId(bookingId),
    startupId: new ObjectId(session.user.id),
  });

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found or unauthorized' }, { status: 404 });
  }

  // Token validation (if provided)
  if (token && booking.retryToken !== token) {
    return NextResponse.json({ error: 'Invalid retry token' }, { status: 401 });
  }

  // Check if retry-able
  if (booking.paymentStatus !== 'failed') {
    return NextResponse.json({ error: 'This booking is not in a retry-able state' }, { status: 400 });
  }

  // Check expiry
  if (booking.expiresAt && new Date(booking.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'The retry window for this booking has expired' }, { status: 410 });
  }

  // Forward to Node.js to create retry Razorpay order
  try {
    const nodeRes = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/api/facility-bookings/payments/create-retry-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: booking._id.toString(),
        amount: booking.amount,
        currency: 'INR',
        receipt: booking._id.toString(),
        notes: {
          bookingId: booking._id.toString(),
          facilityId: booking.facilityId.toString(),
          startupId: session.user.id,
          rentalPlan: booking.rentalPlan,
          isRetry: 'true',
        },
      }),
    });

    const nodeData = await nodeRes.json();

    if (!nodeRes.ok) {
      return NextResponse.json({ error: nodeData.message }, { status: nodeRes.status });
    }

    // Prepare retry attempt log
    const retryAttempt = {
      razorpayOrderId: nodeData.order.id,
      attemptedAt: new Date(),
      status: 'pending',
    };

    // Update booking: set new orderId, remove token, push retry log
    await db.collection('bookings').updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          razorpayOrderId: nodeData.order.id,
          updatedAt: new Date(),
        },
        $unset: {
          retryToken: '',
        },
        $push: {
          paymentRetries: retryAttempt,
        },
      }
    );

    return NextResponse.json({
      orderId: nodeData.order.id,
      bookingId: bookingId,
      amount: booking.amount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Payment retry service unreachable' }, { status: 503 });
  }
}
