'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tag, X, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'


interface CouponInputProps {
  facilityId: string
  bookingAmount: number
  onCouponApplied: (discount: {
    couponCode: string
    discount: number
    discountAmount: number
    finalAmount: number
    couponId: string
  }) => void
  onCouponRemoved: () => void
}

export function CouponInput({ 
  facilityId, 
  bookingAmount, 
  onCouponApplied,
  onCouponRemoved 
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
        toast.error('Please enter a coupon code')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/facilities/${facilityId}/validate-coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode: couponCode.toUpperCase(),
          bookingAmount
        })
      })

      const data = await res.json()

      if (data.success) {
        setAppliedCoupon(data.data)
        onCouponApplied(data.data)
        toast.success(`Coupon applied! You saved ₹${data.data.discountAmount}`)
      } else {
        toast.error('Invalid Coupon', {
            description: data.message
        });
      }
    } catch (error) {
      toast.error('Failed to apply coupon')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    onCouponRemoved()
    toast.success('Coupon Removed', {
        description: 'Coupon has been removed from your booking'
    });
  }

  if (appliedCoupon) {
    return (
      <div className="border rounded-lg p-4 bg-green-50 border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">
                {appliedCoupon.couponCode} Applied!
              </p>
              <p className="text-sm text-green-700">
                You saved ₹{appliedCoupon.discountAmount} ({appliedCoupon.discount}% off)
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveCoupon}
            className="text-green-700 hover:text-green-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2">
        <Tag className="h-4 w-4" />
        Have a Coupon Code?
      </label>
      <div className="flex gap-2">
        <Input
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          className="flex-1"
          maxLength={20}
        />
        <Button 
          onClick={handleApplyCoupon} 
          disabled={loading || !couponCode.trim()}
          variant="outline"
        >
          {loading ? 'Applying...' : 'Apply'}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Enter your coupon code to get a discount on this booking
      </p>
    </div>
  )
}