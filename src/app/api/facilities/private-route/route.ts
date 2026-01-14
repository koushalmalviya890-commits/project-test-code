import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import Facility from '@/models/Facility'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

interface RentalPlan {
  name: string
  price: number
  duration: string
}

interface Equipment {
  labName: string
  equipmentName: string
  capacityAndMake: string
}

interface AreaDetail {
  area: number
  type: 'Covered' | 'Uncovered'
  furnishing: 'Furnished' | 'Not Furnished'
  customisation: 'Open to Customisation' | 'Cannot be Customised'
}

interface StudioEquipmentDetail {
  name: string
  picture: string
  quantity: number
  model: string
}

interface StudioDetails {
  facilityName: string
  description: string
  suitableFor: Array<'video' | 'podcast' | 'audio' | 'others'>
  isSoundProof: boolean
  equipmentDetails: StudioEquipmentDetail[]
  hasAmpleLighting: boolean
  rentalPlanTypes: Array<'Hourly' | 'One-Day'>
}

interface DayTiming {
  isOpen: boolean
  openTime?: string
  closeTime?: string
}

interface Timings {
  monday: DayTiming
  tuesday: DayTiming
  wednesday: DayTiming
  thursday: DayTiming
  friday: DayTiming
  saturday: DayTiming
  sunday: DayTiming
}

interface BaseFacilityDetails {
  name: string
  description: string
  images: string[]
  videoLink: string
  rentalPlans: RentalPlan[]
}

interface LabFacilityDetails extends BaseFacilityDetails {
  equipment: Equipment[]
}

interface RawSpaceFacilityDetails extends BaseFacilityDetails {
  areaDetails: AreaDetail[]
}

interface SoftwareFacilityDetails extends BaseFacilityDetails {
  equipment: { softwareName: string; version: string }[]
}

interface SaasFacilityDetails extends BaseFacilityDetails {
  equipment: { equipmentName: string; capacityAndMake: string }[]
}

interface IndividualCabinDetails extends BaseFacilityDetails {
  totalCabins: number
  availableCabins: number
}

interface CoworkingSpaceDetails extends BaseFacilityDetails {
  totalSeats: number
  availableSeats: number
}

interface MeetingRoomDetails extends BaseFacilityDetails {
  totalRooms: number
  seatingCapacity: number
  totalTrainingRoomSeaters: number
}

interface StudioFacilityDetails extends BaseFacilityDetails {
  studioDetails: StudioDetails
}

type FacilityDetails = 
  | LabFacilityDetails 
  | RawSpaceFacilityDetails 
  | SoftwareFacilityDetails 
  | SaasFacilityDetails
  | IndividualCabinDetails
  | CoworkingSpaceDetails
  | MeetingRoomDetails
  | StudioFacilityDetails

interface FacilityData {
  serviceProviderId: string
  facilityType: string
  status: 'pending' | 'active' | 'rejected' | 'inactive'
  details: FacilityDetails
  timings: Timings
  address: string
  city: string
  pincode: string
  state: string
  country: string
  isFeatured: boolean
  privacyType: 'public' | 'private' // <-- ADD THIS
}

export async function POST(req: Request) {
 // console.log('API Route - POST /api/facilities called')
  
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await req.json()
   // console.log('API Route - Received data:', data)

   // console.log('API Route - Connecting to database...')
    await connectDB()
   // console.log('API Route - Connected to database')

    // Ensure the serviceProviderId is set from the session
    const facilityData = {
      ...data,
      serviceProviderId: session.user.id,
      // Ensure required fields are present
      status: data.status || 'pending',
      isFeatured: data.isFeatured || false,
      privacyType: data.privacyType || 'public',
    }

   // console.log('API Route - Creating facility with data:', JSON.stringify(facilityData, null, 2))
    
    // Use native MongoDB driver instead of Mongoose
    const { db } = await connectToDatabase()
    
    const result = await db.collection('Facilities').insertOne({
      ...facilityData,
      serviceProviderId: new ObjectId(facilityData.serviceProviderId),
      createdAt: new Date(),
      updatedAt: new Date()
    })

   // console.log('API Route - Facility created successfully:', result.insertedId)
    return NextResponse.json(
      { id: result.insertedId },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('API Route - Error creating facility:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create facility',
        details: error.errors || {}
      },
      { status: 400 }
    )
  }
}

// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions)
//     if (!session?.user?.id) {
//       return new NextResponse('Unauthorized', { status: 401 })
//     }

//     const { db } = await connectToDatabase()
//     const serviceProviderId = new ObjectId(session.user.id)

//     const facilities = await db.collection('Facilities')
//       .find({ serviceProviderId })
//       .sort({ updatedAt: -1 })
//       .toArray()

//     return NextResponse.json(facilities)
//   } catch (error) {
//     console.error('Error in GET /api/facilities:', error)
//     return new NextResponse('Internal Server Error', { status: 500 })
//   }
// }
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { db } = await connectToDatabase()
    const serviceProviderId = new ObjectId(session.user.id)

    const facilities = await db.collection('Facilities')
      .find({
        serviceProviderId,
        // privacyType: 'private' // ✅ Only fetch public listings
      })
      .sort({ updatedAt: -1 })
      .toArray()

    return NextResponse.json(facilities)
  } catch (error) {
    console.error('Error in GET /api/facilities:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const id = request.url.split('/').pop()
    if (!id) {
      return new NextResponse('Facility ID is required', { status: 400 })
    }

    const { db } = await connectToDatabase()
    const serviceProviderId = new ObjectId(session.user.id)

    const result = await db.collection('Facilities').deleteOne({
      _id: new ObjectId(id),
      serviceProviderId,
    })

    if (result.deletedCount === 0) {
      return new NextResponse('Facility not found', { status: 404 })
    }

    return new NextResponse('Facility deleted successfully')
  } catch (error) {
    console.error('Error in DELETE /api/facilities:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const id = request.url.split('/').pop()
    if (!id) {
      return new NextResponse('Facility ID is required', { status: 400 })
    }

    const body = await request.json()
    const { db } = await connectToDatabase()
    const serviceProviderId = new ObjectId(session.user.id)

    const result = await db.collection('Facilities').updateOne(
      {
        _id: new ObjectId(id),
        serviceProviderId,
      },
      {
        $set: {
          details: body,
          status: 'pending', // Change status to pending after edit
          updatedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return new NextResponse('Facility not found', { status: 404 })
    }

    return new NextResponse('Facility updated successfully')
  } catch (error) {
    console.error('Error in PATCH /api/facilities:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 