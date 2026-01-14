import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Facility from '@/models/Facility'
import ServiceProvider from '@/models/ServiceProvider'

export async function POST(
  req: NextRequest,
  { params }: { params: { facilityId: string } }
) {
  try {
    await connectToDatabase()

    const body = await req.json()
    const { couponCode, bookingAmount } = body

    if (!couponCode || !bookingAmount) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

   // console.log("paramas id check", params)
    // Get facility
    const facility = await Facility.findById(params.facilityId)
   // console.log(facility);
    if (!facility) {
      return NextResponse.json(
        { success: false, message: 'Facility not found' },
        { status: 404 }
      )
    }

    // Get service provider
const serviceProvider = await ServiceProvider.findOne({
  $or: [
    { _id: facility.serviceProviderId },      // Match by _id
    { userId: facility.serviceProviderId }    // Match by userId
  ]
})

    if (!serviceProvider) {
      return NextResponse.json(
        { success: false, message: 'Service provider not found' },
        { status: 404 }
      )
    }

    // Find coupon
    const coupon = serviceProvider.coupons?.find(
      (c: any) => c.couponCode.toUpperCase() === couponCode.toUpperCase()
    )

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'Invalid coupon code' },
        { status: 404 }
      )
    }

    // Validate coupon
    const now = new Date()
    
    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, message: 'This coupon is no longer active' },
        { status: 400 }
      )
    }

    if (now < new Date(coupon.validFrom)) {
      return NextResponse.json(
        { success: false, message: 'This coupon is not yet valid' },
        { status: 400 }
      )
    }

    if (now > new Date(coupon.validTo)) {
      return NextResponse.json(
        { success: false, message: 'This coupon has expired' },
        { status: 400 }
      )
    }

    if (bookingAmount < coupon.minimumValue) {
      return NextResponse.json(
        { success: false, message: `Minimum booking amount of ₹${coupon.minimumValue} required` },
        { status: 400 }
      )
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, message: 'This coupon has reached its usage limit' },
        { status: 400 }
      )
    }

    // Check if coupon is applicable to this facility
    if (coupon.applicableFacilities.length > 0) {
      const isApplicable = coupon.applicableFacilities.some(
        (id: any) => id.toString() === params.facilityId
      )
      if (!isApplicable) {
        return NextResponse.json(
          { success: false, message: 'This coupon is not applicable to this facility' },
          { status: 400 }
        )
      }
    }

    // Calculate discount
    const discountAmount = (bookingAmount * coupon.discount) / 100
    const finalAmount = bookingAmount - discountAmount

    return NextResponse.json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        couponCode: coupon.couponCode,
        discount: coupon.discount,
        discountAmount: Math.round(discountAmount * 100) / 100,
        originalAmount: bookingAmount,
        finalAmount: Math.round(finalAmount * 100) / 100,
        couponId: coupon._id
      }
    })
  } catch (error: any) {
    console.error('Validate coupon error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}