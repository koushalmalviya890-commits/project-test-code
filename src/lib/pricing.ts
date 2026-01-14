// Pricing utility functions for facility bookings

/**
 * Calculate the fixed service fee for a facility based on its type
 * 
 * @param facilityType The type of facility
 * @returns The fixed service fee in Rupees
 */
export function 
getFixedServiceFee(facilityType: string): number {
  // Normalize facility type to handle different formats
  const normalizedType = facilityType.toLowerCase().trim();
  
  // Individual cabin, coworking spaces, raw space office - 40Rs
  if (
    normalizedType.includes('individual-cabin') || 
    normalizedType.includes('individual cabin') ||
    normalizedType.includes('coworking') || 
    normalizedType.includes('raw space office') ||
    normalizedType.includes('raw-space-office')
  ) {
    return 40;
  }
  
  // Bio-allied, manufacturing labs, prototyping labs, software, saas allied, raw space lab - 10Rs
  if (
    normalizedType.includes('bio-allied') || 
    normalizedType.includes('bio allied') ||
    normalizedType.includes('manufacturing') || 
    normalizedType.includes('prototyping') ||
    normalizedType.includes('software') || 
    normalizedType.includes('saas') ||
    normalizedType.includes('raw space lab') ||
    normalizedType.includes('raw-space-lab')
  ) {
    return 10;
  }
  
  // Studio, meeting rooms - 50Rs
  if (
    normalizedType.includes('studio') || 
    normalizedType.includes('meeting')
  ) {
    return 50;
  }
  
  // Default fee if type is not recognized
  return 30;
} 

