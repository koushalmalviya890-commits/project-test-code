import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const incubatorId = new ObjectId(session.user.id)
    const { db } = await connectToDatabase()

   // console.log("fincubatorId",incubatorId);


    const startups = await db.collection('FacilityStartups').aggregate([
      {
        $match: { incubatorId: incubatorId } // ✅ ObjectId
      },
      {
        $lookup: {
          from: 'Startups',
          localField: 'startupId',
          foreignField: 'userId', // Also ObjectId
          as: 'startup'
        }
      },
      {
        $unwind: '$startup'
      },
      {
        $replaceRoot: { newRoot: '$startup' }
      }
    ]).toArray()

    return NextResponse.json(startups)
  } catch (error) {
    console.error('Error in GET /api/customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch startups' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
 const userId = new ObjectId(session.user.id)
    const { startupId } = await req.json()

    if (!startupId || !userId) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const exists = await db.collection('FacilityStartups').findOne({
      startupId: new ObjectId(startupId),
      incubatorId: new ObjectId(userId)
    })

    if (exists) {
      return NextResponse.json({ message: 'Already exists' }, { status: 409 })
    }

    await db.collection('FacilityStartups').insertOne({
      startupId: new ObjectId(startupId),
      incubatorId: new ObjectId(userId)
    })

    return NextResponse.json({ message: 'Added' })
  } catch (error) {
    console.error('Error in POST /api/customers:', error)
    return NextResponse.json(
      { error: 'Failed to add customer' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const incubatorId = new ObjectId(session.user.id)
    const { startupId } = await req.json()

    if (!startupId) {
      return NextResponse.json({ error: 'Missing startupId' }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const result = await db.collection('FacilityStartups').deleteOne({
      incubatorId,
      startupId: new ObjectId(startupId)
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Not found or already deleted' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/customers:', error)
    return NextResponse.json(
      { error: 'Failed to delete startup' },
      { status: 500 }
    )
  }
}

