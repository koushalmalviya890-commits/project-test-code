"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/ui/image-upload";
import { Clock, Copy, Plus, Trash2 } from "lucide-react";
import {
  RENTAL_PLANS,
  AMENITIES,
  EventWorkspaceFields,
  FacilityFormProps,
} from "../types/index";

const allRentalPlans = [
  "Annual",
  "Monthly",
  "Weekly",
  "One Day (24 Hours)",
  "Hourly",
];

const rentalPlanSchema = z.enum([
  "Annual",
  "Monthly",
  "Weekly",
  "One Day (24 Hours)",
  "Hourly",
]);

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  privacyType: z.enum(["public", "private"], {
    required_error: "Privacy Type is required",
  }),
  description: z.string().min(1, "Description is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  videoLink: z.string().optional(),
  selectedRentalPlans: z
    .array(rentalPlanSchema)
    .min(1, "At least one rental plan is required"),
  seatingCapacity: z.number().min(1, "Must have at least 1 seat"),
  rentPerYear: z.number().optional(),
  rentPerMonth: z.number().optional(),
  rentPerWeek: z.number().optional(),
  dayPassRent: z.number().optional(),
  hourlyRent: z.number().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  pincode: z
    .string()
    .regex(/^[1-9][0-9]{5}$/, { message: "Invalid pincode format" }),
  email: z
    .string()
    .min(1, "Email is required")
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid email format"
    ),
  relevantSectors: z
    .array(z.string())
    .min(1, "Select at least one sector")
    .max(3, "Only 3 sectors allowed"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  timings: z.object({
    monday: z
      .object({
        isOpen: z.boolean(),
        openTime: z.string().optional(),
        closeTime: z.string().optional(),
      })
      .refine((data) => !data.isOpen || (data.openTime && data.closeTime), {
        message: "Opening and closing times are required when open",
        path: ["isOpen"],
      }),
    tuesday: z
      .object({
        isOpen: z.boolean(),
        openTime: z.string().optional(),
        closeTime: z.string().optional(),
      })
      .refine((data) => !data.isOpen || (data.openTime && data.closeTime), {
        message: "Opening and closing times are required when open",
        path: ["isOpen"],
      }),
    wednesday: z
      .object({
        isOpen: z.boolean(),
        openTime: z.string().optional(),
        closeTime: z.string().optional(),
      })
      .refine((data) => !data.isOpen || (data.openTime && data.closeTime), {
        message: "Opening and closing times are required when open",
        path: ["isOpen"],
      }),
    thursday: z
      .object({
        isOpen: z.boolean(),
        openTime: z.string().optional(),
        closeTime: z.string().optional(),
      })
      .refine((data) => !data.isOpen || (data.openTime && data.closeTime), {
        message: "Opening and closing times are required when open",
        path: ["isOpen"],
      }),
    friday: z
      .object({
        isOpen: z.boolean(),
        openTime: z.string().optional(),
        closeTime: z.string().optional(),
      })
      .refine((data) => !data.isOpen || (data.openTime && data.closeTime), {
        message: "Opening and closing times are required when open",
        path: ["isOpen"],
      }),
    saturday: z
      .object({
        isOpen: z.boolean(),
        openTime: z.string().optional(),
        closeTime: z.string().optional(),
      })
      .refine((data) => !data.isOpen || (data.openTime && data.closeTime), {
        message: "Opening and closing times are required when open",
        path: ["isOpen"],
      }),
    sunday: z
      .object({
        isOpen: z.boolean(),
        openTime: z.string().optional(),
        closeTime: z.string().optional(),
      })
      .refine((data) => !data.isOpen || (data.openTime && data.closeTime), {
        message: "Opening and closing times are required when open",
        path: ["isOpen"],
      }),
  }),
});

const formatSectorLabel = (slug: string) => {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

type FormValues = z.infer<typeof formSchema>;

export function EventWorkspaceForm({
  onSubmit,
  onChange,
  initialData,
}: FacilityFormProps) {
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [sectorTags, setSectorTags] = useState<string[]>([]);
  const [templateDay, setTemplateDay] = useState<string>("monday");
  // Custom sector states
  const [customSector, setCustomSector] = useState("");
  const [isAddingSector, setIsAddingSector] = useState(false);
  const [sectorError, setSectorError] = useState<string | null>(null);
  // Custom sector add handler
  const handleCustomSectorAdd = async () => {
    const raw = customSector.trim();
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
      name: initialData?.name || "",
      description: initialData?.description || "",
      images: initialData?.images || [],
      videoLink: initialData?.videoLink || "",
      selectedRentalPlans:
        initialData?.rentalPlans?.map((plan: any) => plan.name) || [],

      seatingCapacity: initialData?.seatingCapacity || 0,
      rentPerYear:
        initialData?.rentalPlans?.find((plan: any) => plan.name === "Annual")
          ?.price || undefined,
      rentPerMonth:
        initialData?.rentalPlans?.find((plan: any) => plan.name === "Monthly")
          ?.price || undefined,
      rentPerWeek:
        initialData?.rentalPlans?.find((plan: any) => plan.name === "Weekly")
          ?.price || undefined,
      dayPassRent:
        initialData?.rentalPlans?.find(
          (plan: any) => plan.name === "One Day (24 Hours)"
        )?.price || undefined,
      hourlyRent:
        initialData?.rentalPlans?.find((plan: any) => plan.name === "Hourly")
          ?.price || undefined,
      relevantSectors: initialData?.relevantSectors || [],
      privacyType: initialData?.privacyType || "public",
      address: initialData?.address || "",
      city: initialData?.city || "",
      pincode: initialData?.pincode || "",
      state: initialData?.state || "",
      country: initialData?.country || "India",
      email: initialData?.email || "",
      timings: initialData?.timings || {
        monday: { isOpen: false, openTime: "", closeTime: "" },
        tuesday: { isOpen: false, openTime: "", closeTime: "" },
        wednesday: { isOpen: false, openTime: "", closeTime: "" },
        thursday: { isOpen: false, openTime: "", closeTime: "" },
        friday: { isOpen: false, openTime: "", closeTime: "" },
        saturday: { isOpen: false, openTime: "", closeTime: "" },
        sunday: { isOpen: false, openTime: "", closeTime: "" },
      },
    },
  });



  const selectedRentalPlans = form.watch("selectedRentalPlans") || [];
  const timingsValue = useWatch({
    control: form.control,
    name: "timings",
  });

  const handleImageUpload = (newImages: string[]) => {
    setImages(newImages);
    form.setValue("images", newImages);
    onChange?.();
  };

  const handleSectorToggle = (slug: string) => {
    const updatedSectors = selectedSectors.includes(slug)
      ? selectedSectors.filter((s) => s !== slug)
      : selectedSectors.length < 5
      ? [...selectedSectors, slug]
      : selectedSectors;

    setSelectedSectors(updatedSectors);
    form.setValue("relevantSectors", updatedSectors);
  };

  const applyToAllDays = () => {
    const templateTiming = timingsValue[templateDay as keyof typeof timingsValue];
    if (!templateTiming) return;

    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    days.forEach((day) => {
      form.setValue(`timings.${day}.isOpen` as any, templateTiming.isOpen);
      form.setValue(
        `timings.${day}.openTime` as any,
        templateTiming.openTime || ""
      );
      form.setValue(
        `timings.${day}.closeTime` as any,
        templateTiming.closeTime || ""
      );
    });
  };

  const handleFormSubmit = async (values: FormValues) => {
    try {
      if (!values.selectedRentalPlans.length) {
        form.setError("root", {
          type: "manual",
          message: "Please select at least one rental plan",
        });
        return;
      }

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
        form.setError("root", {
          type: "manual",
          message: "Please provide rent values for all selected rental plans",
        });
        return;
      }

      const pincode = values.pincode;
      try {
        const response = await fetch(
          `https://api.postalpincode.in/pincode/${pincode}`
        );
        const data = await response.json();
        if (!data || data[0]?.Status !== "Success") {
          form.setError("pincode", {
            type: "manual",
            message:
              "This pincode does not exist. Please enter a valid Indian pincode.",
          });
          return;
        }
      } catch (error) {
        form.setError("pincode", {
          type: "manual",
          message: "Failed to validate pincode. Please try again.",
        });
        return;
      }

      const submissionData = {
        relevantSectors: values.relevantSectors,
        facilityType: "event-workspace",
        status: "pending" as "pending" | "active" | "rejected" | "inactive",
        privacyType: values.privacyType || "public",
        details: {
          name: values.name,
          description: values.description,
          images,
          videoLink: values.videoLink || "",
         
          seatingCapacity: Number(values.seatingCapacity),
        
          rentalPlans: values.selectedRentalPlans.map((plan) => {
            let price = 0;
            switch (plan as string) {
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
            };
          }),
        },
        address: values.address,
        city: values.city,
        pincode: values.pincode,
        state: values.state,
        country: values.country,
        timings: values.timings,
        isFeatured: false,
        email: values.email,
      };

      await onSubmit(submissionData as any);
      form.reset();
      setImages([]);
      onChange?.();
    } catch (error) {
      console.error("Form submission error:", error);
      form.setError("root", {
        type: "manual",
        message: "Failed to submit form. Please try again.",
      });
    }
  };

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
                onClick={() => !isDisabled && handleSectorToggle(sector)}
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
          <label htmlFor="customSector" className="text-sm font-medium">Can’t find your sector?</label>
          <div className="flex gap-2">
            <Input
              id="customSector"
              placeholder="Enter custom sector (e.g. Bioinformatics)"
              value={customSector}
              onChange={(e) => setCustomSector(e.target.value)}
              disabled={isAddingSector}
              className="border rounded px-2 py-1 text-sm flex-1"
            />
            <Button
              type="button"
              onClick={handleCustomSectorAdd}
              disabled={isAddingSector || selectedSectors.length >= 5}
              // className="bg-primary text-white px-3 py-1 rounded text-sm"
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
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Space Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Grand Event Hall" />
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
                  <FormLabel>Contact Email *</FormLabel>
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
                <FormItem className="md:col-span-2">
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
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
                          checked={field.value === "public"}
                          onChange={() => field.onChange("public")}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Public</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="private"
                          checked={field.value === "private"}
                          onChange={() => field.onChange("private")}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="seatingCapacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Seating Capacity *</FormLabel>
                  <FormDescription>
                    Capacity across room
                  </FormDescription>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => {
                        const value =
                          e.target.value === ""
                            ? 0
                            : Math.max(0, Number(e.target.value));
                        field.onChange(value);
                      }}
                      value={field.value || ""}
                    />
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
                <FormLabel>Event Space Photos *</FormLabel>
                <FormDescription>
                  Upload photos showcasing your event spaces and rooms
                </FormDescription>
                <FormControl>
                  <ImageUpload
                    value={images}
                    onChange={handleImageUpload}
                    onRemove={(url) => {
                      const filteredImages = images.filter(
                        (image) => image !== url
                      );
                      setImages(filteredImages);
                      form.setValue("images", filteredImages);
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
                  <Input
                    type="url"
                    placeholder="Google Drive / Youtube link"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="selectedRentalPlans"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rental Plans Available *</FormLabel>
                <FormDescription>
                  Rental is charged per room booking
                </FormDescription>
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
                              switch (plan as string) {
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
                    <FormLabel>Rent per Year (per room, in Rupees) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? 0
                              : Math.max(0, Number(e.target.value));
                          field.onChange(value);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {selectedRentalPlans.includes("Monthly" as any) && (
              <FormField
                control={form.control}
                name="rentPerMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rent per Month (per room, in Rupees) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? 0
                              : Math.max(0, Number(e.target.value));
                          field.onChange(value);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {selectedRentalPlans.includes("Weekly" as any) && (
              <FormField
                control={form.control}
                name="rentPerWeek"
                render={({ field }) => (
                <FormItem>
                  <FormLabel>Rent per Week (per room, in Rupees) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => {
                        const value =
                          e.target.value === ""
                            ? 0
                            : Math.max(0, Number(e.target.value));
                        field.onChange(value);
                      }}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            )}
            {selectedRentalPlans.includes("One Day (24 Hours)" as any) && (
              <FormField
                control={form.control}
                name="dayPassRent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day Pass Rent (1 Day) (per room, in Rupees) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? 0
                              : Math.max(0, Number(e.target.value));
                          field.onChange(value);
                        }}
                        value={field.value || ""}
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
                    <FormLabel>Hourly Rent (per room, in Rupees) *</FormLabel>
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

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location Details</h3>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address *</FormLabel>
                  <FormDescription className="mt-0 mb-2 text-sm text-muted-foreground">
                    Add facility specific details like name, block
                    number/building number
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
              <div className="flex items-center gap-3">
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
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Apply All
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
              ].map((day) => (
                <div
                  key={day}
                  className={`border rounded-md p-4 ${day === templateDay ? "border-primary bg-primary/5" : ""}`}
                >
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
                          <FormLabel className="font-normal">Open</FormLabel>
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
                                  value={field.value || ""}
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
                                  value={field.value || ""}
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
                "Submit for Approval"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}