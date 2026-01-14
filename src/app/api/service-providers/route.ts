import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface Facility {
  _id: ObjectId;
  serviceProviderId: ObjectId;
  facilityType: string;
  status: 'active' | 'pending' | 'rejected' | 'inactive';
  details: {
    name: string;
    description: string;
    images: string[];
    videoLink?: string;
    areaDetails?: Array<{
      area: number;
      type: 'Covered' | 'Uncovered';
      furnishing: 'Furnished' | 'Not Furnished';
      customisation: 'Open to Customisation' | 'Cannot be Customised';
    }>;
    rentalPlans: Array<{
      name: string;
      price: number;
      duration: string;
    }>;
  };
  isFeatured: boolean;
}

interface ServiceProvider {
  _id: ObjectId;
  userId: ObjectId;
  serviceName: string | null;
  address: string | null;
  logoUrl: string | null;
  features: string[];
  images: string[];
  serviceProviderType: string | null;
  city: string | null;
  stateProvince: string | null;
  zipPostalCode: string | null;
  timings?: {
    monday: { isOpen: boolean; openTime?: string; closeTime?: string };
    tuesday: { isOpen: boolean; openTime?: string; closeTime?: string };
    wednesday: { isOpen: boolean; openTime?: string; closeTime?: string };
    thursday: { isOpen: boolean; openTime?: string; closeTime?: string };
    friday: { isOpen: boolean; openTime?: string; closeTime?: string };
    saturday: { isOpen: boolean; openTime?: string; closeTime?: string };
    sunday: { isOpen: boolean; openTime?: string; closeTime?: string };
  };
}

export async function GET() {
  try {
    // Connect to database with proper error handling
    let db;
    try {
      const dbConnection = await connectToDatabase();
      db = dbConnection.db;
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Failed to connect to database' },
        { status: 500 }
      );
    }
    
    // First, fetch all service providers
    let serviceProviders;
    try {
      serviceProviders = await db.collection('Service Provider')
        .find<ServiceProvider>({})
        .project({
          _id: 1,
          userId: 1,
          serviceName: 1,
          address: 1,
          logoUrl: 1,
          features: 1,
          images: 1,
          serviceProviderType: 1,
          city: 1,
          stateProvince: 1,
          zipPostalCode: 1,
          timings: 1
        })
        .toArray();
    } catch (queryError) {
      console.error('Error fetching service providers:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch service providers' },
        { status: 500 }
      );
    }

   // console.log('Service Providers fetched:', serviceProviders.length);
    if (serviceProviders.length > 0) {
     // console.log('Sample Provider:', JSON.stringify(serviceProviders[0], null, 2));
    }

    // Create a map of userId to provider for easier lookup
    const providerMap = new Map<string, ServiceProvider>();
    serviceProviders.forEach(provider => {
      if (provider.userId) {
        providerMap.set(provider.userId.toString(), provider as ServiceProvider);
      }
    });

    // Fetch active facilities for all providers using userId
    let allFacilities;
    try {
      allFacilities = await db.collection('Facilities')
        .find<Facility>({
          status: 'active',
          privacyType: 'public',
          serviceProviderId: { 
            $in: serviceProviders.map(p => p.userId).filter(Boolean)
          }
        })
        .toArray();
    } catch (facilitiesError) {
      console.error('Error fetching facilities:', facilitiesError);
      return NextResponse.json(
        { error: 'Failed to fetch facilities' },
        { status: 500 }
      );
    }

   // console.log('Total Active Facilities fetched:', allFacilities.length);
    if (allFacilities.length > 0) {
     // console.log('Sample Facility:', {
      //   id: allFacilities[0]._id.toString(),
      //   serviceProviderId: allFacilities[0].serviceProviderId.toString(),
      //   type: allFacilities[0].facilityType,
      //   name: allFacilities[0].details.name
      // });
    }

    // Create a map to store facility counts per provider
    const facilityCountMap = new Map<string, number>();
    const facilityTypesMap = new Map<string, Map<string, number>>();

    // Count facilities for each provider
    allFacilities.forEach(facility => {
      const providerId = facility.serviceProviderId.toString();
      
      // Count total facilities
      facilityCountMap.set(
        providerId, 
        (facilityCountMap.get(providerId) || 0) + 1
      );

      // Group facility types
      if (!facilityTypesMap.has(providerId)) {
        facilityTypesMap.set(providerId, new Map());
      }
      const providerTypes = facilityTypesMap.get(providerId)!;
      providerTypes.set(
        facility.facilityType,
        (providerTypes.get(facility.facilityType) || 0) + 1
      );
    });

    // Log facility counts for debugging
   // console.log('Facility Counts:', Object.fromEntries(facilityCountMap));

    // Combine service providers with their facilities data
    const providersWithFacilities = serviceProviders.map(provider => {
      const providerId = provider.userId ? provider.userId.toString() : '';
      const totalFacilities = facilityCountMap.get(providerId) || 0;
      const facilityTypes = facilityTypesMap.get(providerId);

      // Convert facility types map to array and map to display names
      const facilityTypesArray = facilityTypes ? 
        Array.from(facilityTypes).map(([type, count]) => {
          // Map the database facility type to display name based on schema enum values
          let displayType = type;
          switch (type) {
            case 'individual-cabin':
              displayType = 'Individual Cabin';
              break;
            case 'coworking-spaces':
              displayType = 'Coworking Space';
              break;
            case 'meeting-rooms':
              displayType = 'Meeting Room';
              break;
            case 'bio-allied-labs':
              displayType = 'Bio Allied Lab';
              break;
            case 'manufacturing-labs':
              displayType = 'Manufacturing Lab';
              break;
            case 'prototyping-labs':
              displayType = 'Prototyping Lab';
              break;
            case 'software':
              displayType = 'Software';
              break;
            case 'saas-allied':
              displayType = 'SaaS Allied';
              break;
            case 'raw-space-office':
              displayType = 'Raw Space Office';
              break;
            case 'raw-space-lab':
              displayType = 'Raw Space Lab';
              break;
            case 'studio':
              displayType = 'Studio';
              break;
            default:
              // If no mapping is found, capitalize each word for display
              displayType = type
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
          }
          return {
            type: displayType,
            count,
            originalType: type // Keep the original type for reference
          };
        }).sort((a, b) => b.count - a.count) : []; // Sort by count in descending order
      
      // Format the address
      let fullAddress = provider.address || '';
      if (provider.city) fullAddress += (fullAddress ? ', ' : '') + provider.city;
      if (provider.stateProvince) fullAddress += (fullAddress ? ', ' : '') + provider.stateProvince;
      if (provider.zipPostalCode) fullAddress += (fullAddress ? ' - ' : '') + provider.zipPostalCode;
      
      // Ensure features is an array
      const features = Array.isArray(provider.features) ? provider.features : [];

      const result = {
        _id: provider._id,
        serviceName: provider.serviceName,
        address: fullAddress,
        logoUrl: provider.logoUrl,
        serviceProviderType: provider.serviceProviderType,
        features: features,
        images: Array.isArray(provider.images) ? provider.images : [],
        timings: provider.timings,
        facilityTypes: facilityTypesArray,
        totalFacilities: totalFacilities
      };

     // console.log('Provider Result:', {
      //   id: provider._id.toString(),
      //   name: provider.serviceName,
      //   totalFacilities,
      //   facilityTypes: facilityTypesArray
      // });

      return result;
    });
    
    // Return the providers with their facilities data
    return NextResponse.json({
      success: true,
      providers: providersWithFacilities
    });
  } catch (error) {
    console.error('Error in service providers route:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'An unexpected error occurred while fetching service providers'
      },
      { status: 500 }
    );
  }
}