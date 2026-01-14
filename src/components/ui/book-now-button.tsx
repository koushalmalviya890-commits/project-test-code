'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button, ButtonProps } from '@/components/ui/button'
import { IncompleteProfileModal } from '@/components/ui/incomplete-profile-modal'
import { 
  isStartupProfileComplete, 
  getStartupProfileCompletionPercentage,
  getStartupIncompleteFields
} from '@/lib/utils/profile-completion'

interface BookNowButtonProps extends ButtonProps {
  facilityId?: string
  onOpenBookingModal?: (facilityId: string) => void
}

export function BookNowButton({ 
  facilityId, 
  onOpenBookingModal,
  children = 'Book Now',
  ...props 
}: BookNowButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showIncompleteProfileModal, setShowIncompleteProfileModal] = useState(false)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [incompleteFields, setIncompleteFields] = useState<string[]>([])

  const handleClick = async () => {
    // If not authenticated, redirect to sign in
    if (!session) {
      router.push('/sign-in')
      return
    }

    // If not a startup, don't allow booking
    if (session.user.userType !== 'startup') {
      return
    }

    setIsLoading(true)
    
    try {
      // Fetch startup profile
      const response = await fetch('/api/startup/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')
      
      const data = await response.json()
      setProfile(data)
      
      // Check if profile is complete
      const isComplete = isStartupProfileComplete(data)
      const percentage = getStartupProfileCompletionPercentage(data)
      const missingFields = getStartupIncompleteFields(data)
      
      setCompletionPercentage(percentage)
      setIncompleteFields(missingFields)
      
      if (!isComplete) {
        setShowIncompleteProfileModal(true)
        return
      }
      
      // If profile is complete and we have a facilityId and onOpenBookingModal function, open the booking modal
      if (facilityId && onOpenBookingModal) {
        onOpenBookingModal(facilityId)
      }
    } catch (error) {
      console.error('Error checking profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? 'Loading...' : children}
      </Button>

      <IncompleteProfileModal
        isOpen={showIncompleteProfileModal}
        onClose={() => setShowIncompleteProfileModal(false)}
        completionPercentage={completionPercentage}
        incompleteFields={incompleteFields}
        userType="startup"
        redirectPath="/startup/profile"
      />
    </>
  )
} 