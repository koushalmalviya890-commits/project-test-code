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

    const query: any = {
      status: 'active',
      privacyType: 'public'
    }

    if (isFeatured) {
      query.isFeatured = true
    }

    // Search based on tab (searchScope)
    if (search) {
      const formattedSearch = search.toLowerCase().replace(/\s+/g, '-')

      // Get matched enabler userIds
      const enablerMatch = await db.collection('Service Provider')
        .find({
          $or: [
            { serviceName: { $regex: search, $options: 'i' } },
            { primaryContact1Name: { $regex: search, $options: 'i' } },
            { primaryContact1Designation: { $regex: search, $options: 'i' } }
          ]
        })
        .project({ userId: 1 })
        .toArray()

      const matchedUserIds = enablerMatch.map(sp => sp.userId)

      query['$or'] = [
        { 'details.name': { $regex: formattedSearch, $options: 'i' } },
        { 'details.description': { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { pincode: { $regex: search, $options: 'i' } },
        { facilityType: { $regex: formattedSearch, $options: 'i' } },
        { relevantSectors: { $regex: formattedSearch, $options: 'i' } },
        { serviceProviderId: { $in: matchedUserIds } },
        { 'serviceProvider.serviceName': { $regex: search, $options: 'i' } }
      ]
    }

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

    if (city) {
      query.city = { $regex: city, $options: 'i' }
    }

    if (state) {
      query.state = { $regex: state, $options: 'i' }
    }

    const propertyTypes = propertyTypesParam.split(',')
    if (!propertyTypes.includes('All')) {
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

    if (listingStatus !== 'All') {
      query['details.rentalPlans'] = {
        $elemMatch: {
          name: listingStatus,
          price: { $gte: minPrice, $lte: maxPrice }
        }
      }
    } else {
      query['details.rentalPlans'] = {
        $elemMatch: {
          price: { $gte: minPrice, $lte: maxPrice }
        }
      }
    }

    if (facilityType) {
      const facilityTypes = facilityType.split(',')
      query.facilityType = { $in: facilityTypes }
    }

    const skip = (page - 1) * ITEMS_PER_PAGE
    const totalCount = await db.collection('Facilities').countDocuments(query)

    let sortOptions: Sort = {}

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

    const transformedFacilities = facilities.map(facility => ({
      _id: facility._id,
      details: {
        name: facility.details.name,
        images: facility.details.images,
        rentalPlans: facility.details.rentalPlans || [],
        description: facility.details.description,
        studioDetails: facility.details.studioDetails
      },
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
