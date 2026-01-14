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
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const startupId = params.id
    
    // Validate the ID format
    if (!ObjectId.isValid(startupId)) {
      return NextResponse.json({ error: 'Invalid startup ID' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    // Find the startup by ID
    const startup = await db.collection('Startups').findOne({
      _id: new ObjectId(startupId)
    })

    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 })
    }

    return NextResponse.json(startup)
  } catch (error) {
    console.error('Error in GET /api/startups/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to fetch startup details' },
      { status: 500 }
    )
  }
} 