"use client"

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { LoadingButton } from '@/components/ui/loading-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ExclamationTriangleIcon, CheckIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof resetPasswordSchema>

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (!token || !email) {
      setErrorMessage('Invalid or missing reset link parameters. Please request a new password reset.')
    }
  }, [token, email])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      // Reset previous states
      setErrorMessage(null)
      setIsSuccess(false)

      // Make API call to the password update endpoint
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          email, 
          password: data.password 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update password')
      }

      // Show success message
      setIsSuccess(true)
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/sign-in')
      }, 3000)
    } catch (error) {
      console.error('Password update error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while processing your request')
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
        <h1 className="text-2xl font-semibold">Set new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a new password for your account
        </p>
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="text-left">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {isSuccess ? (
        <div className="space-y-6">
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckIcon className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Your password has been successfully reset. You will be redirected to the login page shortly.
            </AlertDescription>
          </Alert>
          
          <Button 
            className="w-full h-12"
            onClick={() => router.push('/sign-in')}
          >
            Sign in now
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2 relative">
            <Input
              {...register('password')}
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              className={cn(
                "h-12 pr-10",
                errors.password && "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={!!errors.password}
              disabled={!token || !email}
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && (
              <p className="text-sm font-medium text-destructive">{errors.password.message}</p>
            )}
          </div>
          
          <div className="space-y-2 relative">
            <Input
              {...register('confirmPassword')}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              className={cn(
                "h-12 pr-10",
                errors.confirmPassword && "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={!!errors.confirmPassword}
              disabled={!token || !email}
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.confirmPassword && (
              <p className="text-sm font-medium text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <LoadingButton 
            type="submit" 
            className="w-full h-12" 
            loading={isSubmitting}
            disabled={!token || !email}
          >
            Reset Password
          </LoadingButton>
        </form>
      )}
    </div>
  )
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="flex items-center mb-4">
          <Link href="/sign-in" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Set new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
} 