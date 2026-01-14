"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingButton } from '@/components/ui/loading-button'

// Create a client component that uses useSearchParams
function ChooseAccountTypeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<'startup' | 'Service Provider' | null>(null)
  const email = searchParams.get('email')

  useEffect(() => {
    // If user is not authenticated and no email is provided, redirect to sign-in
    if (status === 'unauthenticated' && !email) {
      router.push('/sign-in')
    }
  }, [status, email, router])

  const handleContinue = async () => {
    if (!selectedType) return

    setIsLoading(true)

    try {
      // Call API to update user type
      const response = await fetch('/api/auth/update-user-type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userType: selectedType,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user type')
      }

      const data = await response.json()
      
      // Explicitly update the session with the new user type
      if (update) {
        await update({
          ...session,
          user: {
            ...session?.user,
            userType: selectedType
          }
        })
      }

      // Use window.location for a hard redirect to force a complete page refresh
      // This ensures the session is completely reloaded
      window.location.href = '/'
    } catch (error) {
      console.error('Error updating user type:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Choose Account Type</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Select the type of account you want to create on Cumma. You can complete your profile details later.
        </p>
      </div>

      <div className="space-y-4">
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${
            selectedType === 'startup' ? 'border-primary bg-primary/5' : ''
          }`}
          onClick={() => setSelectedType('startup')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Startup</CardTitle>
            <CardDescription>
              For startups looking for resources and facilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 16V6"></path>
                  <path d="M8 12L12 8 16 12"></path>
                  <path d="M3 20h18c.6 0 1-.4 1-1v-1a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v1c0 .6.4 1 1 1z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm">Access resources, book facilities, and connect with Facility Partners.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${
            selectedType === 'Service Provider' ? 'border-primary bg-primary/5' : ''
          }`}
          onClick={() => setSelectedType('Service Provider')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Facility Partner</CardTitle>
            <CardDescription>
              For incubators, accelerators, and other Facility Partners
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M2 22h20"></path>
                  <path d="M6.87 2h10.26L22 22H2L6.87 2z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm">List your facilities, manage bookings, and connect with startups.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <LoadingButton 
          onClick={handleContinue} 
          disabled={!selectedType} 
          loading={isLoading}
          className="w-full h-12"
        >
          Continue <span className="ml-2">→</span>
        </LoadingButton>
      </div>

      <div className="text-center text-sm text-muted-foreground mt-4">
        You'll be able to complete your profile details from your dashboard at any time.
      </div>

      <div className="text-center text-sm">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}

// Main page component with Suspense boundary
export default function ChooseAccountType() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <ChooseAccountTypeContent />
    </Suspense>
  )
} 