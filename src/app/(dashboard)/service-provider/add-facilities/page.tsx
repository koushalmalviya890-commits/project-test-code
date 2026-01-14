'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { FacilityForm } from '@/components/forms/facility-form'
import { FacilityType } from '@/components/forms/types/index'
import { toast } from 'sonner'
import {
  Building2,
  Users,
  VideoIcon,
  Microscope,
  MonitorPlay,
  LayoutDashboard,
  AlertCircle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { IncompleteProfileModal } from '@/components/ui/incomplete-profile-modal'
import { 
  isServiceProviderProfileComplete, 
  getServiceProviderProfileCompletionPercentage,
  getServiceProviderIncompleteFields
} from '@/lib/utils/profile-completion'
import { getServiceProviderProfile } from '@/lib/actions/service-provider'

const facilityTypes = [
  {
    type: 'individual-cabin',
    title: 'Individual Cabin',
    description: 'Private office spaces for individuals or small teams',
    icon: Building2,
  },
  {
    type: 'coworking-spaces',
    title: 'Coworking Spaces',
    description: 'Shared workspace for professionals and teams',
    icon: Users,
  },
  {
    type: 'meeting-rooms',
    title: 'Meeting Rooms',
    description: 'Conference and meeting spaces for professional gatherings',
    icon: VideoIcon,
  },
  {
    type: 'bio-allied-labs',
    title: 'Bio Allied Labs',
    description: 'Laboratory spaces for biotechnology and life sciences',
    icon: Microscope,
  },
  {
    type: 'manufacturing-labs',
    title: 'Manufacturing Labs',
    description: 'Spaces for manufacturing and production',
    icon: Microscope,
  },
  {
    type: 'prototyping-labs',
    title: 'Prototyping Labs',
    description: 'Facilities for product development and prototyping',
    icon: Microscope,
  },
  {
    type: 'software',
    title: 'Software',
    description: 'Software tools and development environments',
    icon: MonitorPlay,
  },
  {
    type: 'saas-allied',
    title: 'SaaS Al',
    description: 'Software as a Service and related tools',
    icon: MonitorPlay,
  },
  {
    type: 'raw-space-office',
    title: 'Raw Space ',
    description: 'Unfurnished office spaces for customization',
    icon: LayoutDashboard,
  },
  {
    type: 'raw-space-lab',
    title: 'Raw ',
    description: 'Unfurnished laboratory spaces for customization',
    icon: LayoutDashboard,
  },
  {
    type: 'studio',
    title: 'Studio',
    description: 'Specialized workspace for creative professionals',
    icon: Microscope,
  },
   {
    type: 'event-workspace',
    title: 'Eventspace',
    description: 'Specialized workspace for creative professionals',
    icon: Microscope,
  },
] as const

export default function AddFacilities() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<FacilityType | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showIncompleteProfileModal, setShowIncompleteProfileModal] = useState(false)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [incompleteFields, setIncompleteFields] = useState<string[]>([])
  const [isProfileComplete, setIsProfileComplete] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await getServiceProviderProfile()
        
        if (result.error) {
          // console.error(`Profile fetch failed: ${result.error}`);
          throw new Error(result.error)
        }
        
        const data = result.data
        //// console.log('Profile data received:', result)
        //// console.log('Profile data structure:', {
        //   address: result.data?.address,
        //   city: result.data?.city,
        //   stateProvince: result.data?.stateProvince,
        //   zipPostalCode: result.data?.zipPostalCode
        // })
        setProfile(result)
        
        // Check if profile is complete
        const isComplete = isServiceProviderProfileComplete(data)
        setIsProfileComplete(isComplete)
        const percentage = getServiceProviderProfileCompletionPercentage(data)
        const missingFields = getServiceProviderIncompleteFields(data)
        
        setCompletionPercentage(percentage)
        setIncompleteFields(missingFields)
        
        if (!isComplete) {
          setShowIncompleteProfileModal(true)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast.error('Failed to load profile. Please refresh the page.')
        setIsProfileComplete(true) // Allow access even if profile fetch fails
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleTypeChange = (newType: FacilityType) => {
    // Check if profile is complete before allowing to select a facility type
    if (!isProfileComplete) {
      setShowIncompleteProfileModal(true)
      return
    }
    
    setSelectedType(newType)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/facilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          facilityType: selectedType,
          details: data,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Facility creation error:', errorText);
        throw new Error(`Failed to create facility: ${response.status}`)
      }

      toast.success('Facility created successfully')
      setIsDialogOpen(false)
      setSelectedType(null)
      router.refresh()
    } catch (error) {
      console.error('Error creating facility:', error)
      toast.error('Failed to create facility. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If profile is incomplete, show a detailed message and redirect button
  if (!isProfileComplete) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Add New Facilities</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete your profile to unlock this feature
          </p>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-amber-50 border-b border-amber-200 p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-medium">Profile Incomplete</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You need to complete your Facility Partner profile before you can add facilities. 
                  This ensures that startups have all the necessary information about your services.
                </p>
                
                <div className="mt-4 space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Profile completion</span>
                      <span className="font-medium">{completionPercentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {incompleteFields.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Missing information:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                        {incompleteFields.slice(0, 5).map((field, index) => (
                          <li key={index}>{field}</li>
                        ))}
                        {incompleteFields.length > 5 && (
                          <li>And {incompleteFields.length - 5} more fields...</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => router.push('/service-provider/profile')}
                  className="mt-6 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Complete Your Profile
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-gray-50">
            <h3 className="text-base font-medium mb-3">Why is this important?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              A complete profile helps startups make informed decisions about your facilities. 
              It builds trust and increases the likelihood of bookings.
            </p>
            
            <h3 className="text-base font-medium mb-3">What happens after I complete my profile?</h3>
            <p className="text-sm text-muted-foreground">
              Once your profile is complete, you'll be able to add facilities, manage bookings, 
              and start receiving requests from startups.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add New Facilities</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a facility type to add to your services
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {facilityTypes.map((facility) => (
          <Card
            key={facility.type}
            className="p-6 cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleTypeChange(facility.type as FacilityType)}
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <facility.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">{facility.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {facility.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Add {facilityTypes.find(f => f.type === selectedType)?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedType && profile?.data && (
            <>
              <div className="text-sm text-muted-foreground mb-4">
                <p>Address fields are pre-filled with your service provider profile information. You can modify them if needed.</p>
              </div>
              <FacilityForm
                type={selectedType}
                onSubmit={handleSubmit}
                initialData={{
                  address: profile.data.address || '',
                  city: profile.data.city || '',
                  state: profile.data.stateProvince || '',
                  pincode: profile.data.zipPostalCode || '',
                  country: 'India'
                }}
              />
            </>
          )}
          {selectedType && !profile?.data && (
            <FacilityForm
              type={selectedType}
              onSubmit={handleSubmit}
            />
          )}
        </DialogContent>
      </Dialog>

      <IncompleteProfileModal
        isOpen={showIncompleteProfileModal}
        onClose={() => setShowIncompleteProfileModal(false)}
        completionPercentage={completionPercentage}
        incompleteFields={incompleteFields}
        userType="service-provider"
        redirectPath="/service-provider/profile"
      />
    </div>
  )
} 