import React from 'react'
import { CheckCircle, Calendar, MapPin, Award, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { redirect } from 'next/navigation'
import SuccessIcon from '@/components/icons/SuccessIcon'
import InvoiceDownload from '@/components/invoice/InvoiceDownload'

interface BookingDetails {
  _id: string
  facilityId: string
  facilityName: string
  startDate: string
  endDate: string
  amount: number
  rentalPlan: string
  duration : Array<{ type: string; units: number; unitLabel: string }>
  address: string
  city: string
  state: string
}

export default async function PaymentSuccessPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ bookingId?: string }>; 
}) {
  // Next.js provides an async proxy for dynamic route helpers; await it first
  const sp = await searchParams;

  // If no bookingId in query params, redirect to home
  if (!sp.bookingId) {
    redirect('/');
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full px-6 py-8 bg-white shadow-md rounded-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <SuccessIcon className="w-20 h-20 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600">
            Your booking has been confirmed. Thank you for your payment.
          </p>
        </div>
        
        {/* Invoice Download Component */}
        <div className="mb-8">
          <InvoiceDownload bookingId={sp.bookingId} />
        </div>
        
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-medium mb-4">What's Next?</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-brand-primary rounded-full text-white text-xs font-medium mr-3 mt-0.5">1</span>
              <span>You will receive a confirmation email with all the details of your booking.</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-brand-primary rounded-full text-white text-xs font-medium mr-3 mt-0.5">2</span>
              <span>The facility provider has been notified of your booking.</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-brand-primary rounded-full text-white text-xs font-medium mr-3 mt-0.5">3</span>
              <span>You can view all your bookings in your user dashboard.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col space-y-3 mt-8">
          <Link
            href="/dashboard/bookings"
            className="w-full py-2 px-4 bg-brand-primary text-white rounded-md font-medium text-center hover:bg-brand-primary-dark transition-colors"
          >
            View My Bookings
          </Link>
          <Link
            href="/"
            className="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-md font-medium text-center hover:bg-gray-50 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
} 