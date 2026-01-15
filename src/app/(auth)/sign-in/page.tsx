"use client"

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { LoadingButton } from '@/components/ui/loading-button'
import { signInSchema } from '@/lib/validations/auth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

type FormData = z.infer<typeof signInSchema>

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const from = searchParams.get('from')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    // Only redirect if we have a session and the status is "authenticated"
    if (session?.user && status === "authenticated") {
      const redirectTo = from || 
        (session.user.userType === 'startup' ? '/landing' : '/landing')
      router.replace(redirectTo)
    }
  }, [session, status, from, router])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

     if (result?.error) {
        let errorMessage = 'Failed to sign in. Please try again.';

        // ✅ Updated Error Handling Logic
        if (result.error === 'No user found with this email') {
          errorMessage = 'No account found with this email address. Please check your email or create a new account.';
        } else if (result.error === 'Invalid password') {
          errorMessage = 'Incorrect password. Please try again or use the forgot password option.';
        } else if (result.error === 'Account pending approval') {
          // 🆕 This catches the error thrown from your NextAuth authorize function
          errorMessage = 'Your account is currently under review. Please wait for admin approval.';
        }

        setError('root', { 
          type: 'manual',
          message: errorMessage
        })
        return
      }

      // If sign-in was successful
      if (result?.ok) {
        // Trigger a session update
        const updatedSession = await fetch('/api/auth/session')
        const sessionData = await updatedSession.json()
        
        // Redirect based on user type or the 'from' parameter
        const redirectTo = from || 
          (sessionData?.user?.userType === 'startup' ? '/landing' : '/landing')
        router.push(redirectTo)
      }
    } catch (error: any) {
      setError('root', { 
        type: 'manual',
        message: 'An unexpected error occurred. Please try again.'
      })
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true)
      await signIn('google', { callbackUrl: from || '/landing' })
    } catch (error) {
      console.error('Google sign-in error:', error)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with your email and password to explore more features on Cumma.
        </p>
      </div>

      {errors.root && (
        <Alert variant="destructive" className="text-left">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            {errors.root.message}
          </AlertDescription>
        </Alert>
      )}

      {/* <Button 
        type="button" 
        variant="outline" 
        className="w-full h-12 flex items-center justify-center gap-2"
        onClick={handleGoogleSignIn}
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
        <span className="ml-2">Sign in with Google</span>
      </Button> */}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        {/* <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div> */}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Input
            {...register('email')}
            type="email"
            placeholder="Ex: weebsitestudio@gmail.com"
            className={cn(
              "h-12",
              errors.email && "border-destructive focus-visible:ring-destructive"
            )}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-sm font-medium text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2 relative">
          <Input
            {...register('password')}
            type={showPassword ? "text" : "password"}
            placeholder="Ex: Abcd@12345"
            className={cn(
              "h-12 pr-10",
              errors.password && "border-destructive focus-visible:ring-destructive"
            )}
            aria-invalid={!!errors.password}
          />
          <button
            type="button"
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
          {errors.password && (
            <p className="text-sm font-medium text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              onCheckedChange={(checked) => setValue('rememberMe', checked as boolean)}
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me
            </label>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <LoadingButton type="submit" className="w-full h-12" loading={isSubmitting}>
          Sign in <span className="ml-2">→</span>
        </LoadingButton>
      </form>

      <div className="text-center text-sm">
        Not yet registered?{' '}
        <Link href="/sign-up" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
        .
      </div>
    </div>
  )
}

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  )
} 