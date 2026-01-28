"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Minimal schema for initial email submission
const startupEmailSignUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Schema for password login
const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

// Schema for setting new password
const setPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password do not match",
  path: ["confirmPassword"],
});

type EmailFormData = z.infer<typeof startupEmailSignUpSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type SetPasswordFormData = z.infer<typeof setPasswordSchema>;

export default function StartupSignUpAffiliate() {
  const router = useRouter();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSetPasswordOpen, setIsSetPasswordOpen] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");
const apiUrl = "http://localhost:3001";


  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
    setError: setEmailError,
  } = useForm<EmailFormData>({
    resolver: zodResolver(startupEmailSignUpSchema),
    defaultValues: { email: "" },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });

  const {
    register: registerSetPassword,
    handleSubmit: handleSetPasswordSubmit,
    formState: { errors: setPasswordErrors },
    reset: resetSetPassword,
  } = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onEmailSubmit = async (data: EmailFormData) => {
    setIsSubmitting(true);
    try {
      // const response = await fetch(`/api/affiliate/affiliate-startup-check`, {
      const response = await fetch(`${apiUrl}/api/affiliate/check`, {
      method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to validate email");
      }

      setCurrentEmail(data.email);
      if (result.existsInUsers) {
        if (result.hasPassword) {
          setShowPasswordField(true);
        } else {
          setIsSetPasswordOpen(true);
        }
      } else {
        setIsSetPasswordOpen(true);
      }
    } catch (error: any) {
      setEmailError("root", {
        message: error.message || "Failed to validate email",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsSubmitting(true);
    try {
      // const signInResult = await signIn("credentials", {
       await login({
        email: currentEmail,
        password: data.password,
        redirect: false,
      });

      // if (signInResult?.error) {
      //   throw new Error(signInResult.error);
      // }

      router.push("/startup/dashboard");
    } catch (error: any) {
      // setEmailError("root", {
      //   message: error.message || "Login failed. Please try again.",
      // });
      const msg = error.response?.data?.message || "Login failed. Please try again.";
      setEmailError("root", { message: msg });
    } finally {
      setIsSubmitting(false);
      resetPassword();
    }
  };

  const onSetPasswordSubmit = async (data: SetPasswordFormData) => {
    setIsSubmitting(true);
    try {
      // const response = await fetch("/api/affiliate/affiliate-startup-set-password", {
      const response = await fetch(`${apiUrl}/api/affiliate/set-password`, {
      method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentEmail, password: data.password }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to set password");
      }

      // const signInResult = await login({
      await login({
        email: currentEmail,
        password: data.password,
        redirect: false,
      });

      // if (signInResult?.error) {
      //   throw new Error(signInResult.error);
      // }

      router.push("/startup/dashboard");
    } catch (error: any) {
     const msg = error.response?.data?.message || error.message || "Failed to set password";
      setEmailError("root", { message: msg });
    } finally {
      setIsSubmitting(false);
      setIsSetPasswordOpen(false);
      resetSetPassword();
    }
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Sign Up as a Startup (Affiliate)</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email to join our platform via affiliate link.
        </p>
      </div>

      {emailErrors.root && (
        <Alert variant="destructive" className="text-left">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>{emailErrors.root.message}</AlertDescription>
        </Alert>
      )}

      {!showPasswordField ? (
        <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Input
              {...registerEmail("email")}
              type="email"
              placeholder="Your Email *"
              className="h-12"
            />
            {emailErrors.email && (
              <p className="text-sm text-destructive">{emailErrors.email.message}</p>
            )}
          </div>
          <LoadingButton type="submit" className="w-full h-12 bg-[#009f2de6] text-[#0a0b0a]" loading={isSubmitting}>
            Continue <span className="ml-2">→</span>
          </LoadingButton>
        </form>
      ) : (
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
          <div className="space-y-2 relative">
            <Input
              {...registerPassword("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password *"
              className="h-12 pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {/* {showPassword ? <EyeOff size={20} /> : <Eye size={20} />} */}
            </button>
            {passwordErrors.password && (
              <p className="text-sm text-destructive">{passwordErrors.password.message}</p>
            )}
          </div>
          <LoadingButton type="submit" className="w-full h-12 bg-[#009f2de6] text-[#0a0b0a]" loading={isSubmitting}>
            Sign In <span className="ml-2">→</span>
          </LoadingButton>
        </form>
      )}

      <Dialog open={isSetPasswordOpen} onOpenChange={setIsSetPasswordOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#0a0b0a]">Create Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSetPasswordSubmit(onSetPasswordSubmit)} className="space-y-4">
            <div className="space-y-2 relative">
              <Input
                {...registerSetPassword("password")}
                type={showPassword ? "text" : "password"}
                placeholder="New Password *"
                className="h-12 pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {setPasswordErrors.password && (
                <p className="text-sm text-destructive">{setPasswordErrors.password.message}</p>
              )}
            </div>
            <div className="space-y-2 relative">
              <Input
                {...registerSetPassword("confirmPassword")}
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
              {setPasswordErrors.confirmPassword && (
                <p className="text-sm text-destructive">{setPasswordErrors.confirmPassword.message}</p>
              )}
            </div>
            <LoadingButton
              type="submit"
              className="w-full h-12 bg-[#009f2de6] text-[#0a0b0a]"
              loading={isSubmitting}
            >
              Set Password <span className="ml-2">→</span>
            </LoadingButton>
          </form>
        </DialogContent>
      </Dialog>

      {/* <div className="text-center text-sm">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div> */}
    </div>
  );
}
