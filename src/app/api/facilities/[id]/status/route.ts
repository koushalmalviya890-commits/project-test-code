import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { authOptions } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get facility ID from params
    const id = params.id
    if (!id) {
      return NextResponse.json(
        { error: 'Facility ID is required' },
        { status: 400 }
      )
    }

    // Get request body
    const data = await request.json()
    const newStatus = data.status

    // Validate status
    if (!newStatus || !['active', 'inactive'].includes(newStatus)) {
      return NextResponse.json(
        { error: 'Invalid status value. Must be either "active" or "inactive"' },
        { status: 400 }
      )
    }

    // Connect to DB
    const { db } = await connectToDatabase()
    const serviceProviderId = new ObjectId(session.user.id)
    const facilityId = new ObjectId(id)

    // Check if facility exists and belongs to this service provider
    const facility = await db.collection('Facilities').findOne({
      _id: facilityId,
      serviceProviderId,
    })

    if (!facility) {
      return NextResponse.json(
        { error: 'Facility not found or you do not have permission to update it' },
        { status: 404 }
      )
    }

    // IMPORTANT: Verify that the current facility status is either 'active' or 'inactive'
    // Only facilities with these statuses can be toggled
    if (!['active', 'inactive'].includes(facility.status)) {
      return NextResponse.json(
        { error: 'Cannot change status of facilities that are pending review or rejected' },
        { status: 403 }
      )
    }

    // Update the facility status
    const result = await db.collection('Facilities').updateOne(
      { _id: facilityId, serviceProviderId },
      {
        $set: {
          status: newStatus,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Facility ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      status: newStatus
    })
  } catch (error) {
    console.error('Error updating facility status:', error)
    return NextResponse.json(
      { error: 'Failed to update facility status' },
      { status: 500 }
    )
  }
} 