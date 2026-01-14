'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Building2,
  Users,
  VideoIcon,
  Microscope,
  MonitorPlay,
  LayoutDashboard,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FacilityForm } from '@/components/forms/facility-form'
import { FacilityType } from '@/components/forms/types'
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
    title: 'SaaS Allied',
    description: 'Software as a Service and related tools',
    icon: MonitorPlay,
  },
  {
    type: 'raw-space-office',
    title: 'Raw Space (Office)',
    description: 'Unfurnished office spaces for customization',
    icon: LayoutDashboard,
  },
  {
    type: 'raw-space-lab',
    title: 'Raw Space (Lab)',
    description: 'Unfurnished laboratory spaces for customization',
    icon: LayoutDashboard,
  },
  {
    type: 'studio',
    title: 'Studio',
    description: 'Specialized workspace for creative professionals',
    icon: Microscope,
  },
] as const

interface AddFacilityDialogProps {
  onSuccess?: () => void
  children?: React.ReactNode
}

export function AddFacilityDialog({ onSuccess, children }: AddFacilityDialogProps) {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<FacilityType | null>(null)
  const [open, setOpen] = useState(false)
  const [showTypeSelection, setShowTypeSelection] = useState(true)
  const [showIncompleteProfileModal, setShowIncompleteProfileModal] = useState(false)
  const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(0)
  const [incompleteFields, setIncompleteFields] = useState<string[]>([])

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!open) return;
      
      try {
        // Get the service provider profile
        const profileResponse = await getServiceProviderProfile();
        
        // Check if the response has the expected format (success and data properties)
        if (profileResponse && profileResponse.success && profileResponse.data) {
          // Check if the profile is complete using the data property
          const isComplete = isServiceProviderProfileComplete(profileResponse.data);
          
          // Only show the incomplete profile modal if the profile is not complete
          if (!isComplete) {
            const percentage = getServiceProviderProfileCompletionPercentage(profileResponse.data);
            const fields = getServiceProviderIncompleteFields(profileResponse.data);
            
            setProfileCompletionPercentage(percentage);
            setIncompleteFields(fields);
            setShowIncompleteProfileModal(true);
            setOpen(false);
          }
          // If profile is complete, do nothing and let the dialog stay open
        } else if (profileResponse && profileResponse.error) {
          console.error('Error fetching profile:', profileResponse.error);
          toast.error('Could not verify profile completion status');
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
        toast.error('An error occurred while checking your profile');
      }
    };
    
    // When dialog opens, reset to facility type selection
    if (open) {
      // Reset form to facility type selection when the dialog opens
      setSelectedType(null);
      setShowTypeSelection(true);
      
      // Check profile completion
      checkProfileCompletion();
    }
  }, [open]);

  const handleTypeChange = (newType: FacilityType) => {
    setSelectedType(newType)
    setShowTypeSelection(false)
  }

  const handleSubmit = async (data: any) => {
    try {
      // Ensure facilityType is included in the form data
      const formData = {
        ...data,
        facilityType: selectedType || data.type || data.facilityType,
      }

      // Add debugging
     // console.log('Submitting facility data with type:', formData.facilityType);

      // Send data to the server
      const response = await fetch('/api/facilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to add facility')
      }

      toast.success('Facility added successfully!')
      
      // Reset form state
      setSelectedType(null)
      setShowTypeSelection(true)
      setOpen(false)
      
      // Refresh data or perform any additional actions
      if (onSuccess) {
        onSuccess()
      }
      
      // Refresh the page data without a full page reload
      router.refresh()
    } catch (error) {
      console.error('Error adding facility:', error)
      toast.error('Failed to add facility. Please try again.')
    }
  }

  const handleCancel = () => {
    setSelectedType(null)
    setShowTypeSelection(true)
    setOpen(false)
  }

  const handleCloseIncompleteModal = () => {
    setShowIncompleteProfileModal(false)
  }

  const handleCompleteProfile = () => {
    router.push('/service-provider/profile')
    handleCloseIncompleteModal()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(openState) => {
        // When closing the dialog, reset to the facility type selection
        if (open && !openState) {
          setSelectedType(null)
          setShowTypeSelection(true)
        }
        setOpen(openState)
      }}>
        <DialogTrigger asChild>
          {children || <Button>Add Facility</Button>}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showTypeSelection ? 'Select Facility Type' : `Add ${selectedType?.replace(/-/g, ' ')}`.replace(/\b\w/g, (c) => c.toUpperCase())}
            </DialogTitle>
          </DialogHeader>
          
          {showTypeSelection ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {facilityTypes.map((facility) => (
                <div
                  key={facility.type}
                  className="border rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                  onClick={() => handleTypeChange(facility.type as FacilityType)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <facility.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">{facility.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{facility.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {selectedType && (
                <FacilityForm 
                  type={selectedType}
                  onSubmit={handleSubmit}
                  onChange={() => {}}
                  initialData={{ type: selectedType }}
                />
              )}
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <IncompleteProfileModal
        isOpen={showIncompleteProfileModal}
        onClose={handleCloseIncompleteModal}
        completionPercentage={profileCompletionPercentage}
        incompleteFields={incompleteFields}
        userType="service-provider"
        redirectPath="/service-provider/profile"
      />
    </>
  )
} 