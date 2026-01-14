"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import EventService from "@/services/Events/services/event-api-services";
import { use } from "react";
// import ActionPopup from "../component/actionPopup";
import BookingDetailPopup from "../component/bookingDetail";
import { NewsletterSignup } from "@/components/sections/newsletter-signup";
// 🕒 Import IST helpers
import {
  formatDateIST,
  formatDateRangeIST,
  getRelativeTimeIST,
  convertUTCtoIST,
} from "@/utils/dateTimeHelper";

interface EventApiResponse {
  events: ApiEvent[];
}

interface ApiEvent {
  _id: string;
  serviceProviderId: string;
  serviceProviderName: string;
  title: string;
  status: string;
  approvalStatus: "pending" | "approved" | "rejected";
  startDateTime: string;
  endDateTime: string;
  venue: string;
  venueStatus: "offline" | "online";
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
  activeStatus: string;
  ticketType: "paid" | "free";
  applyGst: "yes" | "no";
  applyPlatformFee: "yes" | "no";
  tickets: "limited" | "unlimited";
  ticketCapacity: number;
  bookedTicketsCount: number;
  ticketPrice: number;
  bulkRegistration: boolean;
  bulkTickets: number;
  registrationStartDateTime: string;
  registrationEndDateTime: string;
  customizeTicketEmail: boolean;
  ticketEmailContent: string;
  bulkEmailFile: string;
  collectPersonalInfo: Array<{
    fullName: string;
    email: string;
    phoneNumber: string;
    _id: string;
  }>;
  collectIdentityProof: Array<{
    idProof: string;
    idProofType: string;
    idNumber: string;
    webisteLink: string;
    _id: string;
  }>;
  customQuestions: Array<{
    questionType: string;
    question: string;
    options: string[];
    isRequired: string;
    _id: string;
  }>;
  customizeRegistrationEmail: boolean;
  registrationEmailBodyContent: string;
  termsAndConditions: string;
  refundPolicy: string;
  couponAvailability: boolean;
  couponDetails: Array<{
    couponCode: string;
    discount: number;
    validFrom: string;
    validTo: string;
    _id: string;
  }>;
  eventReminder: boolean;
  postEventFeedback: boolean;
  postEventFeedbackDetails: Array<{
    scheduledDateTime: string;
    bodyContent: string;
    _id: string;
  }>;
  socialMediaLinks: Array<{
    socialLink: string;
    _id: string;
  }>;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// 🎫 NEW: Booking validation interface
interface BookingValidation {
  isBookingEnabled: boolean;
  reason: string;
  status:
    | "available"
    | "sold_out"
    | "not_started"
    | "closed"
    | "event_started"
    | "not_approved"
    | "cancelled";
}

// 🕒 UPDATED: Calendar utility functions with IST conversion
const generateCalendarData = (eventData: ApiEvent) => {
  const startDateIST = convertUTCtoIST(eventData.startDateTime);
  const endDateIST = convertUTCtoIST(eventData.endDateTime);

  if (!startDateIST || !endDateIST) {
    return null;
  }

  const formatCalendarDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  return {
    title: eventData.title,
    start: formatCalendarDate(startDateIST),
    end: formatCalendarDate(endDateIST),
    description: eventData.description || "",
    location: eventData.venue,
  };
};

const addToGoogleCalendar = (eventData: ApiEvent) => {
  const calendarData = generateCalendarData(eventData);
  if (!calendarData) return;

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarData.title)}&dates=${calendarData.start}/${calendarData.end}&details=${encodeURIComponent(calendarData.description)}&location=${encodeURIComponent(calendarData.location)}`;
  window.open(googleCalendarUrl, "_blank");
};

const addToOutlookCalendar = (eventData: ApiEvent) => {
  const calendarData = generateCalendarData(eventData);
  if (!calendarData) return;

  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(calendarData.title)}&startdt=${calendarData.start}&enddt=${calendarData.end}&body=${encodeURIComponent(calendarData.description)}&location=${encodeURIComponent(calendarData.location)}`;
  window.open(outlookUrl, "_blank");
};

const downloadICSFile = (eventData: ApiEvent) => {
  const calendarData = generateCalendarData(eventData);
  if (!calendarData) return;

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Event Calendar//EN
BEGIN:VEVENT
UID:${eventData._id}@event-calendar.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART:${calendarData.start}
DTEND:${calendarData.end}
SUMMARY:${calendarData.title}
DESCRIPTION:${calendarData.description}
LOCATION:${calendarData.location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${eventData.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Map utility functions
const openGoogleMaps = (venue: string) => {
  const query = encodeURIComponent(venue);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  window.open(googleMapsUrl, "_blank");
};

const openAppleMaps = (venue: string) => {
  const query = encodeURIComponent(venue);
  const appleMapsUrl = `https://maps.apple.com/?q=${query}`;
  window.open(appleMapsUrl, "_blank");
};

const EventDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: _id } = use(params);

  const [eventsData, setEventsData] = useState<ApiEvent | null>(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [showCalendarOptions, setShowCalendarOptions] = useState(false);
  const [showMapOptions, setShowMapOptions] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const res = (await EventService.getEventDetail(
          _id
        )) as EventApiResponse;
        // console.log(res, `from detail page of event `);
        if (res?.events?.length) {
          const ev = res.events[0];
          setEventsData(ev);
          setTicketCount(1);
        } else {
          setError("Event not found");
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();
  }, [_id]);

  // 🎫 NEW: Booking validation logic
  const validateBooking = (eventData: ApiEvent): BookingValidation => {
    const now = new Date();

    // Check if event has started
    const eventStartTime = new Date(eventData.startDateTime);
    if (now >= eventStartTime) {
      return {
        isBookingEnabled: false,
        reason: "Event has already started",
        status: "event_started",
      };
    }

    // Check ticket capacity (only for limited tickets)
    if (eventData.tickets === "limited") {
      if (eventData.ticketCapacity <= eventData.bookedTicketsCount) {
        return {
          isBookingEnabled: false,
          reason: "Tickets are sold out",
          status: "sold_out",
        };
      }
    }

    // Check registration period
    if (
      eventData.registrationStartDateTime &&
      eventData.registrationEndDateTime
    ) {
      const regStartTime = new Date(eventData.registrationStartDateTime);
      const regEndTime = new Date(eventData.registrationEndDateTime);

      if (now < regStartTime) {
        return {
          isBookingEnabled: false,
          reason: `Registration starts on ${formatDateIST(eventData.registrationStartDateTime, "full")}`,
          status: "not_started",
        };
      }

      if (now > regEndTime) {
        return {
          isBookingEnabled: false,
          reason: "Registration has closed",
          status: "closed",
        };
      }
    }

    //for approval status

    if (eventData.approvalStatus === "pending") {
      return {
        isBookingEnabled: false,
        reason: "Pending For Approval",
        status: "not_approved",
      };
    }

    if (eventData.approvalStatus === "rejected") {
      return {
        isBookingEnabled: false,
        reason: "This Event Has Rejected",
        status: "not_approved",
      };
    }

    if (eventData.activeStatus === "cancelled") {
      return {
        isBookingEnabled: false,
        reason: "Event Has Cancelled By Hoster",
        status: "cancelled",
      };
    }

    // All validations passed
    return {
      isBookingEnabled: true,
      reason: "",
      status: "available",
    };
  };

  // 🎫 NEW: Get booking status
  const bookingStatus = eventsData ? validateBooking(eventsData) : null;

  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      alert("Event link copied to clipboard!");
    }
  };

  const handleAddToCalendar = () => {
    if (!eventsData) return;
    setShowCalendarOptions(!showCalendarOptions);
  };

  const handleGetDirections = () => {
    if (!eventsData?.venue) return;
    setShowMapOptions(!showMapOptions);
  };

  // 🎫 NEW: Handle booking with validation
  const handleBookNow = () => {
    if (!bookingStatus?.isBookingEnabled) return;
    setOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">
            Loading event details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !eventsData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Event Not Found
          </h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            {error || "No data available"}
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  // 🕒 UPDATED: Use IST helpers for date/time formatting
  const dateText = formatDateIST(eventsData.startDateTime, "dateOnly");
  const timeText = formatDateRangeIST(
    eventsData.startDateTime,
    eventsData.endDateTime
  );
  const relativeTime = getRelativeTimeIST(eventsData.startDateTime);

  const isPaid = eventsData.ticketType === "paid";
  const showTicketCounter = Boolean(
    eventsData.bulkRegistration && eventsData.bulkTickets > 0
  );
  const maxTickets = showTicketCounter
    ? Math.max(1, eventsData.bulkTickets)
    : 1;
  const availableTickets =
    eventsData.ticketCapacity - eventsData.bookedTicketsCount;
  const availableMaxTickets = showTicketCounter
    ? Math.max(1, availableTickets)
    : 1;
  // Clamp ticketCount within 1..maxTickets when showTicketCounter toggles
  if (ticketCount > maxTickets) {
    setTicketCount(maxTickets);
  }
  if (ticketCount > availableMaxTickets) {
    setTicketCount(availableMaxTickets);
  }

  // 1. Calculate the final price before the return statement
  // 1. Calculate the final price before the return statement
  const getFinalPrice = () => {
    if (!isPaid) return "FREE";

    const basePrice = Number(eventsData.ticketPrice);
    let finalTotal = basePrice;

    // A. Calculate GST on Ticket Price (Only if applyGst is YES)
    // if (eventsData.applyGst === "yes") {
    //   const gstOnTicket = basePrice * 0.18;
    //   finalTotal += gstOnTicket;
    // }

    // B. Calculate Platform Fee + GST on Platform Fee (If applyPlatformFee is YES)
    // Logic: This runs irrespective of applyGst status
    if (eventsData.applyPlatformFee === "yes") {
      const platformFee = basePrice * 0.02; // 2% of base ticket price
      const gstOnPlatformFee = platformFee * 0.18; // 18% GST on the fee
      finalTotal += (platformFee);
    }

    return `₹${finalTotal.toFixed(2)}`;
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Hero - Mobile Optimized */}
      <section className="relative min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh] lg:min-h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-contain md:bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: eventsData.coverImage
                ? `url('${eventsData.coverImage}')`
                : "url('/events/events.png')",
            }}
          />
          <div className="absolute inset-0 bg-black/30 md:bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20" />
        </div>
      </section>

      {/* Main - Mobile First Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        <section className="mb-8 lg:mb-10">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Content - Mobile Optimized */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6 gap-3 sm:gap-0">
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                      {eventsData.title}
                    </h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        <span className="text-gray-600 truncate">
                          {eventsData.venue}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-green-600 font-medium">
                          {eventsData.venueStatus?.toUpperCase()}
                        </span>
                      </div>
                      {/* 🕒 NEW: Show relative time */}
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="text-blue-600 font-medium">
                          {relativeTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 text-green-600 font-medium text-sm hover:text-green-700 transition-colors self-start sm:self-auto"
                  >
                    <span>Share</span>
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Location with Get Directions - Mobile Optimized */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                        {eventsData.venue}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                        {eventsData.venue}
                      </div>
                      <div className="relative">
                        <button
                          onClick={handleGetDirections}
                          className="text-green-600 text-xs sm:text-sm font-medium hover:text-green-700 transition-colors"
                        >
                          Get directions
                        </button>

                        {/* Map Options Dropdown - Mobile Optimized */}
                        {showMapOptions && (
                          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[180px] sm:min-w-[200px]">
                            <div className="p-2">
                              <button
                                onClick={() => {
                                  openGoogleMaps(eventsData.venue);
                                  setShowMapOptions(false);
                                }}
                                className="w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-gray-50 rounded flex items-center gap-2"
                              >
                                Open in Google Maps
                              </button>
                              <button
                                onClick={() => {
                                  openAppleMaps(eventsData.venue);
                                  setShowMapOptions(false);
                                }}
                                className="w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-gray-50 rounded flex items-center gap-2"
                              >
                                Open in Apple Maps
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 🕒 UPDATED: Date/Time with IST display - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium text-sm sm:text-base">
                      {dateText}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm sm:text-base">
                      {timeText}
                    </span>
                  </div>

                  {/* Calendar Button - Mobile Optimized */}
                  <div className="relative sm:ml-auto">
                    <button
                      onClick={handleAddToCalendar}
                      className="text-green-600 text-xs sm:text-sm font-medium hover:text-green-700 transition-colors whitespace-nowrap"
                    >
                      Add To Calendar
                    </button>

                    {/* Calendar Options Dropdown - Mobile Optimized */}
                    {showCalendarOptions && (
                      <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[180px] sm:min-w-[200px]">
                        <div className="p-2">
                          <button
                            onClick={() => {
                              addToGoogleCalendar(eventsData);
                              setShowCalendarOptions(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-gray-50 rounded flex items-center gap-2"
                          >
                            <span className="text-blue-600">📅</span>
                            Google Calendar
                          </button>
                          <button
                            onClick={() => {
                              addToOutlookCalendar(eventsData);
                              setShowCalendarOptions(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-gray-50 rounded flex items-center gap-2"
                          >
                            <span className="text-blue-500">📧</span>
                            Outlook Calendar
                          </button>
                          <button
                            onClick={() => {
                              downloadICSFile(eventsData);
                              setShowCalendarOptions(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-gray-50 rounded flex items-center gap-2"
                          >
                            <span className="text-gray-600">💾</span>
                            Download .ics file
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 🕒 NEW: Registration Period Display - Mobile Optimized */}
                {eventsData.registrationStartDateTime &&
                  eventsData.registrationEndDateTime && (
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h4 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">
                        📝 Registration Period
                      </h4>
                      <div className="text-xs sm:text-sm space-y-1">
                        <p>
                          <strong>Opens:</strong>{" "}
                          {formatDateIST(
                            eventsData.registrationStartDateTime,
                            "full"
                          )}
                        </p>
                        <p>
                          <strong>Closes:</strong>{" "}
                          {formatDateIST(
                            eventsData.registrationEndDateTime,
                            "full"
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                {/* Payment - Mobile Optimized */}
                <div className="border-t border-gray-100 pt-4 sm:pt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                        Mode of payment
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        Cash, Debit Card, Credit Card, UPI
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Mobile First Order */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:sticky lg:top-6">
                {/* Price - Mobile Optimized */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 9a2 2 0 10-4 0v5a2 2 0 01-2 2h6m-6-4h4m8 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-600 font-medium text-sm sm:text-base">
                      Ticket Cost
                    </span>
                  </div>
                  <div className="text-right flex">
                    {/**
                     * if applyPlatformFee  is yes add 2% of ticket price
                     */}
                    <div className="text-lg sm:text-xl font-bold text-green-600">
                      {getFinalPrice()}
                      {isPaid && (
                        <span className="text-xs sm:text-sm text-gray-500 font-normal">
                          /Person
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 🎫 NEW: Ticket availability display - Mobile Optimized */}
                {eventsData.tickets === "limited" && (
                  <div className="mb-3 sm:mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Available Tickets:</span>
                      <span className="font-semibold text-gray-900">
                        {Math.max(
                          0,
                          eventsData.ticketCapacity -
                            eventsData.bookedTicketsCount
                        )}{" "}
                        / {eventsData.ticketCapacity}
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.max(0, ((eventsData.ticketCapacity - eventsData.bookedTicketsCount) / eventsData.ticketCapacity) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Ticket Counter - Mobile Optimized */}
                {showTicketCounter && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-100 gap-3 sm:gap-0">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium text-sm sm:text-base">
                        Number of Tickets
                      </span>
                    </div>
                    <div className="flex items-center gap-3 justify-center sm:justify-end">
                      <button
                        onClick={() =>
                          setTicketCount((v) => Math.max(1, v - 1))
                        }
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="text-xl font-bold text-gray-900 min-w-[24px] text-center">
                        {ticketCount}
                      </span>
                      <button
                        onClick={() =>
                          setTicketCount((v) => Math.min(maxTickets, v + 1))
                        }
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 🎫 UPDATED: CTA Button with validation - Mobile Optimized */}
                <button
                  onClick={handleBookNow}
                  disabled={!bookingStatus?.isBookingEnabled}
                  className={`w-full font-semibold py-3 sm:py-4 rounded-xl transition-colors mb-3 sm:mb-4 text-sm sm:text-base ${
                    bookingStatus?.isBookingEnabled
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {bookingStatus?.status === "sold_out"
                    ? "Sold Out"
                    : "Book Now"}
                </button>

                {/* 🎫 NEW: Booking status message - Mobile Optimized */}
                {!bookingStatus?.isBookingEnabled && (
                  <div className="flex items-start gap-2 mb-3 sm:mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-red-700 leading-tight">
                      {bookingStatus?.reason}
                    </p>
                  </div>
                )}

                {eventsData.bookedTicketsCount > 0 && (
                  <div className="flex items-center gap-2 justify-center text-xs sm:text-sm text-gray-500">
                    <div className="w-4 h-4">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>

                    <span>
                      {eventsData.bookedTicketsCount} people recently enquired
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Event Information - Mobile Optimized */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
            {/* Event Information */}
            <section className="mb-12 lg:mb-16">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
                Event Information
              </h2>

              {!!eventsData.sectors?.length && (
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
                  {eventsData.sectors.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-white border border-gray-200 text-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                {eventsData.title}
              </h3>

              {eventsData.description && (
                <div className="text-gray-700 leading-relaxed w-full lg:w-1/2 space-y-4 text-sm sm:text-base">
                  <p className="whitespace-pre-line">
                    {eventsData.description}
                  </p>
                </div>
              )}
            </section>

            {/* Amenities - Mobile Optimized */}
            {!!eventsData.amenities?.length && (
              <section className="mb-12 lg:mb-16">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
                  Amenities
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {eventsData.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* What You Gain -> from features - Mobile Optimized */}
            {!!eventsData.features?.length && (
              <section className="mb-12 lg:mb-16">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
                  What You Gain?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {eventsData.features.map((feature) => (
                    <div
                      key={feature._id}
                      className="flex items-start gap-3 sm:gap-4"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <img
                          src={feature.files?.[0] || "/placeholder.png"}
                          alt={feature.name}
                          className="w-8 h-8 sm:w-12 sm:h-12 object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-xs sm:text-sm text-gray-600 capitalize">
                          {feature.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Chief Guests - Mobile Optimized */}
            {!!eventsData.chiefGuests?.length && (
              <section className="mb-12 lg:mb-16">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
                  Chief Guest
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {eventsData.chiefGuests.map((guest) => (
                    <div key={guest._id} className="text-center">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-3xl  border-2 border-dashed border-primary rounded-tl-none rounded-br-none overflow-hidden mb-3 sm:mb-4">
                        {guest.image ? (
                          <Image
                            src={guest.image}
                            alt={guest.name}
                            width={128}
                            height={128}
                            className="w-full h-full object-center object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm sm:text-lg">
                              {guest.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-600 mb-1 text-xs sm:text-sm">
                        {guest.name}
                      </h3>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Terms & Conditions - Mobile Optimized */}
            {eventsData.termsAndConditions && (
              <section className="mb-12 lg:mb-16">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
                  Terms & Conditions
                </h2>
                <div className="space-y-3">
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                    {eventsData.termsAndConditions}
                  </p>
                </div>
              </section>
            )}

            {/* Refund Policy - Mobile Optimized */}
            {eventsData.refundPolicy && (
              <section className="mb-12 lg:mb-16">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
                  Cancellation & Refund Policy
                </h2>
                <div className="space-y-3">
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                    {eventsData.refundPolicy}
                  </p>
                </div>
              </section>
            )}
          </div>
        </section>
      </div>

      {/* 🎫 UPDATED: Bottom CTA with validation - Mobile Optimized */}
      <div className="flex justify-center py-6 sm:py-8 lg:py-10 px-4 sm:px-6">
        <div className="w-full max-w-xs sm:max-w-sm">
          <button
            onClick={handleBookNow}
            disabled={!bookingStatus?.isBookingEnabled}
            className={`w-full font-semibold py-3 sm:py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm sm:text-base ${
              bookingStatus?.isBookingEnabled
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <span>
              {bookingStatus?.status === "sold_out"
                ? "Sold Out"
                : "Book Your Slot"}
            </span>
            {bookingStatus?.isBookingEnabled && (
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            )}
          </button>

          {/* 🎫 NEW: Bottom status message - Mobile Optimized */}
          {!bookingStatus?.isBookingEnabled && (
            <div className="flex items-start gap-2 mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-red-700 leading-tight">
                {bookingStatus?.reason}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showCalendarOptions || showMapOptions) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowCalendarOptions(false);
            setShowMapOptions(false);
          }}
        />
      )}

      <NewsletterSignup />
      {/* <ActionPopup
        ticketCount={ticketCount}
        eventData={eventsData}
        open={open}
        onOpenChange={setOpen}
        minutes={10}
        onStart={() => {
          setOpen(false);
        }}
      /> */}

      <BookingDetailPopup
        eventData={eventsData}
        open={open}
        onOpenChange={setOpen}
        timerMinutes={10}
        ticketCount={ticketCount}
      />
    </div>
  );
};

export default EventDetailPage;
