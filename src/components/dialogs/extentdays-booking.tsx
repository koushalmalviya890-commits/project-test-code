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
import { useAuth } from '@/context/AuthContext'

interface BookingExtensionDialogProps {
  bookingId: string
  currentEndDate: string
  incubatorId:string
  startupId:string
  facilityId:string
  onExtensionRequested?: (bookingId: string, extentDays: number) => void
}

interface ExtensionRequest {
  status: string
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
  const { user } = useAuth();

  const apiUrl ="http://localhost:3001";

  const fetchExtensionRequests = async (id: string) => {
    try {
      // Fetch requests specifically for this booking
      const res = await fetch(`${apiUrl}/api/extent-booking/${id}`);
      const data = await res.json();

      // Check if there is any pending request for this booking
      if (Array.isArray(data)) {
        // Assuming your backend returns an array of requests
        const hasPending = data.some((req: ExtensionRequest) => req.status === "pending");
        setIsRequested(hasPending);
      }
    } catch (error) {
      console.error("Failed to check extension status", error);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchExtensionRequests(bookingId);
    }
  }, [bookingId]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validate days
  if (!extentDays || parseInt(extentDays) <= 0) {
    toast.error('Please enter a valid number of days');
    return;
  }

  // Validate User ID (Required by backend to find Startup)
  if (!user?.id) {
    toast.error('User session not found');
    return;
  }

  setIsLoading(true);

  try {
    // CALCULATION: Backend expects 'requestedEndDate', so we calculate it here
    const daysToAdd = parseInt(extentDays);
    const startDate = new Date(currentEndDate); // Ensure currentEndDate is a valid Date string/object
    const finalDate = new Date(startDate);
    finalDate.setDate(startDate.getDate() + daysToAdd);

    const response = await fetch(`${apiUrl}/api/extent-booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,            // REQUIRED: Your backend uses this to find the startup
        bookingId: bookingId,       // REQUIRED: Link to the booking
        requestedEndDate: finalDate.toISOString(), // REQUIRED: Calculated date
        reason: "Extension requested" // Optional: You might want to add a text input for this
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send extension request');
    }

    setIsRequested(true);
    setIsOpen(false);
    toast.success('Extension request sent successfully!');

    // Refresh the list immediately after successful submission
    fetchExtensionRequests(bookingId);

    if (onExtensionRequested) {
      onExtensionRequested(bookingId, daysToAdd);
    }

  } catch (error) {
    console.error('Error sending extension request:', error);
    toast.error(
      typeof error === 'object' && error !== null && 'message' in error
        ? (error as { message?: string }).message
        : 'Failed to send extension request.'
    );
  } finally {
    setIsLoading(false);
  }
};

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