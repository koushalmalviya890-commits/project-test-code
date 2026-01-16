"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { registerServiceProvider } from "@/lib/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { AMENITIES } from "@/components/forms/types/index";
import { Eye, EyeOff } from "lucide-react";
import { Controller } from "react-hook-form";
// Define the service provider types
const SERVICE_PROVIDER_TYPES = [
  "Incubator",
  "Accelerator",
  "Institution/University",
  "Private Coworking Space",
  "Community Space",
  // "Studio",
  "R & D Labs",
  "Communities",
  "Investors",
  "Creators",
  "State Missions"
] as const;

// Update the form schema to include invoice type and proper types
// Update the form schema to include invoice type and proper types
const serviceProviderSignUpSchema = z
  .object({
    gstNumber: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) =>
          !val ||
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val),
        {
          message: "Invalid GST Number format",
        }
      ),
    applyGst: z.enum(["yes", "no"]).default("no"),
    email: z
      .string()
      .email("Invalid email address")
      .min(1, "Email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    serviceProviderType: z.enum([
    "Incubator",
  "Accelerator",
  "Institution/University",
  "Private Coworking Space",
  "Community Space",
  // "Studio",
  "R & D Labs",
  "Communities",
  "Investors",
  "Creators",
  "State Missions"
    ]),
    serviceName: z.string().min(1, "Organization name is required"),
    address: z.string().optional(),
    city: z.string().optional(),
    stateProvince: z.string().optional(),
    zipPostalCode: z.string().optional(),
    primaryContact1Name: z.string().optional(),
    primaryContact1Designation: z.string().optional(),
    primaryContactNumber: z
      .string()
      .min(1, "Primary contact number is required"),
    otp: z.string().optional(), // For OTP input
    isContactVerified: z.boolean().optional(), // To track verification status
    contact2Name: z.string().optional(),
    contact2Designation: z.string().optional(),
    alternateContactNumber: z.string().optional(),
    alternateEmailId: z.string().optional(),
    primaryEmailId: z.string().optional(),
    logoUrl: z.string().optional(),
    websiteUrl: z.string().optional(),
    invoiceType: z.enum(["self", "cumma"]).default("self"),
    settlementType: z.enum(["monthly", "weekly"]).default("monthly"),
    invoiceTemplate: z.enum(["template1", "template2"]).default("template1"),
    terms: z.literal(true, {
      errorMap: () => ({
        message: "You must agree to the terms and conditions",
      }),
    }),
    features: z.array(z.string()).default([]),
    images: z.array(z.string()).default([]),
    timings: z
      .object({
        monday: z.object({
          isOpen: z.boolean(),
          openTime: z.string().optional(),
          closeTime: z.string().optional(),
        }),
        tuesday: z.object({
          isOpen: z.boolean(),
          openTime: z.string().optional(),
          closeTime: z.string().optional(),
        }),
        wednesday: z.object({
          isOpen: z.boolean(),
          openTime: z.string().optional(),
          closeTime: z.string().optional(),
        }),
        thursday: z.object({
          isOpen: z.boolean(),
          openTime: z.string().optional(),
          closeTime: z.string().optional(),
        }),
        friday: z.object({
          isOpen: z.boolean(),
          openTime: z.string().optional(),
          closeTime: z.string().optional(),
        }),
        saturday: z.object({
          isOpen: z.boolean(),
          openTime: z.string().optional(),
          closeTime: z.string().optional(),
        }),
        sunday: z.object({
          isOpen: z.boolean(),
          openTime: z.string().optional(),
          closeTime: z.string().optional(),
        }),
      })
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof serviceProviderSignUpSchema>;

export default function ServiceProviderSignUp() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);


  // ⭐️ New State for OTP
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    trigger,
    setError,
    getValues,
    control,
  } = useForm<FormData>({
    resolver: zodResolver(serviceProviderSignUpSchema),
    defaultValues: {
      gstNumber: "",
      applyGst: "no",
      email: "",
      password: "",
      confirmPassword: "",
      serviceProviderType: undefined,
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
      logoUrl: "",
      websiteUrl: "",
      invoiceType: "self", // Set default value here
      invoiceTemplate: "template1",
      settlementType: "monthly", // Set default value here
      terms: false as unknown as true,
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

  // Inside your component
  const selectedInvoiceType = useWatch({
    control,
    name: "invoiceType",
  });

  // const primaryContactNumber = watch('primaryContactNumber');

  // const handleSendCode = async () => {
  //     setOtpLoading(true);
  //     setOtpError(null);
  //     const phoneNumber = getValues('primaryContactNumber');

  //     // 1. Validate the phone number format (optional, Zod can do this too)
  //     const isValid = await trigger('primaryContactNumber');
  //     if (!isValid) {
  //       setOtpLoading(false);
  //       return;
  //     }

  //     try {
  //       // ⚠️ You'll need to create this API route in app/api/auth/send-otp
  //       const response = await fetch('/api/auth/send-otp', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ phoneNumber }),
  //       });

  //       const data = await response.json();

  //       if (!response.ok || data.error) {
  //         throw new Error(data.error || 'Failed to send OTP.');
  //       }

  //       setIsCodeSent(true);
  //       setOtpError(null);
  //     } catch (error) {
  //       console.error('Send OTP error:', error);
  //       setOtpError(error instanceof Error ? error.message : 'An unexpected error occurred while sending code.');
  //       setIsCodeSent(false); // Keep the button visible
  //     } finally {
  //       setOtpLoading(false);
  //     }
  //   };

  //   // ⭐️ API Call to verify OTP
  //   const handleVerifyCode = async () => {
  //     setOtpLoading(true);
  //     setOtpError(null);
  //     const phoneNumber = getValues('primaryContactNumber');
  //     const otp = getValues('otp');

  //     if (!otp || otp.length < 4) { // Basic OTP validation
  //       setOtpError('Please enter the 4-digit OTP.');
  //       setOtpLoading(false);
  //       return;
  //     }

  //     try {
  //       // ⚠️ You'll need to create this API route in app/api/auth/verify-otp
  //       const response = await fetch('/api/auth/verify-otp', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ phoneNumber, otp }),
  //       });

  //       const data = await response.json();

  //       if (!response.ok || data.error) {
  //         throw new Error(data.error || 'Invalid OTP. Please try again.');
  //       }

  //       setIsVerified(true); // 🎉 Set verification state
  //       setValue('isContactVerified', true); // Update form data
  //       setOtpError(null);

  //     } catch (error) {
  //       console.error('Verify OTP error:', error);
  //       setOtpError(error instanceof Error ? error.message : 'An unexpected error occurred during verification.');
  //       setIsVerified(false);
  //       setValue('isContactVerified', false);
  //     } finally {
  //       setOtpLoading(false);
  //     }
  //   };

  const onSubmit = async (data: FormData) => {
    if (!data.terms) {
      setError("terms", {
        message: "You must agree to the terms and conditions",
      });
      return;
    }

    try {
      const formData = {
        ...data,
        applyGst: data.applyGst, // Ensure       applyGst is typed as "yes" | "no"
        contact2Name: data.contact2Name || null,
        contact2Designation: data.contact2Designation || null,
        alternateContactNumber: data.alternateContactNumber || null,
        primaryEmailId: data.email,
        features: data.features || [],
        images: data.images || [],
        timings: data.timings || {
          monday: { isOpen: false },
          tuesday: { isOpen: false },
          wednesday: { isOpen: false },
          thursday: { isOpen: false },
          friday: { isOpen: false },
          saturday: { isOpen: false },
          sunday: { isOpen: false },
        },
      };
      //// console.log("Submitting data:", formData);
      //// console.log("Submitting data:", formData.applyGst);
      const result = await registerServiceProvider(formData);

      if (result.success) {
        setIsRegistrationSuccess(true);
        window.scrollTo(0, 0); // Scroll to top to see message
        return;
        // fetch("/api/auth/send-welcome-whatsapp", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //     phoneNumber: formData.primaryContactNumber,
        //     name: formData.primaryContact1Name,
            
        //   }),
        // });
      }

      if (result.error) {
        throw new Error(result.error);
      }

      // const signInResult = await signIn("credentials", {
      //   email: data.email,
      //   password: data.password,
      //   redirect: false,
      // });

      // if (signInResult?.error) {
      //   throw new Error(signInResult.error);
      // }

      // router.push("/service-provider/dashboard");0
    } catch (error) {
      console.error("Registration error:", error);
      setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "Registration failed. Please try again.",
      });
    }
  };

  // const handleNext = () => {
  //   if (activeTab === "basic") {
  //     trigger([
  //       "email",
  //       "password",
  //       "confirmPassword",
  //       "serviceName",
  //       "serviceProviderType",
  //     ]).then((isValid) => {
  //       if (isValid) setActiveTab("contact");
  //     });
  //   } else if (activeTab === "contact") {
  //     trigger([
  //       "address",
  //       "city",
  //       "stateProvince",
  //       "zipPostalCode",
  //       "primaryContact1Name",
  //       "primaryContactNumber",
  //       "alternateEmailId",
  //       "websiteUrl",
  //       "invoiceType",
  //       "terms",
  //     ]).then((isValid) => {
  //       if (isValid) handleSubmit(onSubmit)();
  //     });
  //   }
  // };

  // const handleBack = () => {
  //   if (activeTab === "contact") {
  //     setActiveTab("basic");
  //   }
  // };

  // const handleGoogleSignUp = async () => {
  //   try {
  //     setGoogleLoading(true);
  //     await signIn("google", { callbackUrl: "/landing" });
  //   } catch (error) {
  //     console.error("Google sign-up error:", error);
  //   }
  // };


  if (isRegistrationSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 text-center py-10">
        <div className="rounded-full bg-green-100 p-3">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold">Application Submitted!</h2>
        <p className="text-muted-foreground max-w-md">
          Thank you for registering as a Service Provider. Your account is currently 
          <strong> pending approval</strong>. 
        </p>
        <p className="text-sm text-muted-foreground">
          Our team will review your details. Once approved, you will be able to log in.
        </p>
        <Button onClick={() => router.push('/')} variant="outline">
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Join As a Enabler</h1>
        <h4 className="text-md font-semibold">
          Enabler - Service Provider, Incubation, Institution, Private working
          space
        </h4>
        <p className="mt-2 text-sm text-muted-foreground">
          Please provide your email and password to create an account. Other
          details can be added later.
        </p>
      </div>

      {errors.root && (
        <Alert variant="destructive" className="text-left">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-2 h-auto p-0 bg-transparent">
            <TabsTrigger
              value="basic"
              className={cn(
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary",
                activeTab === "basic"
                  ? "bg-primary text-primary-foreground border-primary"
                  : ""
              )}
              onClick={() => setActiveTab("basic")}
            >
              Basic
            </TabsTrigger>
            {/* <TabsTrigger
              value="contact"
              className={cn(
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary",
                activeTab === 'contact' ? "bg-primary text-primary-foreground border-primary" : ""
              )}
              onClick={() => setActiveTab('contact')}
            >
              Contact
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="Email *"
                  className={cn(
                    "h-12",
                    errors.email &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 relative">
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password *"
                  className={cn(
                    "h-12 pr-10",
                    errors.password &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 relative">
                <Input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password *"
                  className={cn(
                    "h-12 pr-10",
                    errors.confirmPassword &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  {...register("serviceName")}
                  type="text"
                  placeholder="Organization Name *"
                  className={cn(
                    "h-12",
                    errors.serviceName &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.serviceName && (
                  <p className="text-sm text-destructive">
                    {errors.serviceName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Select
                  onValueChange={(value) =>
                    setValue("serviceProviderType", value as any)
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "h-12",
                      errors.serviceProviderType &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_PROVIDER_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.serviceProviderType && (
                  <p className="text-sm text-destructive">
                    Category is required
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  {...register("primaryContactNumber")}
                  type="tel"
                  placeholder="Primary Contact Number *"
                  className={cn(
                    "h-12",
                    errors.primaryContactNumber &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.primaryContactNumber && (
                  <p className="text-sm text-destructive">
                    {errors.primaryContactNumber.message}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                {/* <label className="text-sm font-medium">Apply GST *</label>
                <Controller
                  name="applyGst"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value === "no") {
                          setValue("gstNumber", "");
                        }
                      }}
                      value={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="applyGstYes" />
                        <Label htmlFor="applyGstYes" className="text-sm">
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="applyGstNo" />
                        <Label htmlFor="applyGstNo" className="text-sm">
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                />
                    {errors.applyGst && (
                      <p className="text-sm text-destructive">
                        {errors.applyGst.message}
                      </p>
                    )} */}
              </div>
               <div className="flex items-center space-x-2 mt-6">
                <Checkbox
                  id="terms"
                  onCheckedChange={(checked) => {
                    setValue('terms', checked === true ? true : false as unknown as true);
                  }}
                />
                <label
                  htmlFor="terms"
                  className={cn(
                    "text-sm text-muted-foreground",
                    errors.terms && "text-destructive"
                  )}
                >
                  <a href="/contracts/index.html" target="_blank" className="text-blue-500 hover:underline" rel="noopener noreferrer">
                    By Signing up, you agree to our terms of service and policy. *
                  </a>
                </label>
              </div>
              {errors.terms && (
                <p className="text-sm text-destructive">{errors.terms.message}</p>
              )}
            </div>
          </TabsContent>

          {/* <TabsContent value="contact" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Primary Contact</h3>
              <div className="space-y-2">
                <Input
                  {...register("primaryContact1Name")}
                  type="text"
                  placeholder="Primary Contact Name *"
                  className={cn(
                    "h-12",
                    errors.primaryContact1Name &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.primaryContact1Name && (
                  <p className="text-sm text-destructive">
                    {errors.primaryContact1Name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  {...register("primaryContact1Designation")}
                  type="text"
                  placeholder="Primary Contact Designation"
                  className={cn(
                    "h-12",
                    errors.primaryContact1Designation &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.primaryContact1Designation && (
                  <p className="text-sm text-destructive">
                    {errors.primaryContact1Designation.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  {...register("primaryContactNumber")}
                  type="tel"
                  placeholder="Primary Contact Number *"
                  className={cn(
                    "h-12",
                    errors.primaryContactNumber &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.primaryContactNumber && (
                  <p className="text-sm text-destructive">
                    {errors.primaryContactNumber.message}
                  </p>
                )}
              </div>

              {/* <div className="space-y-2">
  <div className="relative">
    <Input
      {...register('primaryContactNumber')}
      type="tel"
      placeholder="Primary Contact Number *"
     className={cn(
        "h-12",
        isCodeSent && "pr-24", // Adjust padding when button is visible
        isVerified ? "border-green-500" : errors.primaryContactNumber && "border-destructive focus-visible:ring-destructive"
      )}
      // Disable input after code is sent, but allow re-entering on error
      disabled={isCodeSent && !otpError && !isVerified} 
    />

    {/* The Send Code / Verified Badge */}
              {/* {!isVerified && (
      <LoadingButton
        type="button"
        onClick={handleSendCode}
        loading={otpLoading && !isCodeSent}
        className="absolute right-1 top-1/2 -translate-y-8 h-10 px-3 text-sm"
        // Button is disabled if:
        // 1. Phone number is empty or there's an error on it
        // 2. Code has already been sent and no error exists (waiting for OTP)
        disabled={!primaryContactNumber || !!errors.primaryContactNumber || isCodeSent || otpLoading}
        variant={isCodeSent ? "secondary" : "default"}
      >
        {isCodeSent ? 'Resend Code' : 'Send Code'}
      </LoadingButton>
    )}
    {isVerified && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-green-500 font-medium">Verified!</span>
    )}
  </div>
  {errors.primaryContactNumber && (
    <p className="text-sm text-destructive">{errors.primaryContactNumber.message}</p>
  )}
</div> */}

              {/* OTP Input and Verify Button (Conditionally Rendered) */}
              {/* {isCodeSent && !isVerified && (
  <div className="space-y-2">
    <div className="relative">
      <Input
        {...register('otp')}
        type="text"
        maxLength={4} // Assuming a 4-digit OTP
        placeholder="Enter 4-digit OTP *"
        className={cn(
          "h-12 pr-24",
          errors.otp && "border-destructive focus-visible:ring-destructive"
        )}
      />
      <LoadingButton
        type="button"
        onClick={handleVerifyCode}
        loading={otpLoading && isCodeSent}
        className="absolute right-1 top-1/2 -translate-y-1/2 h-10 px-3 text-sm"
        disabled={otpLoading || !watch('otp') || watch('otp')!.length !== 4}
      >
        Verify
      </LoadingButton>
    </div>
    {errors.otp && (
      <p className="text-sm text-destructive">{errors.otp.message}</p>
    )}
  </div>
)} */}

              {/* OTP Error Display */}
              {/* {otpError && (
  <Alert variant="destructive" className="text-left">
    <ExclamationTriangleIcon className="h-4 w-4" />
    <AlertDescription>
      {otpError}
    </AlertDescription>
  </Alert>
)} */}

              {/* <h3 className="text-lg font-medium mt-6">Address</h3>
              <div className="space-y-2">
                <Input
                  {...register('address')}
                  type="text"
                  placeholder="Address *"
                  className={cn(
                    "h-12",
                    errors.address && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    {...register('city')}
                    type="text"
                    placeholder="City *"
                    className={cn(
                      "h-12",
                      errors.city && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {errors.city && (
                    <p className="text-sm text-destructive">{errors.city.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Input
                    {...register('stateProvince')}
                    type="text"
                    placeholder="State/Province *"
                    className={cn(
                      "h-12",
                      errors.stateProvince && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {errors.stateProvince && (
                    <p className="text-sm text-destructive">{errors.stateProvince.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Input
                  {...register('zipPostalCode')}
                  type="text"
                  placeholder="ZIP/Postal Code *"
                  className={cn(
                    "h-12",
                    errors.zipPostalCode && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.zipPostalCode && (
                  <p className="text-sm text-destructive">{errors.zipPostalCode.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  {...register('alternateEmailId', {
                    setValueAs: (value) => value === "" ? undefined : value
                  })}
                  type="email"
                  placeholder="Alternate Email ID"
                  className={cn(
                    "h-12",
                    errors.alternateEmailId && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.alternateEmailId && (
                  <p className="text-sm text-destructive">{errors.alternateEmailId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  {...register('websiteUrl', {
                    setValueAs: (value) => value === "" ? undefined : value
                  })}
                  type="url"
                  placeholder="Website URL"
                  className={cn(
                    "h-12",
                    errors.websiteUrl && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.websiteUrl && (
                  <p className="text-sm text-destructive">{errors.websiteUrl.message}</p>
                )}
              </div> */}

              {/* <div className="space-y-3">
                <label className="text-sm font-medium">Apply GST *</label>
                <Controller
                  name="applyGst"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value === "no") {
                          setValue("gstNumber", "");
                        }
                      }}
                      value={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="applyGstYes" />
                        <Label htmlFor="applyGstYes" className="text-sm">
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="applyGstNo" />
                        <Label htmlFor="applyGstNo" className="text-sm">
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                />
                {errors.applyGst && (
                  <p className="text-sm text-destructive">
                    {errors.applyGst.message}
                  </p>
                )}
              </div>

              {watch("applyGst") === "yes" && (
                <div className="space-y-2">
                  <Input
                    {...register("gstNumber")}
                    type="text"
                    placeholder="GST Number *"
                    className={cn(
                      "h-12",
                      errors.gstNumber &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {errors.gstNumber && (
                    <p className="text-sm text-destructive">
                      {errors.gstNumber.message}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-2 mt-6">
                <Checkbox
                  id="terms"
                  onCheckedChange={(checked) => {
                    setValue(
                      "terms",
                      checked === true ? true : (false as unknown as true)
                    );
                  }}
                />
                <label
                  htmlFor="terms"
                  className={cn(
                    "text-sm text-muted-foreground",
                    errors.terms && "text-destructive"
                  )}
                >
                  <a
                    href="/contracts/index.html"
                    target="_blank"
                    className="text-blue-500 hover:underline"
                    rel="noopener noreferrer"
                  >
                    By Signing up, you agree to our terms of service and policy.
                    *
                  </a>
                </label>
              </div>
              {errors.terms && (
                <p className="text-sm text-destructive">
                  {errors.terms.message}
                </p>
              )}
            </div> */}
          {/* </TabsContent>  */}

          <div className="flex gap-4 justify-end mt-6">
            {/* {activeTab !== 'basic' && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="h-12"
              >
                Back
              </Button>
            )} */}

            {/* {activeTab !== 'contact' ? (
              <Button
                type="button"
                onClick={handleNext}
                className="h-12"
              >
                Next <span className="ml-2">→</span>
              </Button>
            ) : ( */}
            <LoadingButton
              type="submit"
              className="h-12"
              loading={isSubmitting}
              // disabled={isSubmitting || !isVerified}
            >
              Create Account <span className="ml-2">→</span>
            </LoadingButton>
            {/* )} */}
          </div>
        </Tabs>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
      </div>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
        .
      </div>
    </div>
  );
}

{
  /* <div className="space-y-3">
              <label className="text-sm font-medium">Settlement Type *</label>
              <Controller
                name="settlementType"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly" className="text-sm">Monthly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weekly" id="weekly" />
                      <Label htmlFor="weekly" className="text-sm">Weekly</Label>
                    </div>
                  </RadioGroup>
                )}
              />
              {errors.settlementType && (
                <p className="text-sm text-destructive">{errors.settlementType.message}</p>
              )}
            </div> */
}

{
  /* <div className="space-y-3">
  <label className="text-sm font-medium">Invoice Type *</label>
  <Controller
    name="invoiceType"
    control={control}
    render={({ field }) => (
      <RadioGroup
        onValueChange={field.onChange}
        value={field.value}
        className="grid grid-cols-2 gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="self" id="self" />
          <Label htmlFor="self" className="text-sm">Self Invoice</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="cumma" id="cumma" />
          <Label htmlFor="cumma" className="text-sm">Cumma Invoice</Label>
          <a href='/pdf/cummainvoice.html' target='_blank' rel="noopener noreferrer" className='underline text-blue-400 text-xs'>(view)</a>
        </div>
      </RadioGroup>
    )}
  />
  {errors.invoiceType && (
    <p className="text-sm text-destructive">{errors.invoiceType.message}</p>
  )}

 
  {selectedInvoiceType === "self" && (
    <div className="space-y-3 pt-4">
      <label className="text-sm font-medium">Invoice Template *</label>
      <Controller
        name="invoiceTemplate"
        control={control}
        render={({ field }) => (
          <RadioGroup
            onValueChange={field.onChange}
            value={field.value}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="template1" id="template1" />
              <Label htmlFor="template1" className="text-sm">Template 1</Label> 
              <a href='/pdf/template1.html' className='underline text-blue-400 text-xs' target="_blank" rel="noopener noreferrer">
             (view)
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="template2" id="template2" />

              <Label htmlFor="template2" className="text-sm">Template 2</Label>

              <a href='/pdf/template2.html' className='underline text-blue-400 text-xs' target="_blank" rel="noopener noreferrer"> 
             (view)
              </a>
            </div>
          </RadioGroup>
        )}
      />
      {errors.invoiceTemplate && (
        <p className="text-sm text-destructive">{errors.invoiceTemplate.message}</p>
      )}
    </div>
  )}
</div> */
}
