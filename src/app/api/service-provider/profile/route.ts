import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import ServiceProvider from '@/models/ServiceProvider'
import mongoose from 'mongoose'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    await connectDB()

    const profile = await ServiceProvider.findOne({ 
      userId: new mongoose.Types.ObjectId(session.user.id)
    })
      .select('-__v')
      .lean()

    if (!profile) {
      return new NextResponse('Profile not found', { status: 404 })
    }

    // Convert MongoDB document to plain object
    const plainProfile = JSON.parse(JSON.stringify(profile))

    return NextResponse.json(plainProfile)
  } catch (error) {
    console.error('Error in GET /api/service-provider/profile:', error)
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
    
    // Ensure timings and images are properly formatted
    const updateData = {
      ...body,
      features: Array.isArray(body.features) ? body.features : [],
      images: Array.isArray(body.images) ? body.images : [],
      timings: body.timings || {
        monday: { isOpen: false, openTime: '', closeTime: '' },
        tuesday: { isOpen: false, openTime: '', closeTime: '' },
        wednesday: { isOpen: false, openTime: '', closeTime: '' },
        thursday: { isOpen: false, openTime: '', closeTime: '' },
        friday: { isOpen: false, openTime: '', closeTime: '' },
        saturday: { isOpen: false, openTime: '', closeTime: '' },
        sunday: { isOpen: false, openTime: '', closeTime: '' }
      },
      updatedAt: new Date()
    }

    await connectDB()

    const updatedProfile = await ServiceProvider.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(session.user.id) },
      updateData,
      { new: true }
    ).select('-__v').lean()

    if (!updatedProfile) {
      return new NextResponse('Profile not found', { status: 404 })
    }

    // Convert MongoDB document to plain object
    const plainUpdatedProfile = JSON.parse(JSON.stringify(updatedProfile))

    return NextResponse.json(plainUpdatedProfile)
  } catch (error) {
    console.error('Error in PATCH /api/service-provider/profile:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 