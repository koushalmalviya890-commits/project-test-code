import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get userId from query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'userId parameter is required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    // Create query to find startup by userId
    let query: any;
    
    // Handle both string and ObjectId formats for userId
    if (ObjectId.isValid(userId)) {
      query = { 
        $or: [
          { userId: userId },
          { userId: new ObjectId(userId) }
        ]
      };
    } else {
      query = { userId: userId };
    }
    
    // Find the startup by userId
    const startup = await db.collection('Startups').findOne(query);

    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 })
    }

    return NextResponse.json(startup)
  } catch (error) {
    console.error('Error in GET /api/startup_by_userid:', error)
    return NextResponse.json(
      { error: 'Failed to fetch startup details' },
      { status: 500 }
    )
  }
} 