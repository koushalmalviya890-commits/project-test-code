// // // "use client"

// // // import Link from 'next/link'
// // // import { useForm } from 'react-hook-form'
// // // import { zodResolver } from '@hookform/resolvers/zod'
// // // import * as z from 'zod'
// // // import { useState } from 'react'
// // // import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

// // // import { Input } from '@/components/ui/input'
// // // import { LoadingButton } from '@/components/ui/loading-button'
// // // import { Alert, AlertDescription } from '@/components/ui/alert'
// // // import { ExclamationTriangleIcon, CheckIcon } from '@radix-ui/react-icons'
// // // import { cn } from '@/lib/utils'
// // // import { useRouter } from 'next/navigation'

// // // const resetPasswordSchema = z.object({
// // //   email: z.string().email('Invalid email address').min(1, 'Email is required'),
// // //   newPassword: z.string().min(8, 'Password must be at least 8 characters'),
// // //   confirmPassword: z.string().min(1, 'Please confirm your password'),
// // // }).refine((data) => data.newPassword === data.confirmPassword, {
// // //   message: "Passwords don't match",
// // //   path: ['confirmPassword'],
// // // })

// // // type FormData = z.infer<typeof resetPasswordSchema>

// // // export default function ForgotPassword() {
// // //   const [isSuccess, setIsSuccess] = useState(false)
// // //   const [errorMessage, setErrorMessage] = useState<string | null>(null)
// // //   const [showPassword, setShowPassword] = useState(false)
// // //   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
// // //   const router = useRouter()

// // //   const {
// // //     register,
// // //     handleSubmit,
// // //     formState: { errors, isSubmitting },
// // //   } = useForm<FormData>({
// // //     resolver: zodResolver(resetPasswordSchema),
// // //   })

// // //   const onSubmit = async (data: FormData) => {
// // //     try {
// // //       // Reset previous states
// // //       setErrorMessage(null)
// // //       setIsSuccess(false)

// // //       // Make API call to directly update the password
// // //       const response = await fetch('/api/auth/reset-password-direct', {
// // //         method: 'POST',
// // //         headers: {
// // //           'Content-Type': 'application/json',
// // //         },
// // //         body: JSON.stringify({ 
// // //           email: data.email,
// // //           password: data.newPassword
// // //         }),
// // //       })

// // //       if (!response.ok) {
// // //         const errorData = await response.json()
// // //         throw new Error(errorData.error || 'Failed to reset password')
// // //       }

// // //       // Show success message
// // //       setIsSuccess(true)
      
// // //       // Redirect to login page after 3 seconds
// // //       setTimeout(() => {
// // //         router.push('/sign-in')
// // //       }, 3000)
// // //     } catch (error) {
// // //       console.error('Password reset error:', error)
// // //       setErrorMessage(error instanceof Error ? error.message : 'An error occurred while processing your request')
// // //     }
// // //   }

// // //   return (
// // //     <div className="space-y-6">
// // //       <div className="flex items-center mb-4">
// // //         <Link href="/sign-in" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
// // //           <ArrowLeft className="mr-2 h-4 w-4" />
// // //           Back to sign in
// // //         </Link>
// // //       </div>

// // //       <div className="text-center">
// // //         <h1 className="text-2xl font-semibold">Reset your password</h1>
// // //         <p className="mt-2 text-sm text-muted-foreground">
// // //           Enter your email and set a new password
// // //         </p>
// // //       </div>

// // //       {errorMessage && (
// // //         <Alert variant="destructive" className="text-left">
// // //           <ExclamationTriangleIcon className="h-4 w-4" />
// // //           <AlertDescription>{errorMessage}</AlertDescription>
// // //         </Alert>
// // //       )}

// // //       {isSuccess ? (
// // //         <div className="space-y-6">
// // //           <Alert className="bg-green-50 text-green-800 border-green-200">
// // //             <CheckIcon className="h-4 w-4 text-green-600" />
// // //             <AlertDescription className="text-green-700">
// // //               Your password has been successfully reset. You will be redirected to the login page shortly.
// // //             </AlertDescription>
// // //           </Alert>
// // //         </div>
// // //       ) : (
// // //         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
// // //           <div className="space-y-2">
// // //             <Input
// // //               {...register('email')}
// // //               type="email"
// // //               placeholder="Enter your email address"
// // //               className={cn(
// // //                 "h-12",
// // //                 errors.email && "border-destructive focus-visible:ring-destructive"
// // //               )}
// // //               aria-invalid={!!errors.email}
// // //             />
// // //             {errors.email && (
// // //               <p className="text-sm font-medium text-destructive">{errors.email.message}</p>
// // //             )}
// // //           </div>

// // //           <div className="space-y-2 relative">
// // //             <Input
// // //               {...register('newPassword')}
// // //               type={showPassword ? "text" : "password"}
// // //               placeholder="Enter new password"
// // //               className={cn(
// // //                 "h-12 pr-10",
// // //                 errors.newPassword && "border-destructive focus-visible:ring-destructive"
// // //               )}
// // //               aria-invalid={!!errors.newPassword}
// // //             />
// // //             <button
// // //               type="button"
// // //               className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
// // //               onClick={() => setShowPassword(!showPassword)}
// // //             >
// // //               {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
// // //             </button>
// // //             {errors.newPassword && (
// // //               <p className="text-sm font-medium text-destructive">{errors.newPassword.message}</p>
// // //             )}
// // //           </div>
          
// // //           <div className="space-y-2 relative">
// // //             <Input
// // //               {...register('confirmPassword')}
// // //               type={showConfirmPassword ? "text" : "password"}
// // //               placeholder="Confirm new password"
// // //               className={cn(
// // //                 "h-12 pr-10",
// // //                 errors.confirmPassword && "border-destructive focus-visible:ring-destructive"
// // //               )}
// // //               aria-invalid={!!errors.confirmPassword}
// // //             />
// // //             <button
// // //               type="button"
// // //               className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
// // //               onClick={() => setShowConfirmPassword(!showConfirmPassword)}
// // //             >
// // //               {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
// // //             </button>
// // //             {errors.confirmPassword && (
// // //               <p className="text-sm font-medium text-destructive">{errors.confirmPassword.message}</p>
// // //             )}
// // //           </div>

// // //           <LoadingButton type="submit" className="w-full h-12" loading={isSubmitting}>
// // //             Reset Password
// // //           </LoadingButton>
// // //         </form>
// // //       )}
// // //     </div>
// // //   )
// // // } 

// // "use client"

// // import Link from 'next/link'
// // import { useForm } from 'react-hook-form'
// // import { zodResolver } from '@hookform/resolvers/zod'
// // import * as z from 'zod'
// // import { useState, useEffect } from 'react'
// // import { ArrowLeft, Eye, EyeOff, Mail, Shield, Lock } from 'lucide-react'

// // import { Input } from '@/components/ui/input'
// // import { LoadingButton } from '@/components/ui/loading-button'
// // import { Alert, AlertDescription } from '@/components/ui/alert'
// // import { ExclamationTriangleIcon, CheckIcon } from '@radix-ui/react-icons'
// // import { cn } from '@/lib/utils'
// // import { useRouter } from 'next/navigation'

// // // Schema for email step
// // const emailSchema = z.object({
// //   email: z.string().email('Invalid email address').min(1, 'Email is required'),
// // })

// // // Schema for OTP step
// // const otpSchema = z.object({
// //   otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be numbers only'),
// // })

// // // Schema for password reset step
// // const passwordSchema = z.object({
// //   newPassword: z.string().min(8, 'Password must be at least 8 characters'),
// //   confirmPassword: z.string().min(1, 'Please confirm your password'),
// // }).refine((data) => data.newPassword === data.confirmPassword, {
// //   message: "Passwords don't match",
// //   path: ['confirmPassword'],
// // })

// // type EmailFormData = z.infer<typeof emailSchema>
// // type OTPFormData = z.infer<typeof otpSchema>
// // type PasswordFormData = z.infer<typeof passwordSchema>

// // export default function ForgotPassword() {
// //   const [step, setStep] = useState<'email' | 'otp' | 'password' | 'success'>('email')
// //   const [email, setEmail] = useState('')
// //   const [otp, setOtp] = useState('')
// //   const [errorMessage, setErrorMessage] = useState<string | null>(null)
// //   const [successMessage, setSuccessMessage] = useState<string | null>(null)
// //   const [showPassword, setShowPassword] = useState(false)
// //   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
// //   const [countdown, setCountdown] = useState(0)
// //   const router = useRouter()

// //   // Email form
// //   const emailForm = useForm<EmailFormData>({
// //     resolver: zodResolver(emailSchema),
// //   })

// //   // OTP form
// //   const otpForm = useForm<OTPFormData>({
// //     resolver: zodResolver(otpSchema),
// //   })

// //   // Password form
// //   const passwordForm = useForm<PasswordFormData>({
// //     resolver: zodResolver(passwordSchema),
// //   })

// //   // Countdown timer for resend OTP
// //   useEffect(() => {
// //     let timer: NodeJS.Timeout
// //     if (countdown > 0) {
// //       timer = setTimeout(() => setCountdown(countdown - 1), 1000)
// //     }
// //     return () => clearTimeout(timer)
// //   }, [countdown])

// //   // Handle OTP request
// //   const handleEmailSubmit = async (data: EmailFormData) => {
// //     try {
// //       setErrorMessage(null)
// //       setSuccessMessage(null)

// //       const response = await fetch('/api/auth/reset-password-direct', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({ 
// //           email: data.email,
// //           action: 'request_otp'
// //         }),
// //       })

// //       const result = await response.json()

// //       if (!response.ok) {
// //         throw new Error(result.error || 'Failed to send OTP')
// //       }

// //       setEmail(data.email)
// //       setStep('otp')
// //       setCountdown(60) // 1 minute countdown
// //       setSuccessMessage('OTP has been sent to your email address')
// //     } catch (error) {
// //       console.error('OTP request error:', error)
// //       setErrorMessage(error instanceof Error ? error.message : 'Failed to send OTP')
// //     }
// //   }

// //   // Handle OTP verification
// //   const handleOTPSubmit = async (data: OTPFormData) => {
// //     try {
// //       setErrorMessage(null)
// //       setSuccessMessage(null)

// //       const response = await fetch('/api/auth/reset-password-direct', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({ 
// //           email,
// //           otp: data.otp,
// //           action: 'verify_otp'
// //         }),
// //       })

// //       const result = await response.json()

// //       if (!response.ok) {
// //         throw new Error(result.error || 'Invalid OTP')
// //       }

// //       setOtp(data.otp)
// //       setStep('password')
// //       setSuccessMessage('OTP verified successfully')
// //     } catch (error) {
// //       console.error('OTP verification error:', error)
// //       setErrorMessage(error instanceof Error ? error.message : 'Invalid or expired OTP')
// //     }
// //   }

// //   // Handle password reset
// //   const handlePasswordSubmit = async (data: PasswordFormData) => {
// //     try {
// //       setErrorMessage(null)
// //       setSuccessMessage(null)

// //       const response = await fetch('/api/auth/reset-password-direct', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({ 
// //           email,
// //           otp,
// //           newPassword: data.newPassword,
// //           action: 'reset_password'
// //         }),
// //       })

// //       const result = await response.json()

// //       if (!response.ok) {
// //         throw new Error(result.error || 'Failed to reset password')
// //       }

// //       setStep('success')
      
// //       // Redirect to login page after 3 seconds
// //       setTimeout(() => {
// //         router.push('/sign-in')
// //       }, 3000)
// //     } catch (error) {
// //       console.error('Password reset error:', error)
// //       setErrorMessage(error instanceof Error ? error.message : 'Failed to reset password')
// //     }
// //   }

// //   // Resend OTP
// //   const handleResendOTP = async () => {
// //     try {
// //       setErrorMessage(null)
      
// //       const response = await fetch('/api/auth/reset-password-direct', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({ 
// //           email,
// //           action: 'request_otp'
// //         }),
// //       })

// //       const result = await response.json()

// //       if (!response.ok) {
// //         throw new Error(result.error || 'Failed to resend OTP')
// //       }

// //       setCountdown(60)
// //       setSuccessMessage('New OTP has been sent to your email')
// //     } catch (error) {
// //       setErrorMessage('Failed to resend OTP')
// //     }
// //   }

// //   const getStepTitle = () => {
// //     switch (step) {
// //       case 'email':
// //         return 'Reset your password'
// //       case 'otp':
// //         return 'Verify your email'
// //       case 'password':
// //         return 'Set new password'
// //       case 'success':
// //         return 'Password reset successful'
// //       default:
// //         return 'Reset your password'
// //     }
// //   }

// //   const getStepDescription = () => {
// //     switch (step) {
// //       case 'email':
// //         return 'Enter your email address to receive a verification code'
// //       case 'otp':
// //         return `Enter the 6-digit code sent to ${email}`
// //       case 'password':
// //         return 'Enter your new password'
// //       case 'success':
// //         return 'Your password has been successfully reset'
// //       default:
// //         return ''
// //     }
// //   }

// //   const getStepIcon = () => {
// //     switch (step) {
// //       case 'email':
// //         return <Mail className="w-6 h-6 text-blue-500" />
// //       case 'otp':
// //         return <Shield className="w-6 h-6 text-green-500" />
// //       case 'password':
// //         return <Lock className="w-6 h-6 text-purple-500" />
// //       case 'success':
// //         return <CheckIcon className="w-6 h-6 text-green-500" />
// //       default:
// //         return null
// //     }
// //   }

// //   return (
// //     <div className="space-y-6">
// //       <div className="flex items-center mb-4">
// //         <Link href="/sign-in" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
// //           <ArrowLeft className="mr-2 h-4 w-4" />
// //           Back to sign in
// //         </Link>
// //       </div>

// //       <div className="text-center">
// //         <div className="flex justify-center mb-4">
// //           {getStepIcon()}
// //         </div>
// //         <h1 className="text-2xl font-semibold">{getStepTitle()}</h1>
// //         <p className="mt-2 text-sm text-muted-foreground">
// //           {getStepDescription()}
// //         </p>
// //       </div>

// //       {/* Progress indicator */}
// //       <div className="flex justify-center space-x-2 mb-6">
// //         <div className={cn("w-2 h-2 rounded-full", step === 'email' ? 'bg-blue-500' : 'bg-gray-300')} />
// //         <div className={cn("w-2 h-2 rounded-full", step === 'otp' ? 'bg-green-500' : step === 'password' || step === 'success' ? 'bg-green-500' : 'bg-gray-300')} />
// //         <div className={cn("w-2 h-2 rounded-full", step === 'password' ? 'bg-purple-500' : step === 'success' ? 'bg-green-500' : 'bg-gray-300')} />
// //       </div>

// //       {errorMessage && (
// //         <Alert variant="destructive" className="text-left">
// //           <ExclamationTriangleIcon className="h-4 w-4" />
// //           <AlertDescription>{errorMessage}</AlertDescription>
// //         </Alert>
// //       )}

// //       {successMessage && (
// //         <Alert className="bg-green-50 text-green-800 border-green-200">
// //           <CheckIcon className="h-4 w-4 text-green-600" />
// //           <AlertDescription className="text-green-700">
// //             {successMessage}
// //           </AlertDescription>
// //         </Alert>
// //       )}

// //       {/* Email Step */}
// //       {step === 'email' && (
// //         <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
// //           <div className="space-y-2">
// //             <Input
// //               {...emailForm.register('email')}
// //               type="email"
// //               placeholder="Enter your email address"
// //               className={cn(
// //                 "h-12",
// //                 emailForm.formState.errors.email && "border-destructive focus-visible:ring-destructive"
// //               )}
// //               aria-invalid={!!emailForm.formState.errors.email}
// //             />
// //             {emailForm.formState.errors.email && (
// //               <p className="text-sm font-medium text-destructive">{emailForm.formState.errors.email.message}</p>
// //             )}
// //           </div>

// //           <LoadingButton type="submit" className="w-full h-12" loading={emailForm.formState.isSubmitting}>
// //             Send Verification Code
// //           </LoadingButton>
// //         </form>
// //       )}

// //       {/* OTP Step */}
// //       {step === 'otp' && (
// //         <form onSubmit={otpForm.handleSubmit(handleOTPSubmit)} className="space-y-4">
// //           <div className="space-y-2">
// //             <Input
// //               {...otpForm.register('otp')}
// //               type="text"
// //               placeholder="Enter 6-digit code"
// //               maxLength={6}
// //               className={cn(
// //                 "h-12 text-center text-lg font-mono tracking-widest",
// //                 otpForm.formState.errors.otp && "border-destructive focus-visible:ring-destructive"
// //               )}
// //               aria-invalid={!!otpForm.formState.errors.otp}
// //             />
// //             {otpForm.formState.errors.otp && (
// //               <p className="text-sm font-medium text-destructive">{otpForm.formState.errors.otp.message}</p>
// //             )}
// //           </div>

// //           <LoadingButton type="submit" className="w-full h-12" loading={otpForm.formState.isSubmitting}>
// //             Verify Code
// //           </LoadingButton>

// //           <div className="text-center text-sm text-muted-foreground">
// //             Didn't receive the code?{' '}
// //             {countdown > 0 ? (
// //               <span>Resend in {countdown}s</span>
// //             ) : (
// //               <button
// //                 type="button"
// //                 onClick={handleResendOTP}
// //                 className="text-primary hover:underline"
// //               >
// //                 Resend code
// //               </button>
// //             )}
// //           </div>
// //         </form>
// //       )}

// //       {/* Password Step */}
// //       {step === 'password' && (
// //         <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
// //           <div className="space-y-2 relative">
// //             <Input
// //               {...passwordForm.register('newPassword')}
// //               type={showPassword ? "text" : "password"}
// //               placeholder="Enter new password"
// //               className={cn(
// //                 "h-12 pr-10",
// //                 passwordForm.formState.errors.newPassword && "border-destructive focus-visible:ring-destructive"
// //               )}
// //               aria-invalid={!!passwordForm.formState.errors.newPassword}
// //             />
// //             <button
// //               type="button"
// //               className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
// //               onClick={() => setShowPassword(!showPassword)}
// //             >
// //               {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
// //             </button>
// //             {passwordForm.formState.errors.newPassword && (
// //               <p className="text-sm font-medium text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
// //             )}
// //           </div>
          
// //           <div className="space-y-2 relative">
// //             <Input
// //               {...passwordForm.register('confirmPassword')}
// //               type={showConfirmPassword ? "text" : "password"}
// //               placeholder="Confirm new password"
// //               className={cn(
// //                 "h-12 pr-10",
// //                 passwordForm.formState.errors.confirmPassword && "border-destructive focus-visible:ring-destructive"
// //               )}
// //               aria-invalid={!!passwordForm.formState.errors.confirmPassword}
// //             />
// //             <button
// //               type="button"
// //               className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
// //               onClick={() => setShowConfirmPassword(!showConfirmPassword)}
// //             >
// //               {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
// //             </button>
// //             {passwordForm.formState.errors.confirmPassword && (
// //               <p className="text-sm font-medium text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
// //             )}
// //           </div>

// //           <LoadingButton type="submit" className="w-full h-12" loading={passwordForm.formState.isSubmitting}>
// //             Reset Password
// //           </LoadingButton>
// //         </form>
// //       )}

// //       {/* Success Step */}
// //       {step === 'success' && (
// //         <div className="text-center space-y-4">
// //           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
// //             <CheckIcon className="w-8 h-8 text-green-600" />
// //           </div>
// //           <div>
// //             <h3 className="text-lg font-medium text-green-800">Password Reset Successful!</h3>
// //             <p className="text-sm text-green-600 mt-2">
// //               Your password has been successfully reset. You will be redirected to the login page shortly.
// //             </p>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   )
// // }


// "use client"

// import Link from 'next/link'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import * as z from 'zod'
// import { useState, useEffect } from 'react'
// import { ArrowLeft, Eye, EyeOff, Mail, Shield, Lock, Clock, AlertCircle } from 'lucide-react'

// import { Input } from '@/components/ui/input'
// import { LoadingButton } from '@/components/ui/loading-button'
// import { Alert, AlertDescription } from '@/components/ui/alert'
// import { ExclamationTriangleIcon, CheckIcon } from '@radix-ui/react-icons'
// import { cn } from '@/lib/utils'
// import { useRouter } from 'next/navigation'

// // Schema for email step
// const emailSchema = z.object({
//   email: z.string().email('Invalid email address').min(1, 'Email is required'),
// })

// // Schema for OTP step
// const otpSchema = z.object({
//   otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be numbers only'),
// })

// // Schema for password reset step
// const passwordSchema = z.object({
//   newPassword: z.string()
//     .min(8, 'Password must be at least 8 characters')
//     .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
//   confirmPassword: z.string().min(1, 'Please confirm your password'),
// }).refine((data) => data.newPassword === data.confirmPassword, {
//   message: "Passwords don't match",
//   path: ['confirmPassword'],
// })

// type EmailFormData = z.infer<typeof emailSchema>
// type OTPFormData = z.infer<typeof otpSchema>
// type PasswordFormData = z.infer<typeof passwordSchema>

// export default function ForgotPassword() {
//   const [step, setStep] = useState<'email' | 'otp' | 'password' | 'success'>('email')
//   const [email, setEmail] = useState('')
//   const [otp, setOtp] = useState('')
//   const [errorMessage, setErrorMessage] = useState<string | null>(null)
//   const [successMessage, setSuccessMessage] = useState<string | null>(null)
//   const [showPassword, setShowPassword] = useState(false)
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
//   const [countdown, setCountdown] = useState(0)
//   const [otpExpired, setOtpExpired] = useState(false)
//   const router = useRouter()

//   // Email form
//   const emailForm = useForm<EmailFormData>({
//     resolver: zodResolver(emailSchema),
//   })

//   // OTP form
//   const otpForm = useForm<OTPFormData>({
//     resolver: zodResolver(otpSchema),
//   })

//   // Password form
//   const passwordForm = useForm<PasswordFormData>({
//     resolver: zodResolver(passwordSchema),
//   })

//   // Countdown timer for resend OTP
//   useEffect(() => {
//     let timer: NodeJS.Timeout
//     if (countdown > 0) {
//       timer = setTimeout(() => setCountdown(countdown - 1), 1000)
//     }
//     return () => clearTimeout(timer)
//   }, [countdown])

//   // OTP expiry timer (5 minutes = 300 seconds)
//   useEffect(() => {
//     let expiryTimer: NodeJS.Timeout
//     if (step === 'otp' && countdown === 0) {
//       expiryTimer = setTimeout(() => {
//         setOtpExpired(true)
//         setErrorMessage('OTP has expired. Please request a new one.')
//       }, 300000) // 5 minutes
//     }
//     return () => clearTimeout(expiryTimer)
//   }, [step, countdown])

//   // Handle OTP request
//   const handleEmailSubmit = async (data: EmailFormData) => {
//     try {
//       setErrorMessage(null)
//       setSuccessMessage(null)

//       const response = await fetch('/api/auth/reset-password-direct', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 
//           email: data.email,
//           action: 'request_otp'
//         }),
//       })

//       const result = await response.json()

//       if (!response.ok) {
//         throw new Error(result.error || 'Failed to send OTP')
//       }

//       setEmail(data.email)
//       setStep('otp')
//       setCountdown(60) // 1 minute countdown for resend
//       setOtpExpired(false)
//       setSuccessMessage(result.message || 'OTP has been sent to your email address')
//     } catch (error) {
//       console.error('OTP request error:', error)
//       setErrorMessage(error instanceof Error ? error.message : 'Failed to send OTP')
//     }
//   }

//   // Handle OTP verification
//   const handleOTPSubmit = async (data: OTPFormData) => {
//     try {
//       setErrorMessage(null)
//       setSuccessMessage(null)

//       if (otpExpired) {
//         setErrorMessage('OTP has expired. Please request a new one.')
//         return
//       }

//       const response = await fetch('/api/auth/reset-password-direct', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 
//           email,
//           otp: data.otp,
//           action: 'verify_otp'
//         }),
//       })

//       const result = await response.json()

//       if (!response.ok) {
//         throw new Error(result.error || 'Invalid OTP')
//       }

//       setOtp(data.otp)
//       setStep('password')
//       setSuccessMessage(result.message || 'OTP verified successfully')
//     } catch (error) {
//       console.error('OTP verification error:', error)
//       setErrorMessage(error instanceof Error ? error.message : 'Invalid or expired OTP')
//     }
//   }

//   // Handle password reset
//   const handlePasswordSubmit = async (data: PasswordFormData) => {
//     try {
//       setErrorMessage(null)
//       setSuccessMessage(null)

//       const response = await fetch('/api/auth/reset-password-direct', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 
//           email,
//           otp,
//           newPassword: data.newPassword,
//           action: 'reset_password'
//         }),
//       })

//       const result = await response.json()

//       if (!response.ok) {
//         throw new Error(result.error || 'Failed to reset password')
//       }

//       setStep('success')
//       setSuccessMessage(result.message || 'Password reset successfully')
      
//       // Redirect to login page after 3 seconds
//       setTimeout(() => {
//         router.push('/sign-in')
//       }, 3000)
//     } catch (error) {
//       console.error('Password reset error:', error)
//       setErrorMessage(error instanceof Error ? error.message : 'Failed to reset password')
//     }
//   }

//   // Resend OTP
//   const handleResendOTP = async () => {
//     try {
//       setErrorMessage(null)
//       setOtpExpired(false)
      
//       const response = await fetch('/api/auth/reset-password-direct', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 
//           email,
//           action: 'request_otp'
//         }),
//       })

//       const result = await response.json()

//       if (!response.ok) {
//         throw new Error(result.error || 'Failed to resend OTP')
//       }

//       setCountdown(60)
//       setSuccessMessage(result.message || 'New OTP has been sent to your email')
      
//       // Reset the OTP form
//       otpForm.reset()
//     } catch (error) {
//       setErrorMessage(error instanceof Error ? error.message : 'Failed to resend OTP')
//     }
//   }

//   const getStepTitle = () => {
//     switch (step) {
//       case 'email':
//         return 'Reset your password'
//       case 'otp':
//         return 'Verify your email'
//       case 'password':
//         return 'Set new password'
//       case 'success':
//         return 'Password reset successful'
//       default:
//         return 'Reset your password'
//     }
//   }

//   const getStepDescription = () => {
//     switch (step) {
//       case 'email':
//         return 'Enter your email address to receive a verification code'
//       case 'otp':
//         return `Enter the 6-digit code sent to ${email}`
//       case 'password':
//         return 'Enter your new password'
//       case 'success':
//         return 'Your password has been successfully reset'
//       default:
//         return ''
//     }
//   }

//   const getStepIcon = () => {
//     switch (step) {
//       case 'email':
//         return <Mail className="w-6 h-6 text-blue-500" />
//       case 'otp':
//         return <Shield className="w-6 h-6 text-green-500" />
//       case 'password':
//         return <Lock className="w-6 h-6 text-purple-500" />
//       case 'success':
//         return <CheckIcon className="w-6 h-6 text-green-500" />
//       default:
//         return null
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center mb-4">
//         <Link href="/sign-in" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
//           <ArrowLeft className="mr-2 h-4 w-4" />
//           Back to sign in
//         </Link>
//       </div>

//       <div className="text-center">
//         <div className="flex justify-center mb-4">
//           {getStepIcon()}
//         </div>
//         <h1 className="text-2xl font-semibold">{getStepTitle()}</h1>
//         <p className="mt-2 text-sm text-muted-foreground">
//           {getStepDescription()}
//         </p>
//       </div>

//       {/* Progress indicator */}
//       <div className="flex justify-center space-x-2 mb-6">
//         <div className={cn("w-2 h-2 rounded-full", step === 'email' ? 'bg-blue-500' : 'bg-gray-300')} />
//         <div className={cn("w-2 h-2 rounded-full", step === 'otp' ? 'bg-green-500' : step === 'password' || step === 'success' ? 'bg-green-500' : 'bg-gray-300')} />
//         <div className={cn("w-2 h-2 rounded-full", step === 'password' ? 'bg-purple-500' : step === 'success' ? 'bg-green-500' : 'bg-gray-300')} />
//       </div>

//       {/* OTP Expiry Warning */}
//       {step === 'otp' && !otpExpired && (
//         <Alert className="bg-amber-50 text-amber-800 border-amber-200">
//           <Clock className="h-4 w-4 text-amber-600" />
//           <AlertDescription className="text-amber-700">
//             OTP expires in 5 minutes. Please verify before it expires.
//           </AlertDescription>
//         </Alert>
//       )}

//       {/* OTP Expired Alert */}
//       {otpExpired && (
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>
//             Your OTP has expired. Please request a new one to continue.
//           </AlertDescription>
//         </Alert>
//       )}

//       {errorMessage && (
//         <Alert variant="destructive" className="text-left">
//           <ExclamationTriangleIcon className="h-4 w-4" />
//           <AlertDescription>{errorMessage}</AlertDescription>
//         </Alert>
//       )}

//       {successMessage && (
//         <Alert className="bg-green-50 text-green-800 border-green-200">
//           <CheckIcon className="h-4 w-4 text-green-600" />
//           <AlertDescription className="text-green-700">
//             {successMessage}
//           </AlertDescription>
//         </Alert>
//       )}

//       {/* Email Step */}
//       {step === 'email' && (
//         <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
//           <div className="space-y-2">
//             <Input
//               {...emailForm.register('email')}
//               type="email"
//               placeholder="Enter your email address"
//               className={cn(
//                 "h-12",
//                 emailForm.formState.errors.email && "border-destructive focus-visible:ring-destructive"
//               )}
//               aria-invalid={!!emailForm.formState.errors.email}
//             />
//             {emailForm.formState.errors.email && (
//               <p className="text-sm font-medium text-destructive">{emailForm.formState.errors.email.message}</p>
//             )}
//           </div>

//           <LoadingButton type="submit" className="w-full h-12" loading={emailForm.formState.isSubmitting}>
//             Send Verification Code
//           </LoadingButton>
//         </form>
//       )}

//       {/* OTP Step */}
//       {step === 'otp' && (
//         <form onSubmit={otpForm.handleSubmit(handleOTPSubmit)} className="space-y-4">
//           <div className="space-y-2">
//             <Input
//               {...otpForm.register('otp')}
//               type="text"
//               placeholder="Enter 6-digit code"
//               maxLength={6}
//               className={cn(
//                 "h-12 text-center text-lg font-mono tracking-widest",
//                 otpForm.formState.errors.otp && "border-destructive focus-visible:ring-destructive"
//               )}
//               aria-invalid={!!otpForm.formState.errors.otp}
//               disabled={otpExpired}
//             />
//             {otpForm.formState.errors.otp && (
//               <p className="text-sm font-medium text-destructive">{otpForm.formState.errors.otp.message}</p>
//             )}
//           </div>

//           <LoadingButton 
//             type="submit" 
//             className="w-full h-12" 
//             loading={otpForm.formState.isSubmitting}
//             disabled={otpExpired}
//           >
//             Verify Code
//           </LoadingButton>

//           <div className="text-center text-sm text-muted-foreground">
//             Didn't receive the code?{' '}
//             {countdown > 0 ? (
//               <span>Resend in {countdown}s</span>
//             ) : (
//               <button
//                 type="button"
//                 onClick={handleResendOTP}
//                 className="text-primary hover:underline"
//               >
//                 Resend code
//               </button>
//             )}
//           </div>
//         </form>
//       )}

//       {/* Password Step */}
//       {step === 'password' && (
//         <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
//           <div className="space-y-2 relative">
//             <Input
//               {...passwordForm.register('newPassword')}
//               type={showPassword ? "text" : "password"}
//               placeholder="Enter new password"
//               className={cn(
//                 "h-12 pr-10",
//                 passwordForm.formState.errors.newPassword && "border-destructive focus-visible:ring-destructive"
//               )}
//               aria-invalid={!!passwordForm.formState.errors.newPassword}
//             />
//             <button
//               type="button"
//               className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
//               onClick={() => setShowPassword(!showPassword)}
//             >
//               {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//             </button>
//             {passwordForm.formState.errors.newPassword && (
//               <p className="text-sm font-medium text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
//             )}
//           </div>
          
//           <div className="space-y-2 relative">
//             <Input
//               {...passwordForm.register('confirmPassword')}
//               type={showConfirmPassword ? "text" : "password"}
//               placeholder="Confirm new password"
//               className={cn(
//                 "h-12 pr-10",
//                 passwordForm.formState.errors.confirmPassword && "border-destructive focus-visible:ring-destructive"
//               )}
//               aria-invalid={!!passwordForm.formState.errors.confirmPassword}
//             />
//             <button
//               type="button"
//               className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
//               onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//             >
//               {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//             </button>
//             {passwordForm.formState.errors.confirmPassword && (
//               <p className="text-sm font-medium text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
//             )}
//           </div>

//           {/* Password Requirements */}
//           <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
//             <p className="font-medium mb-1">Password requirements:</p>
//             <ul className="space-y-1">
//               <li>• At least 8 characters long</li>
//               <li>• Contains uppercase and lowercase letters</li>
//               <li>• Contains at least one number</li>
//             </ul>
//           </div>

//           <LoadingButton type="submit" className="w-full h-12" loading={passwordForm.formState.isSubmitting}>
//             Reset Password
//           </LoadingButton>
//         </form>
//       )}

//       {/* Success Step */}
//       {step === 'success' && (
//         <div className="text-center space-y-4">
//           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
//             <CheckIcon className="w-8 h-8 text-green-600" />
//           </div>
//           <div>
//             <h3 className="text-lg font-medium text-green-800">Password Reset Successful!</h3>
//             <p className="text-sm text-green-600 mt-2">
//               Your password has been successfully reset. You will be redirected to the login page shortly.
//             </p>
//           </div>
//           <div className="bg-green-50 p-4 rounded-lg border border-green-200">
//             <p className="text-sm text-green-700">
//               Redirecting in 3 seconds... <br />
//               <Link href="/sign-in" className="text-green-800 hover:underline font-medium">
//                 Click here if you're not redirected automatically
//               </Link>
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
// app/forgot-password/page.tsx
"use client"

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState, useEffect } from 'react'
import { ArrowLeft, Eye, EyeOff, Mail, Shield, Lock, Clock, AlertCircle } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { LoadingButton } from '@/components/ui/loading-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ExclamationTriangleIcon, CheckIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

// Schema for email step
const emailSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
})

// Schema for OTP step
const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be numbers only'),
})

// Schema for password reset step
const passwordSchema = z.object({
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type EmailFormData = z.infer<typeof emailSchema>
type OTPFormData = z.infer<typeof otpSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'otp' | 'password' | 'success'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [otpExpired, setOtpExpired] = useState(false)
  const router = useRouter()

  // Email form
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  })

  // OTP form
  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  })

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  // OTP expiry timer (5 minutes = 300 seconds)
  useEffect(() => {
    let expiryTimer: NodeJS.Timeout
    if (step === 'otp' && countdown === 0) {
      expiryTimer = setTimeout(() => {
        setOtpExpired(true)
        setErrorMessage('OTP has expired. Please request a new one.')
      }, 300000) // 5 minutes
    }
    return () => clearTimeout(expiryTimer)
  }, [step, countdown])

  // Handle OTP request
  const handleEmailSubmit = async (data: EmailFormData) => {
    try {
      setErrorMessage(null)
      setSuccessMessage(null)

      const response = await fetch('/api/auth/reset-password-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: data.email,
          action: 'request_otp'
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send OTP')
      }

      setEmail(data.email)
      setStep('otp')
      setCountdown(60) // 1 minute countdown for resend
      setOtpExpired(false)
      setSuccessMessage(result.message || 'OTP has been sent to your email address')
    } catch (error) {
      console.error('OTP request error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send OTP')
    }
  }

  // Handle OTP verification
  const handleOTPSubmit = async (data: OTPFormData) => {
    try {
      setErrorMessage(null)
      setSuccessMessage(null)

      if (otpExpired) {
        setErrorMessage('OTP has expired. Please request a new one.')
        return
      }

      const response = await fetch('/api/auth/reset-password-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          otp: data.otp,
          action: 'verify_otp'
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Invalid OTP')
      }

      setOtp(data.otp)
      setStep('password')
      setSuccessMessage(result.message || 'OTP verified successfully')
    } catch (error) {
      console.error('OTP verification error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Invalid or expired OTP')
    }
  }

  // Handle password reset
  const handlePasswordSubmit = async (data: PasswordFormData) => {
    try {
      setErrorMessage(null)
      setSuccessMessage(null)

      const response = await fetch('/api/auth/reset-password-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          otp,
          newPassword: data.newPassword,
          action: 'reset_password'
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset password')
      }

      setStep('success')
      setSuccessMessage(result.message || 'Password reset successfully')
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/sign-in')
      }, 3000)
    } catch (error) {
      console.error('Password reset error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to reset password')
    }
  }

  // Resend OTP
  const handleResendOTP = async () => {
    try {
      setErrorMessage(null)
      setOtpExpired(false)
      
      const response = await fetch('/api/auth/reset-password-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          action: 'request_otp'
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend OTP')
      }

      setCountdown(60)
      setSuccessMessage(result.message || 'New OTP has been sent to your email')
      
      // Reset the OTP form
      otpForm.reset()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to resend OTP')
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 'email':
        return 'Reset your password'
      case 'otp':
        return 'Verify your email'
      case 'password':
        return 'Set new password'
      case 'success':
        return 'Password reset successful'
      default:
        return 'Reset your password'
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 'email':
        return 'Enter your email address to receive a verification code'
      case 'otp':
        return `Enter the 6-digit code sent to ${email}`
      case 'password':
        return 'Enter your new password'
      case 'success':
        return 'Your password has been successfully reset'
      default:
        return ''
    }
  }

  const getStepIcon = () => {
    switch (step) {
      case 'email':
        return <Mail className="w-6 h-6 text-blue-500" />
      case 'otp':
        return <Shield className="w-6 h-6 text-green-500" />
      case 'password':
        return <Lock className="w-6 h-6 text-purple-500" />
      case 'success':
        return <CheckIcon className="w-6 h-6 text-green-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Link href="/sign-in" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Link>
      </div>

      <div className="text-center">
        <div className="flex justify-center mb-4">
          {getStepIcon()}
        </div>
        <h1 className="text-2xl font-semibold">{getStepTitle()}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {getStepDescription()}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center space-x-2 mb-6">
        <div className={cn("w-2 h-2 rounded-full", step === 'email' ? 'bg-blue-500' : 'bg-gray-300')} />
        <div className={cn("w-2 h-2 rounded-full", step === 'otp' ? 'bg-green-500' : step === 'password' || step === 'success' ? 'bg-green-500' : 'bg-gray-300')} />
        <div className={cn("w-2 h-2 rounded-full", step === 'password' ? 'bg-purple-500' : step === 'success' ? 'bg-green-500' : 'bg-gray-300')} />
      </div>

      {/* OTP Expiry Warning */}
      {step === 'otp' && !otpExpired && (
        <Alert className="bg-amber-50 text-amber-800 border-amber-200">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            OTP expires in 5 minutes. Please verify before it expires.
          </AlertDescription>
        </Alert>
      )}

      {/* OTP Expired Alert */}
      {otpExpired && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your OTP has expired. Please request a new one to continue.
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="text-left">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <CheckIcon className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Email Step */}
      {step === 'email' && (
        <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Input
              {...emailForm.register('email')}
              type="email"
              placeholder="Enter your email address"
              className={cn(
                "h-12",
                emailForm.formState.errors.email && "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={!!emailForm.formState.errors.email}
            />
            {emailForm.formState.errors.email && (
              <p className="text-sm font-medium text-destructive">{emailForm.formState.errors.email.message}</p>
            )}
          </div>

          <LoadingButton type="submit" className="w-full h-12" loading={emailForm.formState.isSubmitting}>
            Send Verification Code
          </LoadingButton>
        </form>
      )}

      {/* OTP Step */}
      {step === 'otp' && (
        <form onSubmit={otpForm.handleSubmit(handleOTPSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Input
              {...otpForm.register('otp')}
              type="text"
              placeholder="Enter 6-digit code"
              maxLength={6}
              className={cn(
                "h-12 text-center text-lg font-mono tracking-widest",
                otpForm.formState.errors.otp && "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={!!otpForm.formState.errors.otp}
              disabled={otpExpired}
            />
            {otpForm.formState.errors.otp && (
              <p className="text-sm font-medium text-destructive">{otpForm.formState.errors.otp.message}</p>
            )}
          </div>

          <LoadingButton 
            type="submit" 
            className="w-full h-12" 
            loading={otpForm.formState.isSubmitting}
            disabled={otpExpired}
          >
            Verify Code
          </LoadingButton>

          <div className="text-center text-sm text-muted-foreground">
            Didn't receive the code?{' '}
            {countdown > 0 ? (
              <span>Resend in {countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                className="text-primary hover:underline"
              >
                Resend code
              </button>
            )}
          </div>
        </form>
      )}

      {/* Password Step */}
      {step === 'password' && (
        <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
          <div className="space-y-2 relative">
            <Input
              {...passwordForm.register('newPassword')}
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              className={cn(
                "h-12 pr-10",
                passwordForm.formState.errors.newPassword && "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={!!passwordForm.formState.errors.newPassword}
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {passwordForm.formState.errors.newPassword && (
              <p className="text-sm font-medium text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
            )}
          </div>
          
          <div className="space-y-2 relative">
            <Input
              {...passwordForm.register('confirmPassword')}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              className={cn(
                "h-12 pr-10",
                passwordForm.formState.errors.confirmPassword && "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={!!passwordForm.formState.errors.confirmPassword}
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-sm font-medium text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
            <p className="font-medium mb-1">Password requirements:</p>
            <ul className="space-y-1">
              <li>• At least 8 characters long</li>
              <li>• Contains uppercase and lowercase letters</li>
              <li>• Contains at least one number</li>
            </ul>
          </div>

          <LoadingButton type="submit" className="w-full h-12" loading={passwordForm.formState.isSubmitting}>
            Reset Password
          </LoadingButton>
        </form>
      )}

      {/* Success Step */}
      {step === 'success' && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckIcon className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-green-800">Password Reset Successful!</h3>
            <p className="text-sm text-green-600 mt-2">
              Your password has been successfully reset. You will be redirected to the login page shortly.
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">
              Redirecting in 3 seconds... <br />
              <Link href="/sign-in" className="text-green-800 hover:underline font-medium">
                Click here if you're not redirected automatically
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}