import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getFacilityTypeIcon } from "@/lib/category-mappings";
import Image from "next/image";

interface FacilityBadgeProps {
  facilityType: string;
  className?: string;
  isHovered?: boolean;
  variant?: 'default' | 'card';
}

// Map of facility types to their display names
const facilityTypeNames: Record<string, string> = {
  "individual-cabin": "Individual Cabin",
  "coworking-spaces": "Coworking Space",
  "meeting-rooms": "Meeting Room",
  "board-rooms": "Board Room",
  "raw-space-office": "Raw Space Office",
  "bio-allied-labs": "Bio Allied Lab",
  "manufacturing-labs": "Manufacturing Lab",
  "prototyping-labs": "Prototyping Lab",
  "raw-space-lab": "Raw Space Lab",
  "software": "Software",
  "saas-allied": "SaaS Allied",
  "studio": "Studio",
  "video-studio": "Video Studio",
  "podcast-studio": "Podcast Studio",
  "edit-studio": "Edit Studio",
  // Default names for common types that might be in the database
  "meeting-room": "Meeting Room",
  "board-room": "Board Room",
  "coworking-space": "Coworking Space",
  // Add more mappings as needed
};

// Default icon component for when no icon is available
const DefaultIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="w-6 h-6 text-white"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <path d="M9 14v1" />
    <path d="M9 8v1" />
    <path d="M15 14v1" />
    <path d="M15 8v1" />
    <path d="M9 12h6" />
  </svg>
);

export function FacilityBadge({ 
  facilityType, 
  className, 
  isHovered = false,
  variant = 'default'
}: FacilityBadgeProps) {
  const [localHover, setLocalHover] = useState(false);
  
  // Use either the prop or local state for hover
  const showHover = isHovered || localHover;
  
  // Get the display name for the facility type, or use a capitalized version of the type
  const displayName = facilityTypeNames[facilityType] || 
    facilityType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  // Get the appropriate icon for this facility type using our utility function
  const iconPath = getFacilityTypeIcon(facilityType);
  
  // Card variant (used in facility cards) - icon with hover text
  if (variant === 'card') {
    return (
      <div 
        className={cn("relative", className)}
        onMouseEnter={() => setLocalHover(true)}
        onMouseLeave={() => setLocalHover(false)}
      >
        {/* Badge with icon */}
        <Card className="w-[45px] h-[40px] p-0 border-0 shadow-sm bg-white rounded-md overflow-hidden">
          <CardContent className="p-0 flex items-center justify-center h-full">
            <Image
              src={iconPath}
              alt={`${displayName} icon`}
              width={28}
              height={28}
              className="object-contain"
            />
          </CardContent>
        </Card>
        
        {/* Hover effect - facility type label */}
        <div 
          className={cn(
            "absolute left-[45px] top-0 h-[40px] bg-[#23bb4e] text-white rounded-r-md px-4 flex items-center",
            "transition-all duration-300 ease-in-out shadow-sm",
            showHover 
              ? "opacity-100 max-w-[200px] w-auto animate-[badgeSlideIn_0.3s_ease-in-out_forwards]" 
              : "opacity-0 max-w-0 w-0 overflow-hidden animate-[badgeSlideOut_0.3s_ease-in-out_forwards]"
          )}
        >
          <span className="text-sm font-medium whitespace-nowrap">{displayName}</span>
        </div>
      </div>
    );
  }
  
  // Default variant (standalone) - icon and text always visible
  return (
    <div className={cn("flex h-[40px]", className)}>
      <div className="w-[45px] h-[40px] bg-white rounded-l-md flex items-center justify-center shadow-sm">
        <Image
          src={iconPath}
          alt={`${displayName} icon`}
          width={28}
          height={28}
          className="object-contain"
        />
      </div>
      
      <div className="h-[40px] bg-[#23bb4e] text-white rounded-r-md px-4 flex items-center shadow-sm">
        <span className="text-sm font-medium whitespace-nowrap">{displayName}</span>
      </div>
    </div>
  );
} 