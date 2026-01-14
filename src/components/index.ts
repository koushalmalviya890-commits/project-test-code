export { Navbar } from './navbar'
export { Footer } from './footer'

import {
  Users,
  Rocket,
  CalendarRange,
  Wind,
  Printer,
  Phone,
  Coffee,
  Camera,
  Car,
  Wifi,
  Dumbbell,
  UtensilsCrossed,
  Droplets,
  Sun,
  MoreHorizontal,
  Building2
} from 'lucide-react'

export const AMENITY_ICONS = {
  'Access to In-House Mentors': Users,
  'Access to Startup Community': Rocket,
  'Access to Upcoming Programs / Initiatives': CalendarRange,
  'Air Conditioned': Wind,
  'Printers & Accessories': Printer,
  'Phone Booths': Phone,
  'Pantry': Coffee,
  'CCTV Enabled': Camera,
  'Two Wheeler Parking': Car,
  'High Speed Internet': Wifi,
  'Car Parking': Car,
  'Quiet Zones': Building2,
  'Storage for Bags': Building2,
  'Play Area': Building2,
  'Fitness Area': Dumbbell,
  'Catered Lunches': UtensilsCrossed,
  'Water': Droplets,
  'Coffee / Tea': Coffee,
  'Natural Lighting': Sun,
  'Other': MoreHorizontal
} as const 