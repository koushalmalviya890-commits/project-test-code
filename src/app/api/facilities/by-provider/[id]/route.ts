import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)
    
    if (!id) {
      return new NextResponse('Service Provider ID is required', { status: 400 })
    }

   // console.log(`Fetching facilities for service provider ID: ${id}`)

    const { db } = await connectToDatabase()
    
    // Convert string ID to ObjectId for MongoDB query
    const serviceProviderId = new ObjectId(id)

    // Use aggregation to get facilities with service provider details
    const facilities = await db.collection('Facilities')
      .aggregate([
        {
          $match: {
            serviceProviderId,
            status: 'active',
          }
        },
        {
          $lookup: {
            from: 'Service Provider',
            localField: 'serviceProviderId',
            foreignField: 'userId',
            as: 'serviceProviderDetails'
          }
        },
        {
          $addFields: {
            serviceProvider: {
              serviceName: {
                $cond: {
                  if: { $gt: [{ $size: '$serviceProviderDetails' }, 0] },
                  then: { $arrayElemAt: ['$serviceProviderDetails.serviceName', 0] },
                  else: 'Unknown Provider'
                }
              },
              serviceProviderType: {
                $cond: {
                  if: { $gt: [{ $size: '$serviceProviderDetails' }, 0] },
                  then: { $arrayElemAt: ['$serviceProviderDetails.serviceProviderType', 0] },
                  else: null
                }
              },
              features: {
                $cond: {
                  if: { $gt: [{ $size: '$serviceProviderDetails' }, 0] },
                  then: { $arrayElemAt: ['$serviceProviderDetails.features', 0] },
                  else: []
                }
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            serviceProviderId: 1,
            facilityType: 1,
            status: 1,
            details: 1,
            features: 1,
            address: 1,
            city: 1,
            pincode: 1,
            state: 1,
            country: 1,
            isFeatured: 1,
            updatedAt: 1,
            serviceProvider: 1
          }
        },
        {
          $sort: {
            isFeatured: -1,
            updatedAt: -1
          }
        }
      ])
      .toArray()

   // console.log(`Found ${facilities.length} active facilities for provider ${id}`)
   // console.log('Sample facility data structure:', facilities[0] ? JSON.stringify({
    //   id: facilities[0]._id,
    //   name: facilities[0].details?.name,
    //   serviceProvider: facilities[0].serviceProvider?.serviceName,
    //   rentalPlans: facilities[0].details?.rentalPlans
    // }, null, 2) : 'No facilities found')

    return NextResponse.json(facilities)
  } catch (error) {
    console.error('Error in GET /api/facilities/by-provider/[id]:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 