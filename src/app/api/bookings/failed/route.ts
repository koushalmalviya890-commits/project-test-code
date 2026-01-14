import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the facilityId from query params
    const { searchParams } = new URL(req.url)
    const facilityId = searchParams.get('facilityId')

    if (!facilityId || !ObjectId.isValid(facilityId)) {
      return NextResponse.json({ error: 'Invalid facility ID' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    // Find the most recent failed payment for this facility and user
    // that hasn't expired yet
    const now = new Date()
    
    const failedBooking = await db.collection('bookings').findOne(
      {
        facilityId: new ObjectId(facilityId),
        startupId: new ObjectId(session.user.id),
        paymentStatus: 'failed',
        expiresAt: { $gt: now }, // Only get non-expired bookings
      },
      {
        sort: { updatedAt: -1 }, // Get the most recent one
        projection: { _id: 1 }
      }
    )

    if (!failedBooking) {
      return NextResponse.json({ bookingId: null })
    }

    return NextResponse.json({ bookingId: failedBooking._id.toString() })
  } catch (error) {
    console.error('Error checking for failed payments:', error)
    return NextResponse.json(
      { error: 'Failed to check for failed payments' },
      { status: 500 }
    )
  }
} 