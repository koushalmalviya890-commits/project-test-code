'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { FileText, Calendar, Clock, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Booking {
  _id: string
  bookingId: string
  facilityDetails: {
    name: string
    type: string
    images: string[]
    location: {
      address: string
      city: string
    }
    amenities: string[]
  }
  serviceProviderDetails: {
    name: string
    logoUrl: string
    email: string
    phone: string
  }
  rentalPlan: string
  amount: number
  baseAmount: number
  gstAmount: number
  bookedOn: string
  startDate: string
  endDate: string
  status: 'pending' | 'approved' | 'rejected' | 'inactive' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed'
  requestNotes?: string
  approvalNotes?: string
  whatsappNumber?: string
  invoiceUrl?: string
  unitCount: number
  processedAt?: string
  createdAt: string
  updatedAt: string
  lastUpdated: string
  validityTill?: string
}

export default function StartupBookings() {
  const { data: session } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
       // console.log('Fetching bookings with session ID:', session?.user?.id)
        const response = await fetch('/api/startup/bookings')
        const data = await response.json()
        
        if (!response.ok) {
          console.error('API error:', data)
          throw new Error(data.error || 'Failed to fetch bookings')
        }
        
       // console.log('API Response:', {
        //   status: response.status,
        //   bookingsCount: Array.isArray(data) ? data.length : 'not an array',
        //   firstBooking: Array.isArray(data) && data.length > 0 ? {
        //     id: data[0]._id,
        //     facility: data[0].facilityDetails?.name,
        //     status: data[0].status
        //   } : null
        // })
        
        if (!Array.isArray(data)) {
          console.error('Unexpected data format:', data)
          throw new Error('Invalid data format received')
        }
        
        setBookings(data)
      } catch (error) {
        console.error('Error fetching bookings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchBookings()
    } else {
     // console.log('No session available yet')
    }
  }, [session])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!bookings.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">My Bookings</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            View and manage your facility bookings
          </p>
        </div>

        <div className="flex items-center justify-center min-h-[40vh] bg-white rounded-lg">
          <p className="text-muted-foreground">No bookings found</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'cancelled':
      case 'inactive':
        return 'bg-gray-50 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Bookings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          View and manage your facility bookings
        </p>
      </div>

      <div className="space-y-4">
        {bookings.map((booking, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Facility Information */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={booking.facilityDetails.images[0] || '/placeholder-facility.png'}
                        alt={booking.facilityDetails.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{booking.facilityDetails.name}</h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        {booking.facilityDetails.type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.facilityDetails.location.address}, {booking.facilityDetails.location.city}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">Service Provider</p>
                    <div className="flex items-center gap-2">
                      <div className="relative h-8 w-8 rounded-full overflow-hidden">
                        <Image
                          src={booking.serviceProviderDetails.logoUrl}
                          alt={booking.serviceProviderDetails.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{booking.serviceProviderDetails.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.serviceProviderDetails.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Booking Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Booking Details</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <p className="text-sm">
                          <span className="text-gray-500">From:</span>{' '}
                          {new Date(booking.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <p className="text-sm">
                          <span className="text-gray-500">To:</span>{' '}
                          {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <p className="text-sm">
                          <span className="text-gray-500">Plan:</span>{' '}
                          {booking.rentalPlan} {booking.unitCount > 1 ? `(${booking.unitCount} units)` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        <p className="text-sm">
                          <span className="text-gray-500">Booked on:</span>{' '}
                          {new Date(booking.bookedOn).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Payment Information</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Total Amount:</p>
                        <p className="text-base font-semibold">₹{booking.amount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment Status:</p>
                        <div className="flex items-center mt-1">
                          <span 
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                              getPaymentStatusColor(booking.paymentStatus)
                            )}
                          >
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Base Amount:</p>
                        <p className="text-sm">₹{booking.baseAmount?.toLocaleString('en-IN') || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">GST Amount:</p>
                        <p className="text-sm">₹{booking.gstAmount?.toLocaleString('en-IN') || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Status and Actions */}
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Booking Status</p>
                    <div className="flex flex-col gap-2">
                      <div 
                        className={cn(
                          "inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium border w-fit",
                          getStatusColor(booking.status)
                        )}
                      >
                        {booking.status}
                      </div>
                      
                      {booking.requestNotes && (
                        <div className="p-3 bg-gray-50 rounded-md mt-1">
                          <p className="text-xs text-gray-500 font-medium">Your Note:</p>
                          <p className="text-sm">{booking.requestNotes}</p>
                        </div>
                      )}
                      
                      {booking.approvalNotes && (
                        <div className="p-3 bg-blue-50 rounded-md mt-1">
                          <p className="text-xs text-blue-500 font-medium">Service Provider Response:</p>
                          <p className="text-sm">{booking.approvalNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {booking.invoiceUrl && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Invoice</p>
                      <a
                        href={booking.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors p-3 rounded-md w-fit"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="font-semibold text-sm text-gray-900">View Invoice</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 