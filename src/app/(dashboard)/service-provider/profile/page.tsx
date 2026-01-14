"use client";
import { useState, useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { ProfilePicture } from "@/components/ui/profile-picture";
import { useSession } from "next-auth/react";
import { Pencil, Save, Info, Clock, UserCircle } from "lucide-react";
import {
  getServiceProviderProfile,
  updateServiceProviderProfile,
} from "@/lib/actions/service-provider";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AMENITIES } from "@/components/forms/types/index";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
// Define the service provider types as a constant for type safety
const SERVICE_PROVIDER_TYPES = [
  "Incubator",
  "Accelerator",
  "Institution/University",
  "Private Coworking Space",
  "Community Space",
  "Studio",
] as const;

// Create a type from the array
type ServiceProviderType = (typeof SERVICE_PROVIDER_TYPES)[number];

// Define the timings schema
const dayTimingSchema = z.object({
  isOpen: z.boolean(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
});

const timingsSchema = z.object({
  monday: dayTimingSchema,
  tuesday: dayTimingSchema,
  wednesday: dayTimingSchema,
  thursday: dayTimingSchema,
  friday: dayTimingSchema,
  saturday: dayTimingSchema,
  sunday: dayTimingSchema,
});

const profileSchema = z
  .object({
    confirmAccountNumber: z
      .string()
      .min(1, "Confirmation is required")
      .nullable()
      .transform((val) => val || ""),
    serviceProviderType: z.enum(SERVICE_PROVIDER_TYPES).nullable(),
    serviceName: z
      .string()
      .min(1, "Service name is required")
      .nullable()
      .transform((val) => val || ""),
    address: z
      .string()
      .min(1, "Address is required")
      .nullable()
      .transform((val) => val || ""),
    city: z
      .string()
      .min(1, "City is required")
      .nullable()
      .transform((val) => val || ""),
    stateProvince: z
      .string()
      .min(1, "State/Province is required")
      .nullable()
      .transform((val) => val || ""),
    zipPostalCode: z
      .string()
      .min(1, "ZIP/Postal Code is required")
      .nullable()
      .transform((val) => val || ""),
    primaryContact1Name: z
      .string()
      .min(1, "Primary contact name is required")
      .nullable()
      .transform((val) => val || ""),
    primaryContact1Designation: z
      .string()
      .min(1, "Primary contact designation is required")
      .nullable()
      .transform((val) => val || ""),
    primaryContactNumber: z
      .string()
      .min(1, "Primary contact number is required")
      .nullable()
      .transform((val) => val || ""),
    contact2Name: z
      .string()
      .optional()
      .nullable()
      .transform((val) => val || ""),
    contact2Designation: z
      .string()
      .optional()
      .nullable()
      .transform((val) => val || ""),
    alternateContactNumber: z
      .string()
      .optional()
      .nullable()
      .transform((val) => val || ""),
    alternateEmailId: z
      .string()
      .email("Please enter a valid email address")
      .optional()
      .nullable()
      .transform((val) => val || ""),
    primaryEmailId: z
      .string()
      .email("Please enter a valid email address")
      .optional()
      .nullable()
      .transform((val) => val || ""),
    websiteUrl: z
      .string()
      .url("Please enter a valid URL")
      .optional()
      .nullable()
      .transform((val) => val || ""),
    logoUrl: z
      .string()
      .min(1, "Logo is required")
      .nullable()
      .transform((val) => val || ""),
    features: z
      .array(z.string())
      .min(1, "At least one amenity must be selected"),
    images: z
      .array(z.string())
      .min(1, "At least one facility image is required"),
    bankName: z.string().min(1, "Bank name is required"),
    accountNumber: z.string().min(1, "Account number is required"),
    ifscCode: z.string().min(1, "IFSC code is required"),
    accountHolderName: z.string().min(1, "Account holder name is required"),
    branchName: z.string().min(1, "Branch name is required"),
    gstNumber: z
      .string()
      .optional()
      .nullable()
      .transform((val) => val || ""),
    applyGst: z.enum(["yes", "no"]).transform((val) => val || ""),
    settlementType: z.enum(["monthly", "weekly"]).transform((val) => val || ""),
    invoiceType: z.enum(["self", "cumma"]).optional().default("cumma"),
    invoiceTemplate: z
      .enum(["template1", "template2"])
      .transform((val) => val || ""),
    timings: timingsSchema,
  })
  .refine(
    (data) => {
      // If account number is provided, confirmation is REQUIRED
      if (data.accountNumber && data.accountNumber.trim() !== "") {
        // Check if confirmation field is empty
        if (
          !data.confirmAccountNumber ||
          data.confirmAccountNumber.trim() === ""
        ) {
          return false; // Fail validation if confirmation is empty
        }
        // Check if confirmation matches account number
        return data.accountNumber === data.confirmAccountNumber;
      }
      return true; // No validation if account number is empty
    },
    {
      message: "Account numbers do not match",
      path: ["confirmAccountNumber"],
    }
  )
  .refine(
    (data) => {
      // Second refine for mismatch validation (only if both fields have values)
      if (
        data.accountNumber &&
        data.accountNumber.trim() !== "" &&
        data.confirmAccountNumber &&
        data.confirmAccountNumber.trim() !== ""
      ) {
        return data.accountNumber === data.confirmAccountNumber;
      }
      return true;
    },
    {
      message: "Account numbers do not match",
      path: ["confirmAccountNumber"],
    }
  );

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ServiceProviderProfile() {
  const [templateDay, setTemplateDay] = useState<string>("monday");
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const tabs = ['basic', 'contact', 'bank', 'amenities'];
  const isLastTab = activeTab === tabs[tabs.length - 1];
  const [isLoading, setIsLoading] = useState(true);
  const [logoImages, setLogoImages] = useState<string[]>([]);
  const [facilityImages, setFacilityImages] = useState<string[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [incompleteFields, setIncompleteFields] = useState<string[]>([]);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      serviceProviderType: null,
      serviceName: "",
      address: "",
      city: "",
      stateProvince: "",
      zipPostalCode: "",
      primaryContact1Name: "",
      primaryContact1Designation: "",
      primaryContactNumber: "",
      contact2Name: "",
      contact2Designation: "",
      alternateContactNumber: "",
      alternateEmailId: "",
      primaryEmailId: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      gstNumber: "",
      accountHolderName: "",
      branchName: "",
      settlementType: "monthly",
      invoiceType: "cumma",
      invoiceTemplate: "template1",
      applyGst: "yes",
      confirmAccountNumber: "",
      websiteUrl: "",
      logoUrl: "",
      features: [],
      images: [],
      timings: {
        monday: { isOpen: false },
        tuesday: { isOpen: false },
        wednesday: { isOpen: false },
        thursday: { isOpen: false },
        friday: { isOpen: false },
        saturday: { isOpen: false },
        sunday: { isOpen: false },
      },
    },
  });

  // Watch timings to determine which days are open
  const timingsValue = useWatch({
    control: form.control,
    name: "timings",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await getServiceProviderProfile();
        if (result.error) {
          throw new Error(result.error);
        }

        if (result.data) {
          // console.log("Profile data:", result.data);
          setProfileUserId(result.data.userId || null);
          // Create a new object for formatted data
          const formattedData: ProfileFormValues = {
            serviceProviderType: result.data.serviceProviderType,
            serviceName: result.data.serviceName || "",
            address: result.data.address || "",
            city: result.data.city || "",
            bankName: result.data.bankName || "",
            accountNumber: result.data.accountNumber || "",
            ifscCode: result.data.ifscCode || "",
            accountHolderName: result.data.accountHolderName || "",
            branchName: result.data.bankBranch || "",
            gstNumber: result.data.gstNumber || "",
            applyGst: result.data.applyGst || "no",
            settlementType: result.data.settlementType || "",
            invoiceType: result.data.invoiceType || "cumma",
            invoiceTemplate: result.data.invoiceTemplate || "",
            confirmAccountNumber: result.data.accountNumber || "",
            stateProvince: result.data.stateProvince || "",
            zipPostalCode: result.data.zipPostalCode || "",
            primaryContact1Name: result.data.primaryContact1Name || "",
            primaryContact1Designation:
              result.data.primaryContact1Designation || "",
            primaryContactNumber: result.data.primaryContactNumber || "",
            contact2Name: result.data.contact2Name || "",
            contact2Designation: result.data.contact2Designation || "",
            alternateContactNumber: result.data.alternateContactNumber || "",
            alternateEmailId: result.data.alternateEmailId || "",
            primaryEmailId: result.data.primaryEmailId || "",
            websiteUrl: result.data.websiteUrl || "",
            logoUrl: result.data.logoUrl || "",
            features: Array.isArray(result.data.features)
              ? result.data.features
              : [],
            images: Array.isArray(result.data.images) ? result.data.images : [],
            timings: result.data.timings || {
              monday: { isOpen: false, openTime: "", closeTime: "" },
              tuesday: { isOpen: false, openTime: "", closeTime: "" },
              wednesday: { isOpen: false, openTime: "", closeTime: "" },
              thursday: { isOpen: false, openTime: "", closeTime: "" },
              friday: { isOpen: false, openTime: "", closeTime: "" },
              saturday: { isOpen: false, openTime: "", closeTime: "" },
              sunday: { isOpen: false, openTime: "", closeTime: "" },
            },
          };

          // Reset form with properly formatted data
          form.reset(formattedData);

          // Set logo image if exists
          if (result.data.logoUrl) {
            // console.log("Setting logo image URL:", result.data.logoUrl);
            setLogoImages([result.data.logoUrl]);
            form.setValue("logoUrl", result.data.logoUrl);
          } else {
            // console.log("No logo image URL found");
            setLogoImages([]);
            form.setValue("logoUrl", "");
          }

          // Set facility images if they exist
          if (
            Array.isArray(result.data.images) &&
            result.data.images.length > 0
          ) {
            setFacilityImages(result.data.images);
          }

          // Calculate profile completion
          calculateProfileCompletion(formattedData);
        }
      } catch (error: any) {
        toast.error("Failed to load profile");
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [form]);

  const calculateProfileCompletion = (
    profileData: Partial<ProfileFormValues>
  ) => {
    // Make sure we have valid data to work with
    if (!profileData) return;

    const requiredFields = [
      { name: "Logo", value: profileData.logoUrl },
      { name: "Service Provider Type", value: profileData.serviceProviderType },
      { name: "Service Name", value: profileData.serviceName },
      { name: "Address", value: profileData.address },
      { name: "City", value: profileData.city },
      { name: "State/Province", value: profileData.stateProvince },
      { name: "ZIP/Postal Code", value: profileData.zipPostalCode },
      { name: "Primary Contact Name", value: profileData.primaryContact1Name },
      {
        name: "Primary Contact Designation",
        value: profileData.primaryContact1Designation,
      },
      {
        name: "Primary Contact Number",
        value: profileData.primaryContactNumber,
      },
      {
        name: "Amenities",
        value:
          Array.isArray(profileData.features) && profileData.features.length > 0
            ? profileData.features[0]
            : null,
      },
      {
        name: "Facility Images",
        value:
          Array.isArray(profileData.images) && profileData.images.length > 0
            ? profileData.images[0]
            : null,
      },
    ];

    const filledFields = requiredFields.filter(
      (field) =>
        field.value !== null && field.value !== undefined && field.value !== ""
    ).length;

    const percentage = Math.round((filledFields / requiredFields.length) * 100);
    setCompletionPercentage(percentage);

    const incomplete = requiredFields
      .filter((field) => !field.value)
      .map((field) => field.name);
    setIncompleteFields(incomplete);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      // Strict client-side validation for account number confirmation
      if (data.accountNumber && data.accountNumber.trim() !== "") {
        // Check if confirmation field is empty
        if (
          !data.confirmAccountNumber ||
          data.confirmAccountNumber.trim() === ""
        ) {
          toast.error("Please re-enter the account number to confirm");
          // Focus on the confirmation field
          const confirmField = document.querySelector(
            'input[name="confirmAccountNumber"]'
          ) as HTMLInputElement;
          if (confirmField) {
            confirmField.focus();
          }
          return;
        }

        // Check if confirmation matches account number
        if (data.accountNumber !== data.confirmAccountNumber) {
          toast.error(
            "Account numbers do not match. Please check and try again."
          );
          // Focus on the confirmation field
          const confirmField = document.querySelector(
            'input[name="confirmAccountNumber"]'
          ) as HTMLInputElement;
          if (confirmField) {
            confirmField.focus();
            confirmField.select(); // Select all text for easy re-entry
          }
          return;
        }
      }

      // Ensure all fields are properly formatted
      const submissionData = {
        ...data,
        bankName: data.bankName || "",
        // accountNumber: data.accountNumber || "",
        ifscCode: data.ifscCode || "",
        gstNumber: data.gstNumber || "",
        accountHolderName: data.accountHolderName || "",
        bankBranch: data.branchName || "",
        serviceProviderType:
          data.serviceProviderType || ("Incubator" as ServiceProviderType),
        logoUrl: logoImages.length > 0 ? logoImages[0] : data.logoUrl || "",
        features: Array.isArray(data.features) ? data.features : [],
        images: Array.isArray(facilityImages) ? facilityImages : [],
        timings: {
          monday: {
            isOpen: data.timings.monday.isOpen,
            openTime: data.timings.monday.openTime || "",
            closeTime: data.timings.monday.closeTime || "",
          },
          tuesday: {
            isOpen: data.timings.tuesday.isOpen,
            openTime: data.timings.tuesday.openTime || "",
            closeTime: data.timings.tuesday.closeTime || "",
          },
          wednesday: {
            isOpen: data.timings.wednesday.isOpen,
            openTime: data.timings.wednesday.openTime || "",
            closeTime: data.timings.wednesday.closeTime || "",
          },
          thursday: {
            isOpen: data.timings.thursday.isOpen,
            openTime: data.timings.thursday.openTime || "",
            closeTime: data.timings.thursday.closeTime || "",
          },
          friday: {
            isOpen: data.timings.friday.isOpen,
            openTime: data.timings.friday.openTime || "",
            closeTime: data.timings.friday.closeTime || "",
          },
          saturday: {
            isOpen: data.timings.saturday.isOpen,
            openTime: data.timings.saturday.openTime || "",
            closeTime: data.timings.saturday.closeTime || "",
          },
          sunday: {
            isOpen: data.timings.sunday.isOpen,
            openTime: data.timings.sunday.openTime || "",
            closeTime: data.timings.sunday.closeTime || "",
          },
        },
        invoiceType: (data as any).invoiceType || "cumma",
        invoiceTemplate: (data as any).invoiceTemplate || "template1",
        settlementType: (data as any).settlementType || "monthly",
      };

      // console.log("Submitting profile with features:", submissionData.features);
      // console.log("Submitting profile with images:", submissionData.images);
      // console.log("Submitting profile with timings:", submissionData.timings);

      const result = await updateServiceProviderProfile(submissionData);

      if (result.error) {
        throw new Error(result.error);
      }

      // Recalculate profile completion
      calculateProfileCompletion(submissionData);

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    }
  };
  const applyToAllDays = () => {
    const templateTiming =
      timingsValue[templateDay as keyof typeof timingsValue];
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
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-full p-4 sm:p-6 lg:p-8 xl:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between max-w-7xl mx-auto gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">My Profile</h1>
          <p className="mt-2 text-sm sm:text-md text-muted-foreground">
            Manage your profile information and service details
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <Button
            variant={isEditing ? "outline" : "default"}
            size="lg"
            onClick={() => setIsEditing(!isEditing)}
            className="w-full sm:w-auto"
          >
            {isEditing ? (
              <>
                <Pencil className="h-4 w-4 mr-2" /> Cancel
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4 mr-2" /> Edit Profile
              </>
            )}
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const qrLink = `https://cumma.in/private/SearchPage?id=${profileUserId}`;
                navigator.clipboard.writeText(qrLink);
                toast.success("QR link copied to clipboard");
              }}
              className="text-muted-foreground hover:text-primary flex-1 sm:flex-none"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy QR Link
            </Button>
          </div>
        </div>
      </div>

      {completionPercentage < 100 && (
        <Card className="border-amber-200 bg-amber-50 max-w-7xl mx-auto">
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-3 sm:gap-4">
              <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <div>
                  <span className="font-medium">Complete your profile: </span>
                  <span className="text-sm">
                    {completionPercentage}% complete
                  </span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
                {incompleteFields.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <p className="break-words">
                      Missing information:{" "}
                      {incompleteFields.slice(0, 3).join(", ")}
                      {incompleteFields.length > 3 &&
                        ` and ${incompleteFields.length - 3} more`}
                    </p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  A complete profile helps startups find and connect with your
                  services more effectively.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 sm:space-y-8"
        >
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="space-y-6 sm:space-y-8"
          >
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 max-w-4xl mx-auto mb-4 sm:mb-6 h-auto p-1">
              <TabsTrigger
                value="basic"
                className="text-xs sm:text-sm px-2 py-2 sm:px-3"
              >
                Basic Info
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="text-xs sm:text-sm px-2 py-2 sm:px-3"
              >
                Contact Details
              </TabsTrigger>
              <TabsTrigger
                value="bank"
                className="text-xs sm:text-sm px-2 py-2 sm:px-3"
              >
                Banking Details
              </TabsTrigger>
              <TabsTrigger
                value="amenities"
                className="text-xs sm:text-sm px-2 py-2 sm:px-3"
              >
                Amenities & Images
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 sm:space-y-8">
              <Card className="max-w-7xl mx-auto">
                <CardContent className="pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col items-center space-y-4 mb-6 sm:mb-8">
                    <FormLabel>Facility Partner Logo *</FormLabel>
                    {isEditing ? (
                      <div className="mx-auto max-w-[256px]">
                        <ProfilePicture
                          imageUrl={form.watch("logoUrl")}
                          size={160}
                          isEditing={true}
                          onImageChange={(urls) => {
                            if (urls.length > 0) {
                              setLogoImages(urls);
                              form.setValue("logoUrl", urls[0]);
                            }
                          }}
                          onImageRemove={() => {
                            setLogoImages([]);
                            form.setValue("logoUrl", "");
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: "160px",
                          height: "160px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          position: "relative",
                        }}
                        className="mx-auto bg-muted"
                      >
                        {form.watch("logoUrl") ? (
                          <img
                            src={form.watch("logoUrl")}
                            alt="Profile Logo"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserCircle className="w-3/4 h-3/4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    )}
                    {form.formState.errors.logoUrl && (
                      <p className="text-destructive text-sm text-center">
                        {form.formState.errors.logoUrl.message?.toString()}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    <FormField
                      control={form.control}
                      name="serviceProviderType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facility Partner Type</FormLabel>
                          <Select
                            disabled={!isEditing}
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SERVICE_PROVIDER_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="serviceName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facility Partner Name</FormLabel>
                          <FormControl>
                            <Input
                              disabled={!isEditing}
                              {...field}
                              value={field.value || ""}
                              placeholder={
                                isEditing
                                  ? "Enter service name"
                                  : "Not provided"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="websiteUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website URL (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              disabled={!isEditing}
                              type="url"
                              {...field}
                              value={field.value || ""}
                              placeholder={
                                isEditing ? "Enter website URL" : "Not provided"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gstNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GST Number(Optional)</FormLabel>
                          <FormControl>
                            <Input
                              disabled={!isEditing}
                              {...field}
                              value={field.value || ""}
                              placeholder={
                                isEditing ? "Enter GST number" : "Not provided"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="applyGst"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apply GST</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex flex-row gap-6 sm:grid sm:grid-cols-2 sm:gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="yes"
                                  id="yes"
                                  disabled={!isEditing}
                                />
                                <Label htmlFor="yes" className="text-sm">
                                  Yes
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="no"
                                  id="no"
                                  disabled={!isEditing}
                                />
                                <Label htmlFor="no" className="text-sm">
                                  No
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="settlementType"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Settlement Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex flex-row gap-6 sm:grid sm:grid-cols-2 sm:gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="monthly"
                                  id="monthly"
                                  disabled={!isEditing}
                                />
                                <Label htmlFor="monthly" className="text-sm">
                                  Monthly
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="weekly"
                                  id="weekly"
                                  disabled={!isEditing}
                                />
                                <Label htmlFor="weekly" className="text-sm">
                                  Weekly
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* <FormField
                      name="invoiceType"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2 xl:col-span-3">
                          <FormLabel>Invoice Type *</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                               disabled={!isEditing}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="self" id="self"  disabled={!isEditing}/>
                                <Label htmlFor="self" className="text-sm">Self Invoice</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="cumma" id="cumma"  disabled={!isEditing}/>
                                <Label htmlFor="cumma" className="text-sm">Cumma Invoice</Label>
                                <a
                                  href="/pdf/cummainvoice.html"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline text-blue-400 text-xs"
                                >
                                  (view)
                                </a>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Conditional Template Field if 'self' is selected 
                    {form.watch("invoiceType") === "self" && (
                      <FormField
                        name="invoiceTemplate"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2 xl:col-span-3 pt-4">
                            <FormLabel>Invoice Template *</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="template1" id="template1" disabled={!isEditing}/>
                                  <Label htmlFor="template1" className="text-sm">Template 1</Label>
                                  <a
                                    href="/pdf/template1.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline text-blue-400 text-xs"
                                  >
                                    (view)
                                  </a>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="template2" id="template2"  disabled={!isEditing}/>
                                  <Label htmlFor="template2" className="text-sm">Template 2</Label>
                                  <a
                                    href="/pdf/template2.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline text-blue-400 text-xs"
                                  >
                                    (view)
                                  </a>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )} */}
                  </div>
                </CardContent>
              </Card>

              <Card className="max-w-7xl mx-auto">
                <CardContent className="pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-3">
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input
                              disabled={!isEditing}
                              {...field}
                              value={field.value || ""}
                              placeholder={
                                isEditing ? "Enter address" : "Not provided"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input
                              disabled={!isEditing}
                              {...field}
                              value={field.value || ""}
                              placeholder={
                                isEditing ? "Enter city" : "Not provided"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stateProvince"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province</FormLabel>
                          <FormControl>
                            <Input
                              disabled={!isEditing}
                              {...field}
                              value={field.value || ""}
                              placeholder={
                                isEditing
                                  ? "Enter state/province"
                                  : "Not provided"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zipPostalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP/Postal Code</FormLabel>
                          <FormControl>
                            <Input
                              disabled={!isEditing}
                              {...field}
                              value={field.value || ""}
                              placeholder={
                                isEditing
                                  ? "Enter ZIP/postal code"
                                  : "Not provided"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 sm:space-y-6 mt-6 sm:mt-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-lg sm:text-xl font-semibold">
                          Operating Hours
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Set your facility's operating hours for each day of
                          the week.
                        </p>
                      </div>

                      {/* Apply to All Controls */}
                      {isEditing && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                          <select
                            value={templateDay}
                            onChange={(e) => setTemplateDay(e.target.value)}
                            className="px-3 py-2 border rounded-md text-sm bg-background flex-1 sm:flex-none"
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
                            className="flex items-center gap-2 w-full sm:w-auto"
                          >
                            <Copy className="h-4 w-4" />
                            Apply All
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                            <h4 className="font-medium capitalize flex items-center gap-2 text-sm sm:text-base">
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
                                      disabled={!isEditing}
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal text-sm">
                                    Open
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          </div>

                          {timingsValue &&
                            timingsValue[day as keyof typeof timingsValue]
                              ?.isOpen && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`timings.${day}.openTime` as any}
                                  render={({ field }) => (
                                    <FormItem>
                                      <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <FormLabel className="text-sm">
                                          Opening Time
                                        </FormLabel>
                                      </div>
                                      <FormControl>
                                        <Input
                                          disabled={!isEditing}
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
                                        <FormLabel className="text-sm">
                                          Closing Time
                                        </FormLabel>
                                      </div>
                                      <FormControl>
                                        <Input
                                          disabled={!isEditing}
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6 sm:space-y-8">
              <Card className="max-w-7xl mx-auto">
                <CardContent className="pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <FormField
                      control={form.control}
                      name="primaryContact1Name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Contact Name</FormLabel>
                          <FormControl>
                            <Input
                              disabled={!isEditing}
                              {...field}
                              value={field.value || ""}
                              placeholder={
                                isEditing
                                  ? "Enter primary contact name"
                                  : "Not provided"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="primaryContact1Designation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Contact Designation</FormLabel>
                          <FormControl>
                            <Input
                              disabled={!isEditing}
                              {...field}
                              value={field.value || ""}
                              placeholder={
                                isEditing
                                  ? "Enter primary contact designation"
                                  : "Not provided"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="primaryContactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Contact Number</FormLabel>
                          <FormControl>
                            <Input
                              disabled={!isEditing}
                              {...field}
                              value={field.value || ""}
                              placeholder={
                                isEditing
                                  ? "Enter primary contact number"
                                  : "Not provided"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="primaryEmailId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Email</FormLabel>
                          <FormControl>
                            <Input
                              disabled={!isEditing}
                              type="email"
                              {...field}
                              value={field.value || ""}
                              placeholder={
                                isEditing
                                  ? "Enter primary email"
                                  : "Not provided"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contact2Name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Secondary Contact Name (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={!isEditing}
                              {...field}
                              value={field.value || ""}
                              placeholder={
                                isEditing
                                  ? "Enter secondary contact name"
                                  : "Not provided"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contact2Designation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Secondary Contact Designation (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={!isEditing}
                              {...field}
                              value={field.value || ""}
                              placeholder={
                                isEditing
                                  ? "Enter secondary contact designation"
                                  : "Not provided"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="alternateContactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Alternate Contact Number (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={!isEditing}
                              {...field}
                              value={field.value || ""}
                              placeholder={
                                isEditing
                                  ? "Enter alternate contact number"
                                  : "Not provided"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="alternateEmailId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alternate Email (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              disabled={!isEditing}
                              type="email"
                              {...field}
                              value={field.value || ""}
                              placeholder={
                                isEditing
                                  ? "Enter alternate email"
                                  : "Not provided"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bank" className="space-y-6 sm:space-y-8">
              <Card className="max-w-7xl mx-auto">
                <CardContent className="pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                          <FormControl>
                            <Input
                              disabled={!isEditing}
                              {...field}
                              value={field.value || ""}
                              placeholder={
                                isEditing ? "Enter bank name" : "Not provided"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input
                              disabled={!isEditing}
                              {...field}
                              value={field.value || ""}
                              placeholder={
                                isEditing
                                  ? "Enter account number"
                                  : "Not provided"
                              }
                              onChange={(e) => {
                                field.onChange(e);
                                // Clear confirmation field when account number changes
                                if (isEditing) {
                                  form.setValue("confirmAccountNumber", "");
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Confirmation field - show in editing mode or when account number exists */}
                    {(isEditing || form.watch("accountNumber")) && (
                      <FormField
                        control={form.control}
                        name="confirmAccountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Confirm Account Number
                              {form.watch("accountNumber") &&
                                form.watch("accountNumber").trim() !== "" && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                            </FormLabel>
                            <FormControl>
                              <Input
                                disabled={!isEditing}
                                {...field}
                                value={field.value || ""}
                                placeholder={
                                  isEditing
                                    ? "Re-enter account number to confirm"
                                    : form.watch("accountNumber") ||
                                      "Not provided"
                                }
                                className={
                                  form.formState.errors.confirmAccountNumber
                                    ? "border-red-500 focus:border-red-500"
                                    : ""
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="ifscCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IFSC Code</FormLabel>
                          <FormControl>
                            <Input
                              disabled={!isEditing}
                              {...field}
                              value={field.value || ""}
                              placeholder={
                                isEditing ? "Enter IFSC code" : "Not provided"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accountHolderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Holder Name</FormLabel>
                          <FormControl>
                            <Input
                              disabled={!isEditing}
                              {...field}
                              value={field.value || ""}
                              placeholder={
                                isEditing
                                  ? "Enter account holder name"
                                  : "Not provided"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="branchName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch Name</FormLabel>
                          <FormControl>
                            <Input
                              disabled={!isEditing}
                              {...field}
                              value={field.value || ""}
                              placeholder={
                                isEditing ? "Enter branch name" : "Not provided"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="amenities" className="space-y-6 sm:space-y-8">
              <Card className="max-w-7xl mx-auto">
                <CardContent className="pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-lg sm:text-xl mb-4">
                        Amenities & Features *
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select the amenities and features available across all
                        your facilities. This is required.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {AMENITIES.map((feature) => (
                          <FormField
                            key={feature}
                            control={form.control}
                            name="features"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    disabled={!isEditing}
                                    checked={field.value?.includes(feature)}
                                    onCheckedChange={(checked) => {
                                      const value = field.value || [];
                                      if (checked) {
                                        field.onChange([...value, feature]);
                                      } else {
                                        field.onChange(
                                          value.filter((f) => f !== feature)
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-sm leading-tight">
                                  {feature}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 sm:mt-8">
                      <h3 className="font-medium text-lg sm:text-xl mb-4">
                        Facility Images *
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload images of your facility to showcase your space to
                        startups. This is required.
                      </p>

                      <FormField
                        control={form.control}
                        name="images"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              {isEditing ? (
                                <ImageUpload
                                  value={field.value || []}
                                  onChange={(urls) => {
                                    field.onChange(urls);
                                    setFacilityImages(urls);
                                  }}
                                  onRemove={(url) => {
                                    const filteredUrls = field.value.filter(
                                      (item) => item !== url
                                    );
                                    field.onChange(filteredUrls);
                                    setFacilityImages(filteredUrls);
                                  }}
                                  disabled={!isEditing}
                                />
                              ) : (
                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                                  {field.value && field.value.length > 0 ? (
                                    field.value.map((url) => (
                                      <div
                                        key={url}
                                        className="relative aspect-square rounded-lg border border-gray-200"
                                      >
                                        <img
                                          src={url}
                                          alt="Facility"
                                          className="rounded-lg object-cover w-full h-full"
                                        />
                                      </div>
                                    ))
                                  ) : (
                                    <div className="col-span-full text-center py-8 text-muted-foreground">
                                      No facility images uploaded
                                    </div>
                                  )}
                                </div>
                              )}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {isEditing && (
            <div className="flex justify-end max-w-7xl mx-auto px-4 sm:px-0">
              <Button 
                type="submit" 
                size="lg" 
                className="w-full sm:w-auto"
                onClick={(e) => {
                  if (!isLastTab) {
                    e.preventDefault();
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex < tabs.length - 1) {
                      const nextTab = tabs[currentIndex + 1];
                      setActiveTab(nextTab);
                      // Scroll to top of form
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }
                }}
              >
                <Save className="h-5 w-5 mr-2" />
                {isLastTab ? 'Save Changes' : 'Save and Proceed'}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
