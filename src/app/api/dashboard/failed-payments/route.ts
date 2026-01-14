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

    // Only startups can have bookings
    if (session.user?.userType !== 'startup') {
      return NextResponse.json([])
    }

    const { db } = await connectToDatabase()
    
    // Find failed payments that haven't expired or recently expired (within last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const now = new Date()
    
    const failedPayments = await db.collection('bookings').aggregate([
      {
        $match: {
          startupId: new ObjectId(session.user.id),
          paymentStatus: 'failed',
          // Get non-expired or recently expired
          $or: [
            { expiresAt: { $gt: now } },
            { 
              expiresAt: { 
                $lt: now, 
                $gt: sevenDaysAgo 
              } 
            }
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
          facilityImage: { $arrayElemAt: ['$facility.details.images', 0] },
          amount: 1,
          startDate: 1,
          endDate: 1,
          rentalPlan: 1,
          expiresAt: 1,
          isExpired: { $lt: ['$expiresAt', now] },
          updatedAt: 1
        }
      },
      {
        $sort: { updatedAt: -1 }
      }
    ]).toArray()

    return NextResponse.json(failedPayments)
  } catch (error) {
    console.error('Error fetching failed payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch failed payments' },
      { status: 500 }
    )
  }
} 