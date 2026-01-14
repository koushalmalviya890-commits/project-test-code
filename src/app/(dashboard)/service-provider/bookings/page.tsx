'use client'
import * as XLSX from 'xlsx';
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { CalendarIcon, FileDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import BufferRequests from "@/components/dialogs/extentdays-req"
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import StatusActions from './StatusActions';

interface Booking {
  _id: string;
  bookingId: string;
  startupDetails: {
    logoUrl: string;
    startupName: string;
  };
  facilityType: string;
  facilityName: string;
  bookedOn: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: string;
   paymentStatus?: string;
}

interface KPIData {
  totalBookingsThisMonth: number;
  todayBookings: number;
  completedBookings: number;
  rejectedCancelledBookings: number;
  pendingBookings: number;
}

export default function BookingsPage() {
  const { data: session } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [kpiData, setKpiData] = useState<KPIData>({
    totalBookingsThisMonth: 0,
    todayBookings: 0,
    completedBookings: 0,
    rejectedCancelledBookings: 0,
    pendingBookings: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<string>("This Month")
  const [error, setError] = useState<string | null>(null)
  const [allBookings, setAllBookings] = useState<Booking[]>([]) // Store all bookings

  // Filter bookings based on selected month
  // useEffect(() => {
  //   if (allBookings.length === 0) return;
    
  //   const now = new Date();
  //   let filteredBookings: Booking[] = [];
    
  //   // Filter bookings based on selectedMonth
  //   switch (selectedMonth) {
  //     case "This Month":
  //       const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  //       filteredBookings = allBookings.filter(booking => 
  //         new Date(booking.startDate) >= startOfThisMonth
  //       );
  //       break;
      
  //     case "Last Month":
  //       const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  //       const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  //       filteredBookings = allBookings.filter(booking => {
  //         const bookingDate = new Date(booking.startDate);
  //         return bookingDate >= startOfLastMonth && bookingDate <= endOfLastMonth;
  //       });
  //       break;
      
  //     case "All Time":
  //     default:
  //       filteredBookings = [...allBookings];
  //       break;
  //   }
    
  //   setBookings(filteredBookings);
    
  //   // Calculate metrics based on filtered bookings
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);
    
  //   const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
  //   // If we're looking at "All Time" or "Last Month", still show this month count in KPI
  //   const bookingsThisMonth = selectedMonth === "This Month" 
  //     ? filteredBookings.length // If "This Month" is selected, count is just filtered bookings
  //     : allBookings.filter(b => new Date(b.startDate) >= startOfMonth).length; // Otherwise calculate this month's count
      
  //   setKpiData({
  //     totalBookingsThisMonth: bookingsThisMonth,
  //     todayBookings: allBookings.filter(b => new Date(b.startDate) >= today).length,
  //     completedBookings: filteredBookings.filter(b => b.status?.toLowerCase() === 'approved').length,
  //     rejectedCancelledBookings: filteredBookings.filter(b => 
  //       b.status?.toLowerCase() === 'rejected' || b.status?.toLowerCase() === 'cancelled'
  //     ).length,
  //     pendingBookings: filteredBookings.filter(b => b.status?.toLowerCase() === 'pending').length
  //   });
    
  // }, [selectedMonth, allBookings]);
useEffect(() => {
  if (allBookings.length === 0) return;
  
  const now = new Date();
  let filteredBookings: Booking[] = [];

    // First filter: Only show bookings with completed payment status
  const completedPaymentBookings = allBookings.filter(booking => 
    booking.paymentStatus?.toLowerCase() === 'completed'
  );
  
  // Filter bookings based on selectedMonth
  switch (selectedMonth) {
    case "This Month":
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredBookings = completedPaymentBookings.filter(booking => 
        new Date(booking.startDate) >= startOfThisMonth
      );
      break;
    
    case "Last Month":
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      filteredBookings = completedPaymentBookings.filter(booking => {
        const bookingDate = new Date(booking.startDate);
        return bookingDate >= startOfLastMonth && bookingDate <= endOfLastMonth;
      });
      break;
    
    case "All Time":
    default:
      filteredBookings = [...completedPaymentBookings];
      break;
  }
  
  setBookings(filteredBookings);
  
  // Calculate metrics based on the selected period
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Update the KPI calculation to show count for the selected period
  let totalBookingsForPeriod = 0;
  
  switch (selectedMonth) {
    case "This Month":
      totalBookingsForPeriod = filteredBookings.length;
      break;
    case "Last Month":
      totalBookingsForPeriod = filteredBookings.length;
      break;
    case "All Time":
      totalBookingsForPeriod = filteredBookings.length;
      break;
  }
  
  setKpiData({
    totalBookingsThisMonth: totalBookingsForPeriod, // This now shows count for selected period
    todayBookings: completedPaymentBookings.filter(b => new Date(b.startDate) >= today).length,
    completedBookings: filteredBookings.filter(b => b.status?.toLowerCase() === 'approved').length,
    rejectedCancelledBookings: filteredBookings.filter(b => 
      b.status?.toLowerCase() === 'rejected' || b.status?.toLowerCase() === 'cancelled'
    ).length,
    pendingBookings: filteredBookings.filter(b => b.status?.toLowerCase() === 'pending').length
  });
  
}, [selectedMonth, allBookings]);

const exportToExcel = () => {
  // Prepare data for export with headers
  const dataForExport = [
    {
      'Date': 'Date',
      'Booking ID': 'Booking ID',
      'Startup Name': 'Startup Name',
      'Facility': 'Facility',
      'Start Date': 'Start Date',
      'End Date': 'End Date',
      'Status': 'Status',
      'Price': 'Price',
    },
    ...bookings.map(booking => ({
      'Date': format(safelyParseDate(booking.bookedOn), 'dd MMM yyyy'),
      'Booking ID': booking._id || booking.bookingId,
      'Startup Name': booking.startupDetails?.startupName || "Unknown Startup",
      'Facility': booking.facilityName || "Meeting Hall",
      'Start Date': format(safelyParseDate(booking.startDate), 'dd MMM yyyy'),
      'End Date': format(safelyParseDate(booking.endDate), 'dd MMM yyyy'),
      'Status': booking.status || "Pending",
      'Price': formatPrice(booking.amount || 0).replace(/[^\d.-]/g, ''), // Remove currency symbols
    }))
  ];

  // Create worksheet with headers
  const ws = XLSX.utils.json_to_sheet(dataForExport, { skipHeader: true });
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Bookings");
  
  // Generate file and download
  const fileName = `Bookings_Report_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};


  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/bookings?detailed=true')
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error(errorText || 'Failed to fetch bookings');
        }
        
        const data = await response.json()
        
        // Check if we have the new format (with bookings and metrics) or old format (just bookings array)
        if (Array.isArray(data)) {
          // Store all bookings - normalize date objects
          const normalizedBookings = data.map((booking: any) => ({
            ...booking,
            // Convert string dates to Date objects for consistent processing
            startDate: booking.startDate instanceof Date ? booking.startDate : new Date(booking.startDate),
            endDate: booking.endDate instanceof Date ? booking.endDate : new Date(booking.endDate),
            bookedOn: booking.bookedOn instanceof Date ? booking.bookedOn : new Date(booking.bookedOn || booking.createdAt || Date.now()),
            paymentStatus: booking.paymentStatus || 'pending'
          }));
          setAllBookings(normalizedBookings);
          // Initial filter will happen in the other useEffect
        } else {
          // Store all bookings - normalize date objects
          const normalizedBookings = (data.bookings || []).map((booking: any) => ({
            ...booking,
            // Convert string dates to Date objects for consistent processing
            startDate: booking.startDate instanceof Date ? booking.startDate : new Date(booking.startDate),
            endDate: booking.endDate instanceof Date ? booking.endDate : new Date(booking.endDate),
            bookedOn: booking.bookedOn instanceof Date ? booking.bookedOn : new Date(booking.bookedOn || booking.createdAt || Date.now()),
             paymentStatus: booking.paymentStatus || 'pending'
          }));
          setAllBookings(normalizedBookings);
          
          // We'll calculate our own metrics based on filteredBookings
          // The initial filtering will happen in the other useEffect
        }
      } catch (error) {
        console.error('Error fetching bookings:', error)
        // Set error message for user
        setError(error instanceof Error ? error.message : 'Failed to load bookings')
        setAllBookings([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-8 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-[#1A1A1A]">Booking Details</h1>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-red-800 text-lg font-medium mb-2">Error Loading Bookings</h3>
          <p className="text-red-600">{error}</p>
          <Button 
            className="mt-4 bg-red-600 hover:bg-red-700"
            onClick={() => {
              setError(null);
              setIsLoading(true);
              // Re-fetch data
              fetch('/api/bookings?detailed=true')
                .then(async response => {
                  if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'API request failed');
                  }
                  return response.json();
                })
                .then(data => {
                  if (Array.isArray(data)) {
                    setAllBookings(data);
                  } else {
                    setAllBookings(data.bookings || []);
                  }
                  setIsLoading(false);
                  // Reset to "This Month" when retrying
                  setSelectedMonth("This Month");
                })
                .catch(err => {
                  console.error('Error retrying fetch:', err);
                  setError('Failed to load bookings. Please try again later.');
                  setIsLoading(false);
                  setAllBookings([]);
                });
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Status badge colors
  const statusColors: Record<string, string> = {
    'approved': 'bg-green-100 text-green-800',
    'pending': 'bg-blue-100 text-blue-800',
    'rejected': 'bg-yellow-100 text-yellow-800',
    'cancelled': 'bg-red-100 text-red-800',
    'request cancellation': 'bg-orange-100 text-orange-800',
  }

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    const cssClass = statusColors[normalizedStatus] || 'bg-gray-100 text-gray-800';
    
    // Transform the status text for display (capitalize first letter of each word)
    const displayStatus = status
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${cssClass}`}>
        {displayStatus}
      </span>
    );
  };

  // Function to safely parse dates
  const safelyParseDate = (dateString: string | undefined) => {
    if (!dateString) return new Date(); // Return current date as fallback
    try {
      return new Date(dateString);
    } catch (error) {
      console.error("Error parsing date:", dateString, error);
      return new Date(); // Return current date if parsing fails
    }
  };

  // Format currency function
  const formatPrice = (amount: number) => {
    return `₹${amount.toLocaleString()}/-`;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header with title and actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1A1A]">Booking Details</h1>
        
        {/* Mobile: Stack actions vertically, Desktop: Horizontal layout */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center rounded-md border border-gray-200 bg-white">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-500">
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="border-0 w-full sm:w-[150px] h-10 focus:ring-0">
                <SelectValue>{selectedMonth}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="This Month">This Month</SelectItem>
                <SelectItem value="Last Month">Last Month</SelectItem>
                <SelectItem value="All Time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Mobile: Full width buttons, Desktop: Auto width */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2 h-10 w-full sm:w-auto text-sm"
              onClick={exportToExcel}
            >
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">Download Full Report</span>
              <span className="sm:hidden">Download</span>
            </Button>
            <Button 
              asChild 
              className="bg-green-500 hover:bg-green-600 h-10 w-full sm:w-auto text-sm"
            >
              <Link href="/service-provider/calendar">
                <span className="hidden sm:inline">View Calendar</span>
                <span className="sm:hidden">Calendar</span>
              </Link>
            </Button>
            <div className="flex justify-center sm:justify-start">
              <BufferRequests/>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        {/* Total Bookings Card - Green */}
        <div className="rounded-[20px] sm:rounded-[30px] bg-green-500 text-white relative overflow-hidden shadow-sm lg:col-span-1">
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 opacity-30">
            <div className="w-full h-full rounded-bl-[40px] sm:rounded-bl-[80px] bg-white"></div>
          </div>
          <div className="p-4 sm:p-6">
            <p className="text-sm sm:text-base font-medium mb-2 sm:mb-3">
              Total Bookings ({selectedMonth === "All Time" ? "All Time" : selectedMonth})
            </p>
            <p className="text-4xl sm:text-5xl lg:text-7xl font-bold">{kpiData.totalBookingsThisMonth}</p>
          </div>
        </div>

        {/* Today's Bookings Card */}
        <div className="rounded-[20px] sm:rounded-[30px] bg-white text-black relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 opacity-10">
            <div className="w-full h-full rounded-bl-[40px] sm:rounded-bl-[80px] bg-gradient-to-br from-[#FFF04B] to-[#22A146]"></div>
          </div>
          <div className="p-4 sm:p-6">
            <p className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">Today Bookings</p>
            <p className="text-4xl sm:text-5xl lg:text-7xl font-bold">{kpiData.todayBookings}</p>
          </div>
        </div>

        {/* Completed Bookings Card */}
        <div className="rounded-[20px] sm:rounded-[30px] bg-white text-black relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 opacity-10">
            <div className="w-full h-full rounded-bl-[40px] sm:rounded-bl-[80px] bg-gradient-to-br from-[#FFF04B] to-[#22A146]"></div>
          </div>
          <div className="p-4 sm:p-6">
            <p className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">Completed</p>
            <p className="text-4xl sm:text-5xl lg:text-7xl font-bold">{kpiData.completedBookings}</p>
          </div>
        </div>

        {/* Rejected/Cancelled Bookings Card */}
        <div className="rounded-[20px] sm:rounded-[30px] bg-white text-black relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 opacity-10">
            <div className="w-full h-full rounded-bl-[40px] sm:rounded-bl-[80px] bg-gradient-to-br from-[#FFF04B] to-[#22A146]"></div>
          </div>
          <div className="p-4 sm:p-6">
            <p className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">Rejected / Cancelled</p>
            <p className="text-4xl sm:text-5xl lg:text-7xl font-bold">{kpiData.rejectedCancelledBookings}</p>
          </div>
        </div>

        {/* Pending Bookings Card */}
        <div className="rounded-[20px] sm:rounded-[30px] bg-white text-black relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 opacity-10">
            <div className="w-full h-full rounded-bl-[40px] sm:rounded-bl-[80px] bg-gradient-to-br from-[#FFF04B] to-[#22A146]"></div>
          </div>
          <div className="p-4 sm:p-6">
            <p className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">Pending</p>
            <p className="text-4xl sm:text-5xl lg:text-7xl font-bold">{kpiData.pendingBookings}</p>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-[10px] overflow-hidden shadow-lg border border-gray-200">
        {/* Mobile: Hide table on small screens, show cards instead */}
        <div className="block lg:hidden">
          {bookings.length > 0 ? (
            <div className="divide-y gap-4 divide-gray-200">
              {bookings.map((booking, index) => {
                const bookingDate = safelyParseDate(booking.bookedOn);
                const startDate = safelyParseDate(booking.startDate);
                const endDate = safelyParseDate(booking.endDate);
                
                return (
                  <div key={booking._id || index} className="p-4 space-y-4 mb-[30px]">
                    {/* Header with date and booking ID */}
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">Booking Date</p>
                        <p className="font-medium text-gray-900">{format(bookingDate, 'dd MMM yyyy')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">ID</p>
                        <p className="font-mono text-sm text-gray-700">{booking._id?.slice(-8) || booking.bookingId}</p>
                      </div>
                    </div>
                    
                    {/* Startup info */}
                    <div className="flex items-center gap-3 py-2">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                        {booking.startupDetails?.logoUrl && (
                          <Image
                            src={booking.startupDetails.logoUrl}
                            alt={booking.startupDetails.startupName || "Startup logo"}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {booking.startupDetails?.startupName || "Unknown Startup"}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {booking.facilityName || "Meeting Hall"}
                        </p>
                      </div>
                    </div>
                    
                    {/* Date range */}
                    <div className="grid grid-cols-2 gap-4 py-2">
                      <div>
                        <p className="text-sm text-gray-500">Start Date</p>
                        <p className="text-sm font-medium">{format(startDate, 'dd MMM yyyy')}</p>
                        <p className="text-xs text-gray-500">{format(startDate, 'hh:mm a')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">End Date</p>
                        <p className="text-sm font-medium">{format(endDate, 'dd MMM yyyy')}</p>
                        <p className="text-xs text-gray-500">{format(endDate, 'hh:mm a')}</p>
                      </div>
                    </div>
                    
                    {/* Status, Price and Action */}
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex flex-col gap-2">
                        <StatusActions 
                          bookingId={booking._id.toString()} 
                          status={booking.status as 'pending' | 'approved' | 'rejected'}
                        />
                        <p className="font-semibold text-lg text-gray-900">
                          {formatPrice(booking.amount || 0)}
                        </p>
                      </div>
                      <Link 
                        href={`/service-provider/bookings/${booking._id}`}
                        className="inline-flex justify-center items-center px-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8">
              <div className="flex flex-col items-center justify-center h-40">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 text-gray-300">
                  <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-gray-500 font-medium text-base mb-1">No bookings found</p>
                <p className="text-gray-400 text-sm">New bookings will appear here once created</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Desktop: Table view */}
        <div className="hidden lg:block overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-gray-50 border-b border-gray-200">
              <TableRow className="divide-x divide-gray-200">
                <TableHead className="py-5 font-semibold text-gray-600 px-6 text-left">DATE</TableHead>
                <TableHead className="py-5 font-semibold text-gray-600 px-6 text-left">BOOKING ID</TableHead>
                <TableHead className="py-5 font-semibold text-gray-600 px-6 text-left">BOOKING NAME</TableHead>
                <TableHead className="py-5 font-semibold text-gray-600 px-6 text-left">FACILITY</TableHead>
                <TableHead className="py-5 font-semibold text-gray-600 px-6 text-left">START DATE</TableHead>
                <TableHead className="py-5 font-semibold text-gray-600 px-6 text-left">END DATE</TableHead>
                <TableHead className="py-5 font-semibold text-gray-600 px-6 text-center">STATUS</TableHead>
                <TableHead className="py-5 font-semibold text-gray-600 px-6 text-right">PRICE</TableHead>
                <TableHead className="py-5 font-semibold text-gray-600 px-6 text-center">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {bookings.length > 0 ? (
                bookings
                .filter(booking => booking.paymentStatus !== 'pending')
                .map((booking, index) => {
                  // Format dates for display - using safe parsing
                  const bookingDate = safelyParseDate(booking.bookedOn);
                  const startDate = safelyParseDate(booking.startDate);
                  const endDate = safelyParseDate(booking.endDate);
                  
                  return (
                    <TableRow key={booking._id || index} className="hover:bg-gray-50 divide-x divide-gray-200">
                      <TableCell className="py-4 px-6 text-gray-700">
                        {format(bookingDate, 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="py-4 px-6 font-medium text-gray-700">
                        {booking._id || booking.bookingId}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative h-9 w-9 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                            {booking.startupDetails?.logoUrl && (
                              <Image
                                src={booking.startupDetails.logoUrl}
                                alt={booking.startupDetails.startupName || "Startup logo"}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <span className="font-medium text-gray-800">
                            {booking.startupDetails?.startupName || "Unknown Startup"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-gray-700">
                        {booking.facilityName || "Meeting Hall"}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-gray-700">
                        <div>
                          <div>{format(startDate, 'dd MMM yyyy')}</div>
                          <div className="text-gray-500 text-sm">{format(startDate, 'hh:mm a')}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-gray-700">
                        <div>
                          <div>{format(endDate, 'dd MMM yyyy')}</div>
                          <div className="text-gray-500 text-sm">{format(endDate, 'hh:mm a')}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <StatusActions 
                          bookingId={booking._id.toString()} 
                          status={booking.status as 'pending' | 'approved' | 'rejected'}
                        />
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right font-semibold">
                        {formatPrice(booking.amount || 0)}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <Link 
                          href={`/service-provider/bookings/${booking._id}`}
                          className="inline-flex justify-center items-center px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
                        >
                          View Details
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-60">
                    <div className="flex flex-col items-center justify-center h-full">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 text-gray-300">
                        <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p className="text-gray-500 font-medium text-lg mb-1">No bookings found</p>
                      <p className="text-gray-400 text-sm">New bookings will appear here once created</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
} 