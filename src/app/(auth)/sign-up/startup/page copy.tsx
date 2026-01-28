"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { startupSignUpSchema } from "@/lib/validations/auth";
import { registerStartup } from "@/lib/actions/auth";
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

type FormData = z.infer<typeof startupSignUpSchema>;

export default function StartupSignUp() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  });

  const validateAllFields = async () => {
    const basicValid = await trigger([
      "email",
      "password",
      "confirmPassword",
      "contactNumber",
      "startupName",
      "terms",
    ]);
    return basicValid;
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
      const registerResult = await registerStartup(data);
      if (registerResult?.error) {
        throw new Error(registerResult.error);
      }

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      router.push("/startup/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      setError("root", {
        message: error.message || "Registration failed. Please try again.",
      });
    }
  };

  const handleNext = async () => {
    let canProceed = false;

    if (activeTab === "basic") {
      const emailValid = await trigger("email");
      const passwordValid = await trigger("password");
      const confirmPasswordValid = await trigger("confirmPassword");
      const contactNumberValid = await trigger("contactNumber");
      const startupNameValid = await trigger("startupName");
      canProceed =
        emailValid &&
        passwordValid &&
        confirmPasswordValid &&
        contactNumberValid &&
        startupNameValid;
    }
  };
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
        onSubmit={handleSubmit(
          async (data) => {
            await onSubmit(data);
          },
          (errors) => {},
        )}
        className="space-y-4"
      >
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

        <div className="flex gap-4 justify-end mt-6">
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
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
      </div>

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
