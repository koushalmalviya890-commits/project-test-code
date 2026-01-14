import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Define a basic facility type for TypeScript
interface Facility {
  _id: ObjectId
  serviceProviderId: ObjectId
  facilityType: string
  status: string
  details: {
    name: string
    images: string[]
    rentalPlans?: Array<{
      name: string
      price: number
      duration: string
    }>
  }
  features: string[]
  address: string
  city: string
  state: string
  pincode: string
  isFeatured: boolean
  updatedAt: Date
  [key: string]: any // Allow for additional properties
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // No authentication required for viewing public facilities
    
    // Ensure params is fully resolved before accessing properties
    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams.id
    
    if (!id) {
      return new NextResponse('Service Provider ID is required', { status: 400 })
    }

    // Get pagination parameters from URL
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '6')
    const skip = (page - 1) * limit

    const { db } = await connectToDatabase()
    
    // Convert string ID to ObjectId for MongoDB query
    const serviceProviderId = new ObjectId(id)

    // Get the service provider to confirm it exists and get its userId
    const serviceProvider = await db.collection('Service Provider').findOne({
      _id: serviceProviderId
    })

    if (!serviceProvider) {
      return new NextResponse('Service provider not found', { status: 404 })
    }

    // Create the query for facilities
    const query = {
      serviceProviderId: serviceProvider.userId ? new ObjectId(serviceProvider.userId) : serviceProviderId,
      status: 'active',
      privacyType: 'public'
    }

    // Get total count for pagination
    const totalCount = await db.collection('Facilities').countDocuments(query)
    
    // Use the userId to find facilities with pagination
    const facilities = await db.collection('Facilities')
      .find(query)
      .sort({ isFeatured: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray() as Facility[]
    
    // Add service provider info to each facility
    const facilitiesWithProvider = facilities.map(facility => ({
      ...facility,
      serviceProvider: {
        serviceName: serviceProvider.serviceName,
        serviceProviderType: serviceProvider.serviceProviderType,
        features: serviceProvider.features || []
      }
    }))
    
    // Return facilities with pagination metadata
    return NextResponse.json({
      facilities: facilitiesWithProvider,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page < Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error in GET /api/service-providers/[id]/facilities:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 