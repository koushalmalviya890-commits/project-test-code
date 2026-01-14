import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Sort } from 'mongodb'

const ITEMS_PER_PAGE = 6

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('search') || ''
    const searchScope = searchParams.get('searchScope') || 'full'
    const listingStatus = searchParams.get('listingStatus') || 'All'
    const propertyTypesParam = searchParams.get('propertyTypes') || 'All'
    const minPrice = parseInt(searchParams.get('minPrice') || '0')
    const maxPrice = parseInt(searchParams.get('maxPrice') || '100000')
    const location = searchParams.get('location') || ''
    const sortBy = searchParams.get('sortBy') || 'newest'
    const isFeatured = searchParams.get('isFeatured') === 'true'
    const city = searchParams.get('city') || ''
    const state = searchParams.get('state') || ''
    const facilityType = searchParams.get('facilityType') || ''
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    const { db } = await connectToDatabase()

    // Build the query
    const query: any = {
      status: 'active' ,// Only show active facilities
      privacyType: 'public' // Only fetch public listings
    }

    // Add isFeatured filter if specified
    if (isFeatured) {
      query.isFeatured = true
    }

    // Search based on scope
    if (search) {
      if (searchScope === 'header') {
        // Limited search for header searches - only name, service provider name, and location
        query['$or'] = [
          // Facility name
          { 'details.name': { $regex: search, $options: 'i' } },
          // Service provider name
          { 'serviceProvider.serviceName': { $regex: search, $options: 'i' } },
          // Location fields
          { address: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
          { state: { $regex: search, $options: 'i' } },
          { country: { $regex: search, $options: 'i' } },
          { pincode: { $regex: search, $options: 'i' } }
        ]
      } else {
        // Comprehensive search across all relevant fields for filter modal searches
        query['$or'] = [
          // Name and description
          { 'details.name': { $regex: search, $options: 'i' } },
          { 'details.description': { $regex: search, $options: 'i' } },
          // Location fields
          { address: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
          { state: { $regex: search, $options: 'i' } },
          { country: { $regex: search, $options: 'i' } },
          { pincode: { $regex: search, $options: 'i' } },
          // Facility type - search in both frontend and backend format
          { facilityType: { $regex: search.toLowerCase().replace(/\s+/g, '-'), $options: 'i' } },
          // Service provider name
          { 'serviceProvider.serviceName': { $regex: search, $options: 'i' } }
        ]
      }
    }

    // Dedicated location search
    if (location) {
      const locationQuery = [
        { address: { $regex: location, $options: 'i' } },
        { city: { $regex: location, $options: 'i' } },
        { state: { $regex: location, $options: 'i' } },
        { country: { $regex: location, $options: 'i' } },
        { pincode: { $regex: location, $options: 'i' } }
      ]

      query['$and'] = query['$and'] || []
      query['$and'].push({ $or: locationQuery })
    }

    // Filter by city
    if (city) {
      query.city = { $regex: city, $options: 'i' }
    }

    // Filter by state
    if (state) {
      query.state = { $regex: state, $options: 'i' }
    }

    // Filter by property types
    const propertyTypes = propertyTypesParam.split(',')
    if (!propertyTypes.includes('All')) {
      // Map frontend property types to backend types
      const typeMap: { [key: string]: string } = {
        'Individual Cabin': 'individual-cabin',
        'Coworking space': 'coworking-spaces',
        'Meeting Room': 'meeting-rooms',
        'Bio Allied': 'bio-allied-labs',
        'Manufacturing': 'manufacturing-labs',
        'Prototype Labs': 'prototyping-labs',
        'Software': 'software',
        'SaaS Allied': 'saas-allied',
        'Raw Space Office': 'raw-space-office',
        'Raw Space Lab': 'raw-space-lab',
        'Studio': 'studio'
      }
      
      const mappedTypes = propertyTypes.map(type => typeMap[type]).filter(Boolean)
      if (mappedTypes.length > 0) {
        query.facilityType = { $in: mappedTypes }
      }
    }

    // Filter by rental plan type
    if (listingStatus !== 'All') {
      query['details.rentalPlans'] = {
        $elemMatch: {
          name: listingStatus,
          price: { $gte: minPrice, $lte: maxPrice }
        }
      }
    } else {
      // If no specific rental plan is selected, filter by any plan within the price range
      query['details.rentalPlans'] = {
        $elemMatch: {
          price: { $gte: minPrice, $lte: maxPrice }
        }
      }
    }

    // Filter by facility type
    if (facilityType) {
      const facilityTypes = facilityType.split(',')
      query.facilityType = { $in: facilityTypes }
    }

    // Calculate pagination
    const skip = (page - 1) * ITEMS_PER_PAGE

    // Get total count for pagination
    const totalCount = await db.collection('Facilities').countDocuments(query)

    // Get facilities with sorting
    let sortOptions: Sort = {}
    
    // Always sort by isFeatured (true first), then apply other sort options
    switch (sortBy) {
      case 'newest':
        sortOptions = { isFeatured: -1, createdAt: -1 }
        break
      case 'oldest':
        sortOptions = { isFeatured: -1, createdAt: 1 }
        break
      default:
        sortOptions = { isFeatured: -1, createdAt: -1 }
    }

    // Build the aggregation pipeline
    const pipeline: any[] = [
      { $match: query },
      {
        $lookup: {
          from: 'Service Provider',
          localField: 'serviceProviderId',
          foreignField: 'userId',
          as: 'serviceProvider'
        }
      },
      {
        $unwind: {
          path: '$serviceProvider',
          preserveNullAndEmptyArrays: true
        }
      },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: ITEMS_PER_PAGE }
    ]

    const facilities = await db.collection('Facilities')
      .aggregate(pipeline)
      .toArray()

    // Transform the response
    const transformedFacilities = facilities.map(facility => ({
      _id: facility._id,
      details: {
        name: facility.details.name,
        images: facility.details.images,
        rentalPlans: facility.details.rentalPlans || [],
        description: facility.details.description,
        studioDetails: facility.details.studioDetails
      },
      // Use service provider features instead of facility features
      features: facility.serviceProvider?.features || [],
      address: facility.address,
      city: facility.city,
      state: facility.state,
      country: facility.country,
      isFeatured: facility.isFeatured,
      facilityType: facility.facilityType,
      serviceProvider: facility.serviceProvider ? {
        serviceName: facility.serviceProvider.serviceName
      } : null,
      timings: facility.timings
    }))

    return NextResponse.json({
      facilities: transformedFacilities,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
        totalItems: totalCount,
        itemsPerPage: ITEMS_PER_PAGE
      }
    })

  } catch (error) {
    console.error('Error in GET /api/facilities/search:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 