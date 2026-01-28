'use client'

import React, { useState, useEffect } from 'react'
// import { useSession } from 'next-auth/react'
import { useAuth } from "@/context/AuthContext"
import Image from 'next/image'
import Link from 'next/link'
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval, isSameDay, isAfter } from 'date-fns'
import { CalendarIcon, ChevronLeft, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { Spinner } from '@/components/spinner'

// Define time slots from 9 AM to 6 PM
const TIME_SLOTS = [
  '09:00AM', '10:00AM', '11:00AM', '12:00PM', 
  '01:00PM', '02:00PM', '03:00PM', '04:00PM', '05:00PM', '06:00PM'
]

// Hours for the calendar from 9 AM to 6 PM
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

// Define facility types for the filter
const FACILITY_TYPES = [
  'All Facilities',
  'Meeting Hall',
  'Private Cabin',
  'Labs',
  'Studio'
]

// Define facility type colors
const facilityTypeColors: Record<string, string> = {
  'Meeting Hall': '#FDB600', // Yellow/gold
  'Private Cabin': '#5368F2', // Blue
  'Labs': '#5368F2', // Blue
  'Studio': '#EB4335', // Red
  'individual-cabin': '#5368F2', // Blue
  'coworking-spaces': '#23BB4E', // Green
  'meeting-rooms': '#FDB600', // Yellow/gold
  'bio-allied-labs': '#5368F2', // Blue
  'manufacturing-labs': '#5368F2', // Blue
  'prototyping-labs': '#5368F2', // Blue
  'raw-space-office': '#23BB4E', // Green
  'raw-space-lab': '#5368F2', // Blue
  'default': '#23BB4E' // Default green
}

// Mapping of facility types to their display names
const facilityTypeNames: Record<string, string> = {
  'individual-cabin': 'Private Cabin',
  'coworking-spaces': 'Coworking Space',
  'meeting-rooms': 'Meeting Hall',
  'bio-allied-labs': 'Labs',
  'manufacturing-labs': 'Labs',
  'prototyping-labs': 'Labs',
  'software': 'Software Development',
  'saas-allied': 'SaaS Allied',
  'raw-space-office': 'Raw Space Office',
  'raw-space-lab': 'Raw Space Lab',
  'studio': 'Studio',
};

// Interface for booking data
interface Booking {
  _id: string;
  facilityId: string;
  facilityName: string;
  facilityType: string;
  startupId: string;
  startupName: string;
  startupDetails?: {
    logoUrl: string;
    startupName: string;
  };
  status: string;
  amount: number;
  startDate: string;
  endDate: string;
  rentalPlan: string;
  createdAt: string;
}

// Grouped facility interface
interface FacilityGroup {
  facilityId: string;
  facilityName: string;
  bookings: Booking[];
}

export default function CalendarPage() {
  // const { data: session } = useSession()
  const { user } = useAuth();
  const session = user ? { user } : null;
  
  // Initialize with saved date or current date
  const [selectedDate, setSelectedDate] = useState(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      const savedDate = localStorage.getItem('calendarSelectedDate')
      return savedDate ? new Date(savedDate) : new Date()
    }
    return new Date()
  })
  
  const [selectedFacilityType, setSelectedFacilityType] = useState('All Facilities')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [calendarBookings, setCalendarBookings] = useState<FacilityGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weekDays, setWeekDays] = useState<Array<{ date: Date, isActive: boolean }>>([])
  
  // New state for long-term bookings modal
  const [showLongTermBookings, setShowLongTermBookings] = useState(false)
  const [longTermBookings, setLongTermBookings] = useState<Record<string, Booking[]>>({
    'Weekly': [],
    'Annual': [],
    'Yearly': []
  })

  // Save selected date to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('calendarSelectedDate', selectedDate.toISOString())
    }
  }, [selectedDate])

  // Initialize week days when selected date changes
  useEffect(() => {
    const startOfCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 }) // Start from Monday
    const endOfCurrentWeek = endOfWeek(selectedDate, { weekStartsOn: 1 })
    
    const days = eachDayOfInterval({
      start: startOfCurrentWeek,
      end: endOfCurrentWeek
    }).filter(date => date.getDay() !== 0) // Exclude Sunday
    
    setWeekDays(days.map(date => ({
      date,
      isActive: isSameDay(date, selectedDate)
    })))
  }, [selectedDate])

  // Fetch bookings data
  useEffect(() => {
    fetchBookings()
  }, [selectedDate])

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setIsLoading(true)
      
      // Get start and end dates for the week
      const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 })
      const endDate = endOfWeek(selectedDate, { weekStartsOn: 1 })
      
      // Format dates for API
      const startDateParam = format(startDate, 'yyyy-MM-dd')
      const endDateParam = format(endDate, 'yyyy-MM-dd')
      
      // Fetch bookings for the selected week
      const response = await fetch(`/api/bookings?detailed=true&startDate=${startDateParam}&endDate=${endDateParam}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to fetch bookings')
      }
      
      const data = await response.json()
      
      // Set bookings from response
      let bookingsData = [];
      if (Array.isArray(data)) {
        bookingsData = data;
      } else if (data.bookings && Array.isArray(data.bookings)) {
        bookingsData = data.bookings;
      }
      
      // Normalize dates in booking data
      const normalizedBookings = (bookingsData || []).map((booking: any) => ({
        ...booking,
        // Convert string dates to Date objects for consistent processing
        startDate: booking.startDate instanceof Date ? booking.startDate : new Date(booking.startDate),
        endDate: booking.endDate instanceof Date ? booking.endDate : new Date(booking.endDate),
        createdAt: booking.createdAt instanceof Date ? booking.createdAt : new Date(booking.createdAt || booking.bookedOn || Date.now())
      }));
      
      setBookings(normalizedBookings);
      
      //// console.log('Fetched bookings:', normalizedBookings.length);
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setError(error instanceof Error ? error.message : 'Failed to load bookings')
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  }

  // Group and filter bookings for each day
  useEffect(() => {
    if (!bookings || bookings.length === 0) {
      setCalendarBookings([]);
      setFilteredBookings([]);
      setLongTermBookings({
        'Weekly': [],
        'Annual': [],
        'Yearly': []
      });
      return;
    }
    
    // Filter bookings based on facility type
    let filtered = bookings;
    
    if (selectedFacilityType !== 'All Facilities') {
      // Map API facility types to display names
      let filterType = selectedFacilityType.toLowerCase();
      
      if (filterType === 'meeting hall') filterType = 'meeting-rooms';
      if (filterType === 'private cabin') filterType = 'individual-cabin';
      
      filtered = bookings.filter(booking => {
        const bookingType = booking.facilityType?.toLowerCase() || '';
        const facilityName = booking.facilityName?.toLowerCase() || '';
        return bookingType.includes(filterType) || facilityName.includes(filterType);
      });
    }
    
    // Separate short-term and long-term bookings
    const shortTermBookings: Booking[] = [];
    const weeklyBookings: Booking[] = [];
    const annualBookings: Booking[] = [];
    const yearlyBookings: Booking[] = [];
    const now = new Date();
    
    filtered.forEach(booking => {
      const rentalPlan = booking.rentalPlan?.toLowerCase() || '';
      const endDate = new Date(booking.endDate);
      
      // Check if it's an approved ongoing long-term booking
      const isApproved = booking.status?.toLowerCase() === 'approved';
      const isOngoing = isAfter(endDate, now);
      
      if ((rentalPlan === 'weekly' || rentalPlan === 'week') && isApproved && isOngoing) {
        weeklyBookings.push(booking);
      } else if ((rentalPlan === 'annual' || rentalPlan === 'annually') && isApproved && isOngoing) {
        annualBookings.push(booking);
      } else if ((rentalPlan === 'yearly' || rentalPlan === 'year') && isApproved && isOngoing) {
        yearlyBookings.push(booking);
      } else if (rentalPlan === 'hourly' || rentalPlan === 'daily' || rentalPlan === 'day pass') {
        // Only show hourly and daily bookings on the calendar
        shortTermBookings.push(booking);
      }
    });
    
    // Update long-term bookings state
    setLongTermBookings({
      'Weekly': weeklyBookings,
      'Annual': annualBookings,
      'Yearly': yearlyBookings
    });
    
    // Filter visible bookings (only short-term ones) that are visible in the current week
    const visibleBookings = shortTermBookings.filter(booking => {
      if (!booking.startDate || !booking.endDate) return false;
      
      const startDateTime = new Date(booking.startDate);
      const endDateTime = new Date(booking.endDate);
      
      // Check if any day in the week intersects with the booking duration
      return weekDays.some(day => {
        // Set day's time to start of day (00:00:00)
        const dayStart = new Date(day.date.setHours(0, 0, 0, 0));
        // Set day's time to end of day (23:59:59)
        const dayEnd = new Date(day.date.setHours(23, 59, 59, 999));
        
        // Check if booking overlaps with this day
        const bookingOverlapsDay = (
          // Booking starts on or before day end AND booking ends on or after day start
          (startDateTime <= dayEnd && endDateTime >= dayStart)
        );
        
        return bookingOverlapsDay;
      });
    });
    
    setFilteredBookings(visibleBookings);
    
    // Group bookings by facility for the weekly view
    const facilityMap = new Map<string, FacilityGroup>();
    
    visibleBookings.forEach((booking) => {
      if (!facilityMap.has(booking.facilityId)) {
        facilityMap.set(booking.facilityId, {
          facilityId: booking.facilityId,
          facilityName: booking.facilityName,
          bookings: []
        });
      }
      
      const group = facilityMap.get(booking.facilityId);
      if (group) {
        group.bookings.push(booking);
      }
    });
    
    // Convert the map to an array
    const groupedBookings = Array.from(facilityMap.values());
    //// console.log('Grouped bookings by facility:', groupedBookings.length);
    
    setCalendarBookings(groupedBookings);
  }, [selectedFacilityType, bookings, weekDays]);

  // Handle date change
  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
    // No need to manually save to localStorage here as the useEffect above will handle it
  }

  // Function to calculate time slot position for a day
  const calculateTimeSlotPositionForDay = (startDate: string | Date, endDate: string | Date, dayDate: Date) => {
    // Parse dates from either string or Date objects
    const startDateTime = startDate instanceof Date ? startDate : new Date(startDate);
    const endDateTime = endDate instanceof Date ? endDate : new Date(endDate);
    
    // Create copies of the day date for start and end
    const currentDayStart = new Date(dayDate);
    currentDayStart.setHours(0, 0, 0, 0);
    
    const currentDayEnd = new Date(dayDate);
    currentDayEnd.setHours(23, 59, 59, 999);
    
    // If booking doesn't overlap with this day, return null
    if (startDateTime > currentDayEnd || endDateTime < currentDayStart) {
      return null;
    }
    
    // Calculate effective start time for this day
    let effectiveStartTime = startDateTime;
    if (startDateTime < currentDayStart) {
      // If booking starts before this day, use day start at 9AM
      effectiveStartTime = new Date(currentDayStart);
      effectiveStartTime.setHours(9, 0, 0, 0);
    }
    
    // Calculate effective end time for this day
    let effectiveEndTime = endDateTime;
    if (endDateTime > currentDayEnd) {
      // If booking ends after this day, use day end at 6PM
      effectiveEndTime = new Date(currentDayEnd);
      effectiveEndTime.setHours(18, 0, 0, 0);
    }
    
    // Calendar time range is from 9AM (hour 9) to 6PM (hour 18) = 9 hours total
    const startHour = effectiveStartTime.getHours() + effectiveStartTime.getMinutes() / 60;
    const endHour = effectiveEndTime.getHours() + effectiveEndTime.getMinutes() / 60;
    
    // Calculate the position as a percentage based on 9AM-6PM day
    const dayStartHour = 9; // 9AM
    const dayEndHour = 18; // 6PM
    const totalDayHours = dayEndHour - dayStartHour; // 9 hours
    
    // Calculate left position (start position) as percentage of day
    const left = Math.max(0, ((startHour - dayStartHour) / totalDayHours) * 100);
    
    // Calculate width as percentage of day
    const width = Math.max(5, ((endHour - startHour) / totalDayHours) * 100);
    
    // Log for debugging
    //// console.log('Time slot calculation:', {
    //   booking: {
    //     start: startDateTime.toLocaleTimeString(),
    //     end: endDateTime.toLocaleTimeString(),
    //   },
    //   effective: {
    //     start: effectiveStartTime.toLocaleTimeString(),
    //     end: effectiveEndTime.toLocaleTimeString(),
    //     startHour,
    //     endHour
    //   },
    //   position: { left, width }
    // });
    
    // Return the times and position information
    return {
      startHours: effectiveStartTime.getHours(),
      startMinutes: effectiveStartTime.getMinutes(),
      endHours: effectiveEndTime.getHours(),
      endMinutes: effectiveEndTime.getMinutes(),
      left, // Now properly calculated
      width, // Now properly calculated
      startTime: `${effectiveStartTime.getHours()}:${String(effectiveStartTime.getMinutes()).padStart(2, '0')}`,
      endTime: `${effectiveEndTime.getHours()}:${String(effectiveEndTime.getMinutes()).padStart(2, '0')}`
    };
  }

  // Restore the original getBookingRow function
  const getBookingRow = (date: string) => {
    try {
      const bookingDate = new Date(date)
      
      // Find index of day in weekDays
      const dayIndex = weekDays.findIndex(day => 
        isSameDay(day.date, bookingDate)
      )
      
      return dayIndex >= 0 ? dayIndex + 1 : null // Return null if day not found
    } catch (e) {
      console.error('Error determining booking row:', e)
      return null
    }
  }

  // Format date from DB for display
  const formatDateFromDB = (dateString: string | Date) => {
    // Create a date object properly converting to local timezone
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    
    // Format the time according to local timezone
    return {
      date,
      formattedTime: date.toLocaleTimeString([], {
        hour: '2-digit', 
        minute: '2-digit'
        // Removed timeZone: 'UTC' to use local timezone
      }),
      hours: date.getHours(), // Use local hours instead of UTC
      minutes: date.getMinutes() // Use local minutes instead of UTC
    };
  };

  // Get display name for facility type
  const getDisplayFacilityType = (booking: Booking): string => {
    return facilityTypeNames[booking.facilityType.toLowerCase()] || booking.facilityType;
  }

  // Get color for facility type
  const getFacilityColor = (booking: Booking): string => {
    return facilityTypeColors[booking.facilityType.toLowerCase()] || facilityTypeColors.default
  }

  // Additional function to count total long-term bookings
  const countLongTermBookings = () => {
    return Object.values(longTermBookings).reduce((total, bookings) => total + bookings.length, 0);
  };

  if (isLoading) {
    return (
      <div className="font-['Plus_Jakarta_Sans'] px-8 py-6">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/service-provider/bookings" className="inline-flex items-center text-gray-700">
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span className="text-xl">Back</span>
          </Link>
          <h1 className="text-4xl font-bold text-[#222222]">Calendar</h1>
        </div>
        
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading calendar data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-8 py-6">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/service-provider/bookings" className="inline-flex items-center text-gray-700">
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span className="text-xl">Back</span>
          </Link>
          <h1 className="text-4xl font-bold text-[#222222]">Calendar</h1>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-red-800 text-lg font-medium mb-2">Error Loading Calendar</h3>
          <p className="text-red-600">{error}</p>
          <Button 
            className="mt-4 bg-red-600 hover:bg-red-700"
            onClick={() => {
              setError(null)
              setIsLoading(true)
              fetchBookings()
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="font-['Plus_Jakarta_Sans'] px-8 py-6">
      {/* Header with back button, title, and filter */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Link href="/service-provider/bookings" className="inline-flex items-center text-gray-700">
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span className="text-xl">Back</span>
          </Link>
          <h1 className="text-4xl font-bold text-[#222222]">Calendar</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Date picker */}
          <div className="flex items-center">
            <Button 
              variant="link" 
              onClick={() => handleDateChange(subDays(selectedDate, 7))}
              className="p-1"
            >
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline"
                  className="border-none shadow-none h-auto hover:bg-transparent hover:text-black"
                >
                  <span className="text-2xl font-bold">
                    {weekDays.length > 0 
                      ? `${format(weekDays[0].date, 'dd MMM')} - ${format(weekDays[weekDays.length - 1].date, 'dd MMM, yyyy')}`
                      : format(selectedDate, 'dd MMM, yyyy')
                    }
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <div className="datepicker-container">
                  <style jsx global>{`
                    .react-datepicker {
                      font-size: 0.875rem;
                      border: 1px solid #e2e8f0;
                      border-radius: 0.5rem;
                    }
                    .react-datepicker__header {
                      padding-top: 0.75rem;
                    }
                    .react-datepicker__current-month {
                      font-size: 0.875rem;
                      margin-bottom: 0.375rem;
                    }
                    .react-datepicker__day-name {
                      width: 2rem;
                      font-size: 0.75rem;
                    }
                    .react-datepicker__day {
                      width: 2rem;
                      height: 2rem;
                      line-height: 2rem;
                      font-size: 0.875rem;
                      margin: 0.1rem;
                    }
                    .react-datepicker__day--selected {
                      background-color: #5368F2;
                    }
                    .react-datepicker__day:hover {
                      background-color: #f3f4f6;
                    }
                    .react-datepicker__day--selected:hover {
                      background-color: #4559e0;
                    }
                  `}</style>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => date && handleDateChange(date)}
                    inline
                  />
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="link" 
              onClick={() => handleDateChange(addDays(selectedDate, 7))}
              className="p-1"
            >
              <ChevronLeft className="h-5 w-5 text-gray-500 transform rotate-180" />
            </Button>
          </div>
          
          {/* Facility type filter */}
          <div className="flex items-center rounded-md border border-gray-200 bg-white">
            <div className="flex h-10 px-3 items-center justify-center text-gray-500">
              <span className="font-medium">Facility type</span>
            </div>
            <Select value={selectedFacilityType} onValueChange={setSelectedFacilityType}>
              <SelectTrigger className="border-0 w-[150px] h-10 focus:ring-0">
                <SelectValue>{selectedFacilityType}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {FACILITY_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Calendar Container */}
      <div className="bg-white rounded-[24px] border border-gray-200 shadow overflow-hidden">
        <div className="relative min-w-[1400px]">
          {/* Calendar Header */}
          <div className="flex border-b border-gray-200">
            {/* Left corner empty cell */}
            <div className="w-[110px] flex-shrink-0 border-r border-gray-200 h-16 flex items-center justify-center">
              <button 
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                onClick={() => setShowLongTermBookings(true)}
                title="View long-term bookings"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {countLongTermBookings() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {countLongTermBookings() > 9 ? '9+' : countLongTermBookings()}
                  </span>
                )}
              </button>
            </div>
            
            {/* Time slots header */}
            <div className="flex-1 grid grid-cols-10">
              {TIME_SLOTS.map((time, index) => (
                <div 
                  key={index} 
                  className="h-16 flex items-center justify-center border-r border-gray-200 last:border-r-0"
                >
                  <span className="text-[16px] font-bold text-gray-600 tracking-tight">
                    {/* Format time to look cleaner */}
                    {time.replace(':00', '')}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Calendar Body */}
          <div className="flex">
            {/* Days column */}
            <div className="w-[110px] flex-shrink-0 border-r border-gray-200">
              {weekDays.map((day, index) => (
                <div 
                  key={index} 
                  className={`h-[100px] border-b border-gray-200 last:border-b-0 flex flex-col justify-center items-center py-3`}
                >
                  <span className="text-[15px] font-medium text-gray-800">
                    {format(day.date, 'EEEE')}
                  </span>
                  <span className="text-sm font-bold mt-1 text-gray-500">
                    {format(day.date, 'dd MMM')}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="flex-1 relative">
              {/* Grid lines */}
              <div className="absolute inset-0 grid grid-cols-10 grid-rows-6 h-full">
                {weekDays.map((_, dayIndex) => (
                  <React.Fragment key={`row-${dayIndex}`}>
                    {[...Array(10)].map((_, timeIndex) => (
                      <div 
                        key={`cell-${dayIndex}-${timeIndex}`} 
                        className={`border-r border-b border-gray-200 
                          ${timeIndex === 9 ? 'border-r-0' : ''} 
                          ${dayIndex === 5 ? 'border-b-0' : ''}`}
                        style={{
                          gridColumn: `${timeIndex + 1}`,
                          gridRow: `${dayIndex + 1}`,
                        }}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </div>
              
              {/* Booking cards */}
              <div className="relative" style={{ height: `${weekDays.length * 100}px` }}>
                {filteredBookings.length > 0 ? (
                  // Render bookings for each day of the week
                  filteredBookings.flatMap((booking) => {
                    // Create a booking card for each day the booking spans
                    return weekDays.map((day, dayIndex) => {
                      // Check if booking is on this day
                      const position = calculateTimeSlotPositionForDay(booking.startDate, booking.endDate, new Date(day.date));
                      
                      // Skip if booking doesn't appear on this day
                      if (!position) return null;
                      
                      // Get facility type display name
                      const facilityType = getDisplayFacilityType(booking);
                      
                      // Set color based on facility type
                      const color = getFacilityColor(booking);
                      
                      // Get properly formatted times for display
                      const startDateInfo = formatDateFromDB(booking.startDate);
                      const endDateInfo = formatDateFromDB(booking.endDate);
                      
                      // Determine styling based on facility type
                      let cardStyle = {};
                      let cardClass = "absolute bg-white rounded-lg shadow-md p-2 box-content overflow-hidden z-10 transition-all hover:shadow-lg";
                      
                      if (facilityType === 'Meeting Hall') {
                        cardStyle = { borderTop: `2px solid ${color}` };
                      } else if (facilityType === 'Labs') {
                        cardStyle = { borderLeft: `3px solid ${color}` };
                        cardClass += " border-l-[3px]"; // Add explicit border-left class
                      } else if (facilityType === 'Studio') {
                        cardStyle = { borderTop: `3px solid ${color}` };
                        cardClass += " border-t-[3px]"; // Add explicit border-top class
                      } else {
                        // Private Cabin or other types
                        cardStyle = { borderTop: `2px solid ${color}`, borderRight: `1px solid ${color}20` };
                        cardClass += " border-t-[2px]"; // Add explicit border-top class
                      }
                      
                      const startDate = new Date(booking.startDate);
                      const endDate = new Date(booking.endDate);
                      const bookingSpansMultipleDays = !isSameDay(startDate, endDate);
                      
                      // Create a title that shows if booking spans multiple days
                      let titleText = `${booking.startupDetails?.startupName || booking.startupName || "Unknown Startup"} - ${facilityType}`;
                      if (bookingSpansMultipleDays) {
                        titleText += ` - From ${format(startDate, 'dd MMM')} ${startDateInfo.formattedTime} to ${format(endDate, 'dd MMM')} ${endDateInfo.formattedTime}`;
                      } else {
                        titleText += ` - ${startDateInfo.formattedTime} to ${endDateInfo.formattedTime}`;
                      }
                      
                      return (
                        <div
                          key={`${booking._id}-day-${dayIndex}`}
                          className={cardClass}
                          style={{
                            top: `${dayIndex * 100 + 2}px`, // Slight adjustment to center better
                            left: `${position.left}%`, // Use the calculated left position directly
                            width: `${position.width}%`, // Use the calculated width directly
                            height: "80px",
                            ...cardStyle
                          }}
                          title={titleText}
                        >
                          <div className="flex items-center h-full">
                            <div className="flex items-center gap-2 w-full px-1">
                              <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300/30 relative flex-shrink-0 overflow-hidden">
                                {booking.startupDetails?.logoUrl && (
                                  <Image
                                    src={booking.startupDetails.logoUrl}
                                    alt={booking.startupName || "Startup logo"}
                                    fill
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <div className="font-bold text-sm text-black">{booking.startupDetails?.startupName || booking.startupName || "Unknown Startup"}</div>
                                <div className="text-xs text-black">{facilityType}</div>
                                <div className="text-xs text-gray-500">
                                  {bookingSpansMultipleDays && !isSameDay(day.date, startDate) 
                                    ? "Continued" 
                                    : startDateInfo.formattedTime} - {
                                    bookingSpansMultipleDays && !isSameDay(day.date, endDate) 
                                      ? "..." 
                                      : endDateInfo.formattedTime}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  }).filter(Boolean) // Remove nulls
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-gray-50/50 px-8 py-10 rounded-lg">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600 font-medium text-lg mb-1">No bookings found</p>
                      <p className="text-gray-400 text-sm">There are no bookings scheduled for this period</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Long-term bookings modal */}
      <Dialog open={showLongTermBookings} onOpenChange={setShowLongTermBookings}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Long-term Ongoing Bookings
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {Object.entries(longTermBookings).map(([planType, bookings]) => (
              bookings.length > 0 ? (
                <div key={planType} className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2">
                    {planType} Bookings ({bookings.length})
                  </h3>
                  <div className="space-y-3">
                    {bookings.map(booking => {
                      const facilityType = getDisplayFacilityType(booking);
                      const color = getFacilityColor(booking);
                      const startDate = new Date(booking.startDate);
                      const endDate = new Date(booking.endDate);
                      
                      return (
                        <div 
                          key={booking._id} 
                          className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow"
                          style={{ borderLeft: `4px solid ${color}` }}
                        >
                          <div className="flex items-start">
                            <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-300/30 relative flex-shrink-0 overflow-hidden mr-3">
                              {booking.startupDetails?.logoUrl && (
                                <Image
                                  src={booking.startupDetails.logoUrl}
                                  alt={booking.startupName || "Startup logo"}
                                  fill
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900">{booking.startupDetails?.startupName || booking.startupName || "Unknown Startup"}</h4>
                              <div className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">{booking.facilityName}</span>
                                <span className="mx-1">•</span>
                                <span>{facilityType}</span>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                                  Start: {format(startDate, 'dd MMM yyyy')}
                                </div>
                                <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                                  End: {format(endDate, 'dd MMM yyyy')}
                                </div>
                                <div className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                                  {booking.rentalPlan}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null
            ))}
            
            {countLongTermBookings() === 0 && (
              <div className="text-center py-10">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 font-medium text-lg mb-1">No long-term bookings</p>
                <p className="text-gray-400 text-sm">There are no ongoing long-term bookings at this time</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
