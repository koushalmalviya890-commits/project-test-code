import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId, Document } from 'mongodb'
import { getFixedServiceFee } from '@/lib/pricing'

interface Facility extends Document {
  _id: ObjectId
  type: string
  name: string
}

interface Booking extends Document {
  _id: ObjectId
  facilityId: ObjectId
  startDate: Date
  endDate: Date
  amount: number
  status: string
  userName: string
}

interface MonthlyData {
  _id: {
    year: number
    month: number
  }
  amount: number
  count: number
}

interface BookingResponse {
  _id: string;
  facilityId: string;
  facilityName: string;
  facilityType: string;
  startupId: string;
  startupName: string;
  incubatorId: string;
  rentalPlan: string;
  status: string;
  paymentStatus: string;
  amount: number;
  requestedAt: string;
  processedAt: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  whatsappNumber: string;
}

export async function GET(req: NextRequest) {
  try {
    // Authentication check - exactly matching bookings API
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
     // console.log('Unauthorized: No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')
    
    // Connect to MongoDB
    const { db } = await connectToDatabase()
    
    // Get userId from session - exactly matching bookings API
   // console.log('Fetching service provider with userId:', session.user.id);
    const userId = new ObjectId(session.user.id)
    
    // Set serviceProviderId to userId - exactly matching bookings API
    const serviceProviderId = userId
   // console.log('Using service provider ID:', serviceProviderId.toString());
    
    // Format the date for filtering
    const selectedDate = date ? new Date(date) : new Date()
    selectedDate.setHours(0, 0, 0, 0)
    
    // End of selected date
    const endOfSelectedDate = new Date(selectedDate)
    endOfSelectedDate.setHours(23, 59, 59, 999)
    
    // Calculate the start of the current month
    const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    
    // Calculate the start of the previous month
    const startOfPreviousMonth = new Date(startOfMonth)
    startOfPreviousMonth.setMonth(startOfPreviousMonth.getMonth() - 1)
    
    // Calculate the end of previous month
    const endOfPreviousMonth = new Date(startOfMonth)
    endOfPreviousMonth.setDate(0)
    endOfPreviousMonth.setHours(23, 59, 59, 999)
    
    // Get total facilities for this service provider
    const totalFacilities = await db.collection('Facilities').countDocuments({
      serviceProviderId: serviceProviderId,
      status: 'active'
    })
    
    // Fetch all facilities for this service provider
    const facilitiesData = await db.collection('Facilities')
      .find({ serviceProviderId: serviceProviderId })
      .project({ 
        _id: 1, 
        'details.name': 1, 
        facilityType: 1,
        status: 1
      })
      .toArray()
    
    // Build the aggregation pipeline - matching the structure from bookings API
    const dashboardData = await db.collection('bookings').aggregate([
      {
        $match: {
          incubatorId: serviceProviderId
        }
      },
      {
        $lookup: {
          from: 'Startups',
          localField: 'startupId',
          foreignField: 'userId',
          as: 'startup'
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
        $match: {
          'startup': { $ne: [] },
          'facility': { $ne: [] }
        }
      },
      {
        $facet: {
          // All bookings without unwinding for metrics calculations
          allBookings: [
            {
              $project: {
                _id: 1,
                bookingId: { $toString: "$_id" },
                startup: 1,
                facility: 1,
                startDate: 1,
                endDate: 1,
                rentalPlan: 1,
                amount: 1,
                status: 1,
                paymentStatus: 1,
                requestedAt: 1,
                createdAt: 1
              }
            }
          ],
          
          // Calendar bookings - for the selected date
          calendarBookings: [
            {
              $match: {
                $or: [
                  // Bookings that start on the selected day
                  { startDate: { $gte: selectedDate, $lte: endOfSelectedDate } },
                  // Bookings that end on the selected day
                  { endDate: { $gte: selectedDate, $lte: endOfSelectedDate } },
                  // Bookings that span over the selected day
                  { 
                    startDate: { $lt: selectedDate },
                    endDate: { $gt: endOfSelectedDate }
                  }
                ]
              }
            },
            {
              $unwind: '$facility'
            },
            {
              $unwind: '$startup'
            },
            {
              $project: {
                _id: 1,
                bookingId: { $toString: "$_id" },
                facilityId: '$facilityId',
                facilityName: '$facility.details.name',
                facilityType: '$facility.facilityType',
                startupId: '$startupId',
                startupDetails: {
                  logoUrl: { $ifNull: ['$startup.logoUrl', '/placeholder-logo.png'] },
                  startupName: '$startup.startupName'
                },
                startupName: '$startup.startupName',
                status: 1,
                amount: 1,
                startDate: 1,
                endDate: 1,
                rentalPlan: 1,
                paymentStatus: 1,
                whatsappNumber: 1,
                bookedOn: '$requestedAt',
                createdAt: 1
              }
            },
            {
              $sort: { startDate: 1 }
            }
          ],
          
          // Recent booking notifications
          recentBookings: [
            {
              $sort: { requestedAt: -1 }
            },
            {
              $limit: 5
            },
            {
              $unwind: '$facility'
            },
            {
              $unwind: '$startup'
            },
            {
              $project: {
                _id: 1,
                bookingId: { $toString: "$_id" },
                facilityId: '$facilityId',
                facilityName: '$facility.details.name',
                facilityType: '$facility.facilityType',
                startupId: '$startupId',
                startupDetails: {
                  logoUrl: { $ifNull: ['$startup.logoUrl', '/placeholder-logo.png'] },
                  startupName: '$startup.startupName'
                },
                userName: '$startup.startupName',
                status: 1,
                amount: 1,
                bookedOn: '$requestedAt',
                createdAt: 1
              }
            }
          ],
          
          // Monthly booking data for the chart
          monthlyData: [
            {
              $match: {
                status: "approved"
              }
            },
            {
              $group: {
                _id: {
                  year: { $year: '$startDate' },
                  month: { $month: '$startDate' }
                },
                count: { $sum: 1 },
                amount: { $sum: '$amount' }
              }
            },
            {
              $sort: { '_id.year': 1, '_id.month': 1 }
            }
          ]
        }
      }
    ]).toArray()

    // Extract results
    const [result] = dashboardData
    const allBookings = result.allBookings || [] as Booking[]
    const calendarBookings = result.calendarBookings || []
    const recentNotifications = result.recentBookings || []
    const monthlyData = result.monthlyData || []
    
    // Calculate pending payouts (last 30 days, base amount before commission)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const pendingPayouts = allBookings
      .filter((booking: Booking) => {
        const bookingDate = new Date(booking.requestedAt || booking.createdAt)
        return (
          booking.status === 'approved' &&
          bookingDate >= thirtyDaysAgo
        )
      })
      .reduce((sum: number, booking: Booking) => {
        // Get base amount
        const baseAmount = booking.amount || 0
        
        // Get the facility type for this booking
        const facilityType = booking.facilityType || 'default'
        
        // Calculate fixed service fee
        const fixedServiceFee = getFixedServiceFee(facilityType)
        
        // Return base amount minus fixed service fee
        return sum + (baseAmount - fixedServiceFee)
      }, 0)

    // Calculate current month metrics
    const currentMonthBookings = allBookings.filter((booking: Booking) => {
      const bookingStartDate = new Date(booking.startDate)
      return booking.status === 'approved' && bookingStartDate >= startOfMonth && bookingStartDate <= endOfSelectedDate
    })
    
    const currentMonthMetrics = {
      totalBookings: currentMonthBookings.length,
      totalEarnings: currentMonthBookings.reduce((sum: number, booking: Booking) => sum + (booking.amount || 0), 0)
    }
    
    // Calculate previous month metrics
    const previousMonthBookings = allBookings.filter((booking: Booking) => {
      const bookingStartDate = new Date(booking.startDate)
      return booking.status === 'approved' && bookingStartDate >= startOfPreviousMonth && bookingStartDate <= endOfPreviousMonth
    })
    
    const previousMonthMetrics = {
      totalBookings: previousMonthBookings.length,
      totalEarnings: previousMonthBookings.reduce((sum: number, booking: Booking) => sum + (booking.amount || 0), 0)
    }
    
    // Calculate month-over-month comparisons
    let bookingsComparison = 0
    let earningsComparison = 0

    if (previousMonthMetrics.totalBookings > 0) {
      bookingsComparison = Math.round(((currentMonthMetrics.totalBookings - previousMonthMetrics.totalBookings) / previousMonthMetrics.totalBookings) * 100)
    }

    if (previousMonthMetrics.totalEarnings > 0) {
      earningsComparison = Math.round(((currentMonthMetrics.totalEarnings - previousMonthMetrics.totalEarnings) / previousMonthMetrics.totalEarnings) * 100)
    }
    
    // Calculate weekly earnings
    const weekStart = new Date(selectedDate)
    weekStart.setDate(weekStart.getDate() - 7)
    
    const previousWeekStart = new Date(weekStart)
    previousWeekStart.setDate(previousWeekStart.getDate() - 7)
    
    const thisWeekBookings = allBookings.filter((booking: Booking) => {
      const bookingStartDate = new Date(booking.startDate)
      return booking.status === 'approved' && bookingStartDate >= weekStart && bookingStartDate <= endOfSelectedDate
    })
    
    const previousWeekBookings = allBookings.filter((booking: Booking) => {
      const bookingStartDate = new Date(booking.startDate)
      return booking.status === 'approved' && bookingStartDate >= previousWeekStart && bookingStartDate < weekStart
    })
    
    const thisWeekEarnings = thisWeekBookings.reduce((sum: number, booking: Booking) => sum + (booking.amount || 0), 0)
    const previousWeekEarnings = previousWeekBookings.reduce((sum: number, booking: Booking) => sum + (booking.amount || 0), 0)
    
    // Format the monthly data for the chart
    const formattedMonthlyData = monthlyData.map((data: MonthlyData) => ({
      month: `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][data._id.month - 1]} ${data._id.year.toString().slice(2)}`,
      amount: data.amount,
      count: data.count
    }))
    
    // Format the response
    return NextResponse.json({
      kpis: {
        totalFacilities,
        totalBookings: allBookings.length,
        totalEarnings: allBookings
          .filter((booking: Booking) => booking.status === 'approved')
          .reduce((sum: number, booking: Booking) => sum + (booking.amount || 0), 0),
        monthlyComparison: {
          bookings: bookingsComparison,
          earnings: earningsComparison
        },
        pendingPayouts
      },
      monthlyPayouts: formattedMonthlyData,
      notifications: recentNotifications,
      calendarBookings,
      dailyEarningData: {
        thisWeek: thisWeekEarnings,
        lastWeek: previousWeekEarnings
      },
      monthlySummaryData: {
        totalEarnings: currentMonthMetrics.totalEarnings,
        lastMonth: previousMonthMetrics.totalEarnings,
        monthlyComparison: earningsComparison
      }
    })
    
  } catch (error) {
    console.error('Error in dashboard API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 