'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
// import { useSession } from 'next-auth/react'
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { FacilityCard } from '@/components/ui/facility-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, ChevronLeft, ChevronRight, MapPin, Clock, Wifi, Coffee, CheckCircle, Phone, Mail, Globe, UserCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { AMENITY_ICONS } from '@/components'
import { AnimatePresence, motion } from 'framer-motion'
import EventService from "@/app/(dashboard)/service-provider/events/services/event-api-services"
import EventCards from '@/app/(landing)/events-page/components/eventcard'
import axios from 'axios'

// Define interfaces
interface DayTiming {
  isOpen: boolean
  openTime?: string
  closeTime?: string
}

interface Timings {
  monday: DayTiming
  tuesday: DayTiming
  wednesday: DayTiming
  thursday: DayTiming
  friday: DayTiming
  saturday: DayTiming
  sunday: DayTiming
}

interface FacilityType {
  type: string
  count: number
  originalType?: string
}

interface ServiceProvider {
  _id: string
  serviceName: string | null
  serviceProviderType: string | null
  address: string | null
  city: string | null
  state: string | null
  pincode: string | null
  logoUrl: string | null
  images: string[]
  features: string[]
  facilityTypes: FacilityType[]
  timings: Timings
  primaryContact1Name: string | null
  primaryContact1Designation: string | null
  primaryContactNumber: string | null
  primaryEmailId: string | null
  websiteUrl: string | null
}

interface Facility {
  _id: string
  serviceProviderId: string
  facilityType: string
  status: string
  details: {
    name: string
    images: string[]
    rentalPlans?: Array<{
      name: string
      price: number
      duration: string
    }>
    description?: string
  }
  address: string
  city: string
  state: string
  country: string
  pincode: string
  features: string[]
  isFeatured: boolean
  serviceProvider: {
    serviceName: string
    serviceProviderType: string
    features: string[]
  }
}

interface Event {
  _id: string;
  serviceProviderId: string;
  serviceProviderName: string;
  title: string;
  status: "public" | "private";
  startDateTime: string;
  endDateTime: string;
  venue: string;
  venueStatus: "offline" | "online";
  description: string;
  category: string;
  sectors: string[];
  amenities: string[];
  coverImage: string;
  features: Array<{
    name: string;
    files: string[];
    _id: string;
  }>;
  chiefGuests: Array<{
    name: string;
    image: string;
    _id: string;
  }>;
  hasChiefGuest: boolean;
  hasFeatures: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  activeStatus: "upcoming" | "ongoing" | "completed" | "cancelled";
  ticketType: "free" | "paid";
  tickets: "limited" | "unlimited";
  ticketCapacity: number;
  bookedTicketsCount: number;
  ticketPrice: number;
  bulkRegistration: boolean;
  bulkTickets: number;
  registrationStartDateTime: string;
  registrationEndDateTime: string;
  customizeTicketEmail: boolean;
  ticketEmailContent: string;
  bulkEmailFile: string;
  collectPersonalInfo: Array<{
    fullName: string;
    email: string;
    phoneNumber: string;
    _id: string;
  }>;
  collectIdentityProof: Array<{
    idProof: string;
    idProofType: string;
    idNumber: string;
    webisteLink: string;
    _id: string;
  }>;
  customQuestions: Array<{
    questionType: string;
    question: string;
    options: string[];
    isRequired: string;
    _id: string;
  }>;
  customizeRegistrationEmail: boolean;
  registrationEmailBodyContent: string;
  termsAndConditions: string;
  refundPolicy: string;
  couponAvailability: boolean;
  couponDetails: Array<{
    couponCode: string;
    discount: number;
    validFrom: string;
    validTo: string;
    _id: string;
  }>;
  eventReminder: boolean;
  postEventFeedback: boolean;
  postEventFeedbackDetails: Array<{
    scheduledDateTime: string;
    bodyContent: string;
    _id: string;
  }>;
  socialMediaLinks: Array<{
    socialLink: string;
    _id: string;
  }>;
  createdAt: string;
  updatedAt: string;
  __v: number;
}


// Add pagination interface
interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

const apiUrl = "http://localhost:3001";

export default function ViewProviderClient({
  providerId
}: {
  providerId: string
}) {
  // const { data: session } = useSession()
  const { user } = useAuth();
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<number>(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fullscreenIndex, setFullscreenIndex] = useState(0)
  const [mapUrl, setMapUrl] = useState<string | null>(null)
  const [hoveredFacilityId, setHoveredFacilityId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('about')
  const [events, setEvents] = useState<Event[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const api = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001'
  // Add pagination state
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 1,
    hasMore: false
  })
  const [loadingFacilities, setLoadingFacilities] = useState(false)
  const [showAllTimings, setShowAllTimings] = useState(false)
  const [currentDay, setCurrentDay] = useState<string>('')
   // Fetch events when events tab is active
  useEffect(() => {
    const fetchEvents = async () => {
      if (activeTab !== 'events') return;
      
      try {
        setLoadingEvents(true)
        setError(null)
        
        // Simple filter - just fetch all events for this provider
        // const filters = {
        //   period: "All Time"
        // }

        const response = await fetch(`${api}/api/admin/eventroutes/events/provider/data/${providerId}`)
        // Check if the response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Parse the JSON from the response
      const jsonData = await response.json()
     // console.log("Events API response:", jsonData)

      // Parse the response based on the structure shown in your document
      let eventsData: Event[] = []
      
      // Check if response has the expected structure
      if (jsonData && jsonData.success && Array.isArray(jsonData.data)) {
        eventsData = jsonData.data
      } else if (Array.isArray(jsonData)) {
        // Fallback if response is directly an array
        eventsData = jsonData
      }
      
     // console.log("Parsed events data:", eventsData)
      setEvents(eventsData)
    } catch (error) {
      console.error('Error fetching events:', error)
      setError('Failed to load events')
      setEvents([])
    } finally {
      setLoadingEvents(false)
    }
  }

  if (providerId && activeTab === 'events') {
    fetchEvents()
  }
}, [providerId, activeTab, api]) // Added 'api' to dependencies


  // Fetch service provider data
  useEffect(() => {
    const fetchServiceProvider = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/service-providers/${providerId}`)
        if (!response.ok) {
          // If we get an unauthorized error, we need to handle it gracefully
          if (response.status === 401) {
            setError('You need to sign in to view provider details')
            return
          }
          throw new Error('Failed to fetch service provider details')
        }
        const data = await response.json()
        
        // Map the fields correctly from the model to our component
        const provider = {
          ...data,
          address: data.address && data.address !== '' ? data.address : null,
          city: data.city && data.city !== '' ? data.city : null,
          // Map stateProvince to state
          state: data.stateProvince && data.stateProvince !== '' ? data.stateProvince : null,
          // Map zipPostalCode to pincode
          pincode: data.zipPostalCode && data.zipPostalCode !== '' ? data.zipPostalCode : null
        }
        
        setProvider(provider)
        
        // Fetch the map URL once we have the provider data
        if (provider.address) {
          // Construct the full address for the map query
          const fullAddress = [
            provider.address,
            provider.city,
            provider.state,
            provider.pincode
          ].filter(Boolean).join(', ')
          
          const mapResponse = await axios.get(`${apiUrl}/api/maps?query=${encodeURIComponent(fullAddress)}`)
          if (mapResponse.data && mapResponse.data.embedUrl) {
    setMapUrl(mapResponse.data.embedUrl); 
  }

        }
      } catch (error) {
        console.error('Error fetching service provider:', error)
        setError('Failed to load service provider details')
      } finally {
        setLoading(false)
      }
    }

    if (providerId) {
      fetchServiceProvider()
    }
  }, [providerId])

  // Fetch facilities for this service provider
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoadingFacilities(true)
        const response = await fetch(`/api/service-providers/${providerId}/facilities?page=${pagination.page}&limit=${pagination.limit}`)
        
        if (!response.ok) {
          // Handle unauthorized errors gracefully
          if (response.status === 401) {
           // console.log('Authentication required to view facilities')
            setFacilities([])
            return
          }
          throw new Error(`Failed to fetch facilities: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        setFacilities(data.facilities)
        setPagination(data.pagination)
      } catch (error) {
        console.error('Error fetching facilities:', error)
        setFacilities([])
      } finally {
        setLoadingFacilities(false)
      }
    }

    if (providerId && activeTab === 'facilities') {
      fetchFacilities()
    }
  }, [providerId, pagination.page, pagination.limit, activeTab])

  // Set current day on component mount
  useEffect(() => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const today = days[new Date().getDay()]
    setCurrentDay(today)
  }, [])

  // Add function to handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Reset to page 1 when switching to facilities tab
    if (value === 'facilities' && pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }))
    }
  }

  // Add pagination navigation functions
  const goToNextPage = () => {
    if (pagination.hasMore) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }))
    }
  }

  const goToPreviousPage = () => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }))
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page }))
    }
  }

  // Image navigation functions
  const nextImage = () => {
    if (!provider?.images?.length) return
    setSelectedImage((prev) => (prev + 1) % provider.images.length)
  }

  const previousImage = () => {
    if (!provider?.images?.length) return
    setSelectedImage((prev) => (prev - 1 + provider.images.length) % provider.images.length)
  }

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index)
    setIsFullscreen(true)
  }

  // Add keyboard event handler for fullscreen navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      
      switch (e.key) {
        case 'ArrowRight':
          if (provider?.images) {
            setFullscreenIndex((prev) => (prev + 1) % provider.images.length);
          }
          break;
        case 'ArrowLeft':
          if (provider?.images) {
            setFullscreenIndex((prev) => (prev - 1 + provider.images.length) % provider.images.length);
          }
          break;
        case 'Escape':
          setIsFullscreen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, provider?.images]);

  // Helper function to format day name
  const formatDayName = (day: string): string => {
    return day.charAt(0).toUpperCase() + day.slice(1)
  }
  
  // Helper function to get timing display text
  const getTimingText = (timing: DayTiming): string => {
    if (!timing.isOpen) return 'Closed'
    return `${timing.openTime} - ${timing.closeTime}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !provider) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {error ? 'Something went wrong' : 'Service provider not found'}
        </h2>
        <p className="text-gray-600 mb-6">{error || 'We could not find the service provider you are looking for.'}</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild>
            <a href="/ProviderSearch">Browse Service Providers</a>
          </Button>
          {error === 'You need to sign in to view provider details' && (
            <Button variant="outline" asChild>
              <a href="/sign-in">Sign In</a>
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Prepare images array, use default if none available
  const images = provider.images && provider.images.length > 0 
    ? provider.images 
    : [provider.logoUrl || '/placeholder-image.jpg']

  return (
    <div className="bg-white">
      {/* Hero section with image gallery */}
      <div className="container mx-auto px-8 py-12 max-w-7xl">
        {/* Provider Name and Address */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{provider.serviceName || 'Unnamed Provider'}</h1>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <p>{provider.address || 'No address provided'}</p>
          </div>
        </div>

        {/* Image Gallery - Similar to ViewDetailsClient */}
        {images.length > 0 && (
          <div className="mb-8">
            {images.length === 1 ? (
              // Single image layout - full width
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={images[0]}
                  alt={provider.serviceName || 'Service Provider'}
                  fill
                  className="rounded-md object-contain cursor-pointer"
                  onClick={() => openFullscreen(0)}
                />
              </div>
            ) : (
              // Grid layout for multiple images
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-8 relative aspect-[16/9]">
                  <Image
                    src={images[selectedImage]}
                    alt={provider.serviceName || 'Service Provider'}
                    fill
                    className="rounded-md object-contain cursor-pointer"
                    onClick={() => openFullscreen(selectedImage)}
                  />
                </div>
                
                {/* Show images in the grid */}
                <div className="col-span-12 md:col-span-4 grid grid-cols-2 gap-3 h-full">
                  {images.map((image, index) => {
                    if (index >= 4) return null;
                    if (index === selectedImage) return null;
                    
                    return (
                      <div 
                        key={index} 
                        className="relative aspect-square bg-gray-50"
                      >
                        <Image
                          src={image}
                          alt={`${provider.serviceName || 'Service Provider'} - Image ${index + 1}`}
                          fill
                          className="rounded-md object-contain cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => openFullscreen(index)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fullscreen Image Modal */}
        {isFullscreen && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            <button 
              className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/70"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-6 w-6" />
            </button>
            
            <button 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full bg-black/50 hover:bg-black/70"
              onClick={() => setFullscreenIndex((prev) => (prev - 1 + images.length) % images.length)}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <div className="relative h-[80vh] w-[80vw] bg-gray-800/20 rounded-lg">
              <Image
                src={images[fullscreenIndex] || '/placeholder-image.jpg'}
                alt={provider.serviceName || 'Service Provider'}
                fill
                className="object-contain"
              />
            </div>
            
            <button 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full bg-black/50 hover:bg-black/70"
              onClick={() => setFullscreenIndex((prev) => (prev + 1) % images.length)}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
              {fullscreenIndex + 1} / {images.length}
            </div>
          </div>
        )}
      </div>

      {/* Tabs section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <Tabs defaultValue="about" onValueChange={handleTabChange} className="w-full">
          <div className="border-b border-gray-200">
            <TabsList className="flex h-10 items-center justify-start space-x-8 bg-transparent p-0">
              <TabsTrigger 
                value="about" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:font-semibold data-[state=active]:shadow-none px-1 pb-3 text-lg bg-transparent"
              >
                About
              </TabsTrigger>
              <TabsTrigger 
                value="facilities" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:font-semibold data-[state=active]:shadow-none px-1 pb-3 text-lg bg-transparent"
              >
                Facilities
              </TabsTrigger>
                <TabsTrigger 
                value="events" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:font-semibold data-[state=active]:shadow-none px-1 pb-3 text-lg bg-transparent"
              >
                Events
              </TabsTrigger>
            </TabsList>
          </div>

          {/* About Tab Content */}
          <TabsContent value="about" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Amenities Section - First on left side */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Amenities</h2>
                  
                  {provider.features && provider.features.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {provider.features.map((feature, index) => {
                        const IconComponent = AMENITY_ICONS[feature as keyof typeof AMENITY_ICONS] || CheckCircle;
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <IconComponent className="h-5 w-5 text-gray-600" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500">No amenities listed</p>
                  )}
                </div>

                {/* Contact Information - Second on left side */}
                {/* <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Contact Information</h2>
                  
                  <div className="space-y-3">
                    {provider.primaryContact1Name && (
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="text-gray-700">{provider.primaryContact1Name}</p>
                          {provider.primaryContact1Designation && (
                            <p className="text-gray-500 text-sm">{provider.primaryContact1Designation}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {provider.primaryContactNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-gray-600" />
                        <span className="font-semibold text-gray-900">{provider.primaryContactNumber}</span>
                      </div>
                    )}
                    
                    {provider.primaryEmailId && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-gray-600" />
                        <span className="font-semibold text-gray-900">{provider.primaryEmailId}</span>
                      </div>
                    )}
                    
                    {provider.websiteUrl && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-gray-600" />
                        <a 
                          href={provider.websiteUrl.startsWith('http') ? provider.websiteUrl : `https://${provider.websiteUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-semibold text-gray-900 hover:underline"
                        >
                          {provider.websiteUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div> */}
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Address and Map - First on right side */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Address</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {provider.address && (
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="text-gray-700">{provider.address || 'Not provided'}</p>
                        </div>
                      )}
                      
                      {provider.city && (
                        <div>
                          <p className="text-sm text-gray-500">City</p>
                          <p className="text-gray-700">{provider.city || 'Not provided'}</p>
                        </div>
                      )}
                      
                      {provider.state && (
                        <div>
                          <p className="text-sm text-gray-500">State</p>
                          <p className="text-gray-700">{provider.state || 'Not provided'}</p>
                        </div>
                      )}
                      
                      {provider.pincode && (
                        <div>
                          <p className="text-sm text-gray-500">Pincode</p>
                          <p className="text-gray-700">{provider.pincode || 'Not provided'}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Map */}
                    {(provider.address || provider.city || provider.state || provider.pincode) && (
                      <div className="relative h-64 w-full overflow-hidden rounded-lg">
                        <div 
                          className="w-full h-full cursor-pointer relative"
                          onClick={() => {
                            // Construct the full address for Google Maps
                            const fullAddress = [
                              provider.address,
                              provider.city,
                              provider.state,
                              provider.pincode
                            ].filter(Boolean).join(', ')
                            
                            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`, '_blank')
                          }}
                        >
                          <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={mapUrl || ''}
                          />
                          <div className="absolute inset-0 bg-transparent hover:bg-black/5 transition-colors" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timings Section - Second on right side */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Venue Timings</h2>
                  
                  {provider.timings && (
                    <div className="space-y-2">
                      <div className="border border-gray-200 rounded-md overflow-hidden">
                        {/* Current day timing - always visible */}
                        <div 
                          className="bg-gray-50 py-3 px-4 flex justify-between items-center cursor-pointer"
                          onClick={() => setShowAllTimings(!showAllTimings)}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <span className="font-medium">{formatDayName(currentDay)}</span>
                            <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">Today</Badge>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-700 mr-2">
                              {getTimingText(provider.timings[currentDay as keyof Timings])}
                            </span>
                            {showAllTimings ? (
                              <ChevronUp className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                        
                        {/* All other days - animated */}
                        <AnimatePresence>
                          {showAllTimings && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="divide-y divide-gray-200">
                                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                                  .filter(day => day !== currentDay) // Filter out current day to avoid duplication
                                  .map((day) => (
                                    <div 
                                      key={day}
                                      className="py-3 px-4 flex justify-between items-center"
                                    >
                                      <span>{formatDayName(day)}</span>
                                      <span className="text-gray-700">
                                        {getTimingText(provider.timings[day as keyof Timings])}
                                      </span>
                                    </div>
                                  ))
                                }
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Facilities Tab Content */}
          <TabsContent value="facilities" className="mt-6">
            {loadingFacilities ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : facilities.length > 0 ? (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Facilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {facilities.map((facility) => (
                    <FacilityCard
                      key={facility._id}
                      facility={facility}
                      onMouseEnter={() => setHoveredFacilityId(facility._id)}
                      onMouseLeave={() => setHoveredFacilityId(null)}
                      isHovered={hoveredFacilityId === facility._id}
                    />
                  ))}
                </div>
                
                {/* Pagination controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center mt-8 space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === pagination.totalPages || 
                        (page >= pagination.page - 1 && page <= pagination.page + 1)
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="text-gray-500">...</span>
                          )}
                          <Button
                            variant={pagination.page === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(page)}
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      ))
                    }
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={goToNextPage}
                      disabled={!pagination.hasMore}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No Facilities Listed</h3>
                <p className="text-gray-600">This service provider hasn't listed any facilities yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="mt-6">
  {events.length > 0 ? 
  (
     <EventCards events={events} />
  ) 
  : (
    <div className="text-center py-12">
      <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
      <p className="text-gray-600">This service provider hasn't posted any events yet.</p>
    </div>
  )}
</TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 