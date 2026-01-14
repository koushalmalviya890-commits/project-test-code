import React from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
// 🕒 ONLY ADDED: IST helpers
import { formatDateIST } from "@/utils/dateTimeHelper";

// Event type
export interface Event {
  _id: string | number;
  title: string;
  startDateTime: string;
  endDateTime: string;
  venue: string;
  coverImage: string;
  venueStatus: string; // "online" | "offline"
  ticketType: string; // "free" | "paid"
  description: string;
    isFeatured?: boolean; // 🌟 Added featured flag
}

interface EventCardsProps {
  events: Event[];
}

// 🕒 UPDATED: Use IST helpers instead of manual formatting
const formatDate = (dateString: string) => {
  return formatDateIST(dateString, 'dateOnly').replace(/,/g, ''); // Keep your original format style
};

const formatTime = (dateString: string) => {
  return formatDateIST(dateString, 'timeOnly');
};

const EventCards: React.FC<EventCardsProps> = ({ events }) => {
  // Filter out events that have already started
  const upcomingEvents = events.filter((event) => {
    const currentTime = new Date();
    const eventStartTime = new Date(event.startDateTime);
    return eventStartTime > currentTime;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
      {upcomingEvents.map((event) => (
        <div key={event._id} className="w-full max-w-sm mx-auto pb-10">
         <div className={`bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
            event.isFeatured ? 'ring-2 ring-yellow-400 shadow-yellow-200' : ''
          }`}>
            {/* Header Section with coverImage */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={event.coverImage}
                alt={event.title}
                className="w-full h-full object-cover"
              />

              {/* Ticket Type Badge */}
              {/* <div className="absolute top-3 left-3 z-10">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    event.ticketType.toLowerCase() === "free"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {event.ticketType.toUpperCase()}
                </span>
              </div> */}

               {event.isFeatured && (
                <div className="absolute top-3 left-3 z-20">
                  <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1.5 rounded-full shadow-lg">
                    <span className="text-lg">⭐</span>
                    <span className="text-xs font-bold uppercase tracking-wide">Featured</span>
                  </div>
                </div>
              )}
                {/* Ticket Type Badge - Adjusted position if featured */}
              <div className={`absolute ${event.isFeatured ? 'top-14' : 'top-3'} left-3 z-10`}>
                {event.ticketType.toLowerCase() === "free" ? (
                  <Image
                    src="/free.png"
                    width={60}
                    height={40}
                    alt="Free Event"
                    className="object-cover"
                  />
                ) : (
                  <Image
                    src="/paid.png"
                    width={60}
                    height={40}
                    alt="Paid Event"
                    className="object-cover"
                  />
                )}
              </div>

              {/* Venue Status */}
              <div className="absolute top-3 right-3 z-10">
                <button className="w-8 h-8 bg-black/40  backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-5 bg-white">
              {/* Event Title */}
             <div className="flex items-start justify-between gap-2 mb-4">
                <h3 className="text-lg font-bold text-black leading-tight line-clamp-2 flex-1">
                  {event.title} ({event.venueStatus})
                </h3>
                {/* 🌟 NEW: Small featured indicator next to title */}
                {event.isFeatured && (
                  <span className="text-yellow-500 text-xl flex-shrink-0">⭐</span>
                )}
              </div>

              {/* Event Details */}
              <div className="space-y-3 mb-6">
                {/* Date */}
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">
                    {formatDate(event.startDateTime)} -{" "}
                    {formatDate(event.endDateTime)}
                  </span>
                </div>

                {/* Time */}
                <div className="flex items-center text-gray-700">
                  <Clock className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">
                    {formatTime(event.startDateTime)} -{" "}
                    {formatTime(event.endDateTime)}
                  </span>
                </div>

                {/* Venue */}
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm truncate">{event.venue}</span>
                </div>
              </div>

              {/* View More Details */}
                           {/* View More Details Button */}
              <Link href={`/EventDetail/${event._id}`} passHref>
                <button className={`w-full py-3 px-6 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
                  event.isFeatured 
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-yellow-900 shadow-lg shadow-yellow-500/25'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}>
                  <span>View More Details</span>
                  <svg
                    className="w-4 h-4"
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
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventCards;
