'use client'

import { useEffect, useState } from 'react'
// import { useSession } from 'next-auth/react'
import { useAuth } from '@/context/AuthContext'
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
import BookingExtensionDialog from '@/components/dialogs/extentdays-booking'
import ReviewDialog from "@/components/dialogs/postRating-dialog"

export interface Booking {
  _id: string;
  bookingId: string;
  facilityId: string;
  startupId: string;
  incubatorId: string;

  facilityDetails: {
    name: string;
    type: string;
    images: string[];
    location: {
      address: string;
      city: string;
    };
    amenities: string[];
  };

  serviceProviderDetails: {
    name: string;
    logoUrl: string;
    email: string;
    phone: string;
  };

  rentalPlan: 'Annual' | 'Monthly' | 'Weekly' | 'One Day (24 Hours)' | 'Hourly' | string;
  amount: number;
  baseAmount: number;
  finalAmount: number;
  gstAmount: number;
  serviceFee:number;
  bookedOn: string; // ISO string
  startDate: string; // ISO string
  endDate: string;   // ISO string
  bookingSeats: number; // Number of booking slots selected
  status: 'pending' | 'approved' | 'rejected' | 'inactive' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';

  requestNotes?: string;
  approvalNotes?: string;
  whatsappNumber?: string;
  invoiceUrl?: string;
  unitCount: number;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  lastUpdated: string;
  validityTill?: string;
  extensionRequested?: boolean;
}


export default function StartupBookings() {
  // const { data: session } = useSession()
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
       // console.log('Fetching bookings with session ID:', session?.user?.id)
        const response = await fetch('/api/startup/bookings')
       // console.log(response  , `this is for booking things`)
        const data = await response.json()
       // console.log(data , " for booking section in startup")
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

    // if (session?.user?.id) {
        if (user?.id) {
      fetchBookings()
    } else {
     // console.log('No session available yet')
    }
  // }, [session])
  }, [user])

  const handleExtensionRequested = (bookingId: string, extentDays: number) => {
    // Update the booking state to mark as extension requested
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, extensionRequested: true }
          : booking
      )
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!bookings.length) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">My Bookings</h1>
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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">My Bookings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          View and manage your facility bookings
        </p>
      </div>

      <div className="space-y-4">
        {bookings.map((booking, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col space-y-6">
                {/* Facility Information */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={booking.facilityDetails.images[0] || '/placeholder-facility.png'}
                        alt={booking.facilityDetails.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold truncate">{booking.facilityDetails.name}</h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        {booking.facilityDetails.type}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {booking.facilityDetails.location.address}, {booking.facilityDetails.location.city}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Service Provider</p>
                    <div className="flex items-center gap-2">
                      <div className="relative h-6 w-6 sm:h-8 sm:w-8 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={booking.serviceProviderDetails.logoUrl}
                          alt={booking.serviceProviderDetails.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{booking.serviceProviderDetails.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {booking.serviceProviderDetails.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Booking Details */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Booking Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <p className="text-sm">
                          <span className="text-gray-500">From:</span>{' '}
                          {new Date(booking.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <p className="text-sm">
                          <span className="text-gray-500">To:</span>{' '}
                          {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <p className="text-sm">
                          <span className="text-gray-500">Plan:</span>{' '}
                          {booking.rentalPlan} {booking.unitCount > 1 ? `(${booking.unitCount} units)` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <p className="text-sm">
                          <span className="text-gray-500">Seat Count:</span>{' '}
                           {booking.bookingSeats} {booking.bookingSeats > 1 ? 'seats' : 'seat'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <CreditCard className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <p className="text-sm">
                          <span className="text-gray-500">Booked on:</span>{' '}
                          {new Date(booking.bookedOn).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Payment Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-500">Total Amount:</p>
                        <p className="text-base font-semibold">₹{booking.amount || booking.finalAmount}</p>
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
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Booking Status</p>
                    <div className="flex flex-col gap-3">
                      <div 
                        className={cn(
                          "inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium border w-fit",
                          getStatusColor(booking.status)
                        )}
                      >
                        {booking.status}
                      </div>
                      
                      {booking.requestNotes && (
                        <div className="p-3 bg-gray-50 rounded-md">
                          <p className="text-xs text-gray-500 font-medium mb-1">Your Note:</p>
                          <p className="text-sm break-words">{booking.requestNotes}</p>
                        </div>
                      )}
                      
                      {booking.approvalNotes && (
                        <div className="p-3 bg-blue-50 rounded-md">
                          <p className="text-xs text-blue-500 font-medium mb-1">Service Provider Response:</p>
                          <p className="text-sm break-words">{booking.approvalNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {booking.invoiceUrl && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Invoice</p>
                        <a
                          href={booking.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors p-3 rounded-md w-full sm:w-fit"
                        >
                          <FileText className="h-4 w-4 flex-shrink-0" />
                          <span className="font-semibold text-sm text-gray-900">View Invoice</span>
                        </a>
                      </div>
                    )}
                    
                    {/* Extension Request - Only show for approved bookings */}
                    {booking.status === 'approved' && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Booking Extension</p>
                        <div className="w-full sm:w-fit">
                          <BookingExtensionDialog
                            facilityId={booking.facilityId}
                            incubatorId={booking.incubatorId}
                            startupId={booking.startupId}
                            bookingId={booking._id}
                            currentEndDate={booking.endDate}
                            onExtensionRequested={handleExtensionRequested}
                          />
                        </div>
                      </div>
                    )}

                    {booking.status === 'approved' && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Review</p>
                        <div className="w-full sm:w-fit">
                          <ReviewDialog
                            facilityId={booking.facilityId}
                            incubatorId={booking.incubatorId}
                            startupId={booking.startupId}
                            bookingId={booking._id}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}