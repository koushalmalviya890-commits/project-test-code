import { z } from 'zod'

export const RENTAL_PLANS = ['Annual', 'Monthly', 'Weekly', 'One Day (24 Hours)', 'Hourly'] as const

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

export interface RentalPlan {
  name: typeof RENTAL_PLANS[number]
  price: number
  duration: typeof RENTAL_PLANS[number]
}

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

export interface BaseFormFields {
  name: string
  description: string
  images: string[]
  videoLink?: string
  rentalPlans: RentalPlan[]
  subscriptionPlans?: RentalPlan[]
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

export interface LabEquipment {
  labName: string
  equipmentName: string
  capacityAndMake: string
}

export interface SoftwareEquipment {
  softwareName: string
  version: string
}

export interface SaasEquipment {
  equipmentName: string
  capacityAndMake: string
}

export interface AreaDetails {
  area: number | undefined
  type: 'Covered' | 'Uncovered'
  furnishing: 'Furnished' | 'Not Furnished'
  customisation: 'Open to Customisation' | 'Cannot be Customised'
}

export interface IndividualCabinFields extends BaseFormFields {
  totalCabins: number
  availableCabins: number
}

export interface CoworkingSpaceFields extends BaseFormFields {
  totalSeats: number
  availableSeats: number
}

export interface MeetingRoomFields extends BaseFormFields {
  totalRooms: number
  seatingCapacity: number
  totalTrainingRoomSeaters: number
}

export interface LabFields extends BaseFormFields {
  equipment: LabEquipment[]
}

export interface SoftwareFields extends BaseFormFields {
  equipment: SoftwareEquipment[]
}

export interface SaasFields extends BaseFormFields {
  equipment: SaasEquipment[]
}

export interface RawSpaceOfficeFields extends BaseFormFields {
  areaDetails: AreaDetails[]
}

export interface RawSpaceLabFields extends BaseFormFields {
  areaDetails: AreaDetails[]
}

export interface EventWorkspaceFields extends BaseFormFields {
  // totalRooms: number
  seatingCapacity: number 
}

export interface StudioEquipment {
  name: string
  picture: string
  quantity: number
  model: string
}

export interface StudioFields extends BaseFormFields {
  studioDetails: {
    facilityName: string
    description: string
    suitableFor: Array<'video' | 'podcast' | 'audio' | 'others'>
    isSoundProof: boolean
    equipmentDetails: StudioEquipment[]
    hasAmpleLighting: boolean
    rentalPlanTypes: Array<'Hourly' | 'One-Day'>
  }
}

export type FormData = 
  | IndividualCabinFields
  | CoworkingSpaceFields
  | MeetingRoomFields
  | LabFields
  | SoftwareFields
  | SaasFields
  | RawSpaceOfficeFields
  | RawSpaceLabFields
  | StudioFields
  | EventWorkspaceFields 

export interface FacilityFormProps {
  onSubmit: (data: FormData) => void
  onChange?: () => void
  initialData?: any
} 