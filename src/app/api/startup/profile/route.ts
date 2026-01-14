import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import Startup from '@/models/Startup'
import mongoose from 'mongoose'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    await connectDB()

    const profile = await Startup.findOne({ 
      userId: new mongoose.Types.ObjectId(session.user.id)
    })
      .select('-__v')
      .lean()

    if (!profile) {
      return new NextResponse('Profile not found', { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error in GET /api/startup/profile:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    await connectDB()

    const updatedProfile = await Startup.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(session.user.id) },
      { 
        ...body,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-__v').lean()

    if (!updatedProfile) {
      return new NextResponse('Profile not found', { status: 404 })
    }

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error('Error in PATCH /api/startup/profile:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 