'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useEventForm } from '../../services/contexts/EventFormContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  FileText, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Clock,
  CheckCircle
} from 'lucide-react';

interface Props {
  onFinalSubmit: () => Promise<void>;
}

interface CouponDetail {
  _id?: string;
  minimumValue: number;
  couponCode: string;
  discount: number;
  validFrom: Date | null;
  validTo: Date | null;
}

interface PostEventFeedback {
  _id?: string;
  scheduledDateTime: Date | null;
  bodyContent: string;
}

const TermsConditionsTab: React.FC<Props> = ({ onFinalSubmit }) => {
  const { formData, updateFormData, showSuccessDialog, setShowSuccessDialog, formatDateTimeLocalIST } = useEventForm() as unknown as {
    formData: {
      title: string;
      startDateTime: Date | null;
      endDateTime: Date | null;
      termsAndConditions: string;
      refundPolicy: string;
      couponAvailability: boolean;
      couponDetails: CouponDetail[];
      eventReminder: boolean;
      postEventFeedback: boolean;
      postEventFeedbackDetails: PostEventFeedback[];
      socialMediaLinks: Array<{ socialLink: string; _id?: string }>;
    };
    showSuccessDialog: boolean;
    setShowSuccessDialog: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (field: keyof any, value: any) => void;
    formatDateTimeLocalIST: (date: any) => string; // 🕒 Added helper
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  // Dialog states
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  
  // Temp states for dialogs
  const [tempTerms, setTempTerms] = useState('');
  const [tempRefund, setTempRefund] = useState('');
  const [tempCoupon, setTempCoupon] = useState<CouponDetail>({
    couponCode: '',
    minimumValue: 0,
    discount: 0,
    validFrom: null,
    validTo: null
  });
  const [tempFeedback, setTempFeedback] = useState<PostEventFeedback>({
    scheduledDateTime: null,
    bodyContent: ''
  });

  // Social media link
  const [newSocialLink, setNewSocialLink] = useState('');

  // 🕒 UPDATED: Date/Time picker states for feedback - removed seconds
  const [feedbackDate, setFeedbackDate] = useState<Date | null>(null);
  const [feedbackTime, setFeedbackTime] = useState<{
    hour: string;
    minute: string;
    period: "AM" | "PM";
  } | null>(null);
  const [openFeedbackCalendar, setOpenFeedbackCalendar] = useState(false);
  const [openFeedbackTimeSelector, setOpenFeedbackTimeSelector] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  // Coupon date states
  const [couponFromDate, setCouponFromDate] = useState<Date | null>(null);
  const [couponToDate, setCouponToDate] = useState<Date | null>(null);

  const { isEditMode } = useEventForm();

  // 🕒 UPDATED: Helper functions for time without seconds
  const getDefaultTime = () => ({
    hour: "09",
    minute: "00",
    period: "AM" as "AM" | "PM"
  });

  const formatTime = (
    time: {
      hour: string;
      minute: string;
      period: "AM" | "PM";
    } | null
  ): string => {
    if (!time) return "Select Time";
    return `${time.hour}:${time.minute} ${time.period}`;
  };

  // 🕒 UPDATED: Time field update function without seconds
  const updateFeedbackTimeField = (
    field: "hour" | "minute" | "period",
    value: string
  ): void => {
    const newTime = feedbackTime
      ? { ...feedbackTime, [field]: value }
      : {
          hour: "09",
          minute: "00",
          period: "AM",
          [field]: value,
        };
    
    setFeedbackTime(newTime as {
      hour: string;
      minute: string;
      period: "AM" | "PM";
    });

    // Auto-update datetime if date is also selected
    if (
      feedbackDate &&
      newTime.hour &&
      newTime.minute &&
      newTime.period
    ) {
      const fullDateTime = computeDateTime(
        feedbackDate,
        newTime as {
          hour: string;
          minute: string;
          period: "AM" | "PM";
        }
      );
      setTempFeedback(prev => ({ ...prev, scheduledDateTime: fullDateTime }));
    }
  };

  // 🕒 UPDATED: Initialize temp states with IST handling (same as other tabs)
  useEffect(() => {
    setTempTerms(formData.termsAndConditions || '');
    setTempRefund(formData.refundPolicy || '');
    
    if (formData.postEventFeedbackDetails.length > 0) {
      const feedback = formData.postEventFeedbackDetails[0];
      setTempFeedback(feedback);
      if (feedback.scheduledDateTime) {
        const dt = new Date(feedback.scheduledDateTime);
        setFeedbackDate(dt);
        let hours = dt.getHours(); // Using local time instead of UTC
        const minutes = String(dt.getMinutes()).padStart(2, '0');
        const period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        setFeedbackTime({ 
          hour: String(hours).padStart(2, '0'), 
          minute: minutes, 
          period 
        });
      }
    }
    
    if (formData.couponDetails.length > 0) {
      const coupon = formData.couponDetails[0];
      setTempCoupon(coupon);
      setCouponFromDate(coupon.validFrom);
      setCouponToDate(coupon.validTo);
    }
  }, [formData]);

  // Custom Calendar Component with validation
  const CustomCalendar = ({
    selectedDate,
    onSelect,
    minDate
  }: {
    selectedDate: Date | undefined;
    onSelect: (date: Date | undefined) => void;
    minDate?: Date;
  }) => {
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();
    const firstDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    ).getDay();
    const today = new Date();

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const isSelected =
        selectedDate && date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === today.toDateString();
      
      // UPDATED: Strict validation - feedback date MUST be after event end date
      let isDisabled = false;
      
      if (formData.endDateTime) {
        // Get the event end date (without time) for comparison
        const eventEndDate = new Date(formData.endDateTime);
        const eventEndDateOnly = new Date(
          eventEndDate.getFullYear(),
          eventEndDate.getMonth(),
          eventEndDate.getDate()
        );
        
        // Date must be AFTER the event end date (not on the same day)
        isDisabled = date <= eventEndDateOnly;
      } else {
        // If no event end date, fall back to minDate or today
        const actualMinDate = minDate || today;
        isDisabled = date <= actualMinDate;
      }

      days.push(
        <button
          key={day}
          onClick={() => !isDisabled && onSelect(date)}
          disabled={isDisabled}
          className={`h-8 w-8 text-sm rounded transition-colors ${
            isSelected
              ? "bg-green-500 text-white font-medium"
              : isToday
                ? "bg-blue-100 text-blue-700"
                : isDisabled
                  ? "text-gray-300 cursor-not-allowed"
                  : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="p-4 w-70 bg-white shadow-lg rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1
                )
              )
            }
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <h3 className="font-semibold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1
                )
              )
            }
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        
        {/* ADDED: Info message about date restriction */}
        {formData.endDateTime && (
          <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
            <strong>Note:</strong> Feedback date must be after the event ends (
            {new Date(formData.endDateTime).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit', 
              year: 'numeric'
            })})
          </div>
        )}
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, index) => (
            <div
              key={day}
              className={`h-8 flex items-center justify-center text-xs font-medium ${
                index === 0 || index === 6 ? "text-green-500" : "text-gray-500"
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    );
  };

  // 🕒 UPDATED: TimePicker without seconds
// 🕒 SIMPLIFIED: TimePicker with better event handling
const TimePicker = ({
  time,
  onTimeChange,
  isOpen,
  onOpenChange,
  type,
}: {
  time: {
    hour: string;
    minute: string;
    period: "AM" | "PM";
  } | null;
  onTimeChange: (
    field: "hour" | "minute" | "period",
    value: string
  ) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  type: "start" | "end";
}) => {
  const currentTime = time || getDefaultTime();

  const handleTimeSet = () => {
    const date = feedbackDate;
    const time = feedbackTime;
    if (
      date &&
      time &&
      time.hour &&
      time.minute &&
      time.period
    ) {
      const fullDateTime = computeDateTime(date, time);
      setTempFeedback(prev => ({ ...prev, scheduledDateTime: fullDateTime }));
    }
    onOpenChange(false);
  };

  return (
    <Popover 
      open={isOpen} 
      onOpenChange={onOpenChange}
      modal={true} // ✅ Fix: Set modal to true to prevent interaction issues
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-11 font-normal shadow-md text-gray-700"
        >
          {formatTime(time)}
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-4" 
        align="start"
        side="bottom"
        // ✅ Remove all the complex event handlers - let modal={true} handle it
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {/* Hour Select */}
            <Select
              value={currentTime.hour}
              onValueChange={(value) => onTimeChange("hour", value)}
            >
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const hour = i + 1;
                  return (
                    <SelectItem
                      key={hour}
                      value={hour.toString().padStart(2, "0")}
                    >
                      {hour.toString().padStart(2, "0")}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <span>:</span>

            {/* Minute Select */}
            <Select
              value={currentTime.minute}
              onValueChange={(value) => onTimeChange("minute", value)}
            >
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 60 }, (_, i) => (
                  <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                    {i.toString().padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* AM/PM Select */}
            <Select
              value={currentTime.period}
              onValueChange={(value) => onTimeChange("period", value)}
            >
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-center">
            <Button
              onClick={handleTimeSet}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-lg font-medium"
            >
              Set
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};


  // Success Dialog Component
  const SuccessDialog = () => (
    <Dialog open={showSuccessDialog} onOpenChange={() => {showSuccessDialog}}>
      <DialogContent 
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center text-center space-y-6 py-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">
              Thank You For Listing An Event On Cumma!
            </h2>
            <p className="text-gray-600 text-sm">
              Your Event Is Currently Under Review. We'll Notify You Once It's Approved.
            </p>
          </div>
          
          <Button
            onClick={() => {
              router.push('/service-provider/events');
              setShowSuccessDialog(false);
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-lg font-medium min-w-[200px]"
          >
            Go to Event List
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Utility functions
  const formatDate = (date: Date | null): string => {
    if (!date) return "Select Date";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // 🕒 UPDATED: computeDateTime with IST handling (same as other tabs)
  const computeDateTime = (
    date: Date,
    time: { hour: string; minute: string; period: "AM" | "PM" }
  ): Date => {
    let hours = parseInt(time.hour);
    if (time.period === "PM" && hours < 12) hours += 12;
    if (time.period === "AM" && hours === 12) hours = 0;
    
    // Create IST date (local time)
    const fullDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      parseInt(time.minute),
      0, // Always set seconds to 0
      0
    );
    return fullDate;
  };

  // Dialog handlers
  const handleSaveTerms = () => {
    updateFormData('termsAndConditions', tempTerms);
    setIsTermsDialogOpen(false);
  };

  const handleSaveRefund = () => {
    updateFormData('refundPolicy', tempRefund);
    setIsRefundDialogOpen(false);
  };

  const handleSaveCoupon = () => {
    if (!tempCoupon.couponCode || !tempCoupon.discount) {
      toast.error('Please fill all coupon fields');
      return;
    }
    
    const couponToSave = {
      ...tempCoupon,
      validFrom: couponFromDate,
      validTo: couponToDate,
    };

    updateFormData('couponDetails', [couponToSave]);
    updateFormData('couponAvailability', true);
    setIsCouponDialogOpen(false);
  };

  const handleDeleteCoupon = () => {
    updateFormData('couponDetails', []);
    updateFormData('couponAvailability', false);
    setTempCoupon({
      couponCode: '',
      minimumValue: 0,
      discount: 0,
      validFrom: null,
      validTo: null
    });
    setCouponFromDate(null);
    setCouponToDate(null);
  };

  const handleSaveFeedback = () => {
    if (!feedbackDate || !feedbackTime || !tempFeedback.bodyContent) {
      toast.error('Please fill all feedback fields');
      return;
    }

    // Validate feedback date is after event end date
    if (formData.endDateTime && feedbackDate <= formData.endDateTime) {
      toast.error('Feedback date must be after the event end date');
      return;
    }

    const scheduledDateTime = computeDateTime(feedbackDate, feedbackTime);
    const feedbackToSave = {
      ...tempFeedback,
      scheduledDateTime,
    };

    updateFormData('postEventFeedbackDetails', [feedbackToSave]);
    updateFormData('postEventFeedback', true);
    setIsFeedbackDialogOpen(false);
  };

  const handleAddSocialLink = () => {
    if (!newSocialLink) return;

    // URL regex (general purpose)
    const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/;

    if (!urlRegex.test(newSocialLink)) {
      toast.error("Please enter a valid URL (e.g. https://twitter.com/username)");
      return;
    }

    const newLink = {
      socialLink: newSocialLink,
    };

    updateFormData("socialMediaLinks", [
      ...formData.socialMediaLinks,
      newLink,
    ]);
    setNewSocialLink("");
  };

  const handleRemoveSocialLink = (id: string) => {
    const updated = formData.socialMediaLinks.filter(link => link._id !== id);
    updateFormData('socialMediaLinks', updated);
  };

  // Final submit handler
  const handleFinalSubmit = async (): Promise<void> => {
    try {
      setIsSubmitting(true);


      await onFinalSubmit();
      
    } catch (error) {
      const errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} event. Please check all required fields.`;
      toast.error(errorMessage);
      console.error('Final submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCoupon = () => {
    if (formData.couponDetails.length > 0) {
      const coupon = formData.couponDetails[0];
      setTempCoupon(coupon);
      setCouponFromDate(coupon.validFrom);
      setCouponToDate(coupon.validTo);
      setIsCouponDialogOpen(true);
    }
  };

  // 🕒 UPDATED: handleEditFeedback with IST handling
  const handleEditFeedback = () => {
    if (formData.postEventFeedbackDetails.length > 0) {
      const feedback = formData.postEventFeedbackDetails[0];
      setTempFeedback(feedback);
      if (feedback.scheduledDateTime) {
        const dt = new Date(feedback.scheduledDateTime);
        setFeedbackDate(dt);
        let hours = dt.getHours(); // Using local time instead of UTC
        const minutes = String(dt.getMinutes()).padStart(2, '0');
        const period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        setFeedbackTime({ 
          hour: String(hours).padStart(2, '0'), 
          minute: minutes, 
          period 
        });
      }
      setIsFeedbackDialogOpen(true);
    }
  };

  return (
    <div className="max-w-4xl p-6">
      <div className="space-y-8">
        
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Terms & Conditions</h2>
          <p className="text-sm text-gray-600">The conditions are shown on event pages and the Terms and Conditions</p>
        </div>

        {/* Terms & Conditions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Terms & Conditions</h3>
            <Dialog open={isTermsDialogOpen} onOpenChange={setIsTermsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="text-green-600 hover:text-green-700 font-medium"
                  onClick={() => {
                    setTempTerms(formData.termsAndConditions || '');
                    setIsTermsDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {formData.termsAndConditions ? 'Edit' : 'Add'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Terms & Conditions
                  </DialogTitle>
                  <p className="text-sm text-gray-600">Specify Your Terms and Conditions</p>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <Textarea
                    value={tempTerms}
                    onChange={(e) => setTempTerms(e.target.value)}
                    placeholder="Refunds can only be issued if the event is cancelled by the host. No refunds will be considered for any other reason, including changes in personal circumstances or inability to attend..."
                    className="min-h-[200px] resize-none"
                  />
                  <Button 
                    onClick={handleSaveTerms}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Save Terms and Condition
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {formData.termsAndConditions ? (
            <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
              <FileText className="w-5 h-5 text-gray-500 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Terms & Condition added</p>
                <p className="text-xs text-gray-500 mt-1">Let guest know what your refund policy is.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <FileText className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">No Terms & Condition added</p>
                <p className="text-xs text-gray-400">Let guest know what your refund policy is.</p>
              </div>
            </div>
          )}
        </div>

        {/* Refund Policy */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Refund Policy</h3>
            <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="text-green-600 hover:text-green-700 font-medium"
                  onClick={() => {
                    setTempRefund(formData.refundPolicy || '');
                    setIsRefundDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {formData.refundPolicy ? 'Edit' : 'Add'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Refund Policy
                  </DialogTitle>
                  <p className="text-sm text-gray-600">Specify Your Refund Policy</p>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <Textarea
                    value={tempRefund}
                    onChange={(e) => setTempRefund(e.target.value)}
                    placeholder="Refunds can only be issued if the event is cancelled by the host. No refunds will be considered for any other reason, including changes in personal circumstances or inability to attend..."
                    className="min-h-[200px] resize-none"
                  />
                  <Button 
                    onClick={handleSaveRefund}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Save Terms and Condition
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {formData.refundPolicy ? (
            <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
              <RefreshCw className="w-5 h-5 text-gray-500 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900"> Refund Policy Added</p>
                <p className="text-xs text-gray-500 mt-1">The refund policy is shown on event pages and the refund policy page.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <RefreshCw className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">No Refund Policy</p>
                <p className="text-xs text-gray-400">The refund policy is shown on event pages and the refund policy page.</p>
              </div>
            </div>
          )}
        </div>

        {/* Coupons */}
        {/* <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Coupons</h3>
            {formData.couponDetails.length === 0 ? (
              <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Coupon</DialogTitle>
                    <p className="text-sm text-gray-600">Create coupon that can be applied to the event</p>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Coupon Code</Label>
                      <Input
                        value={tempCoupon.couponCode}
                        onChange={(e) => setTempCoupon(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                        placeholder="SPARK10"
                        className="uppercase"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Discount (%)</Label>
                      <Input
                        type="number"
                        value={tempCoupon.discount || ''}
                        onChange={(e) => setTempCoupon(prev => ({ ...prev, discount: parseInt(e.target.value) || 0 }))}
                        placeholder="10"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Minimum Purchase Value</Label>
                      <Input
                        type="number"
                        value={tempCoupon.minimumValue || ''}
                        onChange={(e) => setTempCoupon(prev => ({ ...prev, minimumValue: parseInt(e.target.value) || 0 }))}
                        placeholder="10"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Validity Period</Label>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div>
                          <Input
                            type="date"
                            value={couponFromDate ? couponFromDate.toISOString().split('T')[0] : ''}
                            onChange={(e) => setCouponFromDate(e.target.value ? new Date(e.target.value) : null)}
                            className="text-center"
                          />
                          <p className="text-xs text-gray-500 mt-1">From</p>
                        </div>
                        <div>
                          <Input
                            type="date"
                            value={couponToDate ? couponToDate.toISOString().split('T')[0] : ''}
                            onChange={(e) => setCouponToDate(e.target.value ? new Date(e.target.value) : null)}
                            className="text-center"
                          />
                          <p className="text-xs text-gray-500 mt-1">To</p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSaveCoupon}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Add Coupon
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="text-green-600 hover:text-green-700 font-medium"
                    onClick={handleEditCoupon}
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Coupon</DialogTitle>
                    <p className="text-sm text-gray-600">Update coupon details</p>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Coupon Code</Label>
                      <Input
                        value={tempCoupon.couponCode}
                        onChange={(e) => setTempCoupon(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                        placeholder="SPARK10"
                        className="uppercase"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Discount (%)</Label>
                      <Input
                        type="number"
                        value={tempCoupon.discount || ''}
                        onChange={(e) => setTempCoupon(prev => ({ ...prev, discount: parseInt(e.target.value) || 0 }))}
                        placeholder="10"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Minimum Purchase Value</Label>
                      <Input
                        type="number"
                        value={tempCoupon.minimumValue || ''}
                        onChange={(e) => setTempCoupon(prev => ({ ...prev, minimumValue: parseInt(e.target.value) || 0 }))}
                        placeholder="10"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Validity Period</Label>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div>
                          <Input
                            type="date"
                            value={couponFromDate ? couponFromDate.toISOString().split('T')[0] : ''}
                            onChange={(e) => setCouponFromDate(e.target.value ? new Date(e.target.value) : null)}
                            className="text-center"
                          />
                          <p className="text-xs text-gray-500 mt-1">From</p>
                        </div>
                        <div>
                          <Input
                            type="date"
                            value={couponToDate ? couponToDate.toISOString().split('T')[0] : ''}
                            onChange={(e) => setCouponToDate(e.target.value ? new Date(e.target.value) : null)}
                            className="text-center"
                          />
                          <p className="text-xs text-gray-500 mt-1">To</p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSaveCoupon}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Update Coupon
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {formData.couponDetails.length > 0 ? (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-gray-900">{formData.couponDetails[0].couponCode}</div>
                  <div className="text-lg font-bold text-gray-900">{formData.couponDetails[0].discount}%</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-green-600"
                    onClick={handleEditCoupon}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600" onClick={handleDeleteCoupon}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    ✓
                  </Button>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Validity: {formData.couponDetails[0].validFrom ? formatDate(formData.couponDetails[0].validFrom) : 'No start date'} - {formData.couponDetails[0].validTo ? formatDate(formData.couponDetails[0].validTo) : 'No end date'}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Create coupon that can be applied to the event</div>
          )}
        </div> */}

 <div className="space-y-4">
  <div className="flex items-center justify-between">
    <h3 className="text-lg font-semibold text-gray-900">Coupons</h3>
    {formData.couponDetails.length === 0 ? (
      <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Coupon</DialogTitle>
            <p className="text-sm text-gray-600">
              Create coupon that can be applied to the event
            </p>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Coupon Code */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Coupon Code</Label>
              <Input
                value={tempCoupon.couponCode}
                onChange={(e) =>
                  setTempCoupon((prev) => ({
                    ...prev,
                    couponCode: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="SPARK10"
                className="uppercase"
              />
            </div>

            {/* Discount */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Discount (%)</Label>
              <Input
                type="number"
                value={tempCoupon.discount || ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value >= 100) {
                    toast.error("❌ Discount cannot be 100% or more.");
                    return;
                  }
                  setTempCoupon((prev) => ({ ...prev, discount: value }));
                }}
                placeholder="10"
                min="0"
                max="99"
              />
            </div>

            {/* Minimum Value */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Minimum Purchase Value
              </Label>
              <Input
                type="number"
                value={tempCoupon.minimumValue || ""}
                onChange={(e) =>
                  setTempCoupon((prev) => ({
                    ...prev,
                    minimumValue: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="10"
                min="0"
              />
            </div>

            {/* Validity Period */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Validity Period
              </Label>
              <div className="grid grid-cols-2 gap-2 text-center">
                {/* From Date */}
                <div>
                  <Input
                    type="date"
                    value={
                      couponFromDate
                        ? couponFromDate.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setCouponFromDate(
                        e.target.value ? new Date(e.target.value) : null
                      )
                    }
                    className="text-center"
                    min={new Date().toISOString().split("T")[0]} // disable before today
                  />
                  <p className="text-xs text-gray-500 mt-1">From</p>
                </div>

                {/* To Date */}
                <div>
                  <Input
                    type="date"
                    value={
                      couponToDate
                        ? couponToDate.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      const selectedTo = e.target.value
                        ? new Date(e.target.value)
                        : null;
                      if (
                        selectedTo &&
                        couponFromDate &&
                        selectedTo < couponFromDate
                      ) {
                        toast.error("⚠️ 'To' date must be after 'From' date.");
                        return;
                      }
                      setCouponToDate(selectedTo);
                    }}
                    className="text-center"
                    min={
                      couponFromDate
                        ? couponFromDate.toISOString().split("T")[0]
                        : new Date().toISOString().split("T")[0]
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">To</p>
                </div>
              </div>
            </div>

            {/* Save */}
            <Button
              onClick={handleSaveCoupon}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Add Coupon
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    ) : (
      /* ---------- Edit Coupon Dialog ---------- */
      <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="text-green-600 hover:text-green-700 font-medium"
            onClick={handleEditCoupon}
          >
            <Edit3 className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <p className="text-sm text-gray-600">Update coupon details</p>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Coupon Code */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Coupon Code</Label>
              <Input
                value={tempCoupon.couponCode}
                onChange={(e) =>
                  setTempCoupon((prev) => ({
                    ...prev,
                    couponCode: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="SPARK10"
                className="uppercase"
              />
            </div>

            {/* Discount */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Discount (%)</Label>
              <Input
                type="number"
                value={tempCoupon.discount || ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value >= 100) {
                    toast.error("❌ Discount cannot be 100% or more.");
                    return;
                  }
                  setTempCoupon((prev) => ({ ...prev, discount: value }));
                }}
                placeholder="10"
                min="0"
                max="99"
              />
            </div>

            {/* Minimum Value */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Minimum Purchase Value
              </Label>
              <Input
                type="number"
                value={tempCoupon.minimumValue || ""}
                onChange={(e) =>
                  setTempCoupon((prev) => ({
                    ...prev,
                    minimumValue: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="10"
                min="0"
              />
            </div>

            {/* Validity */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Validity Period
              </Label>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <Input
                    type="date"
                    value={
                      couponFromDate
                        ? couponFromDate.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setCouponFromDate(
                        e.target.value ? new Date(e.target.value) : null
                      )
                    }
                    className="text-center"
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <p className="text-xs text-gray-500 mt-1">From</p>
                </div>

                <div>
                  <Input
                    type="date"
                    value={
                      couponToDate
                        ? couponToDate.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      const selectedTo = e.target.value
                        ? new Date(e.target.value)
                        : null;
                      if (
                        selectedTo &&
                        couponFromDate &&
                        selectedTo < couponFromDate
                      ) {
                        toast.error("⚠️ 'To' date must be after 'From' date.");
                        return;
                      }
                      setCouponToDate(selectedTo);
                    }}
                    className="text-center"
                    min={
                      couponFromDate
                        ? couponFromDate.toISOString().split("T")[0]
                        : new Date().toISOString().split("T")[0]
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">To</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSaveCoupon}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Update Coupon
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )}
  </div>

  {/* Coupon Display */}
  {formData.couponDetails.length > 0 ? (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold text-gray-900">
            {formData.couponDetails[0].couponCode}
          </div>
          <div className="text-lg font-bold text-gray-900">
            {formData.couponDetails[0].discount}%
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-green-600"
            onClick={handleEditCoupon}
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600"
            onClick={handleDeleteCoupon}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            ✓
          </Button>
        </div>
      </div>
      <div className="text-sm text-gray-600">
        Validity:{" "}
        {formData.couponDetails[0].validFrom
          ? formatDate(formData.couponDetails[0].validFrom)
          : "No start date"}{" "}
        -{" "}
        {formData.couponDetails[0].validTo
          ? formatDate(formData.couponDetails[0].validTo)
          : "No end date"}
      </div>
    </div>
  ) : (
    <div className="text-sm text-gray-500">
      Create coupon that can be applied to the event
    </div>
  )}
</div>



        {/* Event Reminders */}
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Event Reminders</h3>
              <p className="text-sm text-gray-600">Reminders are sent automatically via email, SMS, and push notification</p>
            </div>
            <Switch
              checked={formData.eventReminder}
              onCheckedChange={(checked) => updateFormData('eventReminder', checked)}
            />
          </div>

          {formData.eventReminder && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <div className="space-y-2 ml-1">
          <div>
            <span className="text-sm">Event is starting tomorrow</span>
            <span className="ml-3 text-green-600 font-semibold">
              TO: Going: <span>Before 1 day of event start date</span>
            </span>
          </div>
          <div>
            <span className="text-sm">Event is starting in 1 hour</span>
            <span className="ml-3 text-yellow-700 font-semibold">
              TO: scheduled: <span>Before 1 hour of event start time</span>
            </span>
          </div>
        </div>
            </div>
          )}
        </div>

        {/* Post-Event Feedback */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Post-Event Feedback</h3>
            {formData.postEventFeedbackDetails.length === 0 ? (
              <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">📧</span>
                      </div>
                      Schedule Feedback Email
                    </DialogTitle>
                    <p className="text-sm text-gray-600">When should the feedback email go out after the event</p>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Date</Label>
                        <Collapsible
                          open={openFeedbackCalendar}
                          onOpenChange={setOpenFeedbackCalendar}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between h-11 font-normal text-gray-700 border-gray-300 hover:border-green-500"
                            >
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                {formatDate(feedbackDate)}
                              </div>
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="mt-2">
                              <CustomCalendar
                                selectedDate={feedbackDate || undefined}
                                onSelect={(date) => {
                                  setFeedbackDate(date || null);
                                  setOpenFeedbackCalendar(false);
                                }}
                                minDate={formData.endDateTime || new Date()}
                              />
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Time</Label>
                        <TimePicker
                          time={feedbackTime}
                          onTimeChange={updateFeedbackTimeField}
                          isOpen={openFeedbackTimeSelector}
                          onOpenChange={setOpenFeedbackTimeSelector}
                          type="start"
                        />
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Feedback will be sent after the event ends
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Subject</Label>
                      <Input 
                        value="Thanks for joining"
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Body</Label>
                      <Textarea
                        value={tempFeedback.bodyContent}
                        onChange={(e) => setTempFeedback(prev => ({ ...prev, bodyContent: e.target.value }))}
                        placeholder="Your event feedback message here..."
                        className="min-h-[100px] resize-none"
                      />
                    </div>

                    <div className="text-xs text-gray-500">
                      What did you think of{" "}
                      <span className="text-green-600">
                        {formData.title}
                      </span>{" "}
                      ?<br />
                      😄 🙂 😐 😞 🤮
                    </div>

                    <Button 
                      onClick={handleSaveFeedback}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Schedule Feedback Mail
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="text-green-600 hover:text-green-700 font-medium"
                    onClick={handleEditFeedback}
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">📧</span>
                      </div>
                      Update Feedback Email
                    </DialogTitle>
                    <p className="text-sm text-gray-600">Update your feedback email settings</p>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Date</Label>
                        <Collapsible
                          open={openFeedbackCalendar}
                          onOpenChange={setOpenFeedbackCalendar}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between h-11 font-normal text-gray-700 border-gray-300 hover:border-green-500"
                            >
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                {formatDate(feedbackDate)}
                              </div>
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="mt-2">
                              <CustomCalendar
                                selectedDate={feedbackDate || undefined}
                                onSelect={(date) => {
                                  setFeedbackDate(date || null);
                                  setOpenFeedbackCalendar(false);
                                }}
                                minDate={formData.endDateTime || new Date()}
                              />
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Time</Label>
                        <TimePicker
                          time={feedbackTime}
                          onTimeChange={updateFeedbackTimeField}
                          isOpen={openFeedbackTimeSelector}
                          onOpenChange={setOpenFeedbackTimeSelector}
                          type="start"
                        />
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Feedback will be sent after the event ends
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Subject</Label>
                      <Input 
                        value="Thanks for joining"
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Body</Label>
                      <Textarea
                        value={tempFeedback.bodyContent}
                        onChange={(e) => setTempFeedback(prev => ({ ...prev, bodyContent: e.target.value }))}
                        placeholder="Your event feedback message here..."
                        className="min-h-[100px] resize-none"
                      />
                    </div>

                    <div className="text-xs text-gray-500">
                      What did you think of{" "}
                      <span className="text-green-600">
                        {formData.title}
                      </span>{" "}
                      ?<br />
                      😄 🙂 😐 😞 🤮
                    </div>

                    <Button 
                      onClick={handleSaveFeedback}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Update Feedback Mail
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {formData.postEventFeedbackDetails.length > 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Feedback scheduled</span>
                </div>
                <Button 
                  size="sm"
                  variant="outline" 
                  className="text-green-600 hover:text-green-700"
                  onClick={handleEditFeedback}
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  View Details
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                Date: {formData.postEventFeedbackDetails[0].scheduledDateTime ? 
                  formatDate(formData.postEventFeedbackDetails[0].scheduledDateTime) : 'Not set'}
              </div>
              {/* 🕒 UPDATED: Display time without seconds */}
              <div className="text-sm text-gray-600">
                Time: {formData.postEventFeedbackDetails[0].scheduledDateTime ? (() => {
                  const dt = new Date(formData.postEventFeedbackDetails[0].scheduledDateTime);
                  let hours = dt.getHours(); // Using local time
                  const minutes = String(dt.getMinutes()).padStart(2, '0');
                  const period = hours >= 12 ? 'PM' : 'AM';
                  hours = hours % 12 || 12;
                  return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
                })() : 'Not set'}
              </div>
              <div className="text-xs text-gray-500 bg-white p-2 rounded border-l-4 border-green-500">
                Message: {formData.postEventFeedbackDetails[0].bodyContent || 'No message set'}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              Schedule a feedback email to go out after the event
            </div>
          )}
        </div>

        {/* Social Media Link */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Social Media Link</h3>
          
          <div className="flex gap-2">
            <Input
              value={newSocialLink}
              onChange={(e) => setNewSocialLink(e.target.value)}
              placeholder="Share your link Here"
              className="flex-1"
            />
            <Button 
              onClick={handleAddSocialLink}
              disabled={!newSocialLink}
              className="bg-green-600 hover:bg-green-700 px-6"
            >
              Add
            </Button>
          </div>

          {formData.socialMediaLinks.map((link) => (
            <div key={link._id} className="flex items-center gap-2">
              <Input 
                value={link.socialLink} 
                disabled 
                className="flex-1 bg-gray-50"
              />
              <Button 
                size="sm"
                variant="outline" 
                className="text-red-600 hover:text-red-700"
                onClick={() => handleRemoveSocialLink(link._id!)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-8">
          <Button
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white px-16 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                {isEditMode ? 'Updating Event...' : 'Creating Event...'}
              </div>
            ) : (
              isEditMode ? 'Update Event' : 'Submit for Approval'
            )}
          </Button>
        </div>
      </div>

      {/* Success Dialog */}
      <SuccessDialog />
    </div>
  );
};

export default TermsConditionsTab;
