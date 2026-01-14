'use client'
import { useState , useEffect } from 'react'
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
import { Clock ,Copy} from 'lucide-react'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

import { RENTAL_PLANS, AMENITIES, LabFields, FacilityFormProps } from '../types/index'


type PricingModel = "rental" | "booking";

// Create a type that includes 'Hourly' to fix type errors
type RentalPlanType = (typeof RENTAL_PLANS)[number];

// Ensure all rental plans are available for selection
const allRentalPlans = [
  "Annual",
  "Monthly",
  "Weekly",
  "One Day (24 Hours)",
  "Hourly",
];


// Create a custom schema for selectedRentalPlans to handle all rental plan types
const rentalPlanSchema = z.enum(['Annual', 'Monthly', 'Weekly', 'One Day (24 Hours)', 'Hourly'])

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  privacyType: z.enum(["public", "private"], {
    required_error: "Privacy Type is required",
  }),
  description: z.string().min(1, 'Description is required'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  videoLink: z.string().optional(),
   pricingModel: z.enum(["rental", "booking"]),
     selectedRentalPlans: z
       .array(rentalPlanSchema)
       // .min(1, "At least one rental plan is required")
       .optional(),
  equipment: z.array(z.object({
    labName: z.string().min(1, 'Lab name is required'),
    equipmentName: z.string().min(1, 'Equipment name is required'),
    capacityAndMake: z.string().min(1, 'Capacity and make is required')
  })).min(1, 'At least one equipment is required'),
  rentPerYear: z.number().optional(),
  rentPerMonth: z.number().optional(),
  rentPerWeek: z.number().optional(),
  dayPassRent: z.number().optional(),
  hourlyRent: z.number().optional(),

   bookingPlanType: z.enum(["per_slot", "per_sample"]).default("per_sample"),
      categories: z.object({
        internalUser: z.object({
          enabled: z.boolean().default(true),
          price: z.number().min(0, "Price must be positive").optional()
        }),
        externalUser: z.object({
          enabled: z.boolean().default(true),
          price: z.number().min(0, "Price must be positive").optional()
        }),
        industryUsage: z.object({
          enabled: z.boolean().default(true),
          price: z.number().min(0, "Price must be positive").optional()
        }),
        internationalUser: z.object({
          enabled: z.boolean().default(false),
          price: z.number().optional()   // 👈 change from string → number
        })
      }),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  pincode: z.string().min(1, 'Pincode is required')
  .regex(/^[1-9][0-9]{5}$/, { message: 'Invalid pincode format' }),
   relevantSectors: z
    .array(z.string())
    .min(1, "Select at least one sector")
    .max(3, "Only 3 sectors allowed"),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  email: z.string().min(1, 'Email is required').regex(
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  'Invalid email format'
),
  timings: z.object({
    monday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional()
    }).refine(data => !data.isOpen || (data.openTime && data.closeTime), {
      message: "Opening and closing times are required when open"
    }),
    tuesday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional()
    }).refine(data => !data.isOpen || (data.openTime && data.closeTime), {
      message: "Opening and closing times are required when open"
    }),
    wednesday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional()
    }).refine(data => !data.isOpen || (data.openTime && data.closeTime), {
      message: "Opening and closing times are required when open"
    }),
    thursday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional()
    }).refine(data => !data.isOpen || (data.openTime && data.closeTime), {
      message: "Opening and closing times are required when open"
    }),
    friday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional()
    }).refine(data => !data.isOpen || (data.openTime && data.closeTime), {
      message: "Opening and closing times are required when open"
    }),
    saturday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional()
    }).refine(data => !data.isOpen || (data.openTime && data.closeTime), {
      message: "Opening and closing times are required when open"
    }),
    sunday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional()
    }).refine(data => !data.isOpen || (data.openTime && data.closeTime), {
      message: "Opening and closing times are required when open"
    })
  })
}).refine(
    (data) => {
      if (data.pricingModel === "rental") {
        return data.selectedRentalPlans && data.selectedRentalPlans.length > 0;
      } else if (data.pricingModel === "booking") {
        // Check if at least one category is enabled and has a price
        return Object.values(data.categories).some(
          (category: any) => category.enabled && category.price !== undefined
        );
      }
      return false;
    },
    {
      message: "Please either select rental plans or configure booking categories",
      path: ["pricingModel"],
    }
  );

type FormValues = z.infer<typeof formSchema> 

export function BioAlliedLabsForm({ onSubmit, onChange, initialData }: FacilityFormProps) {
 // console.log("INitial",initialData);
  const [images, setImages] = useState<string[]>(initialData?.images || [])

    const [templateDay, setTemplateDay] = useState<string>('monday')

  const [equipment, setEquipment] = useState<Array<{ labName: string; equipmentName: string; capacityAndMake: string }>>(
    initialData?.equipment || [{
      labName: '',
      equipmentName: '',
      capacityAndMake: ''
    }]
  )

  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [sectorTags, setSectorTags] = useState<string[]>([]);
const [customSector, setCustomSector] = useState("");
const [isAddingSector, setIsAddingSector] = useState(false);
const [sectorError, setSectorError] = useState<string | null>(null);
 

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
      name: initialData?.name || '',
      description: initialData?.description || '',
      images: initialData?.images || [],
      videoLink: initialData?.videoLink || '',
      equipment: initialData?.equipment || [{
        labName: '',
        equipmentName: '',
        capacityAndMake: ''
      }],
      pricingModel: initialData?.pricingModel || "rental",
      selectedRentalPlans: initialData?.rentalPlans?.map((plan: any) => plan.name) || [],
      bookingPlanType: initialData?.bookingPlanType || "per_sample",
      categories: {
        internalUser: {
          enabled: initialData?.categories?.internalUser?.enabled ?? false,
          price: initialData?.categories?.internalUser?.price
        },
        externalUser: {
          enabled: initialData?.categories?.externalUser?.enabled ?? false,
          price: initialData?.categories?.externalUser?.price
        },
        industryUsage: {
          enabled: initialData?.categories?.industryUsage?.enabled ?? false,
          price: initialData?.categories?.industryUsage?.price
        },
        internationalUser: {
          enabled: initialData?.categories?.internationalUser?.enabled ?? false,
          price: initialData?.categories?.internationalUser?.price
        }
      },
      email:initialData?.email || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      pincode: initialData?.pincode || '',
      state: initialData?.state || '',
      country: initialData?.country || 'India',
       privacyType:initialData?.privacyType||"public",
      relevantSectors: initialData?.relevantSectors || [],

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

  useEffect(() => {
   // console.log("Form errors:", form.formState.errors);
  }, [form.formState.errors]);

   const formatSectorLabel = (slug: string) =>
    slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

   const selectedRentalPlans = form.watch("selectedRentalPlans") || [];
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

    // Auto-select the newly added sector (respecting max 3 rule)
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

  const addEquipment = () => {
    setEquipment([...equipment, { labName: '', equipmentName: '', capacityAndMake: '' }])
    const currentEquipment = form.getValues('equipment')
    form.setValue('equipment', [...currentEquipment, { labName: '', equipmentName: '', capacityAndMake: '' }])
  }

  const removeEquipment = (index: number) => {
    const newEquipment = equipment.filter((_, i) => i !== index)
    setEquipment(newEquipment)
    const currentEquipment = form.getValues('equipment')
    form.setValue('equipment', currentEquipment.filter((_, i) => i !== index))
  }

  const handleFormSubmit = async (values: FormValues) => {
   // console.log('Form submission started - Bio Allied Labs Form')
   // console.log('Form values:', values)
    
    try {
      // Images validation is now handled by Zod schema

      // Validate equipment data
      const validEquipment = values.equipment.filter(eq => 
        eq.labName.trim() !== '' && 
        eq.equipmentName.trim() !== '' && 
        eq.capacityAndMake.trim() !== ''
      )

      if (validEquipment.length === 0) {
       // console.log('Validation failed: No valid equipment data')
        form.setError('root', {
          type: 'manual',
          message: 'Please add at least one equipment with all fields filled'
        })
        return
      }

      if (values.pricingModel === "rental") {
        // Rental plan validation
        if (!values.selectedRentalPlans?.length) {
         // console.log("Validation failed: No rental plans selected");
          form.setError("root", {
            type: "manual",
            message: "Please select at least one rental plan",
          });
          return;
        }

        // Check if rent values are provided for selected rental plans
        const rentValidation = values.selectedRentalPlans.every((plan) => {
          switch (plan as string) {
            case "Annual":
              return !!values.rentPerYear;
            case "Monthly":
              return !!values.rentPerMonth;
            case "Weekly":
              return !!values.rentPerWeek;
            case "One Day (24 Hours)":
              return !!values.dayPassRent;
            case "Hourly":
              return !!values.hourlyRent;
            default:
              return false;
          }
        });

        if (!rentValidation) {
         // console.log("Validation failed: Missing rent values for selected plans");
          form.setError("root", {
            type: "manual",
            message: "Please provide rent values for all selected rental plans",
          });
          return;
        }
      } else {
        // NEW: Validate enabled categories have prices
        const enabledCategories = Object.entries(values.categories).filter(
          ([key, category]) => category.enabled && key !== 'internationalUser'
        );

        const categoryPriceValidation = enabledCategories.every(([key, category]) => {
          return category.price !== undefined && typeof category.price === 'number' && category.price > 0;
        });

        if (!categoryPriceValidation) {
         // console.log("Validation failed: Missing prices for enabled categories");
          form.setError("root", {
            type: "manual",
            message: "Please provide prices for all enabled user categories",
          });
          return;
        }
      }

// Check if pincode is real using India Post API
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

      // Prepare final submission data
      const submissionData = {
          relevantSectors: values.relevantSectors,
        facilityType: 'bio-allied-labs',
        status: 'pending' as 'pending' | 'active' | 'rejected' | 'inactive',
         privacyType:values.privacyType||"public",
         pricingModel: values.pricingModel,
        details: {
          name: values.name,
          description: values.description,
          images,
          videoLink: values.videoLink || '',
          equipment: validEquipment,
          ...(values.pricingModel === "rental"
            ? {
              rentalPlans: values.selectedRentalPlans?.map((plan) => {
                let price = 0;
                switch (plan) {
                  case "Annual":
                    price = values.rentPerYear || 0;
                    break;
                  case "Monthly":
                    price = values.rentPerMonth || 0;
                    break;
                  case "Weekly":
                    price = values.rentPerWeek || 0;
                    break;
                  case "One Day (24 Hours)":
                    price = values.dayPassRent || 0;
                    break;
                  case "Hourly":
                    price = values.hourlyRent || 0;
                    break;
                }
                return {
                  name: plan,
                  price,
                  duration: plan,
                  type: "rental"
                };
              }) || []
            }
            : {
              rentalPlans: Object.entries(values.categories)
                .filter(([_, category]) => category.enabled && category.price !== undefined)
                .map(([key, category]) => ({
                  type: "booking",
                  name: key,
                  price: category.price || 0,
                  duration: "N/A"
                })),
              bookingPlanType: values.bookingPlanType
            }
          )
        },
        address: values.address,
        city: values.city,
        pincode: values.pincode,
        state: values.state,
        country: values.country,
        timings: values.timings,
        isFeatured: false,
        email: values.email, 
      }

     // console.log('Submitting data:', submissionData)
      await onSubmit(submissionData as any)
     // console.log('Form submission successful')
      
      // Reset form state
      form.reset()
      setImages([])
      setEquipment([{ labName: '', equipmentName: '', capacityAndMake: '' }])
      onChange?.()
    } catch (error) {
      console.error('Form submission error:', error)
      form.setError('root', { 
        type: 'manual',
        message: 'Failed to submit form. Please try again.'
      })
    }
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

        {/* Custom sector input */}
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                  onRemove={(url) => {
                    const newImages = images.filter((image) => image !== url);
                    setImages(newImages);
                    form.setValue('images', newImages);
                    onChange?.();
                  }}
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
              <FormLabel>Video Link (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

          <FormField
                    control={form.control}
                    name="pricingModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pricing Model*</FormLabel>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="rental" />
                            </FormControl>
                            <FormLabel>Rental Plans</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="booking" />
                            </FormControl>
                            <FormLabel>Booking Plans</FormLabel>
                          </FormItem>
                        </RadioGroup>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
        
                  {form.watch("pricingModel") === "rental" ? (
                    <>
                      <FormField
                        control={form.control}
                        name="selectedRentalPlans"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rental Subscription Plan(s) Available *</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                {allRentalPlans.map((plan) => (
                                  <div key={plan} className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={field.value?.includes(plan as any)}
                                      onCheckedChange={(checked) => {
                                        const updatedPlans = checked
                                          ? [...(field.value || []), plan]
                                          : field.value?.filter((p) => p !== plan) || [];
                                        field.onChange(updatedPlans);
        
                                        if (!checked) {
                                          switch (plan) {
                                            case "Annual":
                                              form.setValue("rentPerYear", undefined);
                                              break;
                                            case "Monthly":
                                              form.setValue("rentPerMonth", undefined);
                                              break;
                                            case "Weekly":
                                              form.setValue("rentPerWeek", undefined);
                                              break;
                                            case "One Day (24 Hours)":
                                              form.setValue("dayPassRent", undefined);
                                              break;
                                            case "Hourly":
                                              form.setValue("hourlyRent", undefined);
                                              break;
                                          }
                                        }
                                      }}
                                    />
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                      {plan}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
        
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedRentalPlans.includes("Annual" as any) && (
                          <FormField
                            control={form.control}
                            name="rentPerYear"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rent per Year (in Rupees) *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={field.value === undefined ? "" : field.value}
                                    onChange={(e) => {
                                      const inputValue = e.target.value;
                                      let numValue;
        
                                      if (inputValue === "") {
                                        numValue = undefined;
                                      } else {
                                        const parsed = parseInt(inputValue, 10);
                                        numValue = isNaN(parsed) ? 0 : Math.max(0, parsed);
                                      }
        
                                      field.onChange(numValue);
                                    }}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        {selectedRentalPlans.includes("Monthly") && (
                          <FormField
                            control={form.control}
                            name="rentPerMonth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rent per Month (in Rupees) *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={field.value === undefined ? "" : field.value}
                                    onChange={(e) => {
                                      const inputValue = e.target.value;
                                      let numValue;
        
                                      if (inputValue === "") {
                                        numValue = undefined;
                                      } else {
                                        const parsed = parseInt(inputValue, 10);
                                        numValue = isNaN(parsed) ? 0 : Math.max(0, parsed);
                                      }
        
                                      field.onChange(numValue);
                                    }}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        {selectedRentalPlans.includes("Weekly") && (
                          <FormField
                            control={form.control}
                            name="rentPerWeek"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rent per Week (in Rupees) *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={field.value === undefined ? "" : field.value}
                                    onChange={(e) => {
                                      const inputValue = e.target.value;
                                      let numValue;
        
                                      if (inputValue === "") {
                                        numValue = undefined;
                                      } else {
                                        const parsed = parseInt(inputValue, 10);
                                        numValue = isNaN(parsed) ? 0 : Math.max(0, parsed);
                                      }
        
                                      field.onChange(numValue);
                                    }}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        {selectedRentalPlans.includes("One Day (24 Hours)") && (
                          <FormField
                            control={form.control}
                            name="dayPassRent"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Day Pass Rent (1 Day) (in Rupees) *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={field.value === undefined ? "" : field.value}
                                    onChange={(e) => {
                                      const inputValue = e.target.value;
                                      let numValue;
        
                                      if (inputValue === "") {
                                        numValue = undefined;
                                      } else {
                                        const parsed = parseInt(inputValue, 10);
                                        numValue = isNaN(parsed) ? 0 : Math.max(0, parsed);
                                      }
        
                                      field.onChange(numValue);
                                    }}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        {selectedRentalPlans.includes("Hourly" as any) && (
                          <FormField
                            control={form.control}
                            name="hourlyRent"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Hourly Rent (in Rupees) *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={field.value === undefined ? "" : field.value}
                                    onChange={(e) => {
                                      const inputValue = e.target.value;
                                      let numValue;
        
                                      if (inputValue === "") {
                                        numValue = undefined;
                                      } else {
                                        const parsed = parseInt(inputValue, 10);
                                        numValue = isNaN(parsed) ? 0 : Math.max(0, parsed);
                                      }
        
                                      field.onChange(numValue);
                                    }}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">!</span>
                          </div>
                          <p className="text-sm text-yellow-800">
                            Ensure pricing is in INR and includes 18% GST (if applicable)
                          </p>
                        </div>
                      </div>
        
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">
                            Booking Plan (Categories)
                          </h3>
        
                          {/* Radio button selection for Per slot / Per sample */}
                          <FormField
                            control={form.control}
                            name="bookingPlanType"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value || "per_sample"}
                                    className="flex items-center gap-6"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="per_slot" id="per_slot" />
                                      <Label
                                        htmlFor="per_slot"
                                        className="text-sm font-medium"
                                      >
                                        Per Slot
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem
                                        value="per_sample"
                                        id="per_sample"
                                      />
                                      <Label
                                        htmlFor="per_sample"
                                        className="text-sm font-medium"
                                      >
                                        Per sample
                                      </Label>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
        
                        {/* User Categories with Pricing */}
                        <div className="space-y-4">
                          {/* Internal User */}
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FormField
                                control={form.control}
                                name="categories.internalUser.enabled"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <div>
                                <Label className="text-sm font-medium">
                                  Internal User
                                </Label>
                                <p className="text-xs text-gray-500">
                                  (Students & Staff)
                                </p>
                              </div>
                            </div>
                            <div className="w-32">
                              <FormField
                                control={form.control}
                                name="categories.internalUser.price"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div className="relative">
                                        <Input
                                          type="number"
                                          placeholder="250"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(Number(e.target.value))
                                          }
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                          /
                                          {form.watch("bookingPlanType") === "per_slot"
                                            ? "Slot"
                                            : "Sample"}
                                        </span>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
        
                          {/* External User */}
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FormField
                                control={form.control}
                                name="categories.externalUser.enabled"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <div>
                                <Label className="text-sm font-medium">
                                  External User
                                </Label>
                                <p className="text-xs text-gray-500">
                                  (Academic & Research user)
                                </p>
                              </div>
                            </div>
                            <div className="w-32">
                              <FormField
                                control={form.control}
                                name="categories.externalUser.price"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div className="relative">
                                        <Input
                                          type="number"
                                          placeholder="600"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(Number(e.target.value))
                                          }
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                          /
                                          {form.watch("bookingPlanType") === "per_slot"
                                            ? "Slot"
                                            : "Sample"}
                                        </span>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
        
                          {/* Industry Usage */}
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FormField
                                control={form.control}
                                name="categories.industryUsage.enabled"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <div>
                                <Label className="text-sm font-medium">
                                  Industry Usage
                                </Label>
                                <p className="text-xs text-gray-500">(Startup & Other)</p>
                              </div>
                            </div>
                            <div className="w-32">
                              <FormField
                                control={form.control}
                                name="categories.industryUsage.price"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div className="relative">
                                        <Input
                                          type="number"
                                          placeholder="1200"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(Number(e.target.value))
                                          }
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                          /
                                          {form.watch("bookingPlanType") === "per_slot"
                                            ? "Slot"
                                            : "Sample"}
                                        </span>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
        
                          {/* International User */}
                          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3">
                              <FormField
                                control={form.control}
                                name="categories.internationalUser.enabled"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <div>
                                <Label className="text-sm font-medium text-gray-500">
                                  International User
                                </Label>
                              </div>
                            </div>
                            <div className="w-32">
                              <FormField
                                control={form.control}
                                name="categories.internationalUser.price"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div className="relative">
                                        <Input
                                          type="text"
                                          placeholder="Cost"
                                          disabled
                                          className="bg-gray-100"
                                          {...field}
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                          /
                                          {form.watch("bookingPlanType") === "per_slot"
                                            ? "Slot"
                                            : "Sample"}
                                        </span>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
        

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Lab Equipment Details</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEquipment}
            >
              Add Equipment
            </Button>
          </div>
          {equipment.map((_, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
              <FormField
                control={form.control}
                name={`equipment.${index}.labName`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lab Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`equipment.${index}.equipmentName`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`equipment.${index}.capacityAndMake`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity and Make</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {index > 0 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeEquipment(index)}
                  className="mt-2"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Operating Hours */}
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

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Location Details</h3>
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address *</FormLabel>
                <FormDescription className="mt-0 mb-2 text-sm text-muted-foreground">
                  Add facility specific details like name, block number/building number
                </FormDescription>
                <FormControl>
                  <Textarea {...field} className="resize-none" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City *</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Pincode *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State *</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Country *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="w-full md:w-auto bg-primary hover:bg-primary/90"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <span className="mr-2">Submitting...</span>
                <span className="animate-spin">⏳</span>
              </>
            ) : (
              'Submit for Approval'
            )}
          </Button>
        </div>
      </form>
    </Form>
    </>
  )
}