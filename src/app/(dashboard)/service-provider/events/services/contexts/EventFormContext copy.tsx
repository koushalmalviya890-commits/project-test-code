'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
// import { useSession } from 'next-auth/react';
import { useAuth } from "@/context/AuthContext"
import EventService from '../event-api-services';
import { toast } from 'sonner';
import { set } from 'lodash';
import { 
  convertISTtoUTC, 
  convertUTCtoIST, 
  safeToISOStringUTC, 
  formatDateTimeLocalIST,
  ensureDateObjectIST 
} from "@/utils/dateTimeHelper"
// Keep all your existing interfaces exactly the same
interface Feature {
  name: string;
  files: string[];
}

interface ChiefGuest {
  name: string;
  image: string | null;
}

interface CollectPersonalInfo {
  fullName: 'required' | 'optional';
  email: 'required' | 'optional';
  phoneNumber: 'required' | 'optional';
}

interface CollectIdentityProof {
  idProof: 'required' | 'optional' | 'off';
  idProofType: 'Aadhar Card' | 'PAN Card' | 'Driving License' | 'Passport';
  idNumber: 'required' | 'optional' | 'off';
  websiteLink: 'required' | 'optional' | 'off';
}

interface CustomQuestion {
  id: string;
  questionType: 'text' | 'radio' | 'checkbox' | 'options' | 'website';
  question: string;
  options: string[];
  isRequired: 'required' | 'optional';
}

interface CouponDetail {
  couponCode: string;
  minimumValue: number;
  discount: number;
  validFrom: Date | null;
  validTo: Date | null;
}

interface PostEventFeedbackDetail {
  scheduledDateTime: Date | null;
  bodyContent: string;
}

interface SocialMediaLink {
  socialLink: string;
}

interface GlobalEventFormData {
  // Event Details Tab
  serviceProviderId?: string;
  serviceProviderName?: string;
  title: string;
  status: 'public' | 'private';
  startDateTime: Date | null;
  endDateTime: Date | null;
  venue: string;
  venueStatus: 'online' | 'offline';
  description: string;
  category: string;
  sectors: string[];
  amenities: string[];
  coverImage: string | null;
  features: Feature[];
  chiefGuests: ChiefGuest[];
  hasChiefGuest: boolean;
  hasFeatures: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  activeStatus: 'upcoming' | 'ongoing' | 'completed';
  isFeatured: boolean;

  // Ticket Details Tab
  ticketType: 'free' | 'paid';
  tickets: 'unlimited' | 'limited';
  limitedEventAccess: boolean;
  ticketCapacity: number;
  ticketPrice: number;
  bulkRegistration: boolean;
  bulkTickets: number;
  registrationStartDateTime: Date | null;
  registrationEndDateTime: Date | null;
  customizeTicketEmail: boolean;
  ticketEmailContent: string;
  bulkEmailFile: string | null;

  // Registration Details Tab
  collectPersonalInfo: CollectPersonalInfo[];
  collectIdentityProof: CollectIdentityProof[];
  customQuestions: CustomQuestion[];
  customizeRegistrationEmail: boolean;
  registrationEmailBodyContent: string;

  // Terms & Conditions Tab
  termsAndConditions: string;
  refundPolicy: string;
  couponAvailability: boolean;
  couponDetails: CouponDetail[];
  eventReminder: boolean;
  postEventFeedback: boolean;
  postEventFeedbackDetails: PostEventFeedbackDetail[];
  socialMediaLinks: SocialMediaLink[];
}

const initialFormData: GlobalEventFormData = {
  // Event Details
  serviceProviderId: '',
  serviceProviderName: '',
  title: '',
  status: 'public',
  startDateTime: null,
  endDateTime: null,
  venue: '',
  venueStatus: 'offline',
  description: '',
  category: '',
  sectors: [],
  amenities: [],
  coverImage: null,
  features: [],
  chiefGuests: [],
  hasChiefGuest: false,
  hasFeatures: false,
  approvalStatus: 'pending',
  activeStatus: 'upcoming',
  isFeatured: false,

  // Ticket Details
  ticketType: 'free',
  tickets: 'unlimited',
  ticketCapacity: 0,
  ticketPrice: 0,
  bulkRegistration: false,
  bulkTickets: 0,
  registrationStartDateTime: null,
  registrationEndDateTime: null,
  customizeTicketEmail: false,
  ticketEmailContent: '',
  bulkEmailFile: null,
  limitedEventAccess: false,

  // Registration Details
  collectPersonalInfo: [],
  collectIdentityProof: [],
  customQuestions: [],
  customizeRegistrationEmail: false,
  registrationEmailBodyContent: '',

  // Terms & Conditions
  termsAndConditions: '',
  refundPolicy: '',
  couponAvailability: false,
  couponDetails: [],
  eventReminder: false,
  postEventFeedback: false,
  postEventFeedbackDetails: [],
  socialMediaLinks: [],
};

interface EventFormContextType {
  formData: GlobalEventFormData;
  updateFormData: <K extends keyof GlobalEventFormData>(field: K, value: GlobalEventFormData[K]) => void;
  submitFinalEvent: () => Promise<void>;
  clearFormData: () => void;
  isEditMode: boolean;
  editEventId: string | null;
  setEditMode: (eventId: string) => Promise<void>;
  loadEventForEdit: (eventId: string) => Promise<void>;
  storeCsvFile: (file: File | null) => void;
  showSuccessDialog: boolean;

   // 🕒 EXPOSE HELPER FUNCTIONS
  formatDateTimeLocalIST: (date: Date | string | null) => string;
}

const EventFormContext = createContext<EventFormContextType | undefined>(undefined);

export const EventFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<GlobalEventFormData>(initialFormData);
  // const { data: session } = useSession();
  const { user } = useAuth();

  // NEW EDIT MODE STATES
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEventId, setEditEventId] = useState<string | null>(null);

  // NEW: CSV file storage
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // FIXED: Utility function to safely convert dates
  const ensureDateObject = (value: any): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'string') return new Date(value);
    return null;
  };

  // FIXED: Utility function to safely convert date to ISO string
  const safeToISOString = (date: Date | string | null): string => {
    if (!date) return '';
    if (date instanceof Date) return date.toISOString();
    if (typeof date === 'string') {
      const dateObj = new Date(date);
      return isNaN(dateObj.getTime()) ? '' : dateObj.toISOString();
    }
    return '';
  };


  // success popup open

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  // Load from localStorage - UPDATED to handle edit mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if we're in edit mode
      const savedEventId = localStorage.getItem('editEventId');
      if (savedEventId) {
        setIsEditMode(true);
        setEditEventId(savedEventId);
      }

      // Check if CSV file was uploaded (persist indicator)
      const csvUploaded = localStorage.getItem('csvFileUploaded');
      const csvFileName = localStorage.getItem('csvFileName');
      if (csvUploaded === 'true') {
       // console.log('📁 CSV file indicator found in localStorage:', csvFileName);
      }

      const stored = localStorage.getItem('eventFormData');
      if (stored) {
        try {
          const parsedData = JSON.parse(stored);
          
          // FIXED: Convert date strings back to Date objects with safety checks
          const convertedData = {
            ...parsedData,
            startDateTime: ensureDateObject(parsedData.startDateTime),
            endDateTime: ensureDateObject(parsedData.endDateTime),
            registrationStartDateTime: ensureDateObject(parsedData.registrationStartDateTime),
            registrationEndDateTime: ensureDateObject(parsedData.registrationEndDateTime),
            
            // Handle couponDetails dates
            couponDetails: (parsedData.couponDetails || []).map((coupon: any) => ({
              ...coupon,
              validFrom: ensureDateObject(coupon.validFrom),
              validTo: ensureDateObject(coupon.validTo),
            })),
            
            // Handle postEventFeedbackDetails dates
            postEventFeedbackDetails: (parsedData.postEventFeedbackDetails || []).map((feedback: any) => ({
              ...feedback,
              scheduledDateTime: ensureDateObject(feedback.scheduledDateTime),
            })),
          };

          setFormData(prev => ({ ...prev, ...convertedData }));
        } catch (error) {
          console.error('Error loading from localStorage:', error);
        }
      }
    }
  }, []);

  // FIXED: Auto-save to localStorage with better date handling
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('eventFormData', JSON.stringify(formData));
    }
  }, [formData]);

  const updateFormData = <K extends keyof GlobalEventFormData>(field: K, value: GlobalEventFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // FIXED: Store CSV file with persistence indicator
  const storeCsvFile = (file: File | null) => {
   // console.log('📁 storeCsvFile called with:', file?.name, file?.size);
    setCsvFile(file);
    
    if (file) {
      // Store indicators in localStorage that persist across reloads
      localStorage.setItem('csvFileUploaded', 'true');
      localStorage.setItem('csvFileName', file.name);
     // console.log('📁 CSV file indicators stored in localStorage');
    } else {
      // Clear indicators
      localStorage.removeItem('csvFileUploaded');
      localStorage.removeItem('csvFileName');
     // console.log('📁 CSV file indicators cleared from localStorage');
    }
  };

  // Monitor CSV file changes
  useEffect(() => {
   // console.log('📁 CSV file state changed:', csvFile?.name, csvFile?.size);
  }, [csvFile]);

  // NEW: Send bulk invitations after event creation
  const sendBulkInvitations = async (eventId: string) => {
   // console.log('=== BULK INVITATIONS CHECK ===');
   // console.log('CSV file exists:', !!csvFile);
   // console.log('CSV file name:', csvFile?.name);
   // console.log('Limited event access:', formData.limitedEventAccess);
   // console.log('Event ID:', eventId);

    if (!csvFile || !formData.limitedEventAccess) {
     // console.log('❌ Skipping bulk invitations - conditions not met');
      return { success: true, message: 'No bulk invitations to send' };
    }

    try {
     // console.log('✅ Sending bulk invitations for event:', eventId);
      
      const invitationFormData = new FormData();
      invitationFormData.append('bulkEmailFile', csvFile);
      invitationFormData.append('eventId', eventId);
      invitationFormData.append('eventTitle', formData.title);
      invitationFormData.append('eventVenue', formData.venue);
      invitationFormData.append('startDateTime', safeToISOString(formData.startDateTime));
      invitationFormData.append('registrationEndDateTime', safeToISOString(formData.registrationEndDateTime));
      invitationFormData.append('registrationStartDateTime', safeToISOString(formData.registrationStartDateTime));

     // console.log('📤 Sending FormData to bulk email API...');
      const result = await EventService.sendBulkEventInvitations(invitationFormData);
      
     // console.log('📥 Bulk invitation result:', result);
      return result;
    } catch (error) {
      console.error('💥 Error sending bulk invitations:', error);
      throw error;
    }
  };

  // NEW EDIT MODE FUNCTIONS
  const setEditMode = async (eventId: string) => {
    try {
      setIsEditMode(true);
      setEditEventId(eventId);
      await loadEventForEdit(eventId);
    } catch (error) {
      console.error('Error setting edit mode:', error);
      throw error;
    }
  };


const loadEventForEdit = async (eventId: string) => {
  try {
   // console.log('Loading event for edit:', eventId);
    
    const response = await EventService.getEventForEdit(eventId);
    let eventData;
    if (response.events && response.events.length > 0) {
      eventData = response.events[0];
    } else if (response.data) {
      eventData = response.data;
    } else {
      eventData = response;
    }
    
    if (!eventData) {
      throw new Error('No event data received from server');
    }
    
    // 🕒 Convert UTC dates from API to IST for display
    const processedData = {
      ...eventData,
      startDateTime: eventData.startDateTime ? convertUTCtoIST(new Date(eventData.startDateTime)) : null,
      endDateTime: eventData.endDateTime ? convertUTCtoIST(new Date(eventData.endDateTime)) : null,
      registrationStartDateTime: eventData.registrationStartDateTime ? convertUTCtoIST(new Date(eventData.registrationStartDateTime)) : null,
      registrationEndDateTime: eventData.registrationEndDateTime ? convertUTCtoIST(new Date(eventData.registrationEndDateTime)) : null,
      
      couponDetails: (eventData.couponDetails || []).map((coupon:any) => ({
        ...coupon,
        validFrom: coupon.validFrom ? convertUTCtoIST(new Date(coupon.validFrom)) : null,
        validTo: coupon.validTo ? convertUTCtoIST(new Date(coupon.validTo)) : null,
      })),
      
      postEventFeedbackDetails: (eventData.postEventFeedbackDetails || []).map((feedback:any) => ({
        ...feedback,
        scheduledDateTime: feedback.scheduledDateTime ? convertUTCtoIST(new Date(feedback.scheduledDateTime)) : null,
      })),
      
      registrationEmailBodyContent: eventData.registrationEmailBodyContent || '',
    };

    setFormData(processedData);
    localStorage.setItem('eventFormData', JSON.stringify(processedData));
    
  } catch (error) {
    console.error('Error loading event for edit:', error);
    throw error;
  }
};

  // FIXED: submitFinalEvent with safe date handling
  const submitFinalEvent = async () => {
    try {
     // console.log('🎬 Starting event submission...');
     // console.log('- CSV file loaded:', !!csvFile);
     // console.log('- CSV localStorage indicator:', localStorage.getItem('csvFileUploaded'));

      const eventFormData = new FormData();

      // Event Details
      // eventFormData.append('serviceProviderId', session?.user.id || '');
      eventFormData.append('serviceProviderId', user?.id || '');
      eventFormData.append('serviceProviderName', formData.serviceProviderName || '');
      eventFormData.append('title', formData.title);
      eventFormData.append('status', formData.status);
      eventFormData.append('venue', formData.venue);
      eventFormData.append('venueStatus', formData.venueStatus);
      eventFormData.append('description', formData.description);
      eventFormData.append('category', formData.category);
      eventFormData.append('sectors', JSON.stringify(formData.sectors));
      eventFormData.append('amenities', JSON.stringify(formData.amenities));
      eventFormData.append('hasChiefGuest', formData.hasChiefGuest.toString());
      eventFormData.append('hasFeatures', formData.hasFeatures.toString());
      eventFormData.append('approvalStatus', formData.approvalStatus);
      eventFormData.append('activeStatus', formData.activeStatus);
      eventFormData.append('isFeatured', formData.isFeatured.toString());

      // FIXED: Safe date handling
          // 🕒 CRITICAL: Convert IST dates to UTC before sending
    eventFormData.append('startDateTime', formatDateTimeLocalIST(formData.startDateTime));
    eventFormData.append('endDateTime', formatDateTimeLocalIST(formData.endDateTime));
    eventFormData.append('registrationStartDateTime', formatDateTimeLocalIST(formData.registrationStartDateTime));
    eventFormData.append('registrationEndDateTime', formatDateTimeLocalIST(formData.registrationEndDateTime));
      // File URLs
      if (formData.coverImage) {
        eventFormData.append('coverImage', formData.coverImage);
      }
      eventFormData.append('features', JSON.stringify(formData.features));
      eventFormData.append('chiefGuests', JSON.stringify(formData.chiefGuests));
      if (formData.bulkEmailFile) {
        eventFormData.append('bulkEmailFile', formData.bulkEmailFile);
      }

      // Ticket Details
      eventFormData.append('ticketType', formData.ticketType);
      eventFormData.append('tickets', formData.tickets);
      eventFormData.append('ticketCapacity', formData.ticketCapacity.toString());
      eventFormData.append('ticketPrice', formData.ticketPrice.toString());
      eventFormData.append('bulkRegistration', formData.bulkRegistration.toString());
      eventFormData.append('bulkTickets', formData.bulkTickets.toString());
      eventFormData.append('customizeTicketEmail', formData.customizeTicketEmail.toString());
      eventFormData.append('ticketEmailContent', formData.ticketEmailContent);
      eventFormData.append('limitedEventAccess', formData.limitedEventAccess.toString());
    
      // Registration Details
      eventFormData.append('collectPersonalInfo', JSON.stringify(formData.collectPersonalInfo));
      eventFormData.append('collectIdentityProof', JSON.stringify(formData.collectIdentityProof));
      eventFormData.append('customQuestions', JSON.stringify(formData.customQuestions));
      eventFormData.append('customizeRegistrationEmail', formData.customizeRegistrationEmail.toString());
      eventFormData.append('registrationEmailBodyContent', formData.registrationEmailBodyContent);

      // Terms & Conditions - FIXED: Safe date conversion
      eventFormData.append('termsAndConditions', formData.termsAndConditions);
      eventFormData.append('refundPolicy', formData.refundPolicy);
      eventFormData.append('couponAvailability', formData.couponAvailability.toString());
     eventFormData.append('couponDetails', JSON.stringify(formData.couponDetails.map(coupon => ({
      ...coupon,
      validFrom: formatDateTimeLocalIST(coupon.validFrom),
      validTo: formatDateTimeLocalIST(coupon.validTo),
    }))));
      eventFormData.append('eventReminder', formData.eventReminder.toString());
      eventFormData.append('postEventFeedback', formData.postEventFeedback.toString());
         eventFormData.append('postEventFeedbackDetails', JSON.stringify(formData.postEventFeedbackDetails.map(feedback => ({
      ...feedback,
      scheduledDateTime: formatDateTimeLocalIST(feedback.scheduledDateTime),
    }))));
      eventFormData.append('socialMediaLinks', JSON.stringify(formData.socialMediaLinks));

      // CALL THE APPROPRIATE API BASED ON MODE
      let response;
      if (isEditMode && editEventId) {
        response = await EventService.updateEvent(editEventId, eventFormData);
      } else {
        response = await EventService.createEvent(eventFormData);
          setShowSuccessDialog(true);
      }

      const eventId = (response?.data as { _id?: string })?._id || (response as { _id?: string })?._id || editEventId;
      
      // Show success toast for event creation
      if (isEditMode) {
        toast.success('Event updated successfully!');
      } else {
        toast.success('Event created successfully!');
      }

      // FIXED: Check for CSV file with fallback to localStorage indicator
      const csvFileExists = csvFile || localStorage.getItem('csvFileUploaded') === 'true';
      
     // console.log('📧 Checking bulk email conditions...');
     // console.log('- Response exists:', !!response);
     // console.log('- Limited event access:', formData.limitedEventAccess);
     // console.log('- CSV file exists (direct):', !!csvFile);
     // console.log('- CSV file exists (localStorage):', localStorage.getItem('csvFileUploaded') === 'true');
     // console.log('- CSV file exists (combined):', csvFileExists);
     // console.log('- Event ID exists:', !!eventId);

      if (response && formData.limitedEventAccess && csvFileExists && eventId) {
        try {
         // console.log('🚀 Starting bulk email process...');
          toast.info('📧 Sending bulk invitations...');
          
          const invitationResult = await sendBulkInvitations(eventId);
          
          if (invitationResult.success) {
            toast.success('Bulk invitations sent successfully!'); 
          }

        } catch (invitationError) {
          console.error('💥 Failed to send invitations:', invitationError);
          toast.warning(
            `Event ${isEditMode ? 'updated' : 'created'} successfully, but failed to send some invitations`
          );
        }
      } else {
       // console.log('⏭️ Skipping bulk emails - conditions not met');
      }

      // Clean up on success
      if (response) {
       // console.log('🧹 Cleaning up...');
        localStorage.removeItem('eventFormData');
        localStorage.removeItem('editEventId');
        localStorage.removeItem('csvFileUploaded'); // Clear CSV indicators
        localStorage.removeItem('csvFileName');
        setFormData(initialFormData);
        setIsEditMode(false);
        setEditEventId(null);
        setCsvFile(null);
      }
      
      return;
    } catch (error: any) {
      console.error('💥 Final submission error:', error.message || error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} event: Please check and fill the mandatory details.`);
      throw error;
    }
  };

  // UPDATED clearFormData to handle edit mode
  const clearFormData = () => {
    localStorage.removeItem('eventFormData');
    localStorage.removeItem('editEventId');
    localStorage.removeItem('csvFileUploaded');
    localStorage.removeItem('csvFileName');
    setFormData(initialFormData);
    setIsEditMode(false);
    setEditEventId(null);
    setCsvFile(null);
  };

  return (
    <EventFormContext.Provider value={{
      formData,
      updateFormData,
      submitFinalEvent,
      clearFormData,
      isEditMode,
      editEventId,
      setEditMode,
      loadEventForEdit,
      storeCsvFile,
      formatDateTimeLocalIST,
      showSuccessDialog,
      // setShowSuccessDialog,
    }}>
      {children}
    </EventFormContext.Provider>
  );
};

export const useEventForm = () => {
  const context = useContext(EventFormContext);
  if (!context) {
    throw new Error('useEventForm must be used within EventFormProvider');
  }
  return context;
};
