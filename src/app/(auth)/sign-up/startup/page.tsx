"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// import { signIn } from 'next-auth/react'
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { startupSignUpSchema } from "@/lib/validations/auth";
// import { registerStartup } from '@/lib/actions/auth'
import { SECTORS, ENTITY_TYPES, LOOKING_FOR, CATEGORY } from "@/lib/constants";
import { INDUSTRIES, STAGES_COMPLETED } from "@/lib/constants/dropdowns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { error } from "console";

type FormData = z.infer<typeof startupSignUpSchema>;

export default function StartupSignUp() {
  const router = useRouter();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState("basic");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const apiUrl = "http://localhost:3001";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    trigger,
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(startupSignUpSchema),
    // defaultValues: {
    //   lookingFor: [],
    //   industry: undefined,
    //   sector: undefined,
    //   stagecompleted: undefined,
    //   entityType: undefined,
    //   category: undefined,
    //   // invoiceType: undefined,
    // },
  });

  const validateAllFields = async () => {
    const basicValid = await trigger([
      "email",
      "password",
      "confirmPassword",
      "contactNumber",
      "startupName",
      "terms",
      // 'category'
    ]);

    // const companyValid = await trigger([
    //   'startupName',
    //   // 'entityType',
    //   // 'address',
    //   // 'city',
    //   // 'state',
    //   // 'pincode',
    //   // 'country'
    // ]);

    // const additionalValid = await trigger([
    //   // 'industry',
    //   // 'sector',
    //   // 'stagecompleted',
    //   // 'lookingFor',
    //   // 'invoiceType',
    //   'terms'
    // ]);

    return basicValid;
    // && companyValid && additionalValid;
  };

  const onSubmit = async (data: FormData) => {
    try {
      // First validate all fields
      const isValid = await validateAllFields();
      if (!isValid) {
        setError("root", {
          message: "Please fill all required fields correctly",
        });
        return;
      }

      // const response = await fetch(`https://api.postalpincode.in/pincode/${data.pincode}`);
      // const result = await response.json();

      // if (!result || result[0]?.Status !== 'Success') {
      //   setError('pincode', {
      //     type: 'manual',
      //     message: 'This pincode does not exist in India.',
      //   });
      //   return;
      // }

      // ✅ Step 3: Register the startup with all form data
      // const registerResult = await registerStartup(data);
      // if (registerResult?.error) {
      //   throw new Error(registerResult.error);
      // }

      await axios.post(`${apiUrl}/api/affiliate/register`, data);

      // ✅ Step 4: Sign in the user
      // const signInResult = await signIn('credentials', {
      //   email: data.email,
      //   password: data.password,
      //   redirect: false,
      // });

      await login({
        email: data.email,
        password: data.password,
      });

      // if (signInResult?.error) {
      //   throw new Error(signInResult.error);
      // }

      // ✅ Step 5: Redirect to dashboard
      router.push("/startup/profile");
    } catch (error: any) {
      console.error("Registration error:", error);

     const serverMessage = error.response?.data?.message || error.response?.data?.error;
    
    // 2. Fallback to the generic error if the server didn't send a custom message
    const displayMessage = serverMessage || error.message || "Registration failed. Please try again.";

    setError("root", {
      message: displayMessage,
    });
    }
  };

  // const handleIndustryChange = (value: string) => {
  //   setValue('industry', value)
  //   trigger('industry')
  // }

  // const handleSectorChange = (value: string) => {
  //   setValue('sector', value)
  //   trigger('sector')
  // }

  // const handleStageCompletedChange = (value: string) => {
  //   setValue('stagecompleted', value)
  //   trigger('stagecompleted')
  // }

  // const handleCategoryChange = (value: string) => {
  //   setValue('category', value)
  //   trigger('category')
  // }

  // const handleEntityTypeChange = (value: string) => {
  //   setValue('entityType', value)
  //   trigger('entityType')
  // }

  // const handleInvoiceTypeChange = (value: string) => {
  //   setValue('invoiceType', value as "self" | "cumma")
  //   trigger('invoiceType')
  // }

  // const handleLookingForChange = (option: typeof LOOKING_FOR[number]) => {
  //   const currentValues = watch('lookingFor') || []
  //   const newValues = currentValues.includes(option)
  //     ? currentValues.filter(item => item !== option)
  //     : [...currentValues, option]

  //   setValue('lookingFor', newValues)
  //   trigger('lookingFor')
  // }

  const handleNext = async () => {
    let canProceed = false;

    if (activeTab === "basic") {
      const emailValid = await trigger("email");
      const passwordValid = await trigger("password");
      const confirmPasswordValid = await trigger("confirmPassword");
      const contactNumberValid = await trigger("contactNumber");
      // const categoryValid = await trigger('category')
      const startupNameValid = await trigger("startupName");
      canProceed =
        emailValid &&
        passwordValid &&
        confirmPasswordValid &&
        contactNumberValid &&
        startupNameValid;
      // && categoryValid
      // } else if (activeTab === 'company') {

      // const entityTypeValid = await trigger('entityType')
      // const addressValid = await trigger('address')
      // const cityValid = await trigger('city')
      // const stateValid = await trigger('state')
      // const pincodeValid = await trigger('pincode')
      // Additional pincode existence validation
      // if (pincodeValid) {
      //   const pincode = watch('pincode')
      //   try {
      //     const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      //     const result = await response.json()
      //     if (!result || result[0]?.Status !== 'Success') {
      //   setError('pincode', {
      //     type: 'manual',
      //     message: 'This pincode does not exist in India.',
      //   })
      //   return
      //     }
      //   } catch {
      //     setError('pincode', {
      //   type: 'manual',
      //   message: 'Failed to validate pincode. Please try again.',
      //     })
      //     return
      //   }
      // }
      // const countryValid = await trigger('country')

      // canProceed = startupNameValid && entityTypeValid && addressValid && cityValid && stateValid && pincodeValid && countryValid
    }

    // if (canProceed) {
    //   if (activeTab === 'basic') setActiveTab('company')
    //   else if (activeTab === 'company') setActiveTab('additional')
    // }
  };

  // const handleBack = () => {
  //   if (activeTab === 'company') setActiveTab('basic')
  //   else if (activeTab === 'additional') setActiveTab('company')
  // }

  // const handleGoogleSignUp = async () => {
  //   try {
  //     setGoogleLoading(true)
  //     await signIn('google', { callbackUrl: '/onboarding/startup' })
  //   } catch (error) {
  //     console.error('Google sign-up error:', error)
  //   } finally {
  //     setGoogleLoading(false)
  //   }
  // }

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Create a Startup Account</h1>
        <p className="text-muted-foreground text-sm">
          Join our platform to connect with service providers and grow your
          startup.
        </p>
      </div>

      {errors.root && (
        <Alert variant="destructive" className="text-left">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      <form
        onSubmit={handleSubmit(async (data) => {
          await onSubmit(data);
        })}
        className="space-y-4"
      >
        {/* <Tabs
         value={activeTab} onValueChange={setActiveTab}
          className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            {/* <TabsTrigger value="company">Company Details</TabsTrigger>
            <TabsTrigger value="additional">Additional Info</TabsTrigger> */}
        {/* </TabsList> */}

        {/* <TabsContent value="basic" className="space-y-4"> */}
        {/* <div className="space-y-4"> */}
        <div className="space-y-2">
          <Input
            {...register("email")}
            type="email"
            placeholder="Your Email *"
            className="h-12"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2 relative">
          <Input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Create Password *"
            className="h-12 pr-10"
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
            className="h-12 pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <h3 className="font-medium pt-2">Contact Details</h3>
        <div className="space-y-2">
          <Input
            {...register("contactNumber")}
            type="tel"
            placeholder="Contact Number *"
            className="h-12"
          />
          {errors.contactNumber && (
            <p className="text-sm text-destructive">
              {errors.contactNumber.message}
            </p>
          )}
        </div>
        {/* <div className="space-y-2">
                <Select
                  onValueChange={handleCategoryChange}
                  value={watch('category') || undefined}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select Category *" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div> */}
        <div className="space-y-2">
          <Input
            {...register("startupName")}
            type="text"
            placeholder="Company Name *"
            className="h-12"
          />
          {errors.startupName && (
            <p className="text-sm text-destructive">
              {errors.startupName.message}
            </p>
          )}
        </div>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 bg-muted/50 rounded-lg p-4">
            <Checkbox
              id="terms"
              onCheckedChange={(checked) => {
                if (checked) setValue("terms", true);
              }}
              className="mt-0.5"
            />
            <label
              htmlFor="terms"
              className="text-sm leading-tight text-muted-foreground"
            >
              By signing up, you agree to our terms of service and privacy
              policy. *
            </label>
          </div>
          {errors.terms && (
            <p className="text-sm text-destructive">{errors.terms.message}</p>
          )}
        </div>
        {/* </div>
          </TabsContent> */}

        {/* <TabsContent 
          value="basic" 
          className="space-y-4">
            <div className="space-y-4"> */}
        {/* <div className="space-y-2">
                <Select
                  onValueChange={handleEntityTypeChange}
                  value={watch('entityType') || undefined}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select Entity Type *" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTITY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.entityType && (
                  <p className="text-sm text-destructive">{errors.entityType.message}</p>
                )}
              </div> */}

        {/* <div className="space-y-2">
                <Input
                  {...register('founderName')}
                  type="text"
                  placeholder="Founder Name"
                  className="h-12"
                />
                {errors.founderName && (
                  <p className="text-sm text-destructive">{errors.founderName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  {...register('founderDesignation')}
                  type="text"
                  placeholder="Founder Designation"
                  className="h-12"
                />
                {errors.founderDesignation && (
                  <p className="text-sm text-destructive">{errors.founderDesignation.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  {...register('teamSize', { 
                    setValueAs: (value) => {
                      if (value === "") return undefined;
                      const parsed = parseInt(value, 10);
                      return isNaN(parsed) ? undefined : parsed;
                    }
                  })}
                  type="number"
                  placeholder="Team Size"
                  className="h-12"
                />
                {errors.teamSize && (
                  <p className="text-sm text-destructive">{errors.teamSize.message}</p>
                )}
              </div>

              <h3 className="font-medium pt-2">Address Information</h3>
              <div className="space-y-2">
                <Input
                  {...register('address')}
                  type="text"
                  placeholder="Address *"
                  className="h-12"
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  {...register('city')}
                  type="text"
                  placeholder="City *"
                  className="h-12"
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  {...register('state')}
                  type="text"
                  placeholder="State *"
                  className="h-12"
                />
                {errors.state && (
                  <p className="text-sm text-destructive">{errors.state.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  {...register('pincode')}
                  type="text"
                  placeholder="ZIP/Postal Code *"
                  className="h-12"
                />
                {errors.pincode && (
                  <p className="text-sm text-destructive">{errors.pincode.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  {...register('country')}
                  type="text"
                  placeholder="Country *"
                  className="h-12"
                />
                {errors.country && (
                  <p className="text-sm text-destructive">{errors.country.message}</p>
                )}
              </div> */}

        {/* </div>
          </TabsContent> */}

        {/* <TabsContent value="basic" className="space-y-6">
            <div className="space-y-6"> */}
        {/* <div className="space-y-4"> */}
        {/*   <h3 className="font-medium">Startup Details</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Select onValueChange={handleIndustryChange} value={watch('industry') || undefined}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select Industry *" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.industry && (
                      <p className="text-sm text-destructive">{errors.industry.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Select onValueChange={handleSectorChange} value={watch('sector') || undefined}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select Sector *" />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTORS.map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            {sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.sector && (
                      <p className="text-sm text-destructive">{errors.sector.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Select onValueChange={handleStageCompletedChange} value={watch('stagecompleted') || undefined}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select Stage *" />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGES_COMPLETED.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.stagecompleted && (
                      <p className="text-sm text-destructive">{errors.stagecompleted.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Looking For *</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {LOOKING_FOR.map((option) => (
                      <div key={option} className="flex items-start space-x-3">
                        <Checkbox
                          id={option}
                          checked={watch('lookingFor')?.includes(option)}
                          onCheckedChange={() => handleLookingForChange(option)}
                          className="mt-0.5"
                        />
                        <label
                          htmlFor={option}
                          className="text-sm leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Select all that apply to your startup's needs</p>
                </div>
                {errors.lookingFor && (
                  <p className="text-sm text-destructive">{errors.lookingFor.message}</p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Social Links (at least one required)</h3>
                <div className="grid gap-4"> */}
        {/* <div className="space-y-2">
                    <Input
                      {...register('website')}
                      type="url"
                      placeholder="Company Website URL"
                      className="h-12"
                    />
                    {errors.website && (
                      <p className="text-sm text-destructive">{errors.website.message}</p>
                    )}
                  </div> */}
        {/* <div className="space-y-2">
                    <Input
                      {...register('linkedinStartupUrl')}
                      type="url"
                      placeholder="Company LinkedIn URL"
                      className="h-12"
                    />
                    {errors.linkedinStartupUrl && (
                      <p className="text-sm text-destructive">{errors.linkedinStartupUrl.message}</p>
                    )}
                  </div> */}
        {/* <div className="space-y-2">
                    <Input
                      {...register('instagramurl')}
                      type="url"
                      placeholder="Company Instagram URL"
                      className="h-12"
                    />
                    {errors.instagramurl && (
                      <p className="text-sm text-destructive">{errors.instagramurl.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Input
                      {...register('twitterurl')}
                      type="url"
                      placeholder="Company Twitter URL"
                      className="h-12"
                    />
                    {errors.twitterurl && (
                      <p className="text-sm text-destructive">{errors.twitterurl.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Input
                      {...register('linkedinFounderUrl')}
                      type="url"
                      placeholder="Founder's LinkedIn URL"
                      className="h-12"
                    />
                    {errors.linkedinFounderUrl && (
                      <p className="text-sm text-destructive">{errors.linkedinFounderUrl.message}</p>
                    )}
                  </div> */}
        {/* </div>
              </div> */}

        {/* <div className="space-y-4">
                <h3 className="font-medium">Invoice Type *</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <RadioGroup
                    value={watch('invoiceType') || ''}
                    onValueChange={handleInvoiceTypeChange}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="self" id="self" />
                      <Label htmlFor="self" className="text-sm">Self</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cumma" id="cumma" />
                      <Label htmlFor="cumma" className="text-sm">Cumma</Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground mt-3">Select how you prefer to handle invoicing</p>
                </div>
                {errors.invoiceType && (
                  <p className="text-sm text-destructive">{errors.invoiceType.message}</p>
                )}
              </div> */}

        {/* <div className="space-y-4">
                <div className="flex items-start space-x-3 bg-muted/50 rounded-lg p-4">
                  <Checkbox
                    id="terms"
                    onCheckedChange={(checked) => {
                      if (checked) setValue('terms', true)
                    }}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm leading-tight text-muted-foreground"
                  >
                    By signing up, you agree to our terms of service and privacy policy. *
                  </label>
                </div>
                {errors.terms && (
                  <p className="text-sm text-destructive">{errors.terms.message}</p>
                )}
              </div>
            </div>
          </TabsContent> */}

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

          {/* {activeTab !== 'additional' ? (
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
            //  onClick={handleNext}
            loading={isSubmitting}
          >
            Create Account <span className="ml-2">→</span>
          </LoadingButton>
          {/* )} */}
        </div>
        {/* </Tabs> */}
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        {/* <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or
          </span>
        </div> */}
      </div>

      {/* <Button 
        type="button" 
        variant="outline" 
        className="w-full h-12 flex items-center justify-center gap-2"
        onClick={handleGoogleSignUp}
        disabled={googleLoading}
      >
        {googleLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.1711 8.36788H17.4998V8.33329H9.99984V11.6666H14.7094C14.0223 13.607 12.1761 15 9.99984 15C7.23859 15 4.99984 12.7612 4.99984 10C4.99984 7.23871 7.23859 5 9.99984 5C11.2744 5 12.4344 5.48683 13.3177 6.28537L15.6744 3.92871C14.1897 2.56204 12.195 1.66663 9.99984 1.66663C5.39775 1.66663 1.6665 5.39788 1.6665 10C1.6665 14.6021 5.39775 18.3333 9.99984 18.3333C14.6019 18.3333 18.3332 14.6021 18.3332 10C18.3332 9.44121 18.2757 8.89583 18.1711 8.36788Z" fill="#FFC107"/>
            <path d="M2.62744 6.12121L5.36536 8.12913C6.10619 6.29496 7.90036 5 9.99994 5C11.2745 5 12.4345 5.48683 13.3178 6.28537L15.6745 3.92871C14.1899 2.56204 12.1951 1.66663 9.99994 1.66663C6.79911 1.66663 4.02327 3.47371 2.62744 6.12121Z" fill="#FF3D00"/>
            <path d="M10 18.3334C12.1525 18.3334 14.1084 17.4755 15.5871 16.1542L13.008 13.9875C12.1432 14.6452 11.0865 15.0009 10 15C7.83255 15 5.99213 13.6179 5.2988 11.6892L2.5813 13.7829C3.96047 16.4817 6.7613 18.3334 10 18.3334Z" fill="#4CAF50"/>
            <path d="M18.1713 8.36796H17.5V8.33337H10V11.6667H14.7096C14.3809 12.5902 13.7889 13.3972 13.0067 13.9879L13.0079 13.9871L15.5871 16.1538C15.4046 16.3171 18.3333 14.1667 18.3333 10C18.3333 9.44129 18.2758 8.89591 18.1713 8.36796Z" fill="#1976D2"/>
          </svg>
        )}
        <span className="ml-2">Sign up with Google</span>
      </Button> */}

      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
