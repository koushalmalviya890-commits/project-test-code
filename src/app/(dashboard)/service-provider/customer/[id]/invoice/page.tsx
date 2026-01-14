'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { ArrowLeft, Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/spinner'

interface BookingDetails {
  _id: string
  bookingId: string
  rentalPlan: string
  status: string
  paymentStatus: string
  amount: number
  startDate: string
  endDate: string
  facility: {
    name: string
    facilityType: string
  }
  startup: {
    startupName: string
    logoUrl: string
    founderName: string
    primaryContactNumber: string
    city: string
    emailId: string
  }
  serviceProvider: {
    serviceName: string
    logoUrl: string
    features?: string[]
  }
}

export default function InvoicePage() {
  const params = useParams()
  const router = useRouter()
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`/api/bookings/${params.id}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch booking details: ${response.status}`)
        }
        
        const data = await response.json()
        setBookingDetails(data)
      } catch (error) {
        console.error('Error fetching booking details:', error)
        setError('Failed to load booking details. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (params.id) {
      fetchBookingDetails()
    }
  }, [params.id])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    alert('PDF download functionality will be implemented in the future')
  }

  // Format date to display in the format: Sun, 02 May 2025
  const formatDateDisplay = (dateString: string) => {
    try {
      return format(new Date(dateString), 'E, dd MMM yyyy')
    } catch (e) {
      return 'Invalid date'
    }
  }

  // Format time to display in the format: 02:00 PM
  const formatTimeDisplay = (dateString: string) => {
    try {
      return format(new Date(dateString), 'hh:mm a')
    } catch (e) {
      return ''
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !bookingDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold mb-4">Error</h2>
        <p className="text-gray-500 mb-6">{error || 'Booking details not found'}</p>
        <Button 
          onClick={() => router.push('/service-provider/bookings')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bookings
        </Button>
      </div>
    )
  }

  const invoiceNumber = `${bookingDetails._id}`
  const bookingReference = bookingDetails._id
  const checkInDate = formatDateDisplay(bookingDetails.startDate)
  const checkInTime = formatTimeDisplay(bookingDetails.startDate)
  const checkOutDate = formatDateDisplay(bookingDetails.endDate)
  const checkOutTime = formatTimeDisplay(bookingDetails.endDate)
  const today = format(new Date(), 'dd MMM yyyy')

  return (
    <div className="bg-white font-['Plus_Jakarta_Sans']">
      {/* Print controls - only visible on screen, hidden when printing */}
      <div className="flex justify-between items-center p-5 bg-[#f8f8f8] border-b border-[rgba(34,34,34,0.1)] print:hidden">
        <Link href={`/service-provider/bookings/${params.id}`} className="flex items-center gap-2 text-[#222222] hover:text-black">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Back to Details</span>
        </Link>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handlePrint} 
            className="flex items-center gap-2 border-[rgba(34,34,34,0.3)] text-[#222222]"
          >
            <Printer className="h-4 w-4" />
            Print Invoice
          </Button>
          <Button 
            variant="default" 
            className="flex items-center gap-2 bg-[#222222] hover:bg-black text-white"
            onClick={handleDownloadPDF}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice content */}
      <div 
        ref={printRef}
        className="mx-auto max-w-4xl p-10 bg-white"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-14">
          <div>
            <div className="h-12 w-48 relative mb-3">
              <Image
                src="/logo.png"
                alt="Company Logo"
                fill
                style={{ objectFit: 'contain', objectPosition: 'left' }}
              />
            </div>
            <p className="text-[rgba(34,34,34,0.6)] text-sm">
              Booking Platform for Innovation Spaces
            </p>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-extrabold text-[#222222] mb-1 tracking-tight">INVOICE</h1>
            <p className="text-[rgba(34,34,34,0.6)] font-mono font-medium">{invoiceNumber}</p>
            <p className="text-[rgba(34,34,34,0.6)] mt-2 font-medium">Date: {today}</p>
          </div>
        </div>

        {/* Billing Details */}
        <div className="grid grid-cols-2 gap-8 mb-14">
          {/* From details */}
          <div>
            <h2 className="text-[rgba(34,34,34,0.5)] font-semibold mb-4 text-sm uppercase tracking-wide">From</h2>
            <p className="font-bold text-lg mb-1 text-[#222222] tracking-tight">{bookingDetails.serviceProvider.serviceName}</p>
            <p className="text-[rgba(34,34,34,0.7)] mb-1 tracking-tight">{bookingDetails.facility.name}</p>
            <p className="text-[rgba(34,34,34,0.7)] tracking-tight">
              {bookingDetails.facility.facilityType.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </p>
          </div>
          
          {/* To details */}
          <div>
            <h2 className="text-[rgba(34,34,34,0.5)] font-semibold mb-4 text-sm uppercase tracking-wide">To</h2>
            <p className="font-bold text-lg mb-1 text-[#222222] tracking-tight">{bookingDetails.startup.startupName}</p>
            <p className="text-[rgba(34,34,34,0.7)] mb-1 tracking-tight">{bookingDetails.startup.founderName || 'Founder Name'}</p>
            <p className="text-[rgba(34,34,34,0.7)] mb-1 tracking-tight">{bookingDetails.startup.emailId}</p>
            <p className="text-[rgba(34,34,34,0.7)] tracking-tight">{bookingDetails.startup.primaryContactNumber || 'Contact Number'}</p>
          </div>
        </div>

        {/* Booking Details */}
        <div className="mb-14">
          <h2 className="text-[rgba(34,34,34,0.5)] font-semibold mb-4 text-sm uppercase tracking-wide">Booking Details</h2>
          <div className="border border-[rgba(34,34,34,0.2)] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#f8f8f8] text-[#222222] font-semibold">
                <tr>
                  <th className="px-6 py-4 text-left">Booking Reference ID</th>
                  <th className="px-6 py-4 text-left">Check In</th>
                  <th className="px-6 py-4 text-left">Check Out</th>
                  <th className="px-6 py-4 text-left">Rental Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(34,34,34,0.1)]">
                <tr>
                  <td className="px-6 py-4 font-extrabold font-mono text-[#222222]">{bookingReference}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[#222222]">{checkInDate}</div>
                    <div className="text-[rgba(34,34,34,0.6)] text-xs">by {checkInTime}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[#222222]">{checkOutDate}</div>
                    <div className="text-[rgba(34,34,34,0.6)] text-xs">by {checkOutTime}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#222222]">{bookingDetails.rentalPlan}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Information */}
        <div className="mb-14">
          <h2 className="text-[rgba(34,34,34,0.5)] font-semibold mb-4 text-sm uppercase tracking-wide">Payment Information</h2>
          <div className="border border-[rgba(34,34,34,0.2)] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#f8f8f8] text-[#222222] font-semibold">
                <tr>
                  <th className="px-6 py-4 text-left">Description</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(34,34,34,0.1)]">
                <tr>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[#222222]">{bookingDetails.facility.name}</div>
                    <div className="text-[rgba(34,34,34,0.6)] text-xs">
                      {formatDateDisplay(bookingDetails.startDate)} - {formatDateDisplay(bookingDetails.endDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 inline-flex items-center rounded-full text-xs font-bold ${
                      bookingDetails.paymentStatus.toLowerCase() === 'completed' 
                        ? 'bg-[#D1F9DC] text-[#23BB4E] border border-[#23BB4E]' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bookingDetails.paymentStatus.charAt(0).toUpperCase() + bookingDetails.paymentStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-right text-[#222222]">{formatCurrency(bookingDetails.amount)}</td>
                </tr>
              </tbody>
              <tfoot className="bg-[#f8f8f8]">
                <tr>
                  <td colSpan={2} className="px-6 py-4 font-semibold text-right text-[#222222]">Total</td>
                  <td className="px-6 py-4 font-bold text-right text-[#222222]">{formatCurrency(bookingDetails.amount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Terms and Footer */}
        <div className="mt-14 text-center text-sm text-[rgba(34,34,34,0.6)] border-t border-[rgba(34,34,34,0.2)] pt-8">
          <p className="mb-2 font-medium">Thank you for your business!</p>
          <p>For any questions regarding this invoice, please contact <a href="mailto:support@cumma.in" className="text-[#222222] font-semibold">support@cumma.in</a></p>
          <div className="mt-6 flex justify-center items-center space-x-4">
            <span className="font-medium">www.cumma.in</span>
            <span>|</span>
            <span className="font-medium">+91 78459 55939</span>
          </div>
        </div>
      </div>
    </div>
  )
} 