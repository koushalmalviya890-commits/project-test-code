// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { toast } from 'sonner'
// import {
//   Building2, Users, VideoIcon, Microscope,
//   MonitorPlay, LayoutDashboard, Globe, Lock
// } from 'lucide-react'

// import {
//   Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
// } from '@/components/ui/dialog'
// import { Button } from '@/components/ui/button'
// import { FacilityForm } from '@/components/forms/facility-form'
// import { FacilityType } from '@/components/forms/types'
// import { IncompleteProfileModal } from '@/components/ui/incomplete-profile-modal'
// import {
//   isServiceProviderProfileComplete,
//   getServiceProviderProfileCompletionPercentage,
//   getServiceProviderIncompleteFields
// } from '@/lib/utils/profile-completion'
// import { getServiceProviderProfile } from '@/lib/actions/service-provider'

// const facilityTypes = [
//   {
//     type: 'individual-cabin',
//     title: 'Individual Cabin',
//     description: 'Private office spaces for individuals or small teams',
//     icon: Building2,
//   },
//   {
//     type: 'coworking-spaces',
//     title: 'Coworking Spaces',
//     description: 'Shared workspace for professionals and teams',
//     icon: Users,
//   },
//   {
//     type: 'meeting-rooms',
//     title: 'Meeting Rooms',
//     description: 'Conference and meeting spaces for professional gatherings',
//     icon: VideoIcon,
//   },
//   {
//     type: 'bio-allied-labs',
//     title: 'Bio Allied Labs',
//     description: 'Laboratory spaces for biotechnology and life sciences',
//     icon: Microscope,
//   },
//   {
//     type: 'manufacturing-labs',
//     title: 'Manufacturing Labs',
//     description: 'Spaces for manufacturing and production',
//     icon: Microscope,
//   },
//   {
//     type: 'prototyping-labs',
//     title: 'Prototyping Labs',
//     description: 'Facilities for product development and prototyping',
//     icon: Microscope,
//   },
//   {
//     type: 'software',
//     title: 'Software',
//     description: 'Software tools and development environments',
//     icon: MonitorPlay,
//   },
//   {
//     type: 'saas-allied',
//     title: 'SaaS Allied',
//     description: 'Software as a Service and related tools',
//     icon: MonitorPlay,
//   },
//   {
//     type: 'raw-space-office',
//     title: 'Raw Space (Office)',
//     description: 'Unfurnished office spaces for customization',
//     icon: LayoutDashboard,
//   },
//   {
//     type: 'raw-space-lab',
//     title: 'Raw Space (Lab)',
//     description: 'Unfurnished laboratory spaces for customization',
//     icon: LayoutDashboard,
//   },
//   {
//     type: 'studio',
//     title: 'Studio',
//     description: 'Specialized workspace for creative professionals',
//     icon: Microscope,
//   },
// ] as const

// interface AddFacilityDialogProps {
//   onSuccess?: () => void
//   children?: React.ReactNode
// }


// const sectorTags = [
//   "Agri Tech", "Bio Tech", "Aerospace and Defence Tech", "Artificial Intelligence", "Machine Learning",
//   "Food Tech", "SaaS", "IoT - Internet of Things", "Blue Economy", "Marine Tech", "Aquaculture",
//   "Automotive", "Electric Vehicles", "Mobility", "Ed Tech", "Fem Tech", "Fin Tech", "Data and Analytics",
//   "Deep Tech", "Circular Economy", "Energy", "Climate Tech", "Sustainability", "SDG and ESG", "Insure Tech",
//   "Prop Tech", "D2C", "E Commerce", "Art and Culture", "Livelihood", "Manufacturing", "Healthcare",
//   "Life Sciences", "Chemicals", "Retail Tech", "Fashion Tech", "Textiles", "Social Impact", "Sports Tech",
//   "Travel", "Tourism", "Logistics", "Networking", "Web 3.0", "Industry 5.0", "Gaming", "AR, VR", "Others"
// ]


// export function AddFacilityDialog({ onSuccess, children }: AddFacilityDialogProps) {
//   const router = useRouter()
//   const [open, setOpen] = useState(false)
//   const [selectedType, setSelectedType] = useState<FacilityType | null>(null)
//   const [privacyType, setPrivacyType] = useState<'public' | 'private'>('public')
//   const [showPrivacySelection, setShowPrivacySelection] = useState(true)
//   const [showTypeSelection, setShowTypeSelection] = useState(false)
//   const [showSectorsSelection, setShowSectorsSelection] = useState(false)
//   const [showIncompleteProfileModal, setShowIncompleteProfileModal] = useState(false)
//   const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(0)
//   const [incompleteFields, setIncompleteFields] = useState<string[]>([])
//   const [sectorTags, setSectorTags] = useState<string[]>([]);
//   const [loadingSectors, setLoadingSectors] = useState(true);  

//   const [selectedSectors, setSelectedSectors] = useState<string[]>([])

// const toggleSector = (sector: string) => {
//   if (selectedSectors.includes(sector)) {
//     setSelectedSectors(selectedSectors.filter((s) => s !== sector))
//   } else if (selectedSectors.length < 3) {
//     setSelectedSectors([...selectedSectors, sector])
//   }
// }

// useEffect(() => {
//   const fetchSectors = async () => {
//     try {
//       const res = await fetch("/api/sector");
//       const json = await res.json();

//       if (json.success) {
//         setSectorTags(json.data.map((s: any) => s.name));
//       } else {
//         toast.error("Failed to load sectors");
//       }
//     } catch (err) {
//       toast.error("Error fetching sectors");
//     } finally {
//       setLoadingSectors(false);
//     }
//   };

//   if (open) {
//     fetchSectors();
//   }
// }, [open]);

//   useEffect(() => {
//     const checkProfileCompletion = async () => {
//       if (!open) return
//       try {
//         const profileResponse = await getServiceProviderProfile()
//         if (profileResponse?.success && profileResponse.data) {
//           const isComplete = isServiceProviderProfileComplete(profileResponse.data)
//           if (!isComplete) {
//             const percentage = getServiceProviderProfileCompletionPercentage(profileResponse.data)
//             const fields = getServiceProviderIncompleteFields(profileResponse.data)
//             setProfileCompletionPercentage(percentage)
//             setIncompleteFields(fields)
//             setShowIncompleteProfileModal(true)
//             setOpen(false)
//           }
//         } else {
//           toast.error('Could not verify profile completion status')
//         }
//       } catch (error) {
//         toast.error('An error occurred while checking your profile')
//       }
//     }

//     if (open) {
//       setSelectedType(null)
//       setShowPrivacySelection(true)
//       setShowTypeSelection(false)
//       checkProfileCompletion()
//     }
//   }, [open])

// useEffect(() => {
//   if (!open) {
//     setSelectedSectors([]) // Reset selected sectors when dialog is closed
//     setSelectedType(null) // Reset selected type when dialog is closed
//     setPrivacyType('public') // Reset privacy type to default
//     setShowPrivacySelection(true) // Show privacy selection on open
//     setShowTypeSelection(false) // Hide type selection on open
//   }
// }, [open])

//   const handlePrivacySelect = (type: 'public' | 'private') => {
//     setPrivacyType(type)
//     setShowPrivacySelection(false)
//     setShowTypeSelection(true)
//   }

//   const handleTypeChange = (newType: FacilityType) => {
//     setSelectedType(newType)
//     setShowTypeSelection(false)
//   }

//   const handleSubmit = async (data: any) => {
//     try {
//       const formData = {
//         ...data,
//         facilityType: selectedType || data.type,
//       }

//       const response = await fetch('/api/facilities', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData) // ✅ Only max 3 sectors,
//       })

//       if (!response.ok) throw new Error('Failed to add facility')

//       toast.success('Facility added successfully!')
//       setSelectedType(null)
//       setShowTypeSelection(false)
//       setShowPrivacySelection(true)
//       setOpen(false)
//       onSuccess?.()
//       router.refresh()
//     } catch (error) {
//       toast.error('Failed to add facility. Please try again.')
//     }
//   }

//   const handleCancel = () => {
//     setSelectedType(null)
//     setShowPrivacySelection(true)
//     setShowTypeSelection(false)
//     setOpen(false)
//   }

//   const handleCloseIncompleteModal = () => {
//     setShowIncompleteProfileModal(false)
//   }

//   return (
//     <>
//       <Dialog open={open} onOpenChange={(openState) => {
//         if (!openState) {
//           setSelectedType(null)
//           setShowPrivacySelection(true)
//           setShowTypeSelection(false)
//         }
//         setOpen(openState)
//       }}>
//         <DialogTrigger asChild>
//           {children || <Button>Add Facility</Button>}
//         </DialogTrigger>
//         <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto smart-scrollbar">
//           {/* <DialogHeader>
//             <DialogTitle>
//               {showPrivacySelection
//                 ? 'Choose Privacy Type'
//                 : showTypeSelection
//                 ? 'Select Facility Type'
//                 : `Add ${selectedType?.replace(/-/g, ' ')}`.replace(/\b\w/g, c => c.toUpperCase())}
//             </DialogTitle>
//           </DialogHeader> */}

//           {/* Step 1: Privacy Type Selection */}
//           {/* {showPrivacySelection && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//               <div
//                 onClick={() => handlePrivacySelect('public')}
//                 className="cursor-pointer border rounded-lg p-4 hover:border-primary hover:bg-primary/5 transition-colors"
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 rounded-full bg-primary/10">
//                     <Globe className="h-5 w-5 text-primary" />
//                   </div>
//                   <h3 className="font-medium">Public</h3>
//                 </div>
//                 <p className="text-sm text-muted-foreground mt-2">
//                   Visible to all users browsing facilities.
//                 </p>
//               </div>

//               <div
//                 onClick={() => handlePrivacySelect('private')}
//                 className="cursor-pointer border rounded-lg p-4 hover:border-primary hover:bg-primary/5 transition-colors"
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 rounded-full bg-primary/10">
//                     <Lock className="h-5 w-5 text-primary" />
//                   </div>
//                   <h3 className="font-medium">Private</h3>
//                 </div>
//                 <p className="text-sm text-muted-foreground mt-2">
//                   Only accessible to you or selected startups.
//                 </p>
//               </div>
//             </div>
//           )} */}

//           {/* Step 2: Facility Type Selection */}
//           {/* {showTypeSelection && ( */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//               {facilityTypes.map((facility) => (
//                 <div
//                   key={facility.type}
//                   className="border rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
//                   onClick={() => handleTypeChange(facility.type as FacilityType)}
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 rounded-full bg-primary/10">
//                       <facility.icon className="h-5 w-5 text-primary" />
//                     </div>
//                     <h3 className="font-medium">{facility.title}</h3>
//                   </div>
//                   <p className="text-sm text-gray-500 mt-2">{facility.description}</p>
//                 </div>
//               ))}
//             </div>
//           {/* // )} */}



//           {selectedType && (
//   <div className="mt-6">
//     <FacilityForm
//       type={selectedType}
//       onSubmit={handleSubmit}
//       onChange={() => {}}
//       initialData={{ type: selectedType, privacyType }}
//     />
//     <Button variant="outline" className="mt-4" onClick={handleCancel}>
//       Cancel
//     </Button>
//   </div>
// )}

//         </DialogContent>
//       </Dialog>

//       <IncompleteProfileModal
//         isOpen={showIncompleteProfileModal}
//         onClose={handleCloseIncompleteModal}
//         completionPercentage={profileCompletionPercentage}
//         incompleteFields={incompleteFields}
//         userType="service-provider"
//         redirectPath="/service-provider/profile"
//       />
//     </>
//   )
// }
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Building2, Users, VideoIcon, Microscope,
  MonitorPlay, LayoutDashboard
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
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
    {
      type: 'event-workspace',
      title: 'Eventspace',
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
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<FacilityType | null>(null)
  const [showTypeSelection, setShowTypeSelection] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showIncompleteProfileModal, setShowIncompleteProfileModal] = useState(false)
  const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(0)
  const [incompleteFields, setIncompleteFields] = useState<string[]>([])

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!open) return
      try {
        const profileResponse = await getServiceProviderProfile()
        if (profileResponse?.success && profileResponse.data) {
          const isComplete = isServiceProviderProfileComplete(profileResponse.data)
          if (!isComplete) {
            const percentage = getServiceProviderProfileCompletionPercentage(profileResponse.data)
            const fields = getServiceProviderIncompleteFields(profileResponse.data)
            setProfileCompletionPercentage(percentage)
            setIncompleteFields(fields)
            setShowIncompleteProfileModal(true)
            setOpen(false)
          }
        } else {
          toast.error('Could not verify profile completion status')
        }
      } catch (error) {
        toast.error('An error occurred while checking your profile')
      }
    }

    if (open) {
      setSelectedType(null)
      setShowTypeSelection(true)
      setShowForm(false)
      checkProfileCompletion()
    }
  }, [open])

  const handleTypeChange = (newType: FacilityType) => {
    setSelectedType(newType)
    setShowTypeSelection(false)
    setShowForm(true)
  }

  const handleSubmit = async (data: any) => {
    try {
      const formData = {
        ...data,
        facilityType: selectedType || data.type,
      }

      const response = await fetch('/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to add facility')

      toast.success('Facility added successfully!')
      setSelectedType(null)
      setShowTypeSelection(true)
      setShowForm(false)
      setOpen(false)
      onSuccess?.()
      router.refresh()
    } catch (error) {
      toast.error('Failed to add facility. Please try again.')
    }
  }

  const handleCancel = () => {
    setSelectedType(null)
    setShowTypeSelection(true)
    setShowForm(false)
    setOpen(false)
  }
  const handleBack = () => {
    if (showForm) {
      setShowForm(false)
      setShowTypeSelection(true)
    }
  }
  const handleCloseIncompleteModal = () => {
    setShowIncompleteProfileModal(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(openState) => {
        if (!openState) {
          handleCancel()
        }
        setOpen(openState)
      }}>
        <DialogTrigger asChild>
          {children || <Button>Add Facility</Button>}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto smart-scrollbar">
          <DialogHeader>
            <DialogTitle>
              {showTypeSelection
                ? 'Select Facility Type'
                : `Add ${selectedType?.replace(/-/g, ' ')}`.replace(/\b\w/g, c => c.toUpperCase())}
            </DialogTitle>
          </DialogHeader>

          {/* Step 1: Facility Type Selection */}
          {showTypeSelection && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
          )}

          {/* Step 2: Facility Form */}
          {showForm && selectedType && (
            <div className="mt-6">
              <FacilityForm
                type={selectedType}
                onSubmit={handleSubmit}
                onChange={() => {}}
                initialData={{ type: selectedType }}
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
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