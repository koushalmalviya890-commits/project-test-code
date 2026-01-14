import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'



export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
 const startupId = new ObjectId(session.user.id)
    const { incubatorId } = await req.json()

    if (!incubatorId || !startupId) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    const { db } = await connectToDatabase()


    // console.log("sivsa",startupId);
   // console.log("sivsa",incubatorId);

    const exists = await db.collection('FacilityStartups').findOne({
      startupId: new ObjectId(startupId),
      incubatorId: new ObjectId(incubatorId)
    })
  
   // console.log("exer",exists);




   

    

    return NextResponse.json({ exists: exists?true:false })
  } catch (error) {
   console.error('Error in POST /api/checkuser:', error)
    return NextResponse.json(
      { error: 'Failed to fetch startups' },
      { status: 500 }
    )
  }
}
