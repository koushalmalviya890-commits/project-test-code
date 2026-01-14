import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { authOptions } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // `params` is an async proxy in the Next.js app router; await it before using
    const resolvedParams = await params as { id?: string };
    const bookingId = resolvedParams.id
    if (!bookingId || !ObjectId.isValid(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    // Find the booking with facility details
    const bookings = await db.collection('bookings').aggregate([
      {
        $match: { 
          _id: new ObjectId(bookingId),
          // Make sure the user is either the startup or service provider for this booking
          $or: [
            { startupId: new ObjectId(session.user.id) },
            { incubatorId: new ObjectId(session.user.id) }
          ]
        }
      },
      {
        $lookup: {
          from: 'Facilities',
          localField: 'facilityId',
          foreignField: '_id',
          as: 'facility'
        }
      },
      {
        $unwind: '$facility'
      },
      {
        $project: {
          _id: 1,
          facilityId: { $toString: '$facilityId' },
          facilityName: '$facility.details.name',
          facilityType: '$facility.facilityType',
          startDate: 1,
          endDate: 1,
          amount: 1,
          baseAmount: 1,
          gstAmount: 1,
          unitCount: 1,
          rentalPlan: 1,
          paymentStatus: 1,
          paymentDetails: 1,
          status: 1,
          serviceFee:1,
          requestedAt: 1,
          bookingSeats: 1, // Include bookingSeats
          processedAt: 1,
          address: '$facility.address',
          city: '$facility.city',
          state: '$facility.state',
          country: '$facility.country',
          serviceProviderId: { $toString: '$facility.serviceProviderId' },
          bookedBy: { $toString: '$startupId' },
          whatsappNumber: 1,
          invoiceUrl: 1,
          invoiceEmailHistory: 1
        }
      }
    ]).toArray()

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json(bookings[0])
  } catch (error) {
    console.error('Error fetching booking details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking details' },
      { status: 500 }
    )
  }
} 