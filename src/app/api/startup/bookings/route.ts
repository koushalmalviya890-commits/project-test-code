// import { getServerSession } from 'next-auth'
// import { NextResponse } from 'next/server'
// import { connectToDatabase } from '@/lib/mongodb'
// import { ObjectId } from 'mongodb'
// import { authOptions } from '@/lib/auth'

// const validityMap = {
//   "Annual": 365 * 24 * 60 * 60 * 1000,
//   "Monthly": 30 * 24 * 60 * 60 * 1000,
//   "Weekly": 7 * 24 * 60 * 60 * 1000,
//   "One Day (24 Hours)": 24 * 60 * 60 * 1000,
//   "Hourly": 60 * 60 * 1000
// }

// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions)
//     if (!session?.user?.id) {
//       return new NextResponse('Unauthorized', { status: 401 })
//     }

//     const { db } = await connectToDatabase()
    
//     // Get userId as ObjectId
//     const userId = new ObjectId(session.user.id)
    
//     // Get the Startup document to confirm user is a startup
//     const startup = await db.collection('Startups').findOne({
//       userId: userId
//     })
    
//     if (!startup) {
//       return new NextResponse('User is not associated with a startup', { status: 403 })
//     }
    
//     // Get all bookings for this startup with facility and service provider details
//     // Note: In the system, bookings store startupId = userId directly, not startup._id
//     const bookings = await db.collection('bookings').aggregate([
//       // Match bookings for this startup's user ID
//       {
//         $match: {
//           startupId: userId
//         }
//       },
//       // Join with Facilities collection
//       {
//         $lookup: {
//           from: 'Facilities',
//           localField: 'facilityId',
//           foreignField: '_id',
//           as: 'facility'
//         }
//       },
//       // Join with Service Provider collection
//       {
//         $lookup: {
//           from: 'Service Provider',
//           localField: 'incubatorId',
//           foreignField: 'userId',
//           as: 'serviceProvider'
//         }
//       },
//       // Filter out bookings where we couldn't find facility or service provider
//       {
//         $match: {
//           'facility': { $ne: [] }
//         }
//       },
//       // Unwind arrays to get individual documents
//       {
//         $unwind: {
//           path: '$facility',
//           preserveNullAndEmptyArrays: true
//         }
//       },
//       {
//         $unwind: {
//           path: '$serviceProvider',
//           preserveNullAndEmptyArrays: true
//         }
//       },
//       // Project only the fields we need
//       {
//         $project: {
//           _id: 1,
//           bookingId: { $toString: "$_id" },
//           facilityDetails: {
//             name: '$facility.details.name',
//             type: '$facility.facilityType',
//             images: { $ifNull: ['$facility.details.images', []] },
//             location: { 
//               address: { $ifNull: ['$facility.details.location.address', ''] },
//               city: { $ifNull: ['$facility.details.location.city', ''] }
//             },
//             amenities: '$facility.details.amenities'
//           },
//           serviceProviderDetails: {
//             name: { $ifNull: ['$serviceProvider.serviceName', 'Unknown Provider'] },
//             logoUrl: { $ifNull: ['$serviceProvider.logoUrl', '/placeholder-logo.png'] },
//             email: { $ifNull: ['$serviceProvider.email', ''] },
//             phone: { $ifNull: ['$serviceProvider.phone', ''] }
//           },
//           rentalPlan: 1,
//           amount: 1,
//           baseAmount: 1,
//           gstAmount: 1,
//           bookedOn: '$requestedAt',
//           startDate: 1,
//           endDate: 1,
//           status: 1,
//           paymentStatus: 1,
//           requestNotes: 1,
//           approvalNotes: 1,
//           whatsappNumber: 1,
//           invoiceUrl: 1,
//           unitCount: 1,
//           processedAt: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           lastUpdated: { 
//             $ifNull: ['$updatedAt', '$createdAt'] 
//           }
//         }
//       },
//       // Sort by last updated, newest first
//       {
//         $sort: { lastUpdated: -1 }
//       }
//     ]).toArray()
    
//     // Try a direct query with a session.user.id string if no bookings found
//     if (bookings.length === 0) {
//       // Try a different approach - check if there are any bookings with the string version
//       // of the user ID, as sometimes ObjectId/String conversions can be inconsistent
//       const directBookings = await db.collection('bookings')
//         .find({ 
//           $or: [
//             { startupId: userId },
//             { startupId: session.user.id }
//           ]
//         })
//         .toArray()
      
//       if (directBookings.length > 0) {
//         // Rerun the aggregation with string ID
//         const bookingsWithStringId = await db.collection('bookings').aggregate([
//           {
//             $match: {
//               startupId: session.user.id
//             }
//           },
//           // Rest of pipeline remains the same as above
//           {
//             $lookup: {
//               from: 'Facilities',
//               localField: 'facilityId',
//               foreignField: '_id',
//               as: 'facility'
//             }
//           },
//           {
//             $lookup: {
//               from: 'Service Provider',
//               localField: 'incubatorId',
//               foreignField: '_id',
//               as: 'serviceProvider'
//             }
//           },
//           {
//             $match: {
//               'facility': { $ne: [] }
//             }
//           },
//           {
//             $unwind: {
//               path: '$facility',
//               preserveNullAndEmptyArrays: true
//             }
//           },
//           {
//             $unwind: {
//               path: '$serviceProvider',
//               preserveNullAndEmptyArrays: true
//             }
//           },
//           {
//             $project: {
//               _id: 1,
//               bookingId: { $toString: "$_id" },
//               facilityDetails: {
//                 name: '$facility.details.name',
//                 type: '$facility.facilityType',
//                 images: { $ifNull: ['$facility.details.images', []] },
//                 location: { 
//                   address: { $ifNull: ['$facility.details.location.address', ''] },
//                   city: { $ifNull: ['$facility.details.location.city', ''] }
//                 },
//                 amenities: '$facility.details.amenities'
//               },
//               serviceProviderDetails: {
//                 name: { $ifNull: ['$serviceProvider.serviceName', 'Unknown Provider'] },
//                 logoUrl: { $ifNull: ['$serviceProvider.logoUrl', '/placeholder-logo.png'] },
//                 email: { $ifNull: ['$serviceProvider.email', ''] },
//                 phone: { $ifNull: ['$serviceProvider.phone', ''] }
//               },
//               rentalPlan: 1,
//               amount: 1,
//               baseAmount: 1,
//               gstAmount: 1,
//               bookedOn: '$requestedAt',
//               startDate: 1,
//               endDate: 1,
//               status: 1,
//               paymentStatus: 1,
//               requestNotes: 1,
//               approvalNotes: 1,
//               whatsappNumber: 1,
//               invoiceUrl: 1,
//               unitCount: 1,
//               processedAt: 1,
//               createdAt: 1,
//               updatedAt: 1,
//               lastUpdated: { 
//                 $ifNull: ['$updatedAt', '$createdAt'] 
//               }
//             }
//           },
//           {
//             $sort: { lastUpdated: -1 }
//           }
//         ]).toArray()
        
//         if (bookingsWithStringId.length > 0) {
//           return NextResponse.json(bookingsWithStringId)
//         }
//       }
//     }

//     // Calculate validity for each booking
//     const bookingsWithValidity = bookings.map(booking => {
//       const validityDuration = validityMap[booking.rentalPlan as keyof typeof validityMap]
//       const validityTill = new Date(new Date(booking.bookedOn).getTime() + validityDuration)
      
//       return {
//         ...booking,
//         validityTill: validityTill.toISOString()
//       }
//     })

//     return NextResponse.json(bookingsWithValidity)
//   } catch (error) {
//     console.error('Error in GET /api/startup/bookings:', error)
//     return new NextResponse('Internal Server Error', { status: 500 })
//   }
// } 

import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
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

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { db } = await connectToDatabase()
    
    // Get userId as ObjectId
    const userId = new ObjectId(session.user.id)
    
    // Get the Startup document to confirm user is a startup
    const startup = await db.collection('Startups').findOne({
      userId: userId
    })
    
    if (!startup) {
      return new NextResponse('User is not associated with a startup', { status: 403 })
    }
    
    // Get all bookings for this startup with facility and service provider details
    const bookings = await db.collection('bookings').aggregate([
      // Match bookings for this startup's user ID
      {
        $match: {
          startupId: userId
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
      // Join with Service Provider collection
      {
        $lookup: {
          from: 'Service Provider',
          localField: 'incubatorId',
          foreignField: 'userId',
          as: 'serviceProvider'
        }
      },
      // Filter out bookings where we couldn't find facility or service provider
      {
        $match: {
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
          path: '$serviceProvider',
          preserveNullAndEmptyArrays: true
        }
      },
      // Project only the fields we need
      {
        $project: {
          _id: 1,
          bookingId: { $toString: "$_id" },
          // Add the IDs you want to send
          facilityId: 1,
          startupId: 1,
          incubatorId: 1,
          facilityDetails: {
            name: '$facility.details.name',
            type: '$facility.facilityType',
            images: { $ifNull: ['$facility.details.images', []] },
            location: { 
              address: { $ifNull: ['$facility.details.location.address', ''] },
              city: { $ifNull: ['$facility.details.location.city', ''] }
            },
            amenities: '$facility.details.amenities'
          },
          serviceProviderDetails: {
            name: { $ifNull: ['$serviceProvider.serviceName', 'Unknown Provider'] },
            logoUrl: { $ifNull: ['$serviceProvider.logoUrl', '/placeholder-logo.png'] },
            email: { $ifNull: ['$serviceProvider.email', ''] },
            phone: { $ifNull: ['$serviceProvider.phone', ''] }
          },
          rentalPlan: 1,
          amount: 1,
          baseAmount: 1,
          gstAmount: 1,
          bookedOn: '$requestedAt',
          startDate: 1,
          endDate: 1,
          status: 1,
          paymentStatus: 1,
          requestNotes: 1,
          approvalNotes: 1,
          whatsappNumber: 1,
          invoiceUrl: 1,
          unitCount: 1,
          processedAt: 1,
          createdAt: 1,
          updatedAt: 1,
          serviceFee:1,
          bookingSeats: 1, // Include bookingSeats
          lastUpdated: { 
            $ifNull: ['$updatedAt', '$createdAt'] 
          }
        }
      },
      // Sort by last updated, newest first
      {
        $sort: { lastUpdated: -1 }
      }
    ]).toArray()
    
    // Try a direct query with a session.user.id string if no bookings found
    if (bookings.length === 0) {
      const directBookings = await db.collection('bookings')
        .find({ 
          $or: [
            { startupId: userId },
            { startupId: session.user.id }
          ]
        })
        .toArray()
      
      if (directBookings.length > 0) {
        // Rerun the aggregation with string ID
        const bookingsWithStringId = await db.collection('bookings').aggregate([
          {
            $match: {
              startupId: session.user.id
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
            $lookup: {
              from: 'Service Provider',
              localField: 'incubatorId',
              foreignField: '_id',
              as: 'serviceProvider'
            }
          },
          {
            $match: {
              'facility': { $ne: [] }
            }
          },
          {
            $unwind: {
              path: '$facility',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $unwind: {
              path: '$serviceProvider',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              _id: 1,
              bookingId: { $toString: "$_id" },
              // Add the IDs you want to send
              facilityId: 1,
              startupId: 1,
              incubatorId: 1,
              facilityDetails: {
                name: '$facility.details.name',
                type: '$facility.facilityType',
                images: { $ifNull: ['$facility.details.images', []] },
                location: { 
                  address: { $ifNull: ['$facility.details.location.address', ''] },
                  city: { $ifNull: ['$facility.details.location.city', ''] }
                },
                amenities: '$facility.details.amenities'
              },
              serviceProviderDetails: {
                name: { $ifNull: ['$serviceProvider.serviceName', 'Unknown Provider'] },
                logoUrl: { $ifNull: ['$serviceProvider.logoUrl', '/placeholder-logo.png'] },
                email: { $ifNull: ['$serviceProvider.email', ''] },
                phone: { $ifNull: ['$serviceProvider.phone', ''] }
              },
              rentalPlan: 1,
              amount: 1,
              baseAmount: 1,
              gstAmount: 1,
              originalBaseAmount: 1,
              bookedOn: '$requestedAt',
              startDate: 1,
              endDate: 1,
              status: 1,
              serviceFee:1,
              paymentStatus: 1,
              requestNotes: 1,
              approvalNotes: 1,
              whatsappNumber: 1,
              invoiceUrl: 1,
              unitCount: 1,
              processedAt: 1,
              createdAt: 1,
              updatedAt: 1,
              lastUpdated: { 
                $ifNull: ['$updatedAt', '$createdAt'] 
              }
            }
          },
          {
            $sort: { lastUpdated: -1 }
          }
        ]).toArray()
        
        if (bookingsWithStringId.length > 0) {
          return NextResponse.json(bookingsWithStringId)
        }
      }
    }

    // Calculate validity for each booking
    const bookingsWithValidity = bookings.map(booking => {
      try {
        const validityDuration = validityMap[booking.rentalPlan as keyof typeof validityMap] || 0
        // Use bookedOn if available, otherwise fall back to createdAt or current date
        const startDate = booking.bookedOn || booking.createdAt || new Date().toISOString()
        const validityTill = new Date(new Date(startDate).getTime() + validityDuration)
        
        return {
          ...booking,
          validityTill: validityTill.toISOString()
        }
      } catch (error) {
        console.error('Error calculating validity for booking:', booking._id, error)
        return {
          ...booking,
          validityTill: null
        }
      }
    })

    return NextResponse.json(bookingsWithValidity)
  } catch (error) {
    console.error('Error in GET /api/startup/bookings:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}