'use client'
import { useState  , useEffect} from 'react'
import { Calendar, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Form } from 'react-hook-form'

interface BookingExtensionDialogProps {
  bookingId: string
  currentEndDate: string
  incubatorId:string
  startupId:string
  facilityId:string
  onExtensionRequested?: (bookingId: string, extentDays: number) => void
}

export default function BookingExtensionDialog({ 
  bookingId, 
  currentEndDate, 
  incubatorId,
  startupId,
  facilityId,
  onExtensionRequested 
}: BookingExtensionDialogProps) {
  const [extentDays, setExtentDays] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRequested, setIsRequested] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!extentDays || parseInt(extentDays) <= 0) {
      toast.error('Please enter a valid number of days')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/startup/extent-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentEndDate,
          bookingId,
          incubatorId,
          startupId,
          facilityId,
          extentDays: parseInt(extentDays)
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send extension request')
      }

      setIsRequested(true)
      setIsOpen(false)
      toast.success( 'Extension request sent successfully!')
      
      // Call the callback function if provided
      if (onExtensionRequested) {
        onExtensionRequested(bookingId, parseInt(extentDays))
      }
      
    } catch (error) {
      console.error('Error sending extension request:', error)
      toast.error(
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message?: string }).message || 'Failed to send extension request. Please try again.'
          : 'Failed to send extension request. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const calculateNewEndDate = () => {
    if (!extentDays || parseInt(extentDays) <= 0) return null
    
    const currentDate = new Date(currentEndDate)
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + parseInt(extentDays))
    return newDate.toLocaleDateString()
  }

useEffect(()=>{
  if (!isOpen) {
    setExtentDays('');
  }
})

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={isRequested}
        >
          <Clock className="h-4 w-4" />
          {isRequested ? 'Pending' : 'Extend'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Booking Extension</DialogTitle>
          <DialogDescription>
            Request to extend your booking period. The service provider will review your request.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="extentDays">Extension Days</Label>
            <Input
              id="extentDays"
              type="number"
              placeholder="Enter number of days"
              value={extentDays}
              onChange={(e) => setExtentDays(e.target.value)}
              min="1"
              required
            />
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Current End Date:</span>
              <span className="text-sm font-medium">
                {new Date(currentEndDate).toLocaleDateString()}
              </span>
            </div>
            
            {calculateNewEndDate() && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">New End Date:</span>
                <span className="text-sm font-medium text-green-600">
                  {calculateNewEndDate()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}