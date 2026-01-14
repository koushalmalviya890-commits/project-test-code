// app/event-detail/[id]/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, AlertTriangle, Info, Menu, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import EventService from '../../services/event-api-services'; // Adjust path as needed
import { toast } from 'sonner';
import Image from 'next/image';

// Import tab components
import AboutTab from '../components/AboutTab';
import BlastTab from '../components/BlastTab';
import BookingTab from '../components/BookingTab';
import RevenueTab from '../components/RevenueTab';
import FeedbackTab from '../components/FeedbackTab';

interface EventData {
  _id: string;
  serviceProviderId: string;
  serviceProviderName: string;
  title: string;
  status: 'public' | 'private';
  startDateTime: string;
  endDateTime: string;
  venue: string;
  venueStatus: 'offline' | 'online';
  description: string;
  category: string;
  sectors: string[];
  amenities: string[];
  coverImage: string;
  features: Array<{
    name: string;
    files: string[];
    _id: string;
  }>;
  chiefGuests: Array<{
    name: string;
    image: string;
    _id: string;
  }>;
  hasChiefGuest: boolean;
  hasFeatures: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  activeStatus: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  ticketType: 'free' | 'paid';
  tickets: 'limited' | 'unlimited';
  ticketCapacity: number;
  ticketPrice: number;
  bulkRegistration: boolean;
  bulkTickets: number;
  registrationStartDateTime: string;
  registrationEndDateTime: string;
  customizeTicketEmail: boolean;
  ticketEmailContent: string;
  termsAndConditions: string;
  refundPolicy: string;
  couponAvailability: boolean;
  couponDetails: any[];
  eventReminder: boolean;
  postEventFeedback: boolean;
  socialMediaLinks: any[];
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRestrictionBanner, setShowRestrictionBanner] = useState(false);
  const [restrictionReason, setRestrictionReason] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  // Show restriction banner for 5 seconds
  const showRestrictionWarning = (reason: string) => {
    setRestrictionReason(reason);
    setShowRestrictionBanner(true);
    
    setTimeout(() => {
      setShowRestrictionBanner(false);
    }, 5000);
  };

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await EventService.getEventForEdit(eventId);
      const event = response.events?.[0] || response.data || response;
      
      if (!event) {
        throw new Error('Event not found');
      }

      setEventData(event);
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error('Failed to load event details');
      router.push('/events'); // Redirect to events list
    } finally {
      setLoading(false);
    }
  };

  // Get event status text using the same logic as main table
  const getEventStatusText = (event: EventData): string => {
    if (event.approvalStatus === "pending") {
      return "Pending for Approval";
    }

    if (event.approvalStatus === "rejected") {
      return "Rejected";
    }

    if (event.approvalStatus === "approved") {
      if (event.activeStatus === "cancelled") {
        return "Cancelled By You";
      }

      // Time-based status comparison
      const now = new Date().getTime();
      const startDateTime = new Date(event.startDateTime).getTime();
      const endDateTime = new Date(event.endDateTime).getTime();

      if (now < startDateTime) {
        return "Upcoming";
      } else if (startDateTime <= now && now < endDateTime) {
        return "Ongoing";
      } else if (now >= endDateTime) {
        return "Completed";
      }
    }

    return "Unknown";
  };

  // Get status badge with proper styling
  const getStatusBadge = (event: EventData) => {
    const statusText = getEventStatusText(event);

    const statusStyles: Record<string, string> = {
      "Upcoming": "bg-blue-100 text-blue-800",
      "Ongoing": "bg-orange-100 text-orange-800",
      "Completed": "bg-green-100 text-green-800",
      "Cancelled By You": "bg-red-100 text-red-800",
      "Rejected": "bg-red-100 text-red-800",
      "Pending for Approval": "bg-yellow-100 text-yellow-800",
    };

    const style = statusStyles[statusText] || "bg-gray-100 text-gray-800";

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${style}`}>
        {statusText}
      </span>
    );
  };

  // Check if event can be modified/cancelled - same logic as main table
  const canModifyEvent = (event: EventData) => {
    const statusText = getEventStatusText(event);
    
    // Only allow modification for "Upcoming" and "Pending for Approval" statuses
    if (statusText === "Upcoming" || statusText === "Pending for Approval") {
      return { canModify: true };
    }
    
    return { canModify: false, reason: statusText };
  };

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    if (!eventData) return;
    
    const modifyCheck = canModifyEvent(eventData);
    if (!modifyCheck.canModify) {
      showRestrictionWarning(modifyCheck.reason || "unknown");
      return;
    }
    
    router.push(`/service-provider/events/edit-event/${eventId}`);
  };

  const handleCancel = () => {
    if (!eventData) return;
    
    const modifyCheck = canModifyEvent(eventData);
    if (!modifyCheck.canModify) {
      showRestrictionWarning(modifyCheck.reason || "unknown");
      return;
    }
    
    setShowCancelDialog(true);
  };

  const confirmCancel = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/api/event/cancel/${eventId}`, {
        method: 'PUT',
      });

      if (!res.ok) throw new Error("Failed to cancel event");

      toast.success("Event cancelled successfully");
      setShowCancelDialog(false);
      fetchEventDetails();
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel event");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Event not found</h2>
          <Button onClick={() => router.push('/events')}>
            Return to Events
          </Button>
        </div>
      </div>
    );
  }

  // Determine if actions should be shown based on status logic
  const modifyCheck = canModifyEvent(eventData);
  const shouldShowActions = modifyCheck.canModify;

  return (
    <div className="min-h-screen">
      {/* Restriction Warning Banner */}
      {showRestrictionBanner && (
        <div className="px-4 md:px-6 mb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4 flex items-center gap-3">
            <div className="bg-yellow-500 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0">
              !
            </div>
            <p className="text-yellow-800 text-sm md:text-base">
              You cannot modify or cancel because the event status is {restrictionReason}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-gray-200 px-4 md:px-6 lg:px-0 lg:max-w-7xl lg:mx-auto mt-3">
        <h1 className='font-bold text-2xl md:text-3xl mb-4'>Events</h1>
        
        <div className="lg:max-w-7xl lg:mx-auto lg:px-6 py-4">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between">
            {/* Left side - Back button and title */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-gray-900">
                    {eventData.title}
                  </h1>
                  
                  {/* Status badges using new logic */}
                  <div className="flex items-center gap-2">
                    {getStatusBadge(eventData)}
                  </div>
                </div>
                
                <p className="text-sm text-gray-500">
                  {eventData.serviceProviderName}
                </p>
                
                {getEventStatusText(eventData) === "Pending for Approval" && (
                  <p className="text-xs text-gray-400">
                    Waiting for Approval
                  </p>
                )}
              </div>
            </div>

            {/* Right side - Action buttons */}
            {shouldShowActions && (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="bg-red-500 text-white border-red-500 hover:bg-red-600"
                >
                  Cancel
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Header */}
          <div className="md:hidden">
            {/* Mobile Header Row 1 - Back and Menu */}
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back</span>
              </Button>

              {shouldShowActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleEdit} className="flex items-center gap-2">
                      <Edit2 className="h-4 w-4" />
                      Edit Event
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleCancel} 
                      className="flex items-center gap-2 text-red-600 focus:text-red-600"
                    >
                      <X className="h-4 w-4" />
                      Cancel Event
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Mobile Header Row 2 - Event Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                {/* Event Cover Image */}
                {eventData.coverImage && (
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                    <Image 
                      src={eventData.coverImage} 
                      alt={eventData.title} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-gray-900 line-clamp-2 mb-1">
                    {eventData.title}
                  </h1>
                  
                  <p className="text-sm text-gray-500 mb-2">
                    {eventData.serviceProviderName}
                  </p>
                  
                  {/* Status badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(eventData)}
                    {getEventStatusText(eventData) === "Pending for Approval" && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        Waiting for Approval
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md mx-4 md:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-semibold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Cancel Event
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              Are you sure you want to cancel this event? This action cannot be undone.
            </p>
            
            {/* Refund Policy Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900 text-sm md:text-base">Refund Policy</h4>
                  <div className="text-xs md:text-sm text-blue-800 space-y-1">
                    <p>• Refunds for cancelled events will be processed within <strong>7 working days</strong></p>
                    <p>• Our support team will contact you shortly to assist with the cancellation process</p>
                    <p>• All registered attendees will be automatically notified of the cancellation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-xs md:text-sm text-amber-800">
                  <strong>Important:</strong> Once cancelled, this event cannot be restored. Please ensure this is your intended action.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowCancelDialog(false)}
              className="flex-1 sm:flex-none order-2 sm:order-1"
            >
              No, Keep Event
            </Button>
            <Button 
              className="bg-red-500 text-white hover:bg-red-600 flex-1 sm:flex-none order-1 sm:order-2" 
              onClick={confirmCancel}
            >
              Yes, Cancel Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Information Banner for Non-Modifiable Events */}
      {!shouldShowActions && (
        <div className="px-4 md:px-6 lg:max-w-7xl lg:mx-auto lg:px-6">
          <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 md:px-4 py-3 rounded-lg mb-4">
            <span className="text-lg flex-shrink-0">⚠️</span>
            <p className="text-sm">
              {(() => {
                const status = getEventStatusText(eventData);
                switch (status) {
                  case "Rejected":
                    return "This event has been rejected. You cannot modify or cancel it.";
                  case "Ongoing":
                    return "This event is currently ongoing. You cannot modify or cancel it.";
                  case "Completed":
                    return "This event has been completed. You cannot modify or cancel it.";
                  case "Cancelled By You":
                    return "This event has been cancelled. You cannot modify it further.";
                  default:
                    return "You cannot modify or cancel this event due to its current status.";
                }
              })()}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 md:px-6 lg:max-w-7xl lg:mx-auto lg:px-0 bg-white">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Desktop Tabs */}
          <TabsList className="hidden md:grid w-full grid-cols-5 bg-white border-b border-gray-200 rounded-lg p-1">
            <TabsTrigger 
              value="about" 
              className="text-sm font-medium data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none pb-2"
            >
              About
            </TabsTrigger>
            <TabsTrigger 
              value="blast" 
              className="text-sm font-medium data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none pb-2"
            >
              Blast
            </TabsTrigger>
            <TabsTrigger 
              value="bookings" 
              className="text-sm font-medium data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none pb-2"
            >
              Bookings
            </TabsTrigger>
            <TabsTrigger 
              value="revenue" 
              className="text-sm font-medium data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none pb-2"
            >
              Revenue
            </TabsTrigger>
            <TabsTrigger 
              value="feedback" 
              className="text-sm font-medium data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none pb-2"
            >
              Feedback
            </TabsTrigger>
          </TabsList>

          {/* Mobile Tabs - Horizontal Scroll */}
          <div className="md:hidden">
            <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200 bg-white">
              <div className="flex min-w-max">
                {[
                  { value: "about", label: "About" },
                  { value: "blast", label: "Blast" },
                  { value: "bookings", label: "Bookings" },
                  { value: "revenue", label: "Revenue" },
                  { value: "feedback", label: "Feedback" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.value
                        ? "text-green-600 border-green-600"
                        : "text-gray-500 border-transparent hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="pt-4 md:pt-0">
            <TabsContent value="about" className="mt-0">
              <AboutTab eventData={eventData} />
            </TabsContent>
            <TabsContent value="blast" className="mt-0">
              <BlastTab eventData={eventData} />
            </TabsContent>
            <TabsContent value="bookings" className="mt-0">
              <BookingTab eventData={eventData} />
            </TabsContent>
            <TabsContent value="revenue" className="mt-0">
              <RevenueTab eventData={eventData} />
            </TabsContent>
            <TabsContent value="feedback" className="mt-0">
              <FeedbackTab eventData={eventData} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
