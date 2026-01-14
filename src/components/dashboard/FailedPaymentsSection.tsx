'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Clock, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import Image from 'next/image'
import { toast } from 'sonner'
import Link from 'next/link'

interface FailedPayment {
  _id: string
  facilityId: string
  facilityName: string
  facilityImage: string
  amount: number
  startDate: string
  endDate: string
  rentalPlan: string
  expiresAt: string
  isExpired: boolean
}

export default function FailedPaymentsSection() {
  const [failedPayments, setFailedPayments] = useState<FailedPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [retryingId, setRetryingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchFailedPayments = async () => {
      try {
        const response = await fetch('/api/dashboard/failed-payments')
        if (!response.ok) throw new Error('Failed to fetch failed payments')
        
        const data = await response.json()
        setFailedPayments(data)
      } catch (error) {
        console.error('Error fetching failed payments:', error)
        toast.error('Failed to load payment details')
      } finally {
        setLoading(false)
      }
    }

    fetchFailedPayments()
  }, [])

  // Function to load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleRetry = async (bookingId: string, facilityName: string) => {
    try {
      setRetryingId(bookingId)
      
      // Create a retry order
      const response = await fetch('/api/payments/razorpay/retry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create retry payment')
      }
      
      const orderData = await response.json()
      
      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript()
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay script')
      }
      
      // Configure Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Cumma',
        description: `Retry booking for ${facilityName}`,
        order_id: orderData.orderId,
        image: `${window.location.origin}/logo.png`,
        handler: function(response: any) {
          window.location.href = `/booking/success?bookingId=${orderData.bookingId}&paymentId=${response.razorpay_payment_id}`
        },
        modal: {
          ondismiss: function() {
            setRetryingId(null)
          },
        },
      }
      
      // Open Razorpay checkout
      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Error retrying payment:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to retry payment')
      setRetryingId(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Failed Payments</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (failedPayments.length === 0) {
    return null // Don't show the section if no failed payments
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Failed Payments</h2>
      <div className="space-y-4">
        {failedPayments.map((payment) => (
          <div 
            key={payment._id} 
            className="border border-gray-100 rounded-lg p-4 flex flex-col sm:flex-row gap-4"
          >
            <div className="sm:w-24 h-20 relative rounded-md overflow-hidden">
              <Image 
                src={payment.facilityImage || '/placeholder-facility.jpg'} 
                alt={payment.facilityName} 
                fill
                className="object-cover"
              />
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{payment.facilityName}</h3>
              
              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1 text-sm text-gray-600">
                <span className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {format(new Date(payment.startDate), 'PP')} to {format(new Date(payment.endDate), 'PP')}
                </span>
                <span className="flex items-center">
                  <span className="font-medium mr-1">₹</span>
                  {payment.amount.toLocaleString()}
                </span>
              </div>
              
              <div className="mt-2 flex items-center text-sm">
                <Clock className="h-4 w-4 text-amber-500 mr-1" />
                {payment.isExpired ? (
                  <span className="text-red-500">Retry window expired</span>
                ) : (
                  <span className="text-amber-600">
                    Retry available until {format(new Date(payment.expiresAt), 'PPp')}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex sm:flex-col gap-2 sm:justify-center">
              {!payment.isExpired && (
                <Button
                  size="sm"
                  onClick={() => handleRetry(payment._id, payment.facilityName)}
                  disabled={retryingId === payment._id}
                  className="flex-1 sm:flex-none"
                >
                  {retryingId === payment._id ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Retry
                </Button>
              )}
              
              <Link href={`/ViewDetails/${payment.facilityId}`} className="flex-1 sm:flex-none">
                <Button variant="outline" size="sm" className="w-full">
                  View Facility
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 