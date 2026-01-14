/**
 * This file contains mappings between UI category names and their corresponding filter values
 * Used for consistent filtering across the application
 */

// Maps from UI category names to the corresponding property types for filtering
export const categoryToPropertyTypeMapping: Record<string, string[]> = {
  "Individual Cabin": ["Individual Cabin"],
  "Coworking space": ["Coworking space"],
  "Co-Working Space": ["Coworking space"],
  "Meeting Area": ["Meeting Room"],
  "Board Room": ["Meeting Room"],
  "Raw space": ["Raw Space Office", "Raw Space Lab"],
  "Cabins": ["Individual Cabin"],
  "Labs": ["Bio Allied", "Manufacturing", "Prototype Labs", "Software"],
  "Equipment": ["Bio Allied", "Manufacturing", "Prototype Labs", "SaaS Allied"],
  "Lab space": ["Bio Allied", "Raw Space Lab"],
  "Machines": ["Manufacturing"],
  "Production": ["SaaS Allied", "Manufacturing", "Software"],
  "Manufacturing space": ["Manufacturing"],
  "Video": ["Studio"],
  "Podcasts": ["Studio"],
  "Edit": ["Studio"],
};

// Reverse mapping from property types to category names (for icon selection)
export const propertyTypeToCategoryMapping: Record<string, string> = {
  "Individual Cabin": "Cabins",
  "Coworking space": "Co-Working Space",
  "Meeting Room": "Meeting Area",
  "Bio Allied": "Labs",
  "Manufacturing": "Manufacturing space",
  "Prototype Labs": "Labs",
  "Software": "Labs",
  "SaaS Allied": "Production",
  "Raw Space Office": "Raw space",
  "Raw Space Lab": "Raw space",
  "Studio": "Video"
};

// Map facility types to icon paths
export const getFacilityTypeIcon = (facilityType: string): string => {
  // Convert from backend format (kebab-case) to frontend format (Title Case)
  const formattedType = facilityType
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Get the category for this facility type
  const category = propertyTypeToCategoryMapping[formattedType] || "Labs"; // Default to Labs if not found
  
  // Map categories to icon paths
  const categoryToIconMapping: Record<string, string> = {
    "Co-Working Space": "/icons/categories/coworking.svg",
    "Meeting Area": "/icons/categories/meeting.svg",
    "Board Room": "/icons/categories/boardroom.svg",
    "Raw space": "/icons/categories/rawspace.svg",
    "Cabins": "/icons/categories/cabin.svg",
    "Labs": "/icons/categories/lab.svg",
    "Equipment": "/icons/categories/equipment.svg",
    "Lab space": "/icons/categories/labspace.svg",
    "Machines": "/icons/categories/machine.svg",
    "Production": "/icons/categories/production.svg",
    "Manufacturing space": "/icons/categories/manufacturing.svg",
    "Video": "/icons/categories/video.svg",
    "Podcasts": "/icons/categories/podcast.svg",
    "Edit": "/icons/categories/edit.svg"
  };
  
  return categoryToIconMapping[category] || "/icons/categories/lab.svg"; // Default to lab icon
}

// Helper function to get property types for a given category
export function getPropertyTypesForCategory(category: string): string[] {
  return categoryToPropertyTypeMapping[category] || ["All"];
}

// Helper function to check if a property type belongs to a category
export function isCategoryForPropertyType(category: string, propertyType: string): boolean {
  const types = categoryToPropertyTypeMapping[category] || [];
  return types.includes(propertyType);
} 