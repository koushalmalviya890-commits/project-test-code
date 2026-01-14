'use client'

import { useState, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ImageUpload } from '@/components/ui/image-upload'
import {Copy, Clock, Trash2, Image as ImageIcon } from 'lucide-react' 
import { RENTAL_PLANS, AMENITIES, StudioFields, FacilityFormProps, StudioEquipment } from '../types/index'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Label } from "@/components/ui/label"

// Create a custom Switch component since it's missing
const Switch = ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) => {
  return (
    <div 
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-input'}`}
      onClick={() => onCheckedChange(!checked)}
    >
      <span 
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} 
      />
    </div>
  )
}

// Define suitable for options
const SUITABLE_FOR_OPTIONS = [
  { id: 'video', label: 'Video' },
  { id: 'podcast', label: 'Podcast' },
  { id: 'audio', label: 'Audio' },
  { id: 'others', label: 'Others' },
]

// Create a custom schema for selectedRentalPlans to handle all rental plan types
const rentalPlanSchema = z.enum(['Annual', 'Monthly', 'Weekly', 'One Day (24 Hours)', 'Hourly'])

const formSchema = z.object({
    relevantSectors: z
    .array(z.string())
    .min(1, "Select at least one sector")
    .max(3, "Only 3 sectors allowed"),
  name: z.string().min(1, 'Name is required'),
  privacyType: z.enum(["public", "private"], {
    required_error: "Privacy Type is required",
  }),
  description: z.string().min(1, 'Description is required'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  videoLink: z.string().optional(),
  selectedRentalPlans: z.array(rentalPlanSchema).min(1, 'At least one rental plan is required'),
  studioDetails: z.object({
    suitableFor: z.array(z.enum(['video', 'podcast', 'audio', 'others'])).min(1, 'At least one option is required'),
    isSoundProof: z.boolean(),
    equipmentDetails: z.array(z.object({
      name: z.string().min(1, 'Name is required'),
      picture: z.string().min(1, 'Picture is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      model: z.string().min(1, 'Model is required')
    })).min(1, 'At least one equipment is required'),
    hasAmpleLighting: z.boolean()
  }),
  rentPerYear: z.number().optional(),
  rentPerMonth: z.number().optional(),
  rentPerWeek: z.number().optional(),
  dayPassRent: z.number().optional(),
  hourlyRent: z.number().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
   pincode: z.string()
  .regex(/^[1-9][0-9]{5}$/, { message: 'Invalid pincode format' }),
   email: z.string().min(1, 'Email is required').regex(
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  'Invalid email format'
),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  timings: z.object({
    monday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional()
    }).refine(data => !data.isOpen || (data.openTime && data.closeTime), {
      message: "Opening and closing times are required when open",
      path: ["isOpen"]
    }),
    tuesday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional()
    }).refine(data => !data.isOpen || (data.openTime && data.closeTime), {
      message: "Opening and closing times are required when open",
      path: ["isOpen"]
    }),
    wednesday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional()
    }).refine(data => !data.isOpen || (data.openTime && data.closeTime), {
      message: "Opening and closing times are required when open",
      path: ["isOpen"]
    }),
    thursday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional()
    }).refine(data => !data.isOpen || (data.openTime && data.closeTime), {
      message: "Opening and closing times are required when open",
      path: ["isOpen"]
    }),
    friday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional()
    }).refine(data => !data.isOpen || (data.openTime && data.closeTime), {
      message: "Opening and closing times are required when open",
      path: ["isOpen"]
    }),
    saturday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional()
    }).refine(data => !data.isOpen || (data.openTime && data.closeTime), {
      message: "Opening and closing times are required when open",
      path: ["isOpen"]
    }),
    sunday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional()
    }).refine(data => !data.isOpen || (data.openTime && data.closeTime), {
      message: "Opening and closing times are required when open",
      path: ["isOpen"]
    })
  })
})

type FormValues = z.infer<typeof formSchema>

export function StudioForm({ onSubmit, onChange, initialData }: FacilityFormProps) {
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [templateDay, setTemplateDay] = useState<string>('monday')
  const [equipmentImages, setEquipmentImages] = useState<string[]>(
    initialData?.studioDetails?.equipmentDetails?.map((eq: StudioEquipment) => eq.picture) || []
  )
  const [equipment, setEquipment] = useState<StudioEquipment[]>(
    initialData?.studioDetails?.equipmentDetails || [{
      name: '',
      picture: '',
      quantity: 1,
      model: ''
    }]
  )
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [sectorTags, setSectorTags] = useState<string[]>([]);
const [customSector, setCustomSector] = useState("");
  const [isAddingSector, setIsAddingSector] = useState(false);
  const [sectorError, setSectorError] = useState<string | null>(null);


  const formatSectorLabel = (slug: string) =>
    slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  const toggleSector = (sector: string) => {
    let updated = [...selectedSectors];
    if (updated.includes(sector)) {
      updated = updated.filter((s) => s !== sector);
    } else if (updated.length < 5) {
      updated.push(sector);
    }

    setSelectedSectors(updated);
    form.setValue("relevantSectors", updated); // <-- ADD THIS LINE
  };

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const res = await fetch("/api/sector");
        const json = await res.json();
        if (json.success) {
          setSectorTags(json.data.map((s: any) => s.name));
        }
      } catch (err) {
        console.error("Error fetching sectors", err);
      }
    };
    fetchSectors();
  }, []);

  useEffect(() => {
    if (initialData?.relevantSectors?.length) {
      setSelectedSectors(initialData.relevantSectors);
      form.setValue("relevantSectors", initialData.relevantSectors);
    }
  }, [initialData]);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      relevantSectors: initialData?.relevantSectors || [],

      name: initialData?.name || '',
      description: initialData?.description || '',
      images: initialData?.images || [],
      videoLink: initialData?.videoLink || '',
      selectedRentalPlans: initialData?.rentalPlans?.map((plan: any) => plan.name) || [],
      studioDetails: {
        suitableFor: initialData?.studioDetails?.suitableFor || [],
        isSoundProof: initialData?.studioDetails?.isSoundProof || false,
        equipmentDetails: initialData?.studioDetails?.equipmentDetails || [{
          name: '',
          picture: '',
          quantity: 1,
          model: ''
        }],
        hasAmpleLighting: initialData?.studioDetails?.hasAmpleLighting || false
      },
      rentPerYear: initialData?.rentalPlans?.find((plan: any) => plan.name === 'Annual')?.price || undefined,
      rentPerMonth: initialData?.rentalPlans?.find((plan: any) => plan.name === 'Monthly')?.price || undefined,
      rentPerWeek: initialData?.rentalPlans?.find((plan: any) => plan.name === 'Weekly')?.price || undefined,
      dayPassRent: initialData?.rentalPlans?.find((plan: any) => plan.name === 'One Day (24 Hours)')?.price || undefined,
      hourlyRent: initialData?.rentalPlans?.find((plan: any) => plan.name === 'Hourly')?.price || undefined,
      address: initialData?.address || '',
      city: initialData?.city || '',
      pincode: initialData?.pincode || '',
      state: initialData?.state || '',
      country: initialData?.country || 'India',
       privacyType:initialData?.privacyType||"public",
      email:initialData?.email || '',
      timings: initialData?.timings || {
        monday: { isOpen: false, openTime: '', closeTime: '' },
        tuesday: { isOpen: false, openTime: '', closeTime: '' },
        wednesday: { isOpen: false, openTime: '', closeTime: '' },
        thursday: { isOpen: false, openTime: '', closeTime: '' },
        friday: { isOpen: false, openTime: '', closeTime: '' },
        saturday: { isOpen: false, openTime: '', closeTime: '' },
        sunday: { isOpen: false, openTime: '', closeTime: '' }
      }
    },
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        ...form.getValues(),
        address: initialData.address || '',
        city: initialData.city || '',
        pincode: initialData.pincode || '',
        state: initialData.state || '',
        country: initialData.country || 'India',
      });
    }
  }, [initialData, form]);

  // Watch timings to determine which days are open
  const timingsValue = useWatch({
    control: form.control,
    name: 'timings'
  });

  const handleImageUpload = (newImages: string[]) => {
    setImages(newImages)
    form.setValue('images', newImages)
    onChange?.()
  }

const handleSectorToggle = (slug: string) => {
  const updatedSectors = selectedSectors.includes(slug)
    ? selectedSectors.filter((s) => s !== slug)
    : selectedSectors.length < 5
    ? [...selectedSectors, slug]
    : selectedSectors;

  setSelectedSectors(updatedSectors);
  form.setValue("relevantSectors", updatedSectors); // ✅ Keep in sync
};


 const handleCustomSectorAdd = async () => {
    const raw = customSector.trim();

    // Basic validations
    if (!raw) {
      setSectorError("Please enter a sector name.");
      return;
    }

    if (selectedSectors.length >= 5) {
      setSectorError("You can select a maximum of 5 sectors.");
      return;
    }

    setIsAddingSector(true);
    setSectorError(null);

    try {
      const res = await fetch("/api/sector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: raw }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to add sector");
      }

      const createdSectorName: string = json.data.name;

      // Add to options if not already present
      setSectorTags((prev) =>
        prev.includes(createdSectorName) ? prev : [...prev, createdSectorName]
      );

      // Auto-select the newly added sector (respecting max 5 rule)
      const updatedSelection = selectedSectors.includes(createdSectorName)
        ? selectedSectors
        : [...selectedSectors, createdSectorName];

      setSelectedSectors(updatedSelection);
      form.setValue("relevantSectors", updatedSelection);

      setCustomSector("");
    } catch (error: any) {
      console.error("Error adding custom sector:", error);
      setSectorError(error.message || "Failed to add sector. Please try again.");
    } finally {
      setIsAddingSector(false);
    }
  };


 const applyToAllDays = () => {
    const templateTiming = timingsValue[templateDay as keyof typeof timingsValue]
    if (!templateTiming) return

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    
    days.forEach(day => {
      form.setValue(`timings.${day}.isOpen` as any, templateTiming.isOpen)
      form.setValue(`timings.${day}.openTime` as any, templateTiming.openTime || '')
      form.setValue(`timings.${day}.closeTime` as any, templateTiming.closeTime || '')
    })
  }
  const handleImageRemove = (url: string) => {
    const filteredImages = images.filter(image => image !== url);
    setImages(filteredImages);
    form.setValue('images', filteredImages);
    onChange?.();
  }

  const handleEquipmentImageUpload = (newImage: string, index: number) => {
    const newEquipmentImages = [...equipmentImages]
    newEquipmentImages[index] = newImage
    setEquipmentImages(newEquipmentImages)
    
    const currentEquipment = [...form.getValues('studioDetails.equipmentDetails')]
    currentEquipment[index].picture = newImage
    form.setValue('studioDetails.equipmentDetails', currentEquipment)
    
    // Update the equipment state to ensure UI updates
    const updatedEquipment = [...equipment];
    updatedEquipment[index] = { ...updatedEquipment[index], picture: newImage };
    setEquipment(updatedEquipment);
    
    onChange?.()
  }

  const handleEquipmentImageRemove = (url: string, index: number) => {
    const currentEquipment = [...form.getValues('studioDetails.equipmentDetails')];
    currentEquipment[index].picture = '';
    form.setValue('studioDetails.equipmentDetails', currentEquipment);
    
    // Update the equipment state to ensure UI updates
    const updatedEquipment = [...equipment];
    updatedEquipment[index] = { ...updatedEquipment[index], picture: '' };
    setEquipment(updatedEquipment);
    
    // Also update the equipmentImages array
    const newEquipmentImages = [...equipmentImages];
    newEquipmentImages[index] = '';
    setEquipmentImages(newEquipmentImages);
    
    onChange?.();
  }

  const addEquipment = () => {
    const newEquipment = {
      name: '',
      picture: '',
      quantity: 1,
      model: ''
    }
    setEquipment([newEquipment, ...equipment])
    const currentEquipment = form.getValues('studioDetails.equipmentDetails')
    form.setValue('studioDetails.equipmentDetails', [newEquipment, ...currentEquipment])
  }

  const removeEquipment = (index: number) => {
    const newEquipment = equipment.filter((_, i) => i !== index)
    setEquipment(newEquipment)
    form.setValue('studioDetails.equipmentDetails', newEquipment)
  }

  const handleFormSubmit = async (values: FormValues) => {
    // Prepare rental plans
    const rentalPlans = values.selectedRentalPlans.map(plan => {
      let price = 0
      switch (plan) {
        case 'Annual':
          price = values.rentPerYear || 0
          break
        case 'Monthly':
          price = values.rentPerMonth || 0
          break
        case 'Weekly':
          price = values.rentPerWeek || 0
          break
        case 'One Day (24 Hours)':
          price = values.dayPassRent || 0
          break
        case 'Hourly':
          price = values.hourlyRent || 0
          break
      }
      return {
        name: plan,
        price,
        duration: plan
      }
    })

    // Determine rental plan types based on selected rental plans
    const rentalPlanTypes: Array<'Hourly' | 'One-Day'> = [];
    if (values.selectedRentalPlans.includes('Hourly')) {
      rentalPlanTypes.push('Hourly');
    }
    if (values.selectedRentalPlans.includes('One Day (24 Hours)')) {
      rentalPlanTypes.push('One-Day');
    }
    // Default to Hourly if nothing is selected
    if (rentalPlanTypes.length === 0) {
      rentalPlanTypes.push('Hourly');
    }

const pincode = values.pincode;
try {
 const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
  const data = await response.json();
  if (!data || data[0]?.Status !== 'Success') {
    form.setError('pincode', {
      type: 'manual',
      message: 'This pincode does not exist. Please enter a valid Indian pincode.'
    });
    return;
  }
} catch (error) {
  form.setError('pincode', {
    type: 'manual',
    message: 'Failed to validate pincode. Please try again.'
  });
  return;
}


    // Prepare the final data
    const finalData = {
        relevantSectors: values.relevantSectors,
      facilityType: 'studio',
      status: 'pending' as 'pending' | 'active' | 'rejected' | 'inactive',
       privacyType:values.privacyType||"public",
      details: {
        name: values.name,
        description: values.description,
        images: values.images,
        videoLink: values.videoLink,
        rentalPlans,
        studioDetails: {
          ...values.studioDetails,
          // Use the top-level name and description for studioDetails
          facilityName: values.name,
          description: values.description,
          // Ensure all equipment details have valid data
          equipmentDetails: values.studioDetails.equipmentDetails.filter(eq => 
            eq.name && eq.picture && eq.quantity > 0 && eq.model
          ),
          // Add rental plan types
          rentalPlanTypes
        }
      },
      address: values.address,
      city: values.city,
      pincode: values.pincode,
      state: values.state,
      country: values.country,
      email: values.email, 
      // Use the user-provided timings
      timings: values.timings,
      isFeatured: false
    }

    onSubmit(finalData as any)
  }

  return (
    <>
       <div className="mt-4">
         <h3 className="text-lg font-semibold mb-2">
         Choose your relevant sectors
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          These sectors help users discover your facility better. Choose maximum upto 5 sectors.
        </p>

        {selectedSectors.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedSectors.map((sector) => (
              <div
                key={sector}
                className="flex items-center gap-2 bg-primary text-white text-sm px-3 py-1 rounded-full border border-primary"
              >
                <span>{formatSectorLabel(sector)}</span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedSectors(
                      selectedSectors.filter((s) => s !== sector)
                    )
                  }
                  className="hover:text-red-600"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-destructive mb-4">
            Please select at least one sector
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2 smart-scrollbar">
          {sectorTags.map((sector) => {
            const isSelected = selectedSectors.includes(sector);
            const isDisabled = selectedSectors.length >= 5 && !isSelected;
            return (
              <div
                key={sector}
                onClick={() => handleSectorToggle(sector)}
                className={`border rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors select-none ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "hover:border-primary/50 hover:bg-primary/5"
                } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {formatSectorLabel(sector)}
              </div>
            );
          })}
        </div>

         <div className="mt-4 space-y-2">
                            <Label htmlFor="customSector">Can’t find your sector?</Label>
                            <div className="flex gap-2">
                              <Input
                                id="customSector"
                                placeholder="Enter custom sector (e.g. Bioinformatics)"
                                value={customSector}
                                onChange={(e) => setCustomSector(e.target.value)}
                                disabled={isAddingSector}
                              />
                              <Button
                                type="button"
                                onClick={handleCustomSectorAdd}
                                disabled={isAddingSector || selectedSectors.length >= 5}
                              >
                                {isAddingSector ? "Adding..." : "Add"}
                              </Button>
                            </div>
                
                            {sectorError && (
                              <p className="text-xs text-destructive mt-1">{sectorError}</p>
                            )}
                
                            {selectedSectors.length >= 5 && (
                              <p className="text-xs text-muted-foreground">
                                You’ve already selected 5 sectors. Remove one to add another.
                              </p>
                            )}
                          </div>
      </div>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Basic Information</h2>
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter facility name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

            <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter facility description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          

          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={images}
                    onChange={handleImageUpload}
                    onRemove={handleImageRemove}
                    disabled={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="videoLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video Link (YouTube)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter YouTube video link (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
          control={form.control}
          name="privacyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Privacy Type *</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="public"
                      checked={field.value === 'public'}
                      onChange={() => field.onChange('public')}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Public</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="private"
                      checked={field.value === 'private'}
                      onChange={() => field.onChange('private')}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Private</span>
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>

        {/* Studio Details */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Studio Details</h2>
          
          <FormField
            control={form.control}
            name="studioDetails.suitableFor"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel>Suitable For</FormLabel>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {SUITABLE_FOR_OPTIONS.map((option) => (
                    <FormField
                      key={option.id}
                      control={form.control}
                      name="studioDetails.suitableFor"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={option.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.id as any)}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || []
                                  const newValue = checked
                                    ? [...currentValue, option.id]
                                    : currentValue.filter((value) => value !== option.id)
                                  field.onChange(newValue)
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="studioDetails.isSoundProof"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Sound Proof</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Is the studio sound proof?
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="studioDetails.hasAmpleLighting"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Ample Lighting</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Does the studio have ample lighting?
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Equipment Details */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Equipment Details</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Add details about the equipment available in your studio
              </p>
            </div>
            <Button 
              type="button" 
              onClick={addEquipment}
              variant="outline"
              className="border-black text-black bg-white hover:bg-gray-100"
            >
              Add Equipment
            </Button>
          </div>
          
          {equipment.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-center">No equipment added yet</p>
              <Button 
                type="button" 
                onClick={addEquipment}
                variant="outline"
                className="mt-4 border-black text-black bg-white hover:bg-gray-100"
              >
                Add Your First Equipment
              </Button>
            </div>
          ) : (
            equipment.map((item, index) => (
              <Card key={index} className="overflow-hidden mb-6">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">
                      {item.name ? item.name : `Equipment ${index + 1}`}
                    </h3>
                    {equipment.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeEquipment(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name={`studioDetails.equipmentDetails.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Equipment Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter equipment name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`studioDetails.equipmentDetails.${index}.model`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Model *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter equipment model" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`studioDetails.equipmentDetails.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Enter quantity" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name={`studioDetails.equipmentDetails.${index}.picture`}
                      render={() => (
                        <FormItem>
                          <FormLabel>Equipment Image *</FormLabel>
                          <FormDescription className="mt-0 mb-2">
                            Upload a clear image of the equipment
                          </FormDescription>
                          <div className="space-y-4">
                            {equipment[index]?.picture ? (
                              <div className="relative">
                                <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-md border border-gray-200">
                                  <Image
                                    src={equipment[index].picture}
                                    alt={equipment[index].name || "Equipment image"}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleEquipmentImageRemove(equipment[index].picture, index)}
                                    className="absolute right-2 top-2 rounded-full bg-rose-500 p-1 text-white shadow-sm hover:bg-rose-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                                <p className="mt-2 text-xs text-muted-foreground">
                                  Click the trash icon to remove and upload a different image
                                </p>
                              </div>
                            ) : (
                              <FormControl>
                                <ImageUpload
                                  value={[]}
                                  onChange={(urls) => {
                                    if (urls.length > 0) {
                                      handleEquipmentImageUpload(urls[0], index);
                                    }
                                  }}
                                  onRemove={(url) => handleEquipmentImageRemove(url, index)}
                                  disabled={false}
                                />
                              </FormControl>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Rental Plans */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Rental Plans</h2>
          
          <FormField
            control={form.control}
            name="selectedRentalPlans"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel>Select Rental Plans</FormLabel>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {RENTAL_PLANS.map((plan) => (
                    <FormField
                      key={plan}
                      control={form.control}
                      name="selectedRentalPlans"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={plan}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(plan)}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || []
                                  const newValue = checked
                                    ? [...currentValue, plan]
                                    : currentValue.filter((value) => value !== plan)
                                  field.onChange(newValue)
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {plan}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            {form.watch('selectedRentalPlans')?.includes('Annual') && (
              <FormField
                control={form.control}
                name="rentPerYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Rent (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter annual rent"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch('selectedRentalPlans')?.includes('Monthly') && (
              <FormField
                control={form.control}
                name="rentPerMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Rent (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter monthly rent"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch('selectedRentalPlans')?.includes('Weekly') && (
              <FormField
                control={form.control}
                name="rentPerWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekly Rent (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter weekly rent"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch('selectedRentalPlans')?.includes('One Day (24 Hours)') && (
              <FormField
                control={form.control}
                name="dayPassRent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day Pass Rent (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter day pass rent"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch('selectedRentalPlans')?.includes('Hourly') && (
              <FormField
                control={form.control}
                name="hourlyRent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rent (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter hourly rent"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* Operating Hours */}
         <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Operating Hours</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Set your facility's operating hours for each day of the week.
              </p>
            </div>
            
            {/* Apply to All Controls */}
            <div className="flex items-center gap-3 ">
              <select
                value={templateDay}
                onChange={(e) => setTemplateDay(e.target.value)}
                className="px-3 py-3 border rounded-md text-sm bg-background"
              >
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
              </select>
              
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={applyToAllDays}
                className="flex items-center  gap-2"
              >
                <Copy className="h-4 w-4" />
                Apply All
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
              <div key={day} className={`border rounded-md p-4 ${day === templateDay ? 'border-primary bg-primary/5' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium capitalize flex items-center gap-2">
                    {day}
                    {day === templateDay && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        Template
                      </span>
                    )}
                  </h4>
                  <FormField
                    control={form.control}
                    name={`timings.${day}.isOpen` as any}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Open
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                
                {timingsValue && 
                 timingsValue[day as keyof typeof timingsValue]?.isOpen && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`timings.${day}.openTime` as any}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <FormLabel>Opening Time</FormLabel>
                          </div>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`timings.${day}.closeTime` as any}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <FormLabel>Closing Time</FormLabel>
                          </div>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Location Details */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Location Details</h2>
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormDescription className="mt-0 mb-2 text-sm text-muted-foreground">
                  Add facility specific details like name, block number/building number
                </FormDescription>
                <FormControl>
                  <Textarea placeholder="Enter complete street address" {...field} className="resize-none" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pincode</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter pincode" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter state" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" className="w-full">Submit</Button>
      </form>
    </Form>
    </>
  )
}