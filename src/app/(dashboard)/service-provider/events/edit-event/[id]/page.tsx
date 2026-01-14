// app/edit-event/[id]/page.tsx
'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// FIX: Correct the import path based on your folder structure
import { EventFormProvider, useEventForm } from '../../services/contexts/EventFormContext';
import EventDetailsTab from '../../Events-New/components/eventDetailsTab';
import TicketDetailsTab from '../../Events-New/components/ticketDetailsTab';
import RegistrationDetailsTab from '../../Events-New/components/registrationDetailsTab';
import TermsConditionsTab from '../../Events-New/components/termsConditionsTab';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
const EditEventContent: React.FC = () => {
  const params = useParams();
  const eventId = params.id as string;
  const { submitFinalEvent, setEditMode, isEditMode, formData , clearFormData } = useEventForm();
  const [activeTab, setActiveTab] = useState("event-details");
  const [loading, setLoading] = useState(true);
      const router = useRouter();
  // Load event data when page loads
  useEffect(() => {
    const loadEventData = async () => {
      try {
        setLoading(true);
        await setEditMode(eventId);
        setLoading(false);
      } catch (error) {
        console.error('Error loading event:', error);
        toast.error('Failed to load event for editing');
        setLoading(false);
      }
    };

    if (eventId && !isEditMode) {
      loadEventData();
    }
  }, [eventId, setEditMode, isEditMode]);

  const handleFinalSubmit = async () => {
    try {
      await submitFinalEvent();
      clearFormData();
      router.push('/service-provider/events');
      // toast.success('Event updated successfully! 🎉');
    } catch (error) {
      toast.error('Failed to update event. Please try again.');
      console.error('Update error:', error);
    }
  };

  const goToNextTab = () => {
    const tabOrder = ["event-details", "ticket-details", "registration-details", "terms-conditions"];
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p>Loading event data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 px-4 md:px-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Edit Event: {formData.title}
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-4xl leading-relaxed">
            Update your event details and save changes. All modifications will be applied to the existing event.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto bg-white rounded-t-lg border-b border-black/10 text-black">
              <TabsTrigger value="event-details" className="text-xs md:text-sm py-3 data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:shadow-none rounded-none">
                Event Details
              </TabsTrigger>
              <TabsTrigger value="ticket-details" className="text-xs md:text-sm py-3 data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:shadow-none rounded-none">
                Ticket Details
              </TabsTrigger>
              <TabsTrigger value="registration-details" className="text-xs md:text-sm py-3 data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:shadow-none rounded-none">
                Registration Details
              </TabsTrigger>
              <TabsTrigger value="terms-conditions" className="text-xs md:text-sm py-3 data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:shadow-none rounded-none">
                Terms & Conditions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="event-details">
              <EventDetailsTab onNext={goToNextTab} />
            </TabsContent>
            <TabsContent value="ticket-details">
              <TicketDetailsTab onNext={goToNextTab}  isEditMode={isEditMode} />
            </TabsContent>
            <TabsContent value="registration-details">
              <RegistrationDetailsTab onNext={goToNextTab} isEditMode={isEditMode}/>
            </TabsContent>
            <TabsContent value="terms-conditions">
              <TermsConditionsTab onFinalSubmit={handleFinalSubmit} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

const EditEventForm: React.FC = () => {
  return (
    <EventFormProvider>
      <EditEventContent />
    </EventFormProvider>
  );
};

export default EditEventForm;
