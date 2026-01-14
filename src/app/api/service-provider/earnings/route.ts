import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getFixedServiceFee } from '@/lib/pricing'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const userId = new ObjectId(session.user.id)
    
    // Get all bookings for this service provider with proper filtering
    const bookings = await db.collection('bookings').aggregate([
      {
        $match: {
          incubatorId: userId
        }
      },
      // Join with Facilities collection
      {
        $lookup: {
          from: 'Facilities',
          localField: 'facilityId',
          foreignField: '_id',
          as: 'facility'
        }
      },
      // Join with Startups collection to get startup details
      {
        $lookup: {
          from: 'Startups',
          localField: 'startupId',
          foreignField: 'userId',
          as: 'startup'
        }
      },
      // Only keep bookings where both facility and startup exist
      {
        $match: {
          'facility': { $ne: [] },
          'startup': { $ne: [] }
        }
      },
      {
        $unwind: {
          path: '$facility',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $unwind: {
          path: '$startup',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $project: {
          _id: 1,
          bookingId: { $toString: "$_id" },
          date: '$startDate',
          amount: 1,
          serviceFee: 1,
          baseAmount: 1,
          status: 1,
          facility: '$facility.details.name',
          facilityType: '$facility.facilityType',
          invoiceUrl: 1,
          createdAt: 1,
          requestedAt: 1
        }
      }
    ]).toArray()

    // Calculate total earnings (all time)
    const totalEarnings = bookings
      .filter(booking => booking.status === 'approved')
      .reduce((sum, booking) => sum + (booking.amount || 0), 0)

    // Calculate monthly earnings (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const monthlyEarnings = bookings
      .filter(booking => {
        const bookingDate = new Date(booking.date)
        return booking.status === 'approved' && bookingDate >= thirtyDaysAgo
      })
      .reduce((sum, booking) => sum + (booking.amount || 0), 0)

    // Calculate pending payouts (last 30 days, base amount before fixed fee)
    const pendingPayouts = bookings
      .filter(booking => {
        const bookingDate = new Date(booking.requestedAt || booking.createdAt)
        return (
          booking.status === 'approved' &&
          bookingDate >= thirtyDaysAgo
        )
      })
      .reduce((sum, booking) => {
        // Get base amount
        const baseAmount = booking.amount || 0
        
        // Get the facility type for this booking
        const facilityType = booking.facilityType || 'default'
        
        // Calculate fixed service fee
        const fixedServiceFee = booking.serviceFee || 0
        const overAllServicFeeGst = fixedServiceFee * 0.18 
        const finalPrice = fixedServiceFee + overAllServicFeeGst
       // console.log(`Fixed service fee for facility type ${facilityType}: ${fixedServiceFee} : ${overAllServicFeeGst}`)

        // Return base amount minus fixed service fee
        return Math.round(sum + (baseAmount - finalPrice))
      }, 0)

    // Format transactions
    const transactions = bookings.map(booking => ({
      _id: booking._id,
      bookingId: booking.bookingId,
      date: new Date(booking.date).toISOString(),
      amount: booking.amount || 0,
      serviceFee: booking.serviceFee || 0,
      status: booking.status === 'approved' ? 'Completed' : 'Pending',
      facility: booking.facility || 'Unknown Facility',
      facilityType: booking.facilityType || 'Unknown Type',
      invoiceUrl: booking.invoiceUrl
    }))

    return NextResponse.json({
      totalEarnings,
      monthlyEarnings,
      pendingPayouts,
      transactions
    })

  } catch (error) {
    console.error('Error in earnings API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 