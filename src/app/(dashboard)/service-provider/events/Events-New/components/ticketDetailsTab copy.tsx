"use client";

import React, { useState, useEffect, useRef } from "react";
import { useEventForm } from "../../services/contexts/EventFormContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  Download,
} from "lucide-react";
import { toast } from "sonner";

interface ValidationErrors {
  [key: string]: string;
}

const TicketDetailsTab: React.FC<{ onNext: () => void , isEditMode: boolean }> = ({ onNext , isEditMode }) => {
  const { formData, updateFormData, storeCsvFile, formatDateTimeLocalIST } = useEventForm() as unknown as {
    formData: {
      startDateTime: string; // Event start time from previous tab
      status: "public" | "private";
      ticketType: "free" | "paid";
      tickets: "limited" | "unlimited";
      ticketCapacity: number;
      ticketPrice: number;
      bulkRegistration: boolean;
      bulkTickets: number;
      registrationStartDateTime: string;
      registrationEndDateTime: string;
      customizeTicketEmail: boolean;
      ticketEmailContent: string;
      bulkEmailFile: string | null;
      limitedEventAccess: boolean;
    };
    updateFormData: (field: keyof any, value: any) => void;
    storeCsvFile: (file: File | null) => void;
    formatDateTimeLocalIST: (date: any) => string; // 🕒 Added helper
  };

  // 🕒 UPDATED: Removed seconds from time states
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<{
    hour: string;
    minute: string;
    period: "AM" | "PM";
  } | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<{
    hour: string;
    minute: string;
    period: "AM" | "PM";
  } | null>(null);

  const [openCalendar, setOpenCalendar] = useState<"start" | "end" | null>(null);
  const [openTimeSelector, setOpenTimeSelector] = useState<"start" | "end" | null>(null);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [errors, setErrors] = useState<ValidationErrors>({});

  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  // 🕒 UPDATED: Initialize dates with IST conversion (same as EventDetailsTab)
  useEffect(() => {
    if (formData.registrationStartDateTime) {
      const dt = new Date(formData.registrationStartDateTime);
      setStartDate(dt);
      let hours = dt.getHours(); // Using local time instead of UTC
      const minutes = String(dt.getMinutes()).padStart(2, "0");
      const period = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setStartTime({
        hour: String(hours).padStart(2, "0"),
        minute: minutes,
        period,
      });
    }

    if (formData.registrationEndDateTime) {
      const dt = new Date(formData.registrationEndDateTime);
      setEndDate(dt);
      let hours = dt.getHours(); // Using local time instead of UTC
      const minutes = String(dt.getMinutes()).padStart(2, "0");
      const period = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setEndTime({
        hour: String(hours).padStart(2, "0"),
        minute: minutes,
        period,
      });
    }
  }, [formData.registrationStartDateTime, formData.registrationEndDateTime]);

  const updateField = (field: keyof typeof formData, value: any) => {
    updateFormData(field, value);
    // Clear error when field is updated
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // File upload for bulk registration - Store actual File object
  const handleBulkFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
     // console.log('🔍 File selected:', file.name, file.size);
      
      // Store file name in formData for UI display
      updateField("bulkEmailFile", file.name);
      
      // ✅ THIS IS CRITICAL - Store actual File object in context
      storeCsvFile(file);
      
     // console.log('✅ File stored in context');
      toast.success(`CSV file "${file.name}" uploaded successfully`);
    }
  };

  const removeBulkFile = () => {
    updateField("bulkEmailFile", null);
    storeCsvFile(null); // Clear the stored file
    if (bulkFileInputRef.current) {
      bulkFileInputRef.current.value = "";
    }
    toast.info('CSV file removed');
  };

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Number of tickets validation
    if (formData.tickets === "limited" && formData.ticketCapacity <= 1) {
      newErrors.ticketCapacity = "Number of tickets must be greater than 1";
    }

    // Bulk tickets validation
    if (formData.bulkRegistration) {
      if (formData.bulkTickets <= 1) {
        newErrors.bulkTickets = "Bulk tickets must be greater than 1";
      } else if (formData.tickets === "limited" && formData.bulkTickets >= formData.ticketCapacity) {
        newErrors.bulkTickets = "Bulk tickets must be less than total number of tickets";
      }
    }

    // Ticket price validation
    if (formData.ticketType === "paid" && formData.ticketPrice <= 1) {
      newErrors.ticketPrice = "Ticket price must be greater than 1";
    }

    // Registration start date validation
    if (!formData.registrationStartDateTime) {
      newErrors.registrationStartDateTime = "Registration start date and time are required";
    } else {
      const regStartDate = new Date(formData.registrationStartDateTime);
      const eventStartDate = new Date(formData.startDateTime);
      
      if (regStartDate >= eventStartDate) {
        newErrors.registrationStartDateTime = "Registration start must be before event start time";
      }
    }

    // Registration end date validation
    if (!formData.registrationEndDateTime) {
      newErrors.registrationEndDateTime = "Registration end date and time are required";
    } else {
      const regEndDate = new Date(formData.registrationEndDateTime);
      const regStartDate = new Date(formData.registrationStartDateTime);
      const eventStartDate = new Date(formData.startDateTime);
      
      if (regEndDate <= regStartDate) {
        newErrors.registrationEndDateTime = "Registration end must be after registration start";
      } else if (regEndDate >= eventStartDate) {
        newErrors.registrationEndDateTime = "Registration end must be before event start time";
      }
    }

    if (formData.customizeTicketEmail && !formData.ticketEmailContent.trim()) {
      newErrors.ticketEmailContent = "Ticket email content cannot be empty";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndProceed = () => {
    if (validateForm()) {
      onNext();
    } else {
      toast.error("Please fix all validation errors before proceeding");
    }
  };

  // 🕒 UPDATED: IST-compatible computeDateTime (same as EventDetailsTab)
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

  // 🕒 UPDATED: Remove seconds from updateTimeField
  const updateTimeField = (
    type: "startTime" | "endTime",
    field: "hour" | "minute" | "period",
    value: string
  ): void => {
    const newTime = (type === "startTime" ? startTime : endTime)
      ? { ...(type === "startTime" ? startTime : endTime)!, [field]: value }
      : { hour: "09", minute: "00", period: "AM", [field]: value };

    if (type === "startTime") {
      setStartTime(
        newTime as { hour: string; minute: string; period: "AM" | "PM" }
      );
    } else {
      setEndTime(
        newTime as { hour: string; minute: string; period: "AM" | "PM" }
      );
    }

    const date = type === "startTime" ? startDate : endDate;
    if (date && newTime.hour && newTime.minute && newTime.period) {
      const fullDateTime = computeDateTime(
        date,
        newTime as { hour: string; minute: string; period: "AM" | "PM" }
      );
      updateFormData(
        type === "startTime"
          ? "registrationStartDateTime"
          : "registrationEndDateTime",
        fullDateTime
      );
    }
  };

  const handleDateSelect = (date: Date | undefined, type: "start" | "end") => {
    if (date) {
      if (type === "start") {
        setStartDate(date);
        if (startTime && startTime.hour && startTime.minute && startTime.period) {
          const fullDateTime = computeDateTime(date, startTime);
          updateFormData("registrationStartDateTime", fullDateTime);
        }
        // Clear error when date is selected
        if (errors.registrationStartDateTime) {
          setErrors(prev => ({ ...prev, registrationStartDateTime: "" }));
        }
      } else {
        setEndDate(date);
        if (endTime && endTime.hour && endTime.minute && endTime.period) {
          const fullDateTime = computeDateTime(date, endTime);
          updateFormData("registrationEndDateTime", fullDateTime);
        }
        // Clear error when date is selected
        if (errors.registrationEndDateTime) {
          setErrors(prev => ({ ...prev, registrationEndDateTime: "" }));
        }
      }
      setOpenCalendar(null);
      setOpenTimeSelector(type);
    }
  };

  const handleTimeSet = (type: "start" | "end") => {
    const date = type === "start" ? startDate : endDate;
    const time = type === "start" ? startTime : endTime;
    if (date && time && time.hour && time.minute && time.period) {
      const fullDateTime = computeDateTime(date, time);
      updateFormData(
        type === "start"
          ? "registrationStartDateTime"
          : "registrationEndDateTime",
        fullDateTime
      );
    }
    setOpenTimeSelector(null);
  };

  // Date and time formatting
  const formatDate = (date: Date | null): string => {
    if (!date) return "Select Date";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // 🕒 UPDATED: Remove seconds from formatTime
  const formatTime = (
    time: { hour: string; minute: string; period: "AM" | "PM" } | null
  ): string => {
    if (!time) return "Select Time";
    return `${time.hour}:${time.minute} ${time.period}`;
  };

  // 🕒 UPDATED: Remove seconds from getDefaultTime
  const getDefaultTime = () => ({
    hour: "00",
    minute: "00",
    period: "AM" as "AM" | "PM",
  });

  // 🕒 UPDATED: Custom Calendar with same-date support (same as EventDetailsTab)
  const CustomCalendar = ({
    selectedDate,
    onSelect,
    type,
  }: {
    selectedDate: Date | undefined;
    onSelect: (date: Date | undefined) => void;
    type?: "start" | "end";
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
    const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
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
      const isPast = date < yesterday;

      // 🕒 UPDATED: Allow same date for end date (< instead of <=)
      const isBeforeStartDate = type === "end" && startDate && date < startDate;

      days.push(
        <button
          key={day}
          onClick={() => !isPast && onSelect(date)}
          disabled={!!(isPast)}
          className={`h-8 w-8 text-sm rounded transition-colors ${
            isSelected
              ? "bg-green-500 text-white font-medium"
              : isToday
                ? "bg-blue-100 text-blue-700"
                : (isPast || isBeforeStartDate)
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
  const TimePicker = ({ 
    time, 
    onTimeChange, 
    isOpen, 
    onOpenChange,
    type
  }: {
    time: { hour: string; minute: string; period: "AM" | "PM" } | null
    onTimeChange: (field: "hour" | "minute" | "period", value: string) => void
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    type: "start" | "end"
  }) => {
    const currentTime = time || getDefaultTime();

    return (
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-11 font-normal shadow-md text-gray-700"
          >
            {formatTime(time)}
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Select value={currentTime.hour} onValueChange={(value) => onTimeChange('hour', value)}>
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 13 }, (_, i) => {
                    const hour = i 
                    return (
                      <SelectItem key={hour} value={hour.toString().padStart(2, '0')}>
                        {hour.toString().padStart(2, '0')}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              
              <span>:</span>
              
              <Select value={currentTime.minute} onValueChange={(value) => onTimeChange('minute', value)}>
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 60 }, (_, i) => (
                    <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                      {i.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={currentTime.period} onValueChange={(value) => onTimeChange('period', value)}>
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
                onClick={() => {
                  handleTimeSet(type);
                  onOpenChange(false);
                }}
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

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Ticket Type */}
          <div>
            <Label className="text-base font-semibold text-gray-900 mb-4 block">
              Ticket Type*
            </Label>
            <RadioGroup
              value={formData.ticketType}
              onValueChange={(value: "free" | "paid") =>
                updateField("ticketType", value)
              }
              className="flex gap-8"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="free"
                  id="free-ticket"
                  className="border-2 border-gray-300"
                />
                <Label
                  htmlFor="free-ticket"
                  className="text-sm font-medium text-gray-700"
                >
                  Free
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="paid"
                  id="paid-ticket"
                  className="border-2 border-gray-300"
                />
                <Label
                  htmlFor="paid-ticket"
                  className="text-sm font-medium text-gray-700"
                >
                  Paid
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Ticket Capacity & Bulk Registration Switches */}
          <div className="flex">
            <div className="flex items-center gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-900">
                  Ticket Capacity
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.tickets === "limited"
                    ? "Set Your Limit"
                    : "Unlimited"}
                </p>
              </div>
              <Switch
                checked={formData.tickets === "limited"}
                onCheckedChange={(checked) => {
                  updateField("tickets", checked ? "limited" : "unlimited");
                  if (!checked) {
                    updateField("ticketCapacity", 0);
                  } else if (formData.ticketCapacity === 0) {
                    updateField("ticketCapacity", 1);
                  }
                }}
              />
            </div>
            {/* Bulk Registration Toggle */}
            <div className="flex items-center justify-between p-4">
              <div>
                <Label className="text-sm font-medium text-gray-900">
                  Bulk Registration
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  Buy access to certain group of people
                </p>
              </div>
              <Switch
                checked={formData.bulkRegistration}
                onCheckedChange={(checked) =>
                  updateField("bulkRegistration", checked)
                }
              />
            </div>
          </div>

          <div className="flex item-center gap-8">
            <div>
              {/* Ticket Capacity Number Picker - Show only when limited is selected */}
              {formData.tickets === "limited" && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Number Of Tickets
                  </Label>
                  <div className="flex items-center">
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="10000"
                        value={formData.ticketCapacity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          updateField("ticketCapacity", Math.max(value));
                        }}
                        className={`w-36 pr-12 text-sm font-bold border-2 border-dotted text-center focus:ring-0 focus:border-none h-10 text-green-600 ${
                          errors.ticketCapacity ? 'border-red-500' : 'border-green-500'
                        }`}
                      />
                    </div>
                  </div>
                  {errors.ticketCapacity && (
                    <span className="text-red-500 text-xs mt-1">{errors.ticketCapacity}</span>
                  )}
                </div>
              )}
            </div>
            <div>
              {formData.bulkRegistration && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Bulk Tickets
                  </Label>
                  <div className="flex items-center">
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="10000"
                        value={formData.bulkTickets}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          updateField("bulkTickets", Math.max(value));
                        }}
                        className={`w-36 pr-12 text-sm font-bold border-2 border-dotted text-center focus:ring-0 focus:border-none h-10 text-green-600 ${
                          errors.bulkTickets ? 'border-red-500' : 'border-green-500'
                        }`}
                      />
                    </div>
                  </div>
                  {errors.bulkTickets && (
                    <span className="text-red-500 text-xs mt-1">{errors.bulkTickets}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {formData.ticketType === "paid" && (
            <div>
              <Label
                htmlFor="ticketPrice"
                className="text-base font-semibold text-gray-900 mb-3 block"
              >
                Tickets Price*
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">
                  ₹
                </span>
                <Input
                  id="ticketPrice"
                  type="number"
                  value={formData.ticketPrice || ""}
                  onChange={(e) =>
                    updateField(
                      "ticketPrice",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className={`w-36 pl-8 text-sm font-bold border-2 border-dotted text-center focus:ring-0 focus:border-none h-10 text-green-600 ${
                    errors.ticketPrice ? 'border-red-500' : 'border-green-500'
                  }`}
                  placeholder="500"
                />
              </div>
              {errors.ticketPrice && (
                <span className="text-red-500 text-xs mt-1">{errors.ticketPrice}</span>
              )}
              <p className="text-xs text-gray-500 mt-2">Platform fee 2%</p>
            </div>
          )}

          {/* Registration Start Date & Time */}
          <div>
            <Label className="text-base font-semibold text-gray-900 mb-3 block">
              Registration Start*
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Collapsible
                  open={openCalendar === "start"}
                  onOpenChange={(open) =>
                    setOpenCalendar(open ? "start" : null)
                  }
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-between h-12 font-normal text-gray-700 shadow-md hover:border-green-500 ${
                        errors.registrationStartDateTime ? 'border-red-500' : ''
                      }`}
                    >
                      {formatDate(startDate)}
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CustomCalendar
                      selectedDate={startDate || undefined}
                      onSelect={(date) => handleDateSelect(date, "start")}
                      type="start"
                    />
                  </CollapsibleContent>
                </Collapsible>
              </div>
              <div>
                <TimePicker
                  time={startTime}
                  onTimeChange={(field, value) =>
                    updateTimeField("startTime", field, value)
                  }
                  isOpen={openTimeSelector === "start"}
                  onOpenChange={(open) => setOpenTimeSelector(open ? "start" : null)}
                  type="start"
                />
              </div>
            </div>
            {errors.registrationStartDateTime && (
              <span className="text-red-500 text-xs mt-1">{errors.registrationStartDateTime}</span>
            )}
          </div>

          {/* Registration End Date & Time */}
          <div>
            <Label className="text-base font-semibold text-gray-900 mb-3 block">
              Registration End*
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Collapsible
                  open={openCalendar === "end"}
                  onOpenChange={(open) => setOpenCalendar(open ? "end" : null)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-between h-12 font-normal text-gray-700 shadow-md hover:border-green-500 ${
                        errors.registrationEndDateTime ? 'border-red-500' : ''
                      }`}
                    >
                      {formatDate(endDate)}
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CustomCalendar
                      selectedDate={endDate || undefined}
                      onSelect={(date) => handleDateSelect(date, "end")}
                      type="end"
                    />
                  </CollapsibleContent>
                </Collapsible>
              </div>
              <div>
                <TimePicker
                  time={endTime}
                  onTimeChange={(field, value) =>
                    updateTimeField("endTime", field, value)
                  }
                  isOpen={openTimeSelector === "end"}
                  onOpenChange={(open) => setOpenTimeSelector(open ? "end" : null)}
                  type="end"
                />
              </div>
            </div>
            {errors.registrationEndDateTime && (
              <span className="text-red-500 text-xs mt-1">{errors.registrationEndDateTime}</span>
            )}
          </div>

          {/* Limited Event Access Toggle */}
          {formData.status === "private" && (
            <div className="flex items-center gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-900">
                  Limited Event Access
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  Limited access to certain group of people
                </p>
              </div>
              <Switch
                checked={formData.limitedEventAccess}
                onCheckedChange={(checked) =>
                  updateField("limitedEventAccess", checked)
                }
              />
            </div>
          )}

          {/* Bulk Upload Section - Show only if bulk registration is enabled OR status is private */}
          {formData.limitedEventAccess && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Label className="text-base font-semibold text-gray-900">
                  Bulk Upload*
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-green-600 hover:text-green-700 h-auto p-0"
                  onClick={() => {
                    // Download CSV template
                    const csvContent = "Email,Name\nexample@email.com,John Doe";
                    const blob = new Blob([csvContent], { type: "text/csv" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "bulk-registration-template.csv";
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="w-3 h-3 mr-1" />
                  <span className="text-xs">Download CSV Template</span>
                </Button>
              </div>

              {!formData.bulkEmailFile ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-400 transition-colors"
                  onClick={() => bulkFileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={bulkFileInputRef}
                    onChange={handleBulkFileUpload}
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                  />
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="font-medium text-gray-900 mb-1">
                    Drag & drop file here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supported file format .xlsx, .xls, .csv
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Max 50MB</p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {formData.bulkEmailFile}
                      </p>
                      <p className="text-xs text-gray-500">
                        Maximum 200 email IDs can be uploaded at the time
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeBulkFile}
                    className="text-red-500 hover:text-red-700"
                    >
                    ×
                  </Button>
                </div>
              )}
              {
                isEditMode && (
                  <p className="text-xs text-gray-500">
                    (You need upload the file again if you want to change it , bcz its Temporary stored file.)
                  </p>
                )
              }
            </div>
          )}

          {/* Customize Email Toggle */}
          <div className="flex items-center gap-6">
            <Label className="text-sm font-medium text-gray-900">
              Customize Email
            </Label>
            <Switch
              checked={formData.customizeTicketEmail}
              onCheckedChange={(checked) =>
                updateField("customizeTicketEmail", checked)
              }
            />
          </div>

          {formData.customizeTicketEmail && (
            <div>
              <Label
                htmlFor="ticketEmailContent"
                className="text-base font-semibold text-gray-900 mb-3 block"
              >
                Email Content*
              </Label>
              <Textarea
                id="ticketEmailContent"
                value={formData.ticketEmailContent || ""}
                onChange={(e) =>
                  updateField("ticketEmailContent", e.target.value)
                }
                className="min-h-[200px] w-full border-2 border-gray-300 focus:ring-0 resize-none"
                placeholder="Enter your custom email content here..."
              />
            </div>
          )}
          {errors.ticketEmailContent && (
            <span className="text-red-500 text-xs mt-1">{errors.ticketEmailContent}</span>
          )}
        </div>

        {/* Right Column - Payment & Email Content */}
        <div className="space-y-8">
          {/* Right column content */}
        </div>
      </div>

      <div className="flex justify-center mt-12">
        <Button
          onClick={handleSaveAndProceed}
          className="bg-green-500 hover:bg-green-600 text-white px-16 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          Save and Proceed
        </Button>
      </div>
    </div>
  );
};

export default TicketDetailsTab;
