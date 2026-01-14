'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ChevronLeft, Clock, Phone, CalendarIcon } from 'lucide-react'
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { IncompleteProfileModal } from '@/components/ui/incomplete-profile-modal'
import { 
  isStartupProfileComplete, 
  getStartupProfileCompletionPercentage,
  getStartupIncompleteFields
} from '@/lib/utils/profile-completion'

interface RentalPlan {
  name: string
  price: number
  duration: string
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  facility: {
    _id: string
    details: {
      name: string
      images: string[]
      rentalPlans: RentalPlan[]
      description?: string
    }
    address: string
    city: string
    state: string
    pincode: string
    features?: string[]
    isFeatured?: boolean
  }
}

export function BookingModal({ isOpen, onClose, facility }: BookingModalProps) {
  const { data: session } = useSession()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [contactNumber, setContactNumber] = useState<string>('')
  const [bookingPeriod, setBookingPeriod] = useState<string>('')
  const [isCustomDate, setIsCustomDate] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [showIncompleteProfileModal, setShowIncompleteProfileModal] = useState(false)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [incompleteFields, setIncompleteFields] = useState<string[]>([])

  // Fetch startup profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session) return;
      
      // Check if user is a service provider
      if (session.user.userType === 'Service Provider') {
        setIsProfileLoading(false);
        return; // Don't try to fetch startup profile for service providers
      }
      
      try {
        setIsProfileLoading(true)
        const response = await fetch('/api/startup/profile')
        if (!response.ok) throw new Error('Failed to fetch profile')
        
        const data = await response.json()
        setProfile(data)
        
        // Check if profile is complete
        const isComplete = isStartupProfileComplete(data)
        const percentage = getStartupProfileCompletionPercentage(data)
        const missingFields = getStartupIncompleteFields(data)
        
        setCompletionPercentage(percentage)
        setIncompleteFields(missingFields)
        
        if (!isComplete) {
          setShowIncompleteProfileModal(true)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsProfileLoading(false)
      }
    }

    if (isOpen && session) {
      fetchProfile()
    }
  }, [isOpen, session])

  // Debug logging
  useEffect(() => {
   // console.log('Facility in BookingModal:', facility)
   // console.log('Rental Plans:', facility?.details?.rentalPlans)
  }, [facility])

  // Sort rental plans in a specific order
  const sortedRentalPlans = React.useMemo(() => {
    if (!facility?.details?.rentalPlans) {
     // console.log('No rental plans found')
      return []
    }
    const sorted = [...facility.details.rentalPlans].sort((a, b) => {
      const order = ['Hourly', 'One Day (24 Hours)', 'Weekly', 'Monthly', 'Annual']
      return order.indexOf(a.name) - order.indexOf(b.name)
    })
   // console.log('Sorted rental plans:', sorted)
    return sorted
  }, [facility?.details?.rentalPlans])

  // Set initial booking period if available
  useEffect(() => {
    if (sortedRentalPlans.length > 0) {
      setBookingPeriod(sortedRentalPlans[0].name)
    }
  }, [sortedRentalPlans])

  // Calculate end date based on selected date and booking period
  const calculateEndDate = (startDate: Date, period: string): Date => {
    const endDate = new Date(startDate)
    switch (period) {
      case 'Annual':
        endDate.setFullYear(endDate.getFullYear() + 1)
        break
      case 'Monthly':
        endDate.setMonth(endDate.getMonth() + 1)
        break
      case 'Weekly':
        endDate.setDate(endDate.getDate() + 7)
        break
      case 'One Day (24 Hours)':
        endDate.setDate(endDate.getDate() + 1)
        break
      case 'Hourly':
        endDate.setHours(endDate.getHours() + 1)
        break
    }
    return endDate
  }

  // Get duration text based on booking period
  const getDurationText = (startDate: Date, period: string): string => {
    const endDate = calculateEndDate(startDate, period)
    const days = {
      'Annual': 365,
      'Monthly': 30,
      'Weekly': 7,
      'One Day (24 Hours)': 1,
      'Hourly': 0.0417 // 1/24 of a day
    }[period]

    const startDateStr = startDate.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    
    const endDateStr = endDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    // For hourly bookings, include the time
    if (period === 'Hourly') {
      const startTimeStr = startDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric'
      })
      
      const endTimeStr = endDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric'
      })
      
      return `Booking Duration: ${startDateStr} ${startTimeStr} to ${endDateStr} ${endTimeStr} (1 Hour)`
    }

    return `Booking Duration: ${startDateStr} to ${endDateStr} (${days} Days)`
  }

  // Get selected plan price
  const getSelectedPlanPrice = (): number => {
    if (!sortedRentalPlans.length) return 0
    const selectedPlan = sortedRentalPlans.find(plan => plan.name === bookingPeriod)
    return selectedPlan?.price || 0
  }

  // Generate dates for the next 7 days
  const nextSevenDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return date
  })

  const timeSlots = [
    '9 AM', '10 AM', '11 AM', '12 PM', 
    '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'
  ]

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date)
      setIsCustomDate(false)
    }
  }

  const handleDateTileClick = (date: Date) => {
    setSelectedDate(date)
  }

  const toggleCustomDate = () => {
    setIsCustomDate(prev => !prev)
  }

  // Handle booking submission
  const handleBookingSubmit = () => {
    // Check if profile is complete before allowing to book
    if (!isStartupProfileComplete(profile)) {
      setShowIncompleteProfileModal(true)
      return
    }
    
    // Continue with booking submission
    // ... existing booking submission code
  }

  // Auth overlay component
  const AuthOverlay = () => (
    <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 text-center z-50">
      <h3 className="text-xl font-semibold mb-2">Sign in to Book</h3>
      <p className="text-gray-600 mb-6">Please sign in or create an account to proceed with your booking.</p>
      <div className="flex gap-3">
        <Link href="/sign-in">
          <Button variant="outline" size="lg">Sign In</Button>
        </Link>
        <Link href="/sign-up">
          <Button size="lg">Create Account</Button>
        </Link>
      </div>
    </div>
  )

  // Profile completion overlay
  const ProfileCompletionOverlay = () => {
    if (isProfileLoading) return null;
    
    if (!isStartupProfileComplete(profile)) {
      return (
        <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 text-center z-50">
          <h3 className="text-xl font-semibold mb-2">Complete Your Profile</h3>
          <p className="text-gray-600 mb-6">You need to complete your profile before you can make bookings.</p>
          <div className="w-full max-w-md space-y-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Profile completion</span>
                <span className="font-medium">{completionPercentage}%</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          <Link href="/startup/profile">
            <Button size="lg">Complete Profile</Button>
          </Link>
        </div>
      );
    }
    
    return null;
  }

  // Service Provider overlay
  const ServiceProviderOverlay = () => {
    if (!session || session.user.userType !== 'Service Provider') return null;
    
    return (
      <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 text-center z-50">
        <h3 className="text-xl font-semibold mb-2">Facility Partner Account</h3>
        <p className="text-gray-600 mb-6">
          Booking is only available for startup accounts. As a Facility Partner, you can list your own facilities but cannot make bookings.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" onClick={onClose}>Close</Button>
          <Link href="/service-provider/dashboard">
            <Button size="lg">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Book {facility.details.name}</DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2 h-full relative">
          {!session && <AuthOverlay />}
          {session && session.user.userType === 'service-provider' && <ServiceProviderOverlay />}
          {session && session.user.userType !== 'service-provider' && <ProfileCompletionOverlay />}
          
          {/* Left Section - Slot Selection */}
          <div className="p-4 border-r">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2 className="text-lg font-semibold">Select a Slot</h2>
            </div>

            {/* Date Selection */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-medium">Select Date</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`h-7 px-2.5 gap-1 text-sm ${
                    isCustomDate 
                      ? 'bg-primary/5 border-primary text-primary'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                  onClick={toggleCustomDate}
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  Custom
                </Button>
              </div>

              {isCustomDate ? (
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
                  `}</style>
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    dateFormat="MMMM d, yyyy"
                    placeholderText="Select a date"
                    className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                    wrapperClassName="w-full"
                    inline
                  />
                </div>
              ) : (
                <div className="flex gap-1.5 overflow-x-auto pb-1.5">
                  {nextSevenDays.map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => handleDateTileClick(date)}
                      className={`flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center border-2 ${
                        selectedDate?.toDateString() === date.toDateString()
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-[10px] capitalize">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-sm font-semibold">
                        {date.getDate()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Time Selection */}
            <div className="mb-4">
              <h3 className="text-base font-medium mb-3">Select Time</h3>
              <div className="grid grid-cols-3 gap-1.5">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 px-3 rounded-lg border-2 text-xs font-medium transition-colors ${
                      selectedTime === time
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Number */}
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Phone className="h-4 w-4 text-gray-500" />
                <h3 className="text-base font-medium">Contact / Whatsapp Mobile Number</h3>
              </div>
              <p className="text-xs text-gray-600 mb-1.5">Enter the number on which you wish to receive updates</p>
              <Input
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Enter your mobile number"
                className="w-full h-8 text-sm"
              />
            </div>

            {/* Booking Period */}
            <div>
              <h3 className="text-base font-medium mb-3">Booking Period-term</h3>
              {sortedRentalPlans.length > 0 ? (
                <RadioGroup
                  value={bookingPeriod}
                  onValueChange={setBookingPeriod}
                  className="flex flex-col gap-2"
                >
                  {sortedRentalPlans.map((plan) => (
                    <div key={plan.name} className="flex items-center space-x-2">
                      <RadioGroupItem value={plan.name} id={plan.name.toLowerCase()} className="h-4 w-4" />
                      <Label htmlFor={plan.name.toLowerCase()} className="text-sm">
                        {plan.name === 'One Day (24 Hours)' ? 'Day Pass' : plan.name} - ₹{plan.price.toLocaleString()}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <p className="text-sm text-gray-500">No rental plans available for this facility.</p>
              )}
            </div>
          </div>

          {/* Right Section - Booking Details */}
          <div className="p-4 bg-gray-50">
            <h2 className="text-lg font-semibold mb-4">Booking Details</h2>
            
            {/* Facility Image and Details */}
            <div className="mb-4">
              <div className="relative h-36 rounded-lg overflow-hidden mb-3">
                <Image
                  src={facility.details.images[0]}
                  alt={facility.details.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold mb-1">{facility.details.name}</h3>
              <p className="text-sm text-gray-600">
                {facility.address}, {facility.city}, {facility.state}, {facility.pincode}
              </p>
            </div>

            {/* Booking Duration */}
            {selectedDate && bookingPeriod && (
              <div className="mb-4">
                <p className="text-xs text-gray-600">
                  <span className="font-normal">Booking Duration: </span>
                  <span className="font-semibold">
                    {selectedDate.toLocaleDateString('en-US', { 
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="font-normal"> to </span>
                  <span className="font-semibold">
                    {calculateEndDate(selectedDate, bookingPeriod).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="font-normal">
                    {` (${
                      {
                        'Annual': 365,
                        'Monthly': 30,
                        'Weekly': 7,
                        'One Day (24 Hours)': 1,
                        'Hourly': 0.0417 // 1/24 of a day
                      }[bookingPeriod]
                    } Days)`}
                  </span>
                </p>
              </div>
            )}

            {/* Booked Date & Time */}
            {selectedDate && selectedTime && (
              <div className="flex items-center gap-1.5 mb-4">
                <Clock className="h-4 w-4 text-gray-500" />
                <p className="text-xs">
                  <span className="font-semibold">{selectedTime}</span>
                  <span className="font-normal">{' '}</span>
                  <span className="font-semibold">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </p>
              </div>
            )}

            {/* Booking Period */}
            <div className="mb-4">
              <span className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                {bookingPeriod === 'day' ? 'Day' : bookingPeriod === 'month' ? 'Month' : 'Year'}
              </span>
            </div>

            {/* Total Amount */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-base font-medium">Total Amount</span>
              <span className="text-xl font-bold">₹{getSelectedPlanPrice().toLocaleString()}/-</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full py-4 text-base font-semibold"
                disabled={!session || !selectedDate || !selectedTime || !contactNumber || !bookingPeriod}
                onClick={handleBookingSubmit}
              >
                {session ? 'Proceed to Pay' : 'Sign in to Book'}
              </Button>

              <div className="bg-white p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">We can help you</h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => window.location.href = 'tel:+919597357386'}
                  >
                    Contact Admin
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">
                    Call or send a WhatsApp message to get assistance.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs flex items-center gap-1.5"
                    onClick={() => window.location.href = 'https://wa.me/919597357386'}
                  >
                    <Image
                      src="/whatsapp-icon.svg"
                      alt="WhatsApp"
                      width={12}
                      height={12}
                    />
                    Chat with Admin
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
      
      <IncompleteProfileModal
        isOpen={showIncompleteProfileModal}
        onClose={() => setShowIncompleteProfileModal(false)}
        completionPercentage={completionPercentage}
        incompleteFields={incompleteFields}
        userType="startup"
        redirectPath="/startup/profile"
      />
    </Dialog>
  )
} 