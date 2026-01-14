"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Calendar, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// Helper function for API calls
// const apiCall = {
//   get: async (url: string) => {
//     const response = await fetch(`${API_BASE_URL}${url}`);
//     if (!response.ok) throw new Error('Network response was not ok');
//     return response.json();
//   },
//   post: async (url: string, data: any) => {
//     const response = await fetch(`${API_BASE_URL}${url}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(data)
//     });
//     if (!response.ok) throw new Error('Network response was not ok');
//     return response.json();
//   }
// };

// Define Event type matching backend
type Event = {
  _id: string;
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  venue: string;
  banner?: string;
  ticketType?: string;
  serviceProviderName?: string;
  razorpayPages?: string;
  ticketPrice?: number;
};

const EventCard = ({ event }: { event: Event }) => {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    seats: 1,
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const startPayment = async () => {
    try {
      // Validate form data
      if (!form.name || !form.email || !form.phone || form.seats < 1) {
        alert("Please fill all required fields");
        return;
      }

      // First save the booking details to backend
      const bookingData = {
        eventId: event._id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        seats: Number(form.seats),
      };

      //// console.log('Attempting to create booking with data:', bookingData);
      //// console.log('RazorpayPages link:', event.razorpayPages); // Log the razorpay link

      // Save booking details to backend
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/events/bookings/create`,
          bookingData
        );
        //// console.log('Full response:', response);
        //// console.log('Booking creation successful:', response.data);

        if (response.data.success) {
          if (event.razorpayPages) {
            //// console.log('Opening Razorpay link:', event.razorpayPages);
            // Add a small delay to ensure the console log appears before redirect
            setTimeout(() => {
              window.open(event.razorpayPages, "_blank", "noopener,noreferrer");
              setShowModal(false);
            }, 100);
          } else {
           // console.log("No Razorpay link found");
            setShowModal(false);
            alert("Booking successful!");
          }
        } else {
          alert("Booking creation was not successful. Please try again.");
        }
      } catch (apiError: any) {
        console.error("API Error:", apiError);
        console.error("API Error Response:", apiError.response?.data);
        alert(
          apiError.response?.data?.message ||
            "Failed to create booking. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      <div className="relative h-96 overflow-hidden">
        {/* Event Image with Purple Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800" />

        {/* Badge */}
        {/* <div className="absolute top-4 left-4">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            Online
          </span>
        </div> */}

        {/* Share Icon */}
        <div className="absolute top-4 right-4">
          <button
            type="button"
            aria-label="Share event"
            className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
            onClick={() => {
              const shareUrl = `${window.location.origin}/events/${event._id}`;
              if (navigator.clipboard) {
                navigator.clipboard.writeText(shareUrl);
                alert("Share link copied!");
              } else {
                window.prompt("Copy this link:", shareUrl);
              }
            }}
          >
            {/* Share Arrow Icon */}
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
                d="M15 8l5 5m0 0l-5 5m5-5H9a5 5 0 01-5-5V5"
              />
            </svg>
          </button>
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0">
          <Image
            src={event.banner || "/images/events/default.jpg"}
            alt={event.title}
            fill
            className="object-cover h-50"
          />
        </div>

        {/* Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            {event.ticketType || "Free"}
          </span>
        </div>

        {/* Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      <div className="p-6">
        <div className="space-y-3 mb-6">
       
            <div className="text-black">
              <h3 className="font-bold text-lg mb-1">{event.title}</h3>
              <div className="text-xs text-white/90 mb-2">
                {event.serviceProviderName || "Hosted Event"}
              </div>
            </div>
        
          <div className="whitespace-pre-line text-sm text-gray-600">
            {event.description || "No description available"}
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-3 text-gray-400" />
            <span className="text-sm">
              {new Date(event.startDateTime).toLocaleDateString("en-IN", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                 timeZone: 'UTC'
              })}
            </span>
          </div>

          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-3 text-gray-400" />
            <span className="text-sm">
              {new Date(event.startDateTime).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                 timeZone: 'UTC',
                hour12: true
              })}{" "}
              -{" "}
              {new Date(event.endDateTime).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                 timeZone: 'UTC',
                hour12: true
              })}
            </span>
          </div>

          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-3 text-gray-400" />
            <span className="text-sm">{event.venue}</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {event.ticketType === "Paid"
              ? `₹${event.ticketPrice?.toFixed(2) || "0.00"}`
              : "Free"}
          </div>
        </div>
        {/* <Button
          onClick={() => {
            if (event.razorpayPages) {
              window.open(event.razorpayPages, "_blank", "noopener,noreferrer");
            } else {
              alert("Payment link not available for this event.");
            }
          }}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg"
        >
          Buy Now
        </Button> */}
        <Button
          onClick={() => setShowModal(true)}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg"
        >
          Buy Now
        </Button>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="font-bold mb-4">Book Your Ticket</h2>
              <input
                name="name"
                value={form.name}
                onChange={handleInput}
                placeholder="Name"
                className="w-full border p-2 mb-2"
              />
              <input
                name="email"
                value={form.email}
                onChange={handleInput}
                placeholder="Email"
                className="w-full border p-2 mb-2"
              />
              <input
                name="phone"
                value={form.phone}
                onChange={handleInput}
                placeholder="Phone"
                className="w-full border p-2 mb-2"
              />
              {/* <input
                name="seats"
                type="number"
                value={form.seats}
                onChange={handleInput}
                placeholder="Seats"
                className="w-full border p-2 mb-4"
              /> */}
              <Button
                onClick={startPayment}
                disabled={
                  !form.name || !form.email || !form.phone || form.seats < 1
                }
                className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Book Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EventsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/events/events`);
       // console.log("Fetched events:", res.data);
        const eventsData = Array.isArray(res.data)
          ? res.data
          : res.data?.events || [];
        setEvents(eventsData);
      } catch (err: any) {
        console.error("Error fetching events:", err);
        // Only set error if it's not a 404 (which might mean no events)
        if (err.response?.status !== 404) {
          setError(err.message || "Failed to load events");
        } else {
          setEvents([]); // No events found
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
   // console.log("Searching for:", searchQuery);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70 z-10" />
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/events/events.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: "#0f0f23",
            }}
          />

          {/* Crowd silhouette overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-900/30 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-20 text-center max-w-8xl px-6">
          <div className="mb-8">
            <h2 className="text-white/80 text-lg md:text-xl font-medium mb-4 tracking-wide">
              Discover New Opportunities
            </h2>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              <span className="text-green-400">Find and Book</span>{" "}
              <span className="text-white">High Impact</span>
              <span className="block mt-2"></span>
              <span className="block mt-2">Events</span>
            </h1>
          </div>

          {/* Search Bar */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl max-w-8xl w-full mx-auto">
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Enter a Keyword, Facilities, City, or Event name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-4 text-gray-700 placeholder-gray-500 border-0 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-400 text-base"
                />
              </div>
              <Button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white font-medium px-8 py-4 rounded-xl transition-colors duration-200 whitespace-nowrap"
              >
                <Search className="w-5 h-5 mr-2" />
                Search
              </Button>
            </form>
          </div>
        </div>

        {/* Animated elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <div className="absolute top-40 right-20 w-1 h-1 bg-white rounded-full animate-ping" />
          <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse delay-1000" />
          <div className="absolute bottom-60 right-40 w-1 h-1 bg-green-400 rounded-full animate-ping delay-500" />
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Upcoming Events
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join high-impact events that connect entrepreneurs, innovators,
              and industry leaders
            </p>
            <p>Don’t Miss These Upcoming Events in Popular Destinations!</p>
          </div>

          {/* Filters */}
          {/* Filters */}
          <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Left Toggles */}
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium">
                  All
                </button>
                <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100">
                  Online
                </button>
                <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100">
                  Offline
                </button>
                <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100">
                  Free
                </button>
                <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100">
                  Paid
                </button>
              </div>

              {/* Right Dropdowns */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Event Type */}
                <div className="flex items-center gap-2">
                  <Image
                    src="/icons/EventtypeIcon.svg"
                    alt="Event Type"
                    width={20}
                    height={20}
                  />
                  <select
                    id="event-type"
                    className="rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                  >
                    <option value="">Event Type</option>
                    <option value="conference">Conferences</option>
                    <option value="workshop">Workshops</option>
                    <option value="networking">Networking</option>
                    <option value="hackathon">Hackathons</option>
                  </select>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <select
                    id="location"
                    className="rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                  >
                    <option value="">Location</option>
                    <option value="chennai">Chennai</option>
                    <option value="bangalore">Bangalore</option>
                    <option value="delhi">Delhi</option>
                    <option value="mumbai">Mumbai</option>
                  </select>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <select
                    id="date"
                    className="rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                  >
                    <option value="">Date</option>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="this-week">This Week</option>
                    <option value="this-month">This Month</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {loading && <p className="text-center">Loading events...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && !error && (
            <>
              {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {events.map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto bg-gray-50 rounded-xl p-8 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      No Upcoming Events
                    </h3>
                    <p className="text-gray-600 mb-6">
                      There are currently no upcoming events. Please check back
                      later for new events!
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className="border-green-500 text-green-600 hover:bg-green-50"
                    >
                      Refresh Page
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* <div className="text-center mt-12">
            <Button className="bg-green-500 hover:bg-green-600 text-white font-medium px-8 py-3 rounded-xl">
              View All Events
            </Button>
          </div> */}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-green-500 to-green-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Host Your Event?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Connect with our community and create meaningful experiences
          </p>
          <Button
            className="bg-white text-green-600 hover:bg-gray-100 font-medium px-8 py-3 rounded-xl"
            onClick={() => window.open("https://tally.so/r/npE2rE", "_blank")}
          >
            List Your Event
          </Button>
        </div>
      </section>
    </div>
  );
};

export default EventsPage;
