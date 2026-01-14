import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import ServiceProvider from '@/models/ServiceProvider'

export async function PUT(
  req: NextRequest,
  { params }: { params: { couponId: string } }
) {
  try {
    const { db } = await connectToDatabase()
    
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

    const couponIndex = serviceProvider.coupons?.findIndex(
      (c: any) => c._id.toString() === params.couponId
    )

    if (couponIndex === -1 || couponIndex === undefined) {
      return NextResponse.json(
        { success: false, message: 'Coupon not found' },
        { status: 404 }
      )
    }

    const updateData = await req.json()
    
    // Validate dates if provided
    if (updateData.validFrom && updateData.validTo) {
      if (new Date(updateData.validFrom) >= new Date(updateData.validTo)) {
        return NextResponse.json(
          { success: false, message: 'Valid From date must be before Valid To date' },
          { status: 400 }
        )
      }
    }

    // Define allowed fields that can be updated
    const allowedFields = [
      'couponCode', 
      'discount', 
      'minimumValue', 
      'validFrom', 
      'validTo', 
      'isActive', 
      'usageLimit',
      'applicableFacilities'
    ]

    const coupon = serviceProvider.coupons[couponIndex]

    // Update only allowed fields
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'validFrom' || field === 'validTo') {
          (coupon as any)[field] = new Date(updateData[field])
        } else {
          (coupon as any)[field] = updateData[field]
        }
      }
    })

    await serviceProvider.save()

    return NextResponse.json({
      success: true,
      message: 'Coupon updated successfully',
      data: serviceProvider.coupons[couponIndex]
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { couponId: string } }
) {
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

    const couponIndex = serviceProvider.coupons?.findIndex(
      (c: any) => c._id.toString() === params.couponId
    )

    if (couponIndex === -1 || couponIndex === undefined) {
      return NextResponse.json(
        { success: false, message: 'Coupon not found' },
        { status: 404 }
      )
    }

    serviceProvider.coupons.splice(couponIndex, 1)
    await serviceProvider.save()

    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}