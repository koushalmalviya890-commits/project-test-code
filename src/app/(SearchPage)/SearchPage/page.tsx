'use client'

import { useState, useEffect, Suspense } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { AlertCircle } from 'lucide-react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { FacilityCard, FacilityCardSkeleton } from '@/components/ui/facility-card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BookingModal } from '@/components/booking/BookingModal'
import { categoryToPropertyTypeMapping } from '@/lib/category-mappings'

// Types
interface RentalPlan {
  name: string
  price: number
  duration: string
}

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

interface StudioEquipmentDetail {
  name: string
  picture: string
  quantity: number
  model: string
}

interface StudioDetails {
  facilityName: string
  description: string
  suitableFor: Array<'video' | 'podcast' | 'audio' | 'others'>
  isSoundProof: boolean
  equipmentDetails: StudioEquipmentDetail[]
  hasAmpleLighting: boolean
  rentalPlanTypes: Array<'Hourly' | 'One-Day'>
}

interface Facility {
  _id: string
  details: {
    name: string
    images: string[]
    rentalPlans?: RentalPlan[]
    description?: string
    studioDetails?: StudioDetails
  }
  features: string[]
  address: string
  city: string
  state: string
  country: string
  pincode: string
  isFeatured: boolean
  rentalPlans?: RentalPlan[]
  serviceProvider?: {
    serviceName: string
    features?: string[]
  }
  facilityType: string
  timings?: Timings
}

interface BookingFacility {
  _id: string
  details: {
    name: string
    images: string[]
    rentalPlans: RentalPlan[]
    description?: string
    studioDetails?: StudioDetails
  }
  address: string
  city: string
  state: string
  pincode: string
  features?: string[]
  isFeatured?: boolean
  timings?: Timings
}

interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

interface SearchResponse {
  facilities: Facility[]
  pagination: PaginationData
}

// Constants
const ITEMS_PER_PAGE = 6
const PROPERTY_TYPES = [
  'All',
  'Individual Cabin',
  'Coworking space',
  'Meeting Room',
  'Bio Allied',
  'Manufacturing',
  'Prototype Labs',
  'Software',
  'SaaS Allied',
  'Raw Space Office',
  'Raw Space Lab',
  'Studio'
]

const LISTING_STATUSES = [
  { value: 'All', label: 'All' },
  { value: 'Monthly', label: 'Monthly Rent' },
  { value: 'Annual', label: 'Yearly Rent' },
  { value: 'Weekly', label: 'Weekly Rent' },
  { value: 'One Day (24 Hours)', label: 'Day-Pass' },
  { value: 'Hourly', label: 'Hourly Rent' }
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' }
]

// Loading Component
function SearchPageLoading() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 mx-auto max-w-[1200px]">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <div key={index} className="flex justify-center">
                <FacilityCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Component
function SearchPageClient() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  // URL Parameters

  const typeFromUrl = searchParams.get('type')
  const searchFromUrl = searchParams.get('search')
  const searchScopeFromUrl = searchParams.get('searchScope')
  const propertyTypesFromUrl = searchParams.get('propertyTypes')?.split(',').filter(Boolean) || []
  const categoryFromUrl = searchParams.get('category')
  const sortByFromUrl = searchParams.get('sortBy')
  const listingStatusFromUrl = searchParams.get('listingStatus') || 'All'
  const minPriceFromUrl = parseInt(searchParams.get('minPrice') || '0')
  const maxPriceFromUrl = parseInt(searchParams.get('maxPrice') || '100000')
  const showFiltersFromUrl = searchParams.get('showFilters') === 'true'
  const pageFromUrl = parseInt(searchParams.get('page') || '1')

  // State
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: pageFromUrl,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: ITEMS_PER_PAGE
  })
  
  // Main filter state - derived from URL parameters
  const [filters, setFilters] = useState({
    searchTerm: searchFromUrl || '',
    propertyTypes: propertyTypesFromUrl.length > 0 
      ? propertyTypesFromUrl.includes('All') 
        ? ['All'] 
        : propertyTypesFromUrl
      : categoryFromUrl && categoryToPropertyTypeMapping[categoryFromUrl]
        ? [categoryFromUrl] // Use the category as a filter if it exists in our mapping
        : typeFromUrl 
          ? [typeFromUrl] 
          : ['All'],
    category: categoryFromUrl || '',
    listingStatus: listingStatusFromUrl,
    priceRange: [minPriceFromUrl, maxPriceFromUrl] as [number, number],
    sortBy: sortByFromUrl || 'newest'
  })

  // Filter dialog state - synchronized with main filters when dialog opens
  const [dialogFilters, setDialogFilters] = useState({...filters})
  
  const [isFilterOpen, setIsFilterOpen] = useState(showFiltersFromUrl)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFacility, setSelectedFacility] = useState<BookingFacility | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null)

  // Synchronize dialog filters with main filters when dialog opens
  useEffect(() => {
    if (isFilterOpen) {
      setDialogFilters({...filters})
    }
  }, [isFilterOpen])

  // URL Management - Updates URL with new filters and triggers a page reload
  const updateUrlWithFilters = (newFilters: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Update or remove parameters based on the new filters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== null) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    // Ensure category is preserved in the URL if it exists
    if (filters.category && !newFilters.hasOwnProperty('category')) {
      params.set('category', filters.category)
    }
    
    // Use router.push instead of router.replace to ensure a full page update
    router.push(`${pathname}?${params.toString()}`)
  }

  // Data Fetching - Fetches facilities based on current filters
  const fetchFacilities = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get all property types if multiple types are selected
      let propertyTypesForQuery = [...filters.propertyTypes]
      
      // If 'All' is selected, don't send any property types
      if (propertyTypesForQuery.includes('All')) {
        propertyTypesForQuery = []
      }
      
      // Special handling for media categories (Video, Podcasts, Edit)
      // These should all map to the Studio property type
      if (filters.category && ['Video', 'Podcasts', 'Edit'].includes(filters.category)) {
        if (!propertyTypesForQuery.includes('Studio')) {
          propertyTypesForQuery.push('Studio')
        }
      }
      
      // If a single category is selected (not 'All'), expand it to include all mapped property types
      if (propertyTypesForQuery.length === 1 && propertyTypesForQuery[0] !== 'All') {
        const category = propertyTypesForQuery[0]
        // Check if this is a category name that needs to be expanded
        const mappedTypes = Object.entries(categoryToPropertyTypeMapping)
          .find(([key]) => key === category)?.[1]
        
        if (mappedTypes) {
          propertyTypesForQuery = mappedTypes
        }
      }
      
      // If we have a category filter, also check if it maps to property types
      if (filters.category && !propertyTypesForQuery.includes(filters.category)) {
        const categoryMappedTypes = categoryToPropertyTypeMapping[filters.category]
        if (categoryMappedTypes) {
          // If we're already using specific property types, merge them with the category types
          if (propertyTypesForQuery.length > 0) {
            propertyTypesForQuery = [...new Set([...propertyTypesForQuery, ...categoryMappedTypes])]
          } else {
            propertyTypesForQuery = categoryMappedTypes
          }
        }
      }
      
      // Build the query parameters
      const queryParams = new URLSearchParams({
        page: pagination.currentPage.toString(),
        search: filters.searchTerm,
        listingStatus: filters.listingStatus,
        minPrice: filters.priceRange[0].toString(),
        maxPrice: filters.priceRange[1].toString(),
        sortBy: filters.sortBy,
        limit: ITEMS_PER_PAGE.toString()
      })

      // Only add propertyTypes if we have specific types to filter by
      if (propertyTypesForQuery.length > 0) {
        queryParams.set('propertyTypes', propertyTypesForQuery.join(','))
      }

      if (searchScopeFromUrl) {
        queryParams.set('searchScope', searchScopeFromUrl)
      }
      
      // Add category to query if it exists
      if (filters.category) {
        queryParams.set('category', filters.category)
      }

      // Make the API request
      const response = await fetch('/api/facilities/search?' + queryParams)
      
      if (!response.ok) {
        throw new Error('Failed to fetch facilities')
      }

      const data: SearchResponse = await response.json()
      
      setFacilities(data.facilities)
      setPagination({
        ...pagination,
        totalPages: data.pagination.totalPages,
        totalItems: data.pagination.totalItems,
        itemsPerPage: ITEMS_PER_PAGE
      })
    } catch (error) {
      console.error('Error fetching facilities:', error)
      setError('Failed to load facilities. Please try again later.')
      setFacilities([])
    } finally {
      setLoading(false)
    }
  }

  // Effects - Fetch facilities when filters or pagination change
  useEffect(() => {
    fetchFacilities()
  }, [filters, pagination.currentPage])

  // Synchronize filters with URL parameters
  useEffect(() => {
    const newFilters = {...filters}
    let hasChanges = false
    
    // Update search term
    if (searchFromUrl !== null && searchFromUrl !== filters.searchTerm) {
      newFilters.searchTerm = searchFromUrl
      hasChanges = true
    }
    
    // Update property types
    const propertyTypesParam = searchParams.get('propertyTypes')
    if (propertyTypesParam) {
      const propertyTypesFromParam = propertyTypesParam.split(',').filter(Boolean)
      if (JSON.stringify(propertyTypesFromParam) !== JSON.stringify(filters.propertyTypes)) {
        newFilters.propertyTypes = propertyTypesFromParam.includes('All') 
          ? ['All'] 
          : propertyTypesFromParam
        hasChanges = true
      }
    } else if (!searchParams.get('type') && !searchParams.get('category') && filters.propertyTypes.length > 0 && filters.propertyTypes[0] !== 'All') {
      // Only reset to 'All' if there is no 'type' or 'category' parameter present in the URL
      newFilters.propertyTypes = ['All']
      hasChanges = true
    }
    
    // Update listing status
    const listingStatusParam = searchParams.get('listingStatus')
    if (listingStatusParam && listingStatusParam !== filters.listingStatus) {
      newFilters.listingStatus = listingStatusParam
      hasChanges = true
    }
    
    // Update price range
    const minPriceParam = searchParams.get('minPrice')
    const maxPriceParam = searchParams.get('maxPrice')
    if (minPriceParam && parseInt(minPriceParam) !== filters.priceRange[0]) {
      newFilters.priceRange[0] = parseInt(minPriceParam)
      hasChanges = true
    }
    if (maxPriceParam && parseInt(maxPriceParam) !== filters.priceRange[1]) {
      newFilters.priceRange[1] = parseInt(maxPriceParam)
      hasChanges = true
    }
    
    // Update sort by
    const sortByParam = searchParams.get('sortBy')
    if (sortByParam && sortByParam !== filters.sortBy) {
      newFilters.sortBy = sortByParam
      hasChanges = true
    }
    
    // Update category
    if (categoryFromUrl !== filters.category) {
      newFilters.category = categoryFromUrl || ''
      hasChanges = true
    }
    
    // Apply changes if any
    if (hasChanges) {
      setFilters(newFilters)
    }
    
    // Update filter dialog state
    const showFilters = searchParams.get('showFilters') === 'true'
    setIsFilterOpen(showFilters)
    
  }, [searchParams])

  // Handlers - Property type change handler for main page
  const handlePropertyTypeChange = (type: string, checked: boolean) => {
    let newTypes: string[]
    
    if (type === 'All' && checked) {
      newTypes = ['All']
    } else {
      newTypes = filters.propertyTypes.filter(t => t !== 'All')
      if (checked) {
        newTypes.push(type)
      } else {
        newTypes = newTypes.filter(t => t !== type)
      }
      if (newTypes.length === 0) {
        newTypes = ['All']
      }
    }
    
    // Update the filters state
    setFilters(prev => ({ ...prev, propertyTypes: newTypes }))
    
    // Update URL parameters
    if (newTypes.length === 1 && newTypes[0] === 'All') {
      // If 'All' is selected, remove propertyTypes from URL
      updateUrlWithFilters({ propertyTypes: null })
    } else {
      updateUrlWithFilters({ propertyTypes: newTypes.join(',') })
    }
  }

  // Handle booking a facility
  const handleBookNow = (facility: Facility, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (session?.user?.userType === 'Service Provider') {
      toast.error('Facility Partners cannot make bookings. Please use a startup account to book facilities.', {
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      })
      return
    }
    
    const formattedFacility: BookingFacility = {
      _id: facility._id,
      details: {
        name: facility.details.name,
        images: facility.details.images,
        description: facility.details.description,
        rentalPlans: (facility.details.rentalPlans || facility.rentalPlans?.map(plan => ({
          name: plan.name,
          price: plan.price,
          duration: plan.duration || plan.name
        })) || []).filter(Boolean) as RentalPlan[],
        studioDetails: facility.details.studioDetails
      },
      address: facility.address,
      city: facility.city,
      state: facility.state,
      pincode: facility.pincode,
      features: facility.features,
      isFeatured: facility.isFeatured,
      timings: facility.timings
    }
    
    setSelectedFacility(formattedFacility)
    setIsBookingModalOpen(true)
  }

  // Handle filter dialog close
  const handleFilterClose = (open: boolean) => {
    if (!open) {
      setIsFilterOpen(false)
      updateUrlWithFilters({ showFilters: null })
    }
  }

  // Reset all filters
  const resetFilters = () => {
    window.location.href = '/SearchPage'
  }

  // Pagination - Handle page change
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
    updateUrlWithFilters({ page: page.toString() })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Get page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5
    
    if (pagination.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= pagination.totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      pageNumbers.push(1)
      
      let startPage = Math.max(2, pagination.currentPage - 1)
      let endPage = Math.min(pagination.totalPages - 1, pagination.currentPage + 1)
      
      if (pagination.currentPage <= 2) {
        endPage = 4
      } else if (pagination.currentPage >= pagination.totalPages - 1) {
        startPage = pagination.totalPages - 3
      }
      
      if (startPage > 2) pageNumbers.push('...')
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }
      
      if (endPage < pagination.totalPages - 1) pageNumbers.push('...')
      
      if (pagination.totalPages > 1) {
        pageNumbers.push(pagination.totalPages)
      }
    }
    
    return pageNumbers
  }

  // Filter Panel Component
  const FilterPanel = () => {
    // Handle property type checkbox changes in dialog
    const handleDialogPropertyTypeChange = (type: string, checked: boolean) => {
      let newTypes: string[];
      
      if (type === 'All' && checked) {
        // If 'All' is selected, clear all other selections
        newTypes = ['All'];
      } else {
        // Remove 'All' from the selection
        newTypes = dialogFilters.propertyTypes.filter(t => t !== 'All');
        
        if (checked) {
          // Add the selected type
          newTypes.push(type);
        } else {
          // Remove the deselected type
          newTypes = newTypes.filter(t => t !== type);
        }
        
        // If no types are selected, default to 'All'
        if (newTypes.length === 0) {
          newTypes = ['All'];
        }
      }
      
      setDialogFilters(prev => ({
        ...prev,
        propertyTypes: newTypes
      }));
    };

    // Handle price range changes in dialog
    const handleDialogPriceRangeChange = (value: [number, number]) => {
      setDialogFilters(prev => ({
        ...prev,
        priceRange: value
      }));
    };

    // Handle listing status changes in dialog
    const handleDialogListingStatusChange = (value: string) => {
      setDialogFilters(prev => ({
        ...prev,
        listingStatus: value
      }));
    };

    // Apply dialog filters to main filters and update URL
    const applyDialogFilters = () => {
      // Update main filters with dialog filters
      setFilters(dialogFilters);
      
      // Create URL parameters
      const params: Record<string, string | null> = {
        search: dialogFilters.searchTerm,
        minPrice: dialogFilters.priceRange[0].toString(),
        maxPrice: dialogFilters.priceRange[1].toString(),
        sortBy: dialogFilters.sortBy,
        listingStatus: dialogFilters.listingStatus,
        showFilters: null,
        page: '1'
      };
      
      // Only include propertyTypes if it's not just 'All'
      if (!(dialogFilters.propertyTypes.length === 1 && dialogFilters.propertyTypes[0] === 'All')) {
        params.propertyTypes = dialogFilters.propertyTypes.join(',');
      } else {
        params.propertyTypes = null;
      }
      
      // Update URL and close filter panel
      updateUrlWithFilters(params);
      
      // Reset pagination to page 1
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    return (
      <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Price Range</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="min-price" className="text-xs text-gray-500">Min Price</Label>
                <Input
                  id="min-price"
                  type="number"
                  min={0}
                  max={dialogFilters.priceRange[1]}
                  value={dialogFilters.priceRange[0]}
                  onChange={(e) => {
                    const value = Math.max(0, Math.min(Number(e.target.value), dialogFilters.priceRange[1]));
                    handleDialogPriceRangeChange([value, dialogFilters.priceRange[1]]);
                  }}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="max-price" className="text-xs text-gray-500">Max Price</Label>
                <Input
                  id="max-price"
                  type="number"
                  min={dialogFilters.priceRange[0]}
                  max={100000}
                  value={dialogFilters.priceRange[1]}
                  onChange={(e) => {
                    const value = Math.max(dialogFilters.priceRange[0], Math.min(Number(e.target.value), 100000));
                    handleDialogPriceRangeChange([dialogFilters.priceRange[0], value]);
                  }}
                  className="mt-1"
                />
              </div>
            </div>
            <Slider
              value={dialogFilters.priceRange}
              onValueChange={(value) => handleDialogPriceRangeChange(value as [number, number])}
              max={100000}
              step={100}
              minStepsBetweenThumbs={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>₹0</span>
              <span>₹100,000</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Listing Status</h3>
          <RadioGroup 
            value={dialogFilters.listingStatus}
            onValueChange={handleDialogListingStatusChange}
          >
            <div className="space-y-2">
              {LISTING_STATUSES.map(({ value, label }) => (
                <div key={value} className="flex items-center">
                  <RadioGroupItem value={value} id={value.toLowerCase()} />
                  <Label htmlFor={value.toLowerCase()} className="ml-2">{label}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Property Type</h3>
          <div className="space-y-2">
            {PROPERTY_TYPES.map((type) => (
              <div key={type} className="flex items-center">
                <Checkbox
                  id={type}
                  checked={dialogFilters.propertyTypes.includes(type)}
                  onCheckedChange={(checked) => {
                    handleDialogPropertyTypeChange(type, checked === true);
                  }}
                />
                <label htmlFor={type} className="ml-2 text-sm">{type}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-between">
          <Button 
            variant="outline"
            className="w-auto text-gray-600"
            onClick={resetFilters}
          >
            Reset Filters
          </Button>
          <Button 
            className="w-full sm:w-auto bg-[#23bb4e] hover:bg-[#1ea844] text-white px-6"
            onClick={applyDialogFilters}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">
              {typeFromUrl ? `${typeFromUrl} Facilities` : 'All Facilities'}
            </h1>
            {searchFromUrl && (
              <p className="text-gray-600">
                Search results for: <span className="font-medium">{searchFromUrl}</span>
              </p>
            )}
            {!loading && facilities.length > 0 && (
              <p className="text-gray-600 mt-2">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} results
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-gray-600 hidden sm:inline">Sort y</span>
              <Select 
                value={filters.sortBy} 
                onValueChange={(value) => {
                  setFilters(prev => ({ ...prev, sortBy: value }))
                  updateUrlWithFilters({ sortBy: value })
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 mx-auto max-w-[1200px]">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                <div key={index} className="flex justify-center">
                  <FacilityCardSkeleton />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Error Loading Facilities</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={fetchFacilities}>Try Again</Button>
            </div>
          ) : facilities.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No Facilities Found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
              <Button onClick={resetFilters}>Reset Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 mx-auto max-w-[1200px]">
              {facilities.map((facility) => (
                <div key={facility._id} className="flex justify-center">
                  <FacilityCard
                    facility={{
                      _id: facility._id,
                      details: {
                        name: facility.details.name,
                        images: facility.details.images || [],
                        rentalPlans: facility.details.rentalPlans || [],
                      },
                      address: facility.address,
                      features: facility.features || [],
                      serviceProvider: facility.serviceProvider,
                      facilityType: facility.facilityType || "Other",
                    }}
                    isHovered={hoveredCardId === facility._id}
                    onMouseEnter={() => setHoveredCardId(facility._id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    isFeatured={facility.isFeatured}
                  />
                </div>
              ))}
            </div>
          )}
          
          {!loading && !error && facilities.length > 0 && pagination.totalPages > 1 && (
            <div className="flex flex-col items-center mt-10">
              <nav className="flex items-center space-x-2">
                <button 
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`px-3 py-2 rounded-md ${
                    pagination.currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label="Previous page"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {getPageNumbers().map((page, index) => (
                    typeof page === 'number' ? (
                      <button
                        key={index}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 flex items-center justify-center rounded-md ${
                          pagination.currentPage === page
                            ? 'bg-green-500 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ) : (
                      <span key={index} className="px-2">
                        {page}
                      </span>
                    )
                  ))}
                </div>
                
                <button 
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`px-3 py-2 rounded-md ${
                    pagination.currentPage === pagination.totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label="Next page"
                >
                  Next
                </button>
              </nav>
              
              <div className="text-center mt-4 text-sm text-gray-500">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} results
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={isFilterOpen} onOpenChange={handleFilterClose}>
        <DialogContent className="sm:max-w-[500px] p-0 hide-scrollbar ">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>
          <FilterPanel />
        </DialogContent>
      </Dialog>
      
      {selectedFacility && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false)
            setSelectedFacility(null)
          }}
          facility={selectedFacility}
        />
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <SearchPageClient />
    </Suspense>
  )
}
