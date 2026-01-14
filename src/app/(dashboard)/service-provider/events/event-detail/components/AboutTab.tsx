// app/event-detail/[id]/components/AboutTab.tsx
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import Link from "next/link";
import { MapPin, Wifi, Car, Coffee, Shield } from "lucide-react";
import { 
  formatDateIST, 
  formatDateRangeIST, 
  getRelativeTimeIST,
  convertUTCtoIST 
} from "@/utils/dateTimeHelper";

interface EventData {
  _id: string;
  title: string;
  status: "public" | "private";
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
  ticketType: "free" | "paid";
  tickets: "limited" | "unlimited";
  ticketCapacity: number;
  ticketPrice: number;
  termsAndConditions: string;
  refundPolicy: string;
  // Add location fields for map functionality
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

interface AboutTabProps {
  eventData: EventData;
}

export default function AboutTab({ eventData }: AboutTabProps) {
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(false);

  // Fetch map URL when component mounts
  useEffect(() => {
    const fetchMapUrl = async () => {
      if (!eventData.venue) return;

      try {
        setMapLoading(true);

        // Create address string - use venue as primary, fallback to individual fields
        const address =
          eventData.venue +
          (eventData.city ? `, ${eventData.city}` : "") +
          (eventData.state ? `, ${eventData.state}` : "") +
          (eventData.pincode ? `, ${eventData.pincode}` : "") +
          (eventData.country ? `, ${eventData.country}` : "");

        const mapResponse = await fetch(
          `/api/maps?query=${encodeURIComponent(address)}`
        );

        if (mapResponse.ok) {
          const mapData = await mapResponse.json();
          setMapUrl(mapData.embedUrl);
        }
      } catch (error) {
        console.error("Error fetching map URL:", error);
      } finally {
        setMapLoading(false);
      }
    };

    fetchMapUrl();
  }, [
    eventData.venue,
    eventData.city,
    eventData.state,
    eventData.pincode,
    eventData.country,
  ]);

  const formatDateUTC = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  const formatTimeUTC = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
      case "wi-fi":
        return <Wifi className="h-4 w-4" />;
      case "parking":
        return <Car className="h-4 w-4" />;
      case "food stalls":
      case "cafe":
        return <Coffee className="h-4 w-4" />;
      case "outside food allowed":
        return <Coffee className="h-4 w-4" />;
      case "metro access":
        return <Shield className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="px-4 md:px-6 lg:px-12 py-4 md:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 max-w-none lg:max-w-5xl gap-4 md:gap-6 lg:gap-8">
        {/* Left Column */}
        <div className="space-y-4 md:space-y-6 lg:space-y-8">
          {/* Event Details */}
          <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 md:mb-6">
              Event Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1">Event Status</p>
                <p className="font-medium text-gray-900 capitalize text-sm md:text-base">
                  {eventData.status}
                </p>
              </div>

              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1">Number of Seats</p>
                <p className="font-medium text-gray-900 text-sm md:text-base">
                  {eventData.tickets === "unlimited"
                    ? "Unlimited"
                    : eventData.ticketCapacity}
                </p>
              </div>

              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1">Event Type</p>
                <p className="font-medium text-gray-900 capitalize text-sm md:text-base">
                  {eventData.ticketType === "paid" ? "Paid" : "Free"}
                </p>
              </div>

              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1">Event Category</p>
                <p className="font-medium text-gray-900 text-sm md:text-base">
                  {eventData.category || "Workshop / Offline"}
                </p>
              </div>

              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1">Booking Starts from</p>
                <p className="font-medium text-gray-900 text-sm md:text-base">
                  {formatDateUTC(eventData.startDateTime)}
                </p>
              </div>

              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1">Booking End</p>
                <p className="font-medium text-gray-900 text-sm md:text-base">
                  {formatDateUTC(eventData.endDateTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
              Description
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm md:text-base">
              {eventData.description}
            </p>
          </div>

          {/* Features */}
          {eventData.features && eventData.features.length > 0 && (
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
                Features
              </h2>
              <div className="space-y-3 md:space-y-4">
                {eventData.features.map((feature) => (
                  <div key={feature._id} className="flex items-start gap-3 md:gap-4">
                    {feature.files && feature.files[0] && (
                      <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={feature.files[0]}
                          alt={feature.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="text-wrap flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm md:text-base">
                        {feature.name}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chief Guest */}
          {eventData.chiefGuests && eventData.chiefGuests.length > 0 && (
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
                Chief Guest
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {eventData.chiefGuests.map((guest, index) => (
                  <div
                    key={guest._id || index}
                    className="flex items-center gap-3 md:gap-4"
                  >
                    <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full overflow-hidden">
                      {guest.image ? (
                        <Image
                          src={guest.image}
                          alt={guest.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium text-sm md:text-base">
                          {guest.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="text-wrap flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm md:text-base truncate">
                        {guest.name}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

     {/* Policy */}
{(eventData.termsAndConditions || eventData.refundPolicy) && (
  <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
    <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
      Policy
    </h2>

    <div className="space-y-3 md:space-y-4">
      {eventData.termsAndConditions && (
        <div>
          <h3 className="font-medium text-gray-900 mb-2 text-sm md:text-base">
            Terms & Conditions
          </h3>
          <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
            {eventData.termsAndConditions}
          </p>
        </div>
      )}

      {eventData.refundPolicy && (
        <div>
          <h3 className="font-medium text-gray-900 mb-2 text-sm md:text-base">
            Refund & Cancellation Policy
          </h3>
          <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
            {eventData.refundPolicy}
          </p>
        </div>
      )}
    </div>
  </div>
)}

        </div>

        {/* Right Column */}
        <div className="space-y-4 md:space-y-6 lg:space-y-8">
          {/* Cover Image - Show at top on mobile */}
          {eventData.coverImage && (
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 lg:order-last">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
                Cover Image
              </h2>

              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={eventData.coverImage}
                  alt={eventData.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Venue Amenities */}
          {eventData.amenities && eventData.amenities.length > 0 && (
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
                Venue Amenities
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {eventData.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2 md:gap-3">
                    <div className="text-gray-500 flex-shrink-0">
                      {getAmenityIcon(amenity)}
                    </div>
                    <span className="text-xs md:text-sm text-gray-700 truncate">
                      {amenity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sector */}
          {eventData.sectors && eventData.sectors.length > 0 && (
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
                Sector
              </h2>
              <div className="flex flex-wrap gap-2">
                {eventData.sectors.map((sector, index) => (
                  <span
                    key={index}
                    className="px-2 md:px-3 py-1 bg-gray-100 text-gray-700 border border-primary shadow-md rounded-full text-xs md:text-sm"
                  >
                    {sector}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Event Timings */}
          <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
              Event Timings
            </h2>

            <div className="space-y-3 md:space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="text-gray-600 text-sm md:text-base">Start</span>
                <div className="text-left sm:text-right">
                  <div className="font-medium text-gray-900 text-sm md:text-base">
                    {formatDateIST(eventData.startDateTime)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="text-gray-600 text-sm md:text-base">End</span>
                <div className="text-left sm:text-right">
                  <div className="font-medium text-gray-900 text-sm md:text-base">
                    {formatDateIST(eventData.endDateTime)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
              Ticket Details
            </h2>

            <div className="space-y-3 md:space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="text-gray-600 text-sm md:text-base">Ticket Type</span>
                <span className="font-medium text-gray-900 capitalize text-sm md:text-base">
                  {eventData.ticketType || "Paid"}
                </span>
              </div>

              {eventData.ticketType === "paid" && (
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                  <span className="text-gray-600 text-sm md:text-base">Price /Person</span>
                  <span className="font-medium text-gray-900 text-sm md:text-base">
                    ₹{eventData.ticketPrice?.toLocaleString("en-IN") || "24,000"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Venue Details - Updated with Dynamic Map */}
          <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-100">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
              Venue Details
            </h2>

            {eventData.venueStatus?.toLowerCase() === "online" ? (
              <p className="text-gray-900 font-medium mb-3 md:mb-4 text-sm md:text-base break-all">
                <Link
                  href={eventData.venue}
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  {eventData.venue}
                </Link>
              </p>
            ) : (
              <p className="text-gray-900 font-medium mb-3 md:mb-4 text-sm md:text-base">
                {eventData.venue}
              </p>
            )}

            {eventData.venueStatus?.toLowerCase() === "online" ? (
              <div className="aspect-video rounded-lg border border-gray-200 bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                <div className="text-center p-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 md:h-10 md:w-10 text-purple-700 mx-auto mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6h8m-8 4h8m-8 4h5"
                    />
                  </svg>
                  <p className="text-xs md:text-sm text-gray-700 font-medium">
                    Virtual Event
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="aspect-video rounded-lg overflow-hidden bg-gray-200 cursor-pointer relative border border-gray-200 touch-manipulation"
                onClick={() => {
                  const address = encodeURIComponent(
                    eventData.venue +
                      (eventData.city ? `, ${eventData.city}` : "") +
                      (eventData.state ? `, ${eventData.state}` : "") +
                      (eventData.pincode ? `, ${eventData.pincode}` : "") +
                      (eventData.country ? `, ${eventData.country}` : "")
                  );
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${address}`,
                    "_blank"
                  );
                }}
              >
                {mapLoading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
                      <p className="text-xs md:text-sm text-gray-600">Loading map...</p>
                    </div>
                  </div>
                ) : mapUrl ? (
                  <>
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={mapUrl}
                      className="pointer-events-none md:pointer-events-auto"
                    />
                    <div className="absolute inset-0 bg-transparent hover:bg-black/5 transition-colors md:hidden" />
                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1 md:hidden">
                      <p className="text-xs text-gray-700">Tap to open in Maps</p>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center">
                    <div className="text-center p-4">
                      <MapPin className="h-6 w-6 md:h-8 md:w-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-xs md:text-sm text-gray-600">
                        Tap to view on Google Maps
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
