import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication is no longer required to view provider details
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const providerId = params.id
    
    // Validate the ID format
    if (!ObjectId.isValid(providerId)) {
      return NextResponse.json({ error: 'Invalid provider ID' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    // Try to find the service provider by either _id or userId
    const serviceProvider = await db.collection('Service Provider').findOne({
      $or: [
        { _id: new ObjectId(providerId) },
        { userId: new ObjectId(providerId) }
      ]
    })

    if (!serviceProvider) {
      return NextResponse.json({ error: 'Service provider not found' }, { status: 404 })
    }

    return NextResponse.json(serviceProvider)
  } catch (error) {
    console.error('Error in GET /api/service-providers/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service provider details' },
      { status: 500 }
    )
  }
} 