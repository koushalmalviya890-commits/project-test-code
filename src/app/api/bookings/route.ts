import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { authOptions } from '@/lib/auth'

const validityMap = {
  "Annual": 365 * 24 * 60 * 60 * 1000,
  "Monthly": 30 * 24 * 60 * 60 * 1000,
  "Weekly": 7 * 24 * 60 * 60 * 1000,
  "One Day (24 Hours)": 24 * 60 * 60 * 1000,
  "Hourly": 60 * 60 * 1000
}

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.error('Unauthorized access attempt to /api/bookings');
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const detailed = searchParams.get('detailed') === 'true'
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    
   // console.log(`Request for bookings - detailed: ${detailed}, startDate: ${startDateParam}, endDate: ${endDateParam}`);
    
    // Connect to the database
    const { db } = await connectToDatabase()
    
    // Convert session user ID to ObjectId for matching
    const userId = new ObjectId(session.user.id)
   // console.log(`Fetching bookings for user ID: ${userId.toString()}`);
    
    // Build the matching pipeline for the incubatorId
    const matchPipeline: any = {
      incubatorId: userId
    }
    
    // Add date filters if provided
    if (startDateParam || endDateParam) {
      matchPipeline.startDate = {}
      
      if (startDateParam) {
        const startDate = new Date(startDateParam)
        startDate.setUTCHours(0, 0, 0, 0)
        matchPipeline.startDate.$gte = startDate
      }
      
      if (endDateParam) {
        const endDate = new Date(endDateParam)
        endDate.setUTCHours(23, 59, 59, 999)
        
        if (matchPipeline.startDate) {
          matchPipeline.startDate.$lte = endDate
        } else {
          matchPipeline.startDate = { $lte: endDate }
        }
      }
    }
    
    // Log the query we're about to execute
   // console.log('Executing MongoDB query with match:', JSON.stringify(matchPipeline));
    
    // Check if the collection exists and has documents
    const collectionInfo = await db.listCollections({name: 'bookings'}).toArray()
    if (collectionInfo.length === 0) {
      console.error('Bookings collection not found')
      return NextResponse.json({
        error: 'Bookings collection not found',
        bookings: []
      }, { status: 404 })
    }
    
    // Count total matching documents for verification
    const totalMatchingBookings = await db.collection('bookings').countDocuments(matchPipeline)
   // console.log(`Total matching bookings before aggregation: ${totalMatchingBookings}`)
    
    // Perform aggregation to fetch bookings with related data
    const bookings = await db.collection('bookings').aggregate([
      // Match bookings for this incubator with any date filters
      {
        $match: matchPipeline
      },
      // Join with Startups collection
      {
        $lookup: {
          from: 'Startups',
          let: { startupId: "$startupId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$userId", "$$startupId"] }
              }
            }
          ],
          as: 'startup'
        }
      },
      // Join with Facilities collection
      {
        $lookup: {
          from: 'Facilities',
          let: { facilityId: "$facilityId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$facilityId"] }
              }
            }
          ],
          as: 'facility'
        }
      },
      // Filter out any bookings where we couldn't find the related startup or facility
      {
        $match: {
          'startup': { $ne: [] },
          'facility': { $ne: [] }
        }
      },
      // Unwind arrays to get individual documents
      {
        $unwind: {
          path: '$facility',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$startup',
          preserveNullAndEmptyArrays: true
        }
      },
      // Project only the fields we need
      {
        $project: {
          _id: 1,
          bookingId: { $toString: "$_id" },
          startupDetails: {
            logoUrl: { $ifNull: ['$startup.logoUrl', '/placeholder-logo.png'] },
            startupName: { $ifNull: ['$startup.startupName', 'Unknown Startup'] }
          },
          facilityType: { $ifNull: ['$facility.facilityType', 'Unknown Type'] },
          facilityName: { $ifNull: ['$facility.details.name', 'Unknown Facility'] },
          bookedOn: { $ifNull: ['$requestedAt', '$createdAt'] },
          startDate: 1,
          endDate: 1,
          rentalPlan: 1,
          amount: 1,
          baseAmount: 1,
          gstAmount: 1,
          status: 1,
          paymentStatus: 1,
          whatsappNumber: 1,
          invoiceUrl: 1,
          bookingSeats: 1, // Include bookingSeats
        }
      },
      // Sort by booked date, newest first
      {
        $sort: { bookedOn: -1 }
      }
    ]).toArray()
    
   // console.log(`Successfully fetched ${bookings.length} bookings after aggregation`);
    
    if (bookings.length === 0) {
     // console.log('No bookings found for this service provider');
    } else if (bookings.length !== totalMatchingBookings) {
      console.warn(`Mismatch between pre-count (${totalMatchingBookings}) and fetched bookings (${bookings.length})`);
    }
    
    // If detailed flag is true, calculate metrics
    if (detailed) {
      // Current date info
      const now = new Date()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      // Calculate metrics
      const todayBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.startDate)
        return bookingDate >= startOfToday
      }).length

      const totalBookingsThisMonth = bookings.filter(booking => {
        const bookingDate = new Date(booking.startDate)
        return bookingDate >= startOfMonth
      }).length

      const completedBookings = bookings.filter(booking => 
        booking.status?.toLowerCase() === 'approved'
      ).length

      const rejectedCancelledBookings = bookings.filter(booking => 
        booking.status?.toLowerCase() === 'rejected' || booking.status?.toLowerCase() === 'cancelled'
      ).length

      const pendingBookings = bookings.filter(booking => 
        booking.status?.toLowerCase() === 'pending'
      ).length

     // console.log('Calculated metrics:', {
      //   totalBookingsThisMonth,
      //   todayBookings,
      //   completedBookings,
      //   rejectedCancelledBookings,
      //   pendingBookings
      // });

      return NextResponse.json({
        bookings: bookings,
        metrics: {
          totalBookingsThisMonth,
          todayBookings,
          completedBookings,
          rejectedCancelledBookings,
          pendingBookings
        }
      })
    }

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error in GET /api/bookings:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function POST(req: NextRequest) {
  console.log("🚀 >>> API ROUTE HIT: POST /api/bookings <<<");
  try {
    // Verify authentication
     // Verify authentication
    const session = await getServerSession(authOptions)
       console.log("🔍 Session check:", session ? `User ID: ${session.user?.id}` : "No Session");

    if (!session?.user?.id) {
      console.error('Unauthorized POST attempt to /api/bookings');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
 if (session.user.userType === 'Service Provider') { 
        console.error('❌ Forbidden: Service Providers cannot create bookings');
        return NextResponse.json(
          { success: false, message: 'Service Providers are not authorized to make bookings.' },
          { status: 403 } // 403 Forbidden
        )
    }
     let body;
    try {
        body = await req.json();
    } catch (jsonError) {
        console.error("❌ Failed to parse JSON body");
        return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
    }

    // console.log('📨 Received Booking Request Body:', JSON.stringify(body, null, 2))
    // console.log('POST /api/bookings body:', body)
    const {
      // userId,
      facilityId,
      // facility,
      rentalPlan,
      unitCount,
      unitLabel,
      bookingSeats,
      label,
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
    } = body

  //  // console.log('Creating booking with data:', {
  //     facilityId,
  //   rentalPlan,
  //     unitCount,
  //     unitLabel,
  //     // seating,
  //     bookingSeats,
  //     bookingUnitLabel,
  //     startDate,
  //     endDate,
  //     contactNumber,
  //     originalBaseAmount,
  //   baseAmount,
  //       perUnitPrice,
  //       serviceFee,
  //       gstAmount,
  //       totalBeforeDiscount,
  //       discount,
  //       amount,
  //     couponApplied
  //   })

    // Validate required fields
   if (
      !facilityId ||
      !rentalPlan ||
      !startDate ||
      !endDate ||
      !contactNumber ||
      !amount
    ) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }
if (!ObjectId.isValid(facilityId)) {
      // console.error('❌ Invalid Facility ID format:', facilityId);
      return NextResponse.json({ success: false, message: 'Invalid Facility ID' }, { status: 400 })
    }
    // Connect to database
    const { db } = await connectToDatabase()

    // Get facility to find service provider
    // Get facility to find service provider
    const facilityDoc = await db.collection('Facilities').findOne({
      _id: new ObjectId(facilityId)
    })

    if (!facilityDoc) {
      console.error('❌ Facility not found in DB for ID:', facilityId);
      return NextResponse.json(
        { success: false, message: 'Facility not found' },
        { status: 404 }
      )
    }

    // Handle coupon if applied
    if (couponApplied && couponApplied.couponId) {
      try {
        const serviceProvider = await db.collection('Service Provider').findOne({
          $or: [
            { _id: facilityDoc.serviceProviderId },
            { userId: facilityDoc.serviceProviderId }
          ]
        })

        if (serviceProvider && serviceProvider.coupons) {
          const couponIndex = serviceProvider.coupons.findIndex(
            (c: any) => c._id.toString() === couponApplied.couponId
          )

          if (couponIndex !== -1) {
            await db.collection('Service Provider').updateOne(
              { _id: serviceProvider._id },
              { 
                $inc: { 
                  [`coupons.${couponIndex}.usedCount`]: 1 
                } 
              }
            )
          }
        }
      } catch (couponError) {
        console.error('Error updating coupon usage:', couponError)
      }
    }

    // Create booking document with new structure
    const booking = {
      startupId: new ObjectId(session.user.id),
      facilityId: new ObjectId(facilityId),
      incubatorId: facilityDoc.serviceProviderId
  ? new ObjectId(facilityDoc.serviceProviderId)
  : null,

      // Rental Plan details
      rentalPlan: rentalPlan,
        unitCount: unitCount,
        unitLabel: unitLabel,

      // Seating details
      // seating: {
      //   count: seating.count,
      //   type: seating.type,
      //   label: seating.label
      // },
                bookingSeats: bookingSeats,
          // type: facility?.details?.bookingPlanType || 'seat',
          label: label,

      // Timing details
      // timing: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      // },

      // Contact details
      whatsappNumber: contactNumber,

      // Pricing details
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

      // Coupon details
      couponApplied: couponApplied || null,

      // Status and metadata
      status: 'pending',
      paymentStatus: 'pending',
      requestedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }


    //  console.log('💾 Inserting Booking:', booking);


    let result;
    try {
      result = await db.collection('bookings').insertOne(booking)
    } catch (dbError: any) {
      console.error('❌ MongoDB Insert Error:', dbError);
      return NextResponse.json(
        { success: false, message: `Database insertion failed: ${dbError.message}` },
        { status: 500 }
      );
    }
    if (!result.insertedId) {
      throw new Error('Booking insertion failed')
    }
        // console.log('✅ Booking created:', result.insertedId);

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      bookingId: result.insertedId.toString(),
      data: {
        ...booking,
        _id: result.insertedId
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/bookings:', error)
    return NextResponse.json(
      { 
        success: false,
        message: error instanceof Error ? error.message : 'Internal Server Error' 
      }, 
      { status: 500 }
    )
  }
}