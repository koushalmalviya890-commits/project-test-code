import Image from 'next/image';
import { BsFillDoorOpenFill } from 'react-icons/bs';
import { MdCoPresent, MdScience, MdComputer, MdOutlineHomeWork, MdOutlinePhotoCamera, MdMeetingRoom, MdBiotech, MdPrecisionManufacturing } from 'react-icons/md';
import { useState } from 'react';
import Link from 'next/link';
import { AMENITY_ICONS } from '@/components';

interface FacilityType {
  type: string;
  count: number;
  originalType?: string;
}

interface ServiceProvider {
  _id: string;
  serviceName: string | null;
  address: string | null;
  logoUrl: string | null;
  serviceProviderType: string | null;
  features: string[];
  facilityTypes: FacilityType[];
  totalFacilities: number;
}

interface ServiceProviderCardProps {
  provider: ServiceProvider;
}

const facilityIcons = {
  'Individual Cabin': BsFillDoorOpenFill,
  'Coworking Space': MdCoPresent,
  'Meeting Room': MdMeetingRoom,
  'Bio Allied Lab': MdBiotech,
  'Manufacturing Lab': MdPrecisionManufacturing,
  'Prototyping Lab': MdScience,
  'Software': MdComputer,
  'SaaS Allied': MdComputer,
  'Raw Space Office': MdOutlineHomeWork,
  'Raw Space Lab': MdScience,
  'Studio': MdOutlinePhotoCamera,
};

// Default placeholder image
const DEFAULT_IMAGE = '/placeholder-image.jpg';

export default function ServiceProviderCard({ provider }: ServiceProviderCardProps) {
  const [imgError, setImgError] = useState(false);
  const [showAllFacilities, setShowAllFacilities] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  
  // Handle image loading error
  const handleImageError = () => {
    setImgError(true);
  };

  // Determine image source
  const imgSrc = imgError || !provider.logoUrl ? DEFAULT_IMAGE : provider.logoUrl;

  // Add fallbacks for null values
  const displayName = provider.serviceName || 'Unnamed Provider';
  const displayAddress = provider.address || 'No address provided';

  // Ensure facilities is an array
  const facilitiesArray = Array.isArray(provider.facilityTypes) ? provider.facilityTypes : [];
  
  // Facilities are already sorted by count in the API
  const sortedFacilities = facilitiesArray;
  
  // Limit to top 4 facilities
  const displayedFacilities = showAllFacilities ? sortedFacilities : sortedFacilities.slice(0, 4);
  const hasMoreFacilities = sortedFacilities.length > 4;
  const remainingFacilitiesCount = sortedFacilities.length - 4;

  // Ensure features is an array and limit initial display
  const featuresArray = Array.isArray(provider.features) ? provider.features : [];
  const displayedFeatures = showAllAmenities ? featuresArray : featuresArray.slice(0, 2);
  const hasMoreFeatures = featuresArray.length > 2;

  return (
    <Link href={`/ViewProvider/${provider._id}`} passHref>
      <div className="bg-white rounded-lg overflow-auto shadow-md p-6 flex flex-col h-[500px] cursor-pointer hover:shadow-lg transition-shadow duration-300">
        {/* Provider Info Section */}
        <div className="flex flex-col items-start mb-6">
          <div className="relative w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 overflow-hidden">
            {imgSrc.startsWith('/') || imgSrc.startsWith('http') ? (
              <Image
                src={imgSrc}
                alt={displayName}
                fill
                className="object-cover rounded-full"
                onError={handleImageError}
              />
            ) : (
              <div className="text-2xl font-bold text-gray-400">
                {displayName.charAt(0)}
              </div>
            )}
          </div>
          <div className="text-left w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{displayName}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{displayAddress}</p>
          </div>
        </div>

        {/* Facilities Section */}
        <div className="flex-grow space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Facilities Available</p>
            {sortedFacilities.length === 0 ? (
              <p className="text-sm text-gray-500">No facilities available</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {displayedFacilities.map((facility, index) => {
                  const Icon = facilityIcons[facility.type as keyof typeof facilityIcons];
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50"
                      title={facility.type}
                      onClick={(e) => e.stopPropagation()} // Prevent card click when clicking on facility
                    >
                      {Icon && <Icon className="w-4 h-4 flex-shrink-0 text-gray-600" />}
                      <span className="text-sm truncate max-w-[90px] text-gray-700">{facility.type}</span>
                      {facility.count > 0 && (
                        <span className="text-xs bg-white px-1.5 py-0.5 rounded-full flex-shrink-0 text-gray-600 border border-gray-200">
                          {facility.count}
                        </span>
                      )}
                    </div>
                  );
                })}
                {hasMoreFacilities && !showAllFacilities && (
                  <div 
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-600"
                  >
                    +{remainingFacilitiesCount} more
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Amenities Section */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Key Amenities</p>
            <div className="flex flex-wrap gap-3">
              {displayedFeatures.map((feature, index) => {
                const IconComponent = AMENITY_ICONS[feature as keyof typeof AMENITY_ICONS];
                return IconComponent ? (
                  <div 
                    key={index} 
                    className="flex items-center space-x-1"
                    onClick={(e) => e.stopPropagation()} // Prevent card click
                  >
                    <IconComponent className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600">{feature}</span>
                  </div>
                ) : null;
              })}
              {hasMoreFeatures && !showAllAmenities && (
                <div className="text-xs text-gray-500">
                  +{featuresArray.length - 2} more
                </div>
              )}
              {featuresArray.length === 0 && (
                <p className="text-sm text-gray-500">No amenities listed</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex items-center mt-5 pt-4 border-t border-gray-100">
          <p className="text-sm text-green-500 font-medium">Listed {provider.totalFacilities} Facilities</p>
        </div>
      </div>
    </Link>
  );
} 