import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
// import dbConnect from '@/lib/mongodb'
import ServiceProvider from '@/models/ServiceProvider'

export async function GET(req: NextRequest) {
  try {
  const { db } =  await connectToDatabase()
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const serviceProvider = await ServiceProvider.findOne({ 
      userId: session.user.id 
    })

    if (!serviceProvider) {
      return NextResponse.json(
        { success: false, message: 'Service provider not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: serviceProvider.coupons || []
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
  const { db } =  await connectToDatabase()
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { 
      couponCode, 
      discount, 
      minimumValue, 
      validFrom, 
      validTo,
      usageLimit,
      applicableFacilities 
    } = body

    // Validation
    if (!couponCode || !discount || minimumValue === undefined || !validFrom || !validTo) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const serviceProvider = await ServiceProvider.findOne({ 
      userId: session.user.id 
    })

    if (!serviceProvider) {
      return NextResponse.json(
        { success: false, message: 'Service provider not found' },
        { status: 404 }
      )
    }

    // Check if coupon code already exists
    const existingCoupon = serviceProvider.coupons?.find(
      (c: any) => c.couponCode.toUpperCase() === couponCode.toUpperCase()
    )

    if (existingCoupon) {
      return NextResponse.json(
        { success: false, message: 'Coupon code already exists' },
        { status: 400 }
      )
    }

    // Validate dates
    if (new Date(validFrom) >= new Date(validTo)) {
      return NextResponse.json(
        { success: false, message: 'Valid From date must be before Valid To date' },
        { status: 400 }
      )
    }

    // Add new coupon
    const newCoupon = {
      couponCode: couponCode.toUpperCase(),
      discount,
      minimumValue,
      validFrom: new Date(validFrom),
      validTo: new Date(validTo),
      isActive: true,
      usageLimit: usageLimit || null,
      usedCount: 0,
      applicableFacilities: applicableFacilities || [],
      createdAt: new Date()
    }

    serviceProvider.coupons = serviceProvider.coupons || []
    serviceProvider.coupons.push(newCoupon)
    await serviceProvider.save()

    return NextResponse.json({
      success: true,
      message: 'Coupon created successfully',
      data: newCoupon
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}