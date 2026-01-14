// Profile completion utility functions

// Check if a startup profile is complete
export function isStartupProfileComplete(profile: any): boolean {
  if (!profile) return false;
  
  const requiredFields = [
    profile.startupName,
    profile.contactName,
    profile.contactNumber,
    profile.founderName,
    profile.founderDesignation,
    profile.entityType,
    profile.teamSize,
    profile.startupMailId,
    profile.address,
    profile.city,
    profile.state,
    profile.pincode,
    profile.country,
    profile.logoUrl,
    profile.website,
    profile.linkedinStartupUrl,
    // profile.linkedinFounderUrl,
    profile.industry,
    profile.sector
  ];
  
  return requiredFields.every(field => 
    field !== null && field !== undefined && field !== ''
  );
}

// Check if a service provider profile is complete
export function isServiceProviderProfileComplete(profile: any): boolean {
  if (!profile) return false;
  
  const requiredFields = [
    profile.serviceProviderType,
    profile.serviceName,
    profile.address,
    profile.city,
    profile.stateProvince,
    profile.zipPostalCode,
    profile.primaryContact1Name,
    profile.primaryContact1Designation,
    profile.primaryContactNumber,
    profile.logoUrl
  ];
  
  return requiredFields.every(field => 
    field !== null && field !== undefined && field !== ''
  );
}

// Get the completion percentage of a startup profile
export function getStartupProfileCompletionPercentage(profile: any): number {
  if (!profile) return 0;
  
  const requiredFields = [
    { name: 'Logo', value: profile.logoUrl },
    { name: 'Startup Name', value: profile.startupName },
    { name: 'Entity Type', value: profile.entityType },
    { name: 'Team Size', value: profile.teamSize },
    { name: 'Contact Name', value: profile.contactName },
    { name: 'Contact Number', value: profile.contactNumber },
    { name: 'Founder Name', value: profile.founderName },
    { name: 'Founder Designation', value: profile.founderDesignation },
    { name: 'Startup Email', value: profile.startupMailId },
    { name: 'Address', value: profile.address },
    { name: 'City', value: profile.city },
    { name: 'State', value: profile.state },
    { name: 'Pincode', value: profile.pincode },
    { name: 'Country', value: profile.country },
    { name: 'Website', value: profile.website },
    { name: 'LinkedIn Company URL', value: profile.linkedinStartupUrl },
    // { name: 'Founder LinkedIn URL', value: profile.linkedinFounderUrl },
    // { name: 'Instagram URL', value: profile.instagramurl },
    // { name: 'Twitter URL', value: profile.twitterurl },
    { name: 'Industry', value: profile.industry },
    { name: 'Sector', value: profile.sector },
    { name: 'Category', value: profile.category },
    // { name: 'DPIIT Number', value: profile.dpiitNumber },
    // { name: 'CIN', value: profile.cin },
    // { name: 'GST Number', value: profile.gstnumber },
    { name: 'Secondary Contact Name', value: profile.secondarycontactname },
    { name: 'Secondary Contact Designation', value: profile.secondarycontactdesignation },
    { name: 'Secondary Contact Number', value: profile.secondarycontactnumber }
  ];
  
  const filledFields = requiredFields.filter(field => 
    field.value !== null && field.value !== undefined && field.value !== ''
  ).length;
  
  return Math.round((filledFields / requiredFields.length) * 100);
}

// Get the completion percentage of a service provider profile
export function getServiceProviderProfileCompletionPercentage(profile: any): number {
  if (!profile) return 0;
  
  const requiredFields = [
    { name: 'Logo', value: profile.logoUrl },
    { name: 'Service Provider Type', value: profile.serviceProviderType },
    { name: 'Service Name', value: profile.serviceName },
    { name: 'Address', value: profile.address },
    { name: 'City', value: profile.city },
    { name: 'State/Province', value: profile.stateProvince },
    { name: 'ZIP/Postal Code', value: profile.zipPostalCode },
    { name: 'Primary Contact Name', value: profile.primaryContact1Name },
    { name: 'Primary Contact Designation', value: profile.primaryContact1Designation },
    { name: 'Primary Contact Number', value: profile.primaryContactNumber }
  ];
  
  const filledFields = requiredFields.filter(field => 
    field.value !== null && field.value !== undefined && field.value !== ''
  ).length;
  
  return Math.round((filledFields / requiredFields.length) * 100);
}

// Get incomplete fields for a startup profile
export function getStartupIncompleteFields(profile: any): string[] {
  if (!profile) return [];
  
  const requiredFields = [
    { name: 'Logo', value: profile.logoUrl },
    { name: 'Startup Name', value: profile.startupName },
    { name: 'Entity Type', value: profile.entityType },
    { name: 'Team Size', value: profile.teamSize },
    { name: 'Contact Name', value: profile.contactName },
    { name: 'Contact Number', value: profile.contactNumber },
    { name: 'Founder Name', value: profile.founderName },
    { name: 'Founder Designation', value: profile.founderDesignation },
    { name: 'Startup Email', value: profile.startupMailId },
    { name: 'Address', value: profile.address },
    { name: 'City', value: profile.city },
    { name: 'State', value: profile.state },
    { name: 'Pincode', value: profile.pincode },
    { name: 'Country', value: profile.country },
    { name: 'Website', value: profile.website },
    { name: 'LinkedIn Company URL', value: profile.linkedinStartupUrl },
    // { name: 'Founder LinkedIn URL', value: profile.linkedinFounderUrl },
    // { name: 'Instagram URL', value: profile.instagramurl },
    // { name: 'Twitter URL', value: profile.twitterurl },
    { name: 'Industry', value: profile.industry },
    { name: 'Sector', value: profile.sector },
    { name: 'Category', value: profile.category },
    // { name: 'DPIIT Number', value: profile.dpiitNumber },
    // { name: 'CIN', value: profile.cin },
    // { name: 'GST Number', value: profile.gstnumber },
    { name: 'Secondary Contact Name', value: profile.secondarycontactname },
    { name: 'Secondary Contact Designation', value: profile.secondarycontactdesignation },
    { name: 'Secondary Contact Number', value: profile.secondarycontactnumber }
  ];
  
  return requiredFields
    .filter(field => !field.value)
    .map(field => field.name);
}

// Get incomplete fields for a service provider profile
export function getServiceProviderIncompleteFields(profile: any): string[] {
  if (!profile) return [];
  
  const requiredFields = [
    { name: 'Logo', value: profile.logoUrl },
    { name: 'Service Provider Type', value: profile.serviceProviderType },
    { name: 'Service Name', value: profile.serviceName },
    { name: 'Address', value: profile.address },
    { name: 'City', value: profile.city },
    { name: 'State/Province', value: profile.stateProvince },
    { name: 'ZIP/Postal Code', value: profile.zipPostalCode },
    { name: 'Primary Contact Name', value: profile.primaryContact1Name },
    { name: 'Primary Contact Designation', value: profile.primaryContact1Designation },
    { name: 'Primary Contact Number', value: profile.primaryContactNumber }
  ];
  
  return requiredFields
    .filter(field => !field.value)
    .map(field => field.name);
} 