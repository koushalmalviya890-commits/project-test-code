import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { authOptions } from '@/lib/auth'
import Facility from '@/models/Facility'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const id = (await params).id

    // Use the MongoDB driver directly instead of Mongoose to avoid typing issues
    const { db } = await connectToDatabase()
    const facility = await db.collection('Facilities').findOne({
      _id: new ObjectId(id)
    })

    if (!facility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      )
    }

    // Get service provider info
    // Make sure serviceProviderId is an ObjectId before querying
    const serviceProviderId = typeof facility.serviceProviderId === 'string' 
      ? new ObjectId(facility.serviceProviderId) 
      : facility.serviceProviderId;
      
    // Try to find service provider by userId field first (which matches serviceProviderId)
    let serviceProvider = await db.collection('Service Provider').findOne({
      userId: serviceProviderId
    })
    
    // If not found, try with _id as fallback
    if (!serviceProvider) {
      serviceProvider = await db.collection('Service Provider').findOne({
        _id: serviceProviderId
      })
    }

    // Transform the facility data to match the expected format
    const transformedFacility = {
      ...facility,
      _id: facility._id.toString(),
      serviceProviderId: facility.serviceProviderId.toString(),
      serviceProvider: serviceProvider ? {
        serviceName: serviceProvider.serviceName,
        _id: serviceProvider._id.toString(),
        logoUrl: serviceProvider.logoUrl || null,
      } : null,
    }

    return NextResponse.json(transformedFacility)
  } catch (error) {
    console.error('Error fetching facility:', error)
    return NextResponse.json(
      { error: 'Failed to fetch facility' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { db } = await connectToDatabase()
    const serviceProviderId = new ObjectId(session.user.id)
    const facilityId = new ObjectId(params.id)

    const result = await db.collection('Facilities').deleteOne({
      _id: facilityId,
      serviceProviderId,
    })

    if (result.deletedCount === 0) {
      return new NextResponse('Facility not found', { status: 404 })
    }

    return new NextResponse('Facility deleted successfully')
  } catch (error) {
    console.error('Error in DELETE /api/facilities/[id]:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await connectToDatabase()
    const id = (await params).id
    const data = await request.json()

    // Validate the incoming data
    if (!data) {
      return NextResponse.json(
        { error: 'No data provided' },
        { status: 400 }
      )
    }

    // Find the facility
    const facility = await db.collection('Facilities').findOne({
      _id: new ObjectId(id)
    })
    
    if (!facility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      )
    }

    // Log the incoming data for debugging
   // console.log('Updating facility with data:', JSON.stringify(data, null, 2));
    
    // Ensure details object exists
    if (!data.details) {
      console.warn('Details object missing in update payload, using existing details');
      data.details = { ...facility.details };
    } else {
      // Check for missing required fields and populate them if needed
     // console.log('Checking required fields in details object');
      
      // Check name field
      if (!data.details.name) {
        console.warn('Name field missing in update payload, using existing name:', facility.details.name);
        data.details.name = facility.details.name;
      }
      
      // Check description field
      if (!data.details.description) {
        console.warn('Description field missing in update payload, using existing description');
        data.details.description = facility.details.description;
      }
      
      // Check images field
      if (!data.details.images || !Array.isArray(data.details.images) || data.details.images.length === 0) {
        console.warn('Images field missing or empty in update payload, using existing images');
        data.details.images = facility.details.images;
      }
      
      // Check rental plans field
      if (!data.details.rentalPlans || !Array.isArray(data.details.rentalPlans) || data.details.rentalPlans.length === 0) {
        console.warn('Rental plans field missing or empty in update payload, using existing rental plans');
        data.details.rentalPlans = facility.details.rentalPlans;
      }
      
      // Check facility type-specific fields
      const facilityType = data.facilityType || facility.facilityType;
      
      switch (facilityType) {
        case 'saas-allied':
        case 'software':
        case 'bio-allied-labs':
        case 'manufacturing-labs':
        case 'prototyping-labs':
          if (!data.details.equipment || !Array.isArray(data.details.equipment) || data.details.equipment.length === 0) {
            console.warn(`Equipment field missing for ${facilityType}, using existing equipment`);
            data.details.equipment = facility.details.equipment;
          }
          break;
          
        case 'individual-cabin':
          if (data.details.totalCabins === undefined) {
            console.warn('totalCabins field missing, using existing value');
            data.details.totalCabins = facility.details.totalCabins;
          }
          if (data.details.availableCabins === undefined) {
            console.warn('availableCabins field missing, using existing value');
            data.details.availableCabins = facility.details.availableCabins;
          }
          break;
          
        case 'coworking-spaces':
          if (data.details.totalSeats === undefined) {
            console.warn('totalSeats field missing, using existing value');
            data.details.totalSeats = facility.details.totalSeats;
          }
          if (data.details.availableSeats === undefined) {
            console.warn('availableSeats field missing, using existing value');
            data.details.availableSeats = facility.details.availableSeats;
          }
          break;
          
        case 'meeting-rooms':
          if (data.details.totalRooms === undefined) {
            console.warn('totalRooms field missing, using existing value');
            data.details.totalRooms = facility.details.totalRooms;
          }
          if (data.details.seatingCapacity === undefined) {
            console.warn('seatingCapacity field missing, using existing value');
            data.details.seatingCapacity = facility.details.seatingCapacity;
          }
          break;
          
        case 'raw-space-office':
        case 'raw-space-lab':
          if (!data.details.areaDetails || !Array.isArray(data.details.areaDetails) || data.details.areaDetails.length === 0) {
            console.warn('areaDetails field missing, using existing value');
            data.details.areaDetails = facility.details.areaDetails;
          }
          break;
          
        case 'studio':
          if (!data.details.studioDetails) {
            console.warn('studioDetails field missing, using existing value');
            data.details.studioDetails = facility.details.studioDetails;
          }
          break;
      }
    }
    
    // Check timings object
    if (!data.timings) {
      console.warn('Timings object missing in update payload, using existing timings');
      data.timings = facility.timings;
    }

    // Create a complete document validation function to ensure everything matches the schema
    function validateFullDocument(doc: any): { valid: boolean, errorField?: string, errorMessage?: string } {
      // Check required top-level fields
      const requiredFields = [
        'serviceProviderId', 'facilityType', 'status', 'details',
        'address', 'city', 'pincode', 'state', 'country', 'isFeatured', 'timings'
      ];
      
      for (const field of requiredFields) {
        if (doc[field] === undefined || doc[field] === null) {
          console.error(`Missing required field: ${field}`);
          return { valid: false, errorField: field, errorMessage: `Missing required field: ${field}` };
        }
      }
      
      // Check details object
      const { details } = doc;
      if (!details || typeof details !== 'object') {
        return { valid: false, errorField: 'details', errorMessage: 'Details must be a valid object' };
      }
      
      // Check required details fields
      const requiredDetailsFields = ['name', 'description', 'images', 'rentalPlans'];
      for (const field of requiredDetailsFields) {
        if (!details[field]) {
          return { valid: false, errorField: `details.${field}`, errorMessage: `Missing required field in details: ${field}` };
        }
      }
      
      // Specific validation for arrays
      if (!Array.isArray(details.images) || details.images.length === 0) {
        return { valid: false, errorField: 'details.images', errorMessage: 'Images must be a non-empty array' };
      }
      
      if (!Array.isArray(details.rentalPlans) || details.rentalPlans.length === 0) {
        return { valid: false, errorField: 'details.rentalPlans', errorMessage: 'Rental plans must be a non-empty array' };
      }
      
      // Validate each rental plan
      for (let i = 0; i < details.rentalPlans.length; i++) {
        const plan = details.rentalPlans[i];
        if (!plan.name || !plan.price || !plan.duration) {
          return { 
            valid: false, 
            errorField: `details.rentalPlans[${i}]`, 
            errorMessage: `Rental plan at index ${i} is missing required fields (name, price, duration)` 
          };
        }
        
        // Ensure rental plan name and duration are valid enum values
        const validPlanTypes = ['Annual', 'Monthly', 'Weekly', 'One Day (24 Hours)', 'Hourly'];
        if (!validPlanTypes.includes(plan.name)) {
          return { 
            valid: false, 
            errorField: `details.rentalPlans[${i}].name`, 
            errorMessage: `Invalid rental plan name: ${plan.name}. Must be one of: ${validPlanTypes.join(', ')}` 
          };
        }
        
        if (!validPlanTypes.includes(plan.duration)) {
          return { 
            valid: false, 
            errorField: `details.rentalPlans[${i}].duration`, 
            errorMessage: `Invalid rental plan duration: ${plan.duration}. Must be one of: ${validPlanTypes.join(', ')}` 
          };
        }
      }
      
      // Validate based on facility type
      const { facilityType } = doc;
      
      if (['saas-allied', 'software', 'bio-allied-labs', 'manufacturing-labs', 'prototyping-labs'].includes(facilityType)) {
        if (!Array.isArray(details.equipment) || details.equipment.length === 0) {
          return { 
            valid: false, 
            errorField: 'details.equipment', 
            errorMessage: `${facilityType} requires a non-empty equipment array` 
          };
        }
      }
      
      if (facilityType === 'individual-cabin') {
        if (typeof details.totalCabins !== 'number' || typeof details.availableCabins !== 'number') {
          return { 
            valid: false, 
            errorField: facilityType === 'individual-cabin' ? 'details.totalCabins/availableCabins' : 'facilityType specific fields', 
            errorMessage: 'individual-cabin requires totalCabins and availableCabins as numbers' 
          };
        }
      }
      
      if (facilityType === 'coworking-spaces') {
        if (typeof details.totalSeats !== 'number' || typeof details.availableSeats !== 'number') {
          return { 
            valid: false, 
            errorField: 'details.totalSeats/availableSeats', 
            errorMessage: 'coworking-spaces requires totalSeats and availableSeats as numbers' 
          };
        }
      }
      
      if (facilityType === 'meeting-rooms') {
        if (typeof details.totalRooms !== 'number' || typeof details.seatingCapacity !== 'number') {
          return { 
            valid: false, 
            errorField: 'details.totalRooms/seatingCapacity', 
            errorMessage: 'meeting-rooms requires totalRooms and seatingCapacity as numbers' 
          };
        }
      }
      
      // Validate timings for each day
      const requiredDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const { timings } = doc;
      
      if (!timings || typeof timings !== 'object') {
        return { valid: false, errorField: 'timings', errorMessage: 'Timings must be a valid object' };
      }
      
      for (const day of requiredDays) {
        if (!timings[day] || timings[day].isOpen === undefined) {
          return { 
            valid: false, 
            errorField: `timings.${day}`, 
            errorMessage: `Missing ${day} in timings or isOpen property is undefined` 
          };
        }
        
        // If isOpen is true, ensure openTime and closeTime are defined
        if (timings[day].isOpen === true) {
          if (!timings[day].openTime || !timings[day].closeTime) {
            return { 
              valid: false, 
              errorField: `timings.${day}.openTime/closeTime`, 
              errorMessage: `When ${day} is open, openTime and closeTime are required` 
            };
          }
        }
      }
      
      return { valid: true };
    }

    // Update the facility with the new data
    try {
      // Add facility createdAt if it's missing
      if (!data.createdAt) {
        data.createdAt = facility.createdAt;
      }
      
      // After ensuring all fields are present, log the final structure
     // console.log('Final validated details structure:');
     // console.log('- Name:', data.details.name);
     // console.log('- Description:', data.details.description?.substring(0, 30) + (data.details.description?.length > 30 ? '...' : ''));
     // console.log('- Images:', data.details.images?.length, 'images');
     // console.log('- Rental plans:', data.details.rentalPlans?.length, 'plans');
      
      // Make facility type-specific logs
      const facilityType = data.facilityType || facility.facilityType;
      switch (facilityType) {
        case 'coworking-spaces':
         // console.log('- Coworking specific fields:');
         // console.log('  - Total Seats:', data.details.totalSeats);
         // console.log('  - Available Seats:', data.details.availableSeats);
          break;
        case 'individual-cabin':
         // console.log('- Individual Cabin specific fields:');
         // console.log('  - Total Cabins:', data.details.totalCabins);
         // console.log('  - Available Cabins:', data.details.availableCabins);
          break;
        // Add more types as needed
      }

      // Make sure we set updatedAt to a proper Date object and preserve createdAt
      const updateData = {
        $set: {
          ...data,
          updatedAt: new Date(),
          // If createdAt was passed as a string, make sure it's converted to a Date
          createdAt: typeof data.createdAt === 'string' ? new Date(data.createdAt) : data.createdAt
        }
      }

      // Debug output of the final document structure
     // console.log('Final document structure before update:');
      const debugData = {...updateData.$set};
     // console.log('- Top level fields:', Object.keys(debugData).join(', '));
     // console.log('- Details fields:', Object.keys(debugData.details || {}).join(', '));
     // console.log('- Rental plans:', (debugData.details?.rentalPlans?.length || 0));
      
      // Log details about specific field types that might cause validation issues
      if (typeof debugData.serviceProviderId === 'string') {
       // console.log('- Converting serviceProviderId from string to ObjectId');
        updateData.$set.serviceProviderId = new ObjectId(debugData.serviceProviderId);
      }
      
      // Ensure isFeatured is a boolean
      if (updateData.$set.isFeatured !== undefined) {
        updateData.$set.isFeatured = Boolean(updateData.$set.isFeatured);
      }
      
      // Validate the full document before updating
      const validation = validateFullDocument(updateData.$set);
      if (!validation.valid) {
        return NextResponse.json(
          { 
            error: 'Document validation failed', 
            field: validation.errorField,
            message: validation.errorMessage 
          },
          { status: 400 }
        );
      }
      
      // Log the name specifically to debug name updates
     // console.log('Facility name before update:', updateData.$set.details.name);

      const result = await db.collection('Facilities').updateOne(
        { _id: new ObjectId(id) },
        updateData
      )

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: 'Facility not found' },
          { status: 404 }
        )
      }

      // Get the updated facility
      const updatedFacility = await db.collection('Facilities').findOne({
        _id: new ObjectId(id)
      })
      
      // Log the name after update to confirm it was saved correctly
     // console.log('Facility name after update:', updatedFacility?.details?.name);

      return NextResponse.json(updatedFacility)
    } catch (error) {
      console.error('MongoDB update error:', error)
      
      // Provide more specific error message for validation errors
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 121) {
        const mongoError = error as any; // Cast to any since MongoDB error types aren't standard
        const validationErrors = mongoError.errInfo?.details?.schemaRulesNotSatisfied || [];
        const errorDetails = validationErrors.map((rule: any) => {
          return {
            failingField: rule.operatorName,
            reason: rule.reason,
            missingProperties: rule.missingProperties
          };
        });
        
        return NextResponse.json(
          { 
            error: 'Document validation failed in MongoDB', 
            details: errorDetails,
            fullError: JSON.stringify(mongoError.errInfo || mongoError) 
          },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to update facility', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      )
    }
  } catch (error: unknown) {
    console.error('Error updating facility:', error)
    return NextResponse.json(
      { error: 'Failed to update facility', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 