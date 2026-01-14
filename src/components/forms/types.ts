export const RENTAL_PLANS = [
  'Annual',
  'Monthly',
  'Weekly',
  'One Day (24 Hours)'
] as const

export const AMENITIES = [
  'Access to In-House Mentors',
  'Access to Startup Community',
  'Access to Upcoming Programs / Initiatives',
  'Air Conditioned',
  'Printers & Accessories',
  'Phone Booths',
  'Pantry',
  'CCTV Enabled',
  'Two Wheeler Parking',
  'High Speed Internet',
  'Car Parking',
  'Quiet Zones',
  'Storage for Bags',
  'Play Area',
  'Fitness Area',
  'Catered Lunches',
  'Water',
  'Coffee / Tea',
  'Natural Lighting',
  'Other'
] as const

export type FacilityType =
  | 'individual-cabin'
  | 'coworking-spaces'
  | 'meeting-rooms'
  | 'bio-allied-labs'
  | 'manufacturing-labs'
  | 'prototyping-labs'
  | 'software'
  | 'saas-allied'
  | 'raw-space-office'
  | 'raw-space-lab'
  | 'studio'
  | 'event-workspace'

export interface BaseFields {
  name: string
  description: string
  images: string[]
  videoLink?: string
  selectedRentalPlans: typeof RENTAL_PLANS[number][]
  rentPerYear?: number
  rentPerMonth?: number
  rentPerWeek?: number
  dayPassRent?: number
  address: string
  city: string
  pincode: string
  state: string
  country: string
  timings?: {
    monday: { isOpen: boolean; openTime?: string; closeTime?: string };
    tuesday: { isOpen: boolean; openTime?: string; closeTime?: string };
    wednesday: { isOpen: boolean; openTime?: string; closeTime?: string };
    thursday: { isOpen: boolean; openTime?: string; closeTime?: string };
    friday: { isOpen: boolean; openTime?: string; closeTime?: string };
    saturday: { isOpen: boolean; openTime?: string; closeTime?: string };
    sunday: { isOpen: boolean; openTime?: string; closeTime?: string };
  }
}

export interface LabFields extends BaseFields {
  equipment: Array<{
    labName: string
    equipmentName: string
    capacityAndMake: string
  }>
}

export interface SoftwareFields extends BaseFields {
  equipment: Array<{
    softwareName: string
    version: string
  }>
}

export interface SaasFields extends BaseFields {
  equipment: Array<{
    equipmentName: string
    capacityAndMake: string
  }>
}

export interface RawSpaceFields extends BaseFields {
  areaDetails: Array<{
    area: number
    type: 'Covered' | 'Uncovered'
    furnishing: 'Furnished' | 'Not Furnished'
    customisation: 'Open to Customisation' | 'Cannot be Customised'
  }>
}

export interface IndividualCabinFields extends BaseFields {
  totalCabins: number
  availableCabins: number
}

export interface CoworkingSpaceFields extends BaseFields {
  totalSeats: number
  availableSeats: number
}

export interface MeetingRoomFields extends BaseFields {
  totalRooms: number
  seatingCapacity: number
  totalTrainingRoomSeaters: number
}

export interface StudioFields extends BaseFields {
  studioDetails: {
    facilityName: string;
    description: string;
    suitableFor: Array<'video' | 'podcast' | 'audio' | 'others'>;
    isSoundProof: boolean;
    equipmentDetails: Array<{
      name: string;
      picture: string;
      quantity: number;
      model: string;
    }>;
    hasAmpleLighting: boolean;
    rentalPlanTypes: Array<'Hourly' | 'One-Day'>;
  }
}


export interface EventWorkspaceFields extends BaseFields {
  // totalRooms: number
  seatingCapacity: number 
}

export type FormData =
  | (LabFields & { type: 'bio-allied-labs' | 'manufacturing-labs' | 'prototyping-labs' })
  | (SoftwareFields & { type: 'software' })
  | (SaasFields & { type: 'saas-allied' })
  | (RawSpaceFields & { type: 'raw-space-office' | 'raw-space-lab' })
  | (IndividualCabinFields & { type: 'individual-cabin' })
  | (CoworkingSpaceFields & { type: 'coworking-spaces' })
  | (MeetingRoomFields & { type: 'meeting-rooms' })
  | (StudioFields & { type: 'studio' })
  | (EventWorkspaceFields & { type: 'event-workspace' })

export interface FacilityFormProps {
  onSubmit: (data: FormData) => void
  onChange?: () => void
  initialData?: any
} 