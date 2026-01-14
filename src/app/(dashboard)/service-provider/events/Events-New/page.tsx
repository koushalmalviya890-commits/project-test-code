'use client'

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventFormProvider, useEventForm } from '../services/contexts/EventFormContext';
import EventDetailsTab from './components/eventDetailsTab';
import TicketDetailsTab from './components/ticketDetailsTab';
import RegistrationDetailsTab from './components/registrationDetailsTab';
import TermsConditionsTab from './components/termsConditionsTab';
import { toast } from 'sonner';

const EventCreationContent: React.FC = () => {
  const { submitFinalEvent } = useEventForm();
  const [activeTab, setActiveTab] = useState("event-details");

  const handleFinalSubmit = async () => {
    try {
      await submitFinalEvent();
      // toast.success('Event created successfully! 🎉');
      // Redirect or show success
    } catch (error) {
      // toast.error('Failed to create event. Please try again.');
      console.error('Submission error:', error);
    }
  };

  // Helper to move to next tab
  const goToNextTab = () => {
    const tabOrder = ["event-details", "ticket-details", "registration-details", "terms-conditions"];
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 px-4 md:px-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Let's Create Events</h1>
          <p className="text-gray-600 text-sm md:text-base max-w-4xl leading-relaxed">
            Add complete details including event name, date & time, venue, registration link, and a compelling description. 
            Don't forget high-quality images and an engaging poster to attract more participants and increase visibility.
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
              <TicketDetailsTab  isEditMode={false} onNext={goToNextTab}/>
            </TabsContent>
            <TabsContent value="registration-details">
              <RegistrationDetailsTab  onNext={goToNextTab}/>
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

const EventCreationForm: React.FC = () => {
  return (
    <EventFormProvider>
      <EventCreationContent />
    </EventFormProvider>
  );
};

export default EventCreationForm;
