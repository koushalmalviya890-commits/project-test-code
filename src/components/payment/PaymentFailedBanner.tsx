'use client'

import { useState, useEffect } from 'react'
import { XCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface FailedPaymentDetails {
  bookingId: string
  facilityName: string
  amount: number
  failureReason?: string
  failedAt: string
  expiresAt: string
}

interface PaymentFailedBannerProps {
  bookingId: string
}

export default function PaymentFailedBanner({ bookingId }: PaymentFailedBannerProps) {
  const [paymentDetails, setPaymentDetails] = useState<FailedPaymentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [expired, setExpired] = useState(false)

  //const base_url = "http://localhost:3001";

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

  // Fetch the booking details
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        //const response = await fetch(`/api/bookings/${bookingId}`)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASEURL}/api/bookings/${bookingId}`,
          {
            method: "GET",
            credentials: "include", // IMPORTANT (send JWT cookie)
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch booking details')
        
        const data = await response.json()
        
        // Check if this is a failed payment booking
        if (data.paymentStatus !== 'failed') {
          setDismissed(true)
          return
        }
        
        // Check if expired
        const expiresAt = new Date(data.expiresAt)
        const now = new Date()
        if (expiresAt < now) {
          setExpired(true)
        }
        
        // Prepare display data
        setPaymentDetails({
          bookingId: data._id,
          facilityName: data.facilityName,
          amount: data.amount,
          failureReason: data.paymentDetails?.failureReason,
          failedAt: new Date(data.paymentDetails?.failedAt || data.updatedAt).toLocaleString(),
          expiresAt: expiresAt.toLocaleString(),
        })
      } catch (error) {
        console.error('Error fetching failed payment details:', error)
        setDismissed(true)
      } finally {
        setLoading(false)
      }
    }

    if (bookingId) {
      fetchBooking()
    } else {
      setDismissed(true)
      setLoading(false)
    }
  }, [bookingId])

  const handleRetryPayment = async () => {
    try {
      setRetrying(true)
      
      // Call API to create a new payment order for retry
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/api/facility-bookings/payments/create-retry-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ✅ CRITICAL: Send cookies to backend
        body: JSON.stringify({
          bookingId,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create retry payment')
      }
      
      const orderData = await response.json()
      
      // Load Razorpay script if not already loaded
      const isScriptLoaded = await loadRazorpayScript()
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay script')
      }
      
      // Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount, // Server already returns amount in paise
        currency: orderData.currency,
        name: 'Cumma',
        description: `Retry booking for ${paymentDetails?.facilityName}`,
        order_id: orderData.orderId,
        image: `${window.location.origin}/logo.png`,
       handler: async function(response: any) {
          try {
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/api/facility-bookings/payments/verify-signature`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: orderData.bookingId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success || verifyData.isValid) {
              toast.success("Payment verified successfully!");
              window.location.href = `/booking/success?bookingId=${orderData.bookingId}`;
            } else {
              throw new Error(verifyData.message || "Verification failed");
            }
          } catch (verifyError) {
            console.error("Verification error:", verifyError);
            toast.error("Payment verification failed. Please check your dashboard.");
            setRetrying(false);
          }
        },
       prefill: {
          name: '', 
          email: '', 
          contact: '', 
        },
        notes: {
          bookingId: orderData.bookingId,
          isRetry: 'true',
        },
        theme: {
          color: '#4F46E5',
        },
        modal: {
          ondismiss: function() {
            setRetrying(false)
          },
        },
      }
      
      // Create and open Razorpay checkout
      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Error retrying payment:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to retry payment', {
        duration: 5000,
      })
      setRetrying(false)
    }
  }
  
  // Don't show if loading, dismissed or no payment details
  if (loading || dismissed || !paymentDetails) {
    return null
  }
  
  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50">
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">
                Payment Failed for {paymentDetails.facilityName}
              </h3>
              <p className="mt-1 text-sm text-amber-700">
                Your payment of ₹{paymentDetails.amount.toLocaleString()} wasn't successful. 
                {paymentDetails.failureReason && (
                  <span> Reason: {paymentDetails.failureReason}</span>
                )}
              </p>
              {expired ? (
                <p className="mt-2 text-sm text-amber-700">
                  The retry window has expired. Please make a new booking.
                </p>
              ) : (
                <p className="mt-2 text-sm text-amber-700">
                  You can retry until {paymentDetails.expiresAt}
                </p>
              )}
            </div>
          </div>
          <button 
            className="text-amber-500 hover:text-amber-700"
            onClick={() => setDismissed(true)}
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        
        {!expired && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-amber-700 border-amber-300 hover:bg-amber-50"
              onClick={handleRetryPayment}
              disabled={retrying}
            >
              {retrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Payment
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 