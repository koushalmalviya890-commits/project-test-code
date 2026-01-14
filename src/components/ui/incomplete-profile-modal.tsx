'use client'

import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AlertCircle } from 'lucide-react'

interface IncompleteProfileModalProps {
  isOpen: boolean
  onClose: () => void
  completionPercentage: number
  incompleteFields: string[]
  userType: 'startup' | 'service-provider'
  redirectPath: string
}

export function IncompleteProfileModal({
  isOpen,
  onClose,
  completionPercentage,
  incompleteFields,
  userType,
  redirectPath,
}: IncompleteProfileModalProps) {
  const router = useRouter()

  const handleRedirect = () => {
    router.push(redirectPath)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-500">
            <AlertCircle className="h-5 w-5" />
            <DialogTitle>Complete Your Profile</DialogTitle>
          </div>
          <DialogDescription>
            {userType === 'startup'
              ? 'You need to complete your startup profile before you can make bookings.'
              : 'You need to complete your service provider profile before you can add facilities.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Profile completion</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Missing information:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              {incompleteFields.slice(0, 5).map((field, index) => (
                <li key={index}>{field}</li>
              ))}
              {incompleteFields.length > 5 && (
                <li>And {incompleteFields.length - 5} more fields...</li>
              )}
            </ul>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleRedirect}>
            Complete Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 