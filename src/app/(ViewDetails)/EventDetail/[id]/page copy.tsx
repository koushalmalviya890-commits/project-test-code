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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import EventService from "@/services/Events/services/event-api-services";
import { use } from "react";
import ActionPopup from "../component/actionPopup";
import { NewsletterSignup } from "@/components/sections/newsletter-signup";

interface EventApiResponse {
  events: ApiEvent[];
}

interface ApiEvent {
  _id: string;
  serviceProviderId: string;
  serviceProviderName: string;
  title: string;
  status: string;
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
  approvalStatus: string;
  activeStatus: string;
  ticketType: "paid" | "free";
  tickets: string;
  ticketCapacity: number;
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

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
};

const formatTimeRange = (start?: string, end?: string) => {
  if (!start || !end) return "";
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return "";
  const sTxt = s.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const eTxt = e.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${sTxt} - ${eTxt}`;
};

// Calendar utility functions
const generateCalendarData = (eventData: ApiEvent) => {
  const startDate = new Date(eventData.startDateTime);
  const endDate = new Date(eventData.endDateTime);

  const formatCalendarDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  return {
    title: eventData.title,
    start: formatCalendarDate(startDate),
    end: formatCalendarDate(endDate),
    description: eventData.description || "",
    location: eventData.venue,
  };
};

const addToGoogleCalendar = (eventData: ApiEvent) => {
  const calendarData = generateCalendarData(eventData);
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarData.title)}&dates=${calendarData.start}/${calendarData.end}&details=${encodeURIComponent(calendarData.description)}&location=${encodeURIComponent(calendarData.location)}`;
  window.open(googleCalendarUrl, "_blank");
};

const addToOutlookCalendar = (eventData: ApiEvent) => {
  const calendarData = generateCalendarData(eventData);
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(calendarData.title)}&startdt=${calendarData.start}&enddt=${calendarData.end}&body=${encodeURIComponent(calendarData.description)}&location=${encodeURIComponent(calendarData.location)}`;
  window.open(outlookUrl, "_blank");
};

const downloadICSFile = (eventData: ApiEvent) => {
  const calendarData = generateCalendarData(eventData);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !eventsData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Event Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error || "No data available"}</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const dateText = formatDate(eventsData.startDateTime);
  const timeText = formatTimeRange(
    eventsData.startDateTime,
    eventsData.endDateTime
  );

  const isPaid = eventsData.ticketType === "paid";
  const showTicketCounter = Boolean(
    eventsData.bulkRegistration && eventsData.bulkTickets > 0
  );
  const maxTickets = showTicketCounter
    ? Math.max(1, eventsData.bulkTickets)
    : 1;

  // Clamp ticketCount within 1..maxTickets when showTicketCounter toggles
  if (ticketCount > maxTickets) {
    setTicketCount(maxTickets);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative min-h-[90vh] overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: eventsData.coverImage
                ? `url('${eventsData.coverImage}')`
                : "url('/events/events.png')",
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20" />
        </div>
      </section>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <section className="mb-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {eventsData.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        <span className="text-gray-600">
                          {eventsData.venue}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-green-600 font-medium">
                          {eventsData.venueStatus?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 text-green-600 font-medium text-sm hover:text-green-700 transition-colors"
                  >
                    <span>Share</span>
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Location with Get Directions */}
                <div className="mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">
                        {eventsData.venue}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {eventsData.venue}
                      </div>
                      <div className="relative">
                        <button
                          onClick={handleGetDirections}
                          className="text-green-600 text-sm font-medium hover:text-green-700 transition-colors"
                        >
                          Get directions
                        </button>

                        {/* Map Options Dropdown */}
                        {showMapOptions && (
                          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                            <div className="p-2">
                              <button
                                onClick={() => {
                                  openGoogleMaps(eventsData.venue);
                                  setShowMapOptions(false);
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2"
                              >
                                Open in Google Maps
                              </button>
                              <button
                                onClick={() => {
                                  openAppleMaps(eventsData.venue);
                                  setShowMapOptions(false);
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2"
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

                {/* Date/Time with Add to Calendar */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700 font-medium">
                      {dateText}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{timeText}</span>
                    <div className="relative ml-auto">
                      <button
                        onClick={handleAddToCalendar}
                        className="text-green-600 text-sm font-medium hover:text-green-700 transition-colors"
                      >
                        Add To Calendar
                      </button>

                      {/* Calendar Options Dropdown */}
                      {showCalendarOptions && (
                        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                          <div className="p-2">
                            <button
                              onClick={() => {
                                addToGoogleCalendar(eventsData);
                                setShowCalendarOptions(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2"
                            >
                              <span className="text-blue-600">📅</span>
                              Google Calendar
                            </button>
                            <button
                              onClick={() => {
                                addToOutlookCalendar(eventsData);
                                setShowCalendarOptions(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2"
                            >
                              <span className="text-blue-500">📧</span>
                              Outlook Calendar
                            </button>
                            <button
                              onClick={() => {
                                downloadICSFile(eventsData);
                                setShowCalendarOptions(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2"
                            >
                              <span className="text-gray-600">💾</span>
                              Download .ics file
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 text-green-500 mt-0.5">
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
                      <div className="font-semibold text-gray-900 mb-1">
                        Mode of payment
                      </div>
                      <div className="text-sm text-gray-600">
                        Cash, Debit Card, Credit Card, UPI
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
                {/* Price */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 text-gray-400">
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
                    <span className="text-gray-600 font-medium">
                      Ticket Cost
                    </span>
                  </div>
                  <div className="text-right flex ">
                    <div className="text-xl font-bold text-green-600">
                      {isPaid ? `₹${eventsData.ticketPrice}` : "FREE"}
                      {isPaid && (
                        <span className="text-sm text-gray-500 font-normal">
                          /Person
                        </span>
                      )}
                    </div>
                    {/* <div className="text-xs text-gray-500 mt-2.5"></div> */}
                  </div>
                </div>

                {/* Ticket Counter - only if bulkRegistration true and bulkTickets > 0 */}
                {showTicketCounter && (
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 text-gray-400">
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
                      <span className="text-gray-700 font-medium">
                        Number of Tickets
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
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

                {/* CTA */}
                <button
                  onClick={() => setOpen(true)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-xl transition-colors mb-4"
                >
                  Book Now
                </button>

                {/* <div className="flex items-center gap-2 justify-center text-sm text-gray-500">
                  <div className="w-4 h-4">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <span>25 people recently enquired</span>
                </div> */}
              </div>
            </div>
          </div>

          {/* Event Information */}
          <div className="max-w-7xl mx-auto px-6 py-16">
            {/* Event Information */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Event Information
              </h2>

              {!!eventsData.sectors?.length && (
                <div className="flex flex-wrap gap-3 mb-8">
                  {eventsData.sectors.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {eventsData.title}
              </h3>

              {eventsData.description && (
                <div className="text-gray-700 leading-relaxed w-1/2 space-y-4">
                  <p>{eventsData.description}</p>
                </div>
              )}
            </section>

            {/* Amenities */}
            {!!eventsData.amenities?.length && (
              <section className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {eventsData.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3">
                      <div className="w-6 h-6 text-green-500">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* What You Gain -> from features */}
            {!!eventsData.features?.length && (
              <section className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  What You Gain?
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {eventsData.features.map((feature) => (
                    <div key={feature._id} className="flex items-start gap-4">
                      {/* Icon / Image */}
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0  shadow-md">
                        <img
                          src={feature.files?.[0] || "/placeholder.png"}
                          alt={feature.name}
                          className="w-12 h-12 object-cover "
                        />
                      </div>

                      {/* Text */}
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-600 capitalize">
                          {feature.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Chief Guests */}
            {!!eventsData.chiefGuests?.length && (
              <section className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  Chief Guest
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {eventsData.chiefGuests.map((guest) => (
                    <div key={guest._id} className="text-center">
                      <div className="w-32 h-32 mx-auto rounded-[50px]  border-2 border-dashed  border-primary rounded-tl-none rounded-br-none overflow-hidden mb-4">
                        {guest.image ? (
                          <Image
                            src={guest.image}
                            alt={guest.name}
                            width={128}
                            height={128}
                            className="w-full  h-full object-center object-fit"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {guest.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-600 mb-1 text-sm">
                        {guest.name}
                      </h3>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Terms & Conditions */}
            {eventsData.termsAndConditions && (
              <section className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  Terms & Conditions
                </h2>
                <div className="space-y-3">
                  <p className="text-gray-700 text-sm">
                    {eventsData.termsAndConditions}
                  </p>
                </div>
              </section>
            )}

            {/* Refund Policy */}
            {eventsData.refundPolicy && (
              <section className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  Cancellation & Refund Policy
                </h2>
                <div className="space-y-3">
                  <p className="text-gray-700 text-sm">
                    {eventsData.refundPolicy}
                  </p>
                </div>
              </section>
            )}
          </div>
        </section>
      </div>

      <div className="flex justify-center py-10">
        <button
          onClick={() => setOpen(true)}
          className="w-3/4 max-w-sm bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <span>Book Your Slot</span>
          <svg
            className="w-5 h-5"
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
        </button>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showCalendarOptions || showMapOptions) && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => {
            setShowCalendarOptions(false);
            setShowMapOptions(false);
          }}
        />
      )}

      <NewsletterSignup />
      <ActionPopup
        ticketCount={ticketCount}
        eventData={eventsData}
        open={open}
        onOpenChange={setOpen}
        minutes={10}
        onStart={() => {
          setOpen(false);
        }}
      />
    </div>
  );
};

export default EventDetailPage;
