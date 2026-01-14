"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Calendar, MapPin, Clock, Users, ChevronDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EventCards from "./components/eventcard";
import EventService from "@/services/Events/services/event-api-services"
import { useRouter } from "next/navigation";
import PopularCitiesSection from "./components/popularCites"
import Link from "next/link";
import { NewsletterSignup } from "@/components/sections/newsletter-signup";
import ComingSoon from "@/components/ui/commingsoon";
// Interface definition (keep the same)
interface Event {
  _id: string;
  serviceProviderId: string;
  serviceProviderName: string;
  title: string;
  status: string;
  startDateTime: string;
  endDateTime: string;
  venue: string;
  venueStatus: string;
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
  ticketType: string;
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
   isFeatured?: boolean;
}

// Custom Dropdown Component
const CustomDropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  icon: Icon 
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
  icon: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 min-w-[140px] ${
          value !== 'all' 
            ? 'border-green-500 bg-green-50 text-green-700' 
            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
        }`}
      >
        <Icon className={`w-4 h-4 ${value !== 'all' ? 'text-green-600' : 'text-gray-500'}`} />
        <span className="text-sm font-medium truncate">
          {value === 'all' ? placeholder : options.find(opt => opt.value === value)?.label || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${
          value !== 'all' ? 'text-green-600' : 'text-gray-400'
        }`} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-full overflow-hidden">
            <div className="py-2">
              <button
                onClick={() => {
                  onChange('all');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                  value === 'all' 
                    ? 'bg-green-50 text-green-700 border-r-2 border-green-500' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                All {placeholder}
              </button>
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                    value === option.value 
                      ? 'bg-green-50 text-green-700 border-r-2 border-green-500' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// New Why Book Events Section Component
const WhyBookEventsSection = () => {
  return (
    <section className="">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Book Events Through{" "}
            <Image 
            className="mx-auto mt-10"
            src="/logo-green.png"
            height={200}
            width={200}
            alt="Cumma2 Logo"
            />
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience events the smarter way
          </p>
        </div>
      </div>
    </section>
  );
};

const EventsPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);


  // Static filter options
  const staticFilterOptions = {
    categories: [
      { value: 'Technology', label: 'Technology' },
      { value: 'Conferences', label: 'Conferences' },
      { value: 'Workshops', label: 'Workshops' },
      { value: 'Networking', label: 'Networking' },
      { value: 'Hackathons', label: 'Hackathons' }
    ],
    cities: [
      { value: 'Chennai', label: 'Chennai' },
      { value: 'Bangalore', label: 'Bangalore' },
      { value: 'Delhi', label: 'Delhi' },
      { value: 'Mumbai', label: 'Mumbai' }
    ],
    dateOptions: [
      { value: 'today', label: 'Today' },
      { value: 'tomorrow', label: 'Tomorrow' },
      { value: 'this-week', label: 'This Week' },
      { value: 'this-month', label: 'This Month' }
    ]
  };

  // Filter states
  const [activeFilters, setActiveFilters] = useState({
    venueStatus: 'all',
    ticketType: 'all',
    category: 'all',
    location: 'all',
    dateFilter: 'all'
  });


    // 🌟 NEW: Function to sort events with featured first
  const sortEventsByFeatured = (eventsArray: Event[]) => {
    return [...eventsArray].sort((a, b) => {
      // Featured events come first
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      
      // If both featured or both not featured, sort by start date (most recent first)
      return new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime();
    });
  };

// Update your main events page handleSearch function

const handleSearch = async (e: React.FormEvent) => {
  e.preventDefault();
  if (searchQuery.trim()) {
    setSearchLoading(true);
    // Redirect to search page with query
    router.push(`/EventSearchPage?search=${encodeURIComponent(searchQuery.trim())}`);
    // Simulate search delay (remove this in production if routing is fast)
    setTimeout(() => setSearchLoading(false), 1000);
  }
};


const handleCityClick = (cityName: string) => {
  // Navigate to search page with city filter
  router.push(`/EventSearchPage?search=${encodeURIComponent(cityName)}`);
};

  // Load featured events on page load
  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        setLoading(true);
        const response = await EventService.getFeaturedEvents(6);
       // console.log("Featured events:", response);
        
        const eventsData = Array.isArray(response.events)
          ? (response.events as unknown as Event[])
          : [];
        
         const sortedEvents = sortEventsByFeatured(eventsData);
        setEvents(sortedEvents);
        
      } catch (err: any) {
        console.error("Error fetching featured events:", err);
        if (err.response?.status !== 404) {
          setError(err.message || "Failed to load events");
        } else {
          // Fallback to regular events if no featured events
          try {
            const res = await EventService.getEvent();
            const eventsData = Array.isArray(res.events)
              ? (res.events as unknown as Event[])
              : [];
          // 🌟 UPDATED: Sort fallback events too
            const sortedEvents = sortEventsByFeatured(eventsData);
            setEvents(sortedEvents);
          } catch (fallbackErr) {
            setEvents([]);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedEvents();
  }, []);

  // Apply filters dynamically
  const applyFilters = async (newFilters: any) => {
    try {
      setLoading(true);
      
      // Remove 'all' values
      const cleanFilters = Object.keys(newFilters).reduce((acc, key) => {
        if (newFilters[key] !== 'all' && newFilters[key] !== '') {
          acc[key] = newFilters[key];
        }
        return acc;
      }, {} as any);

     // console.log("Applying filters:", cleanFilters);
      
      const response = await EventService.getEventsWithFilters(cleanFilters);
      
      const eventsData = Array.isArray(response.events)
        ? (response.events as unknown as Event[])
        : [];
      
        
      // 🌟 UPDATED: Sort filtered events to show featured first
      const sortedEvents = sortEventsByFeatured(eventsData);
      setEvents(sortedEvents);
      
    } catch (err: any) {
      console.error("Error fetching filtered events:", err);
      setError(err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: value
    };
    
    setActiveFilters(newFilters);
    applyFilters(newFilters);
  };

  // Reset to featured events
  const resetToFeatured = async () => {
    setActiveFilters({
      venueStatus: 'all',
      ticketType: 'all',
      category: 'all',
      location: 'all',
      dateFilter: 'all'
    });
    
    try {
      setLoading(true);
      const response = await EventService.getFeaturedEvents(6);
      const eventsData = Array.isArray(response.events)
        ? (response.events as unknown as Event[])
        : [];
       const sortedEvents = sortEventsByFeatured(eventsData);
      setEvents(sortedEvents);
    } catch (err: any) {
      setError(err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  // const handleSearch = (e: React.FormEvent) => {
  //   e.preventDefault();
  //  // console.log("Searching for:", searchQuery);
  // };

  // Count active filters
  const activeFilterCount = Object.values(activeFilters).filter(f => f !== 'all').length;

// 🌟 NEW: Count featured events
  const featuredCount = events.filter(e => e.isFeatured).length;

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
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-900/30 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-20 text-center px-6">
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
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl w-full mx-auto">
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
  disabled={searchLoading}
  className="bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white font-medium px-8 py-4 rounded-xl transition-colors duration-200 whitespace-nowrap"
>
  {searchLoading ? (
    <>
      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
      Searching...
    </>
  ) : (
    <>
      <Search className="w-5 h-5 mr-2" />
      Search
    </>
  )}
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

{/* Popular Cities Section - NEW - Insert before Featured Events */}

      {/* Featured Events Section */}
{/* <PopularCitiesSection onCityClick={handleCityClick} /> */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {activeFilterCount > 0 
                ? 'Filtered Events' 
                : 'Upcoming Events'
              }
            </h2>
            <p className="font-semibold text-gray-600">
              {activeFilterCount > 0
                ? `Found ${events.length} event(s) with ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} applied`
                : "Don't Miss These Featured Events in Popular Destinations!"
              }
            </p>
          </div>

          {/* Enhanced Filters */}
          <div className="mb-8">
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="text-lg font-semibold text-gray-800">Filter Events</span>
              
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetToFeatured}
                  className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="bg-gradient-to-r from-gray-50 rounded-2xl to-white p-6 shadow-sm">
              <div className="flex justify-between space">
                
         
<div className="flex flex-col sm:flex-row gap-4">
  <div className="flex flex-wrap gap-3">
    <button 
      onClick={resetToFeatured}
      className={`px-4 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
        activeFilterCount === 0
          ? 'bg-green-500 text-white shadow-lg shadow-green-500/25' 
          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-300 hover:shadow-md'
      }`}
    >
      All Events
    </button>
    <button 
      onClick={() => handleFilterChange('venueStatus', 'online')}
      className={`px-4 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
        activeFilters.venueStatus === 'online'
          ? 'bg-green-500 text-white shadow-lg shadow-green-500/25' 
          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-300 hover:shadow-md'
      }`}
    >
       Online
    </button>
    <button 
      onClick={() => handleFilterChange('venueStatus', 'offline')}
      className={`px-4 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
        activeFilters.venueStatus === 'offline'
          ? 'bg-green-500 text-white shadow-lg shadow-green-500/25' 
          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-300 hover:shadow-md'
      }`}
    >
     Offline
    </button>
    <button 
      onClick={() => handleFilterChange('ticketType', 'free')}
      className={`px-4 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
        activeFilters.ticketType === 'free'
          ? 'bg-green-500 text-white shadow-lg shadow-green-500/25' 
          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-300 hover:shadow-md'
      }`}
    >
    Free
    </button>
    <button 
      onClick={() => handleFilterChange('ticketType', 'paid')}
      className={`px-4 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
        activeFilters.ticketType === 'paid'
          ? 'bg-green-500 text-white shadow-lg shadow-green-500/25' 
          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-300 hover:shadow-md'
      }`}
    >
       Paid
    </button>
  </div>
</div>


                {/* Advanced Dropdowns */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex flex-wrap gap-4">
                    <CustomDropdown
                      value={activeFilters.category}
                      onChange={(value) => handleFilterChange('category', value)}
                      options={staticFilterOptions.categories}
                      placeholder="Event Type"
                      icon={({ className }: { className: string }) => (
                        <div className={className}>
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </div>
                      )}
                    />

                    <CustomDropdown
                      value={activeFilters.location}
                      onChange={(value) => handleFilterChange('location', value)}
                      options={staticFilterOptions.cities}
                      placeholder="Location"
                      icon={MapPin}
                    />

                    <CustomDropdown
                      value={activeFilters.dateFilter}
                      onChange={(value) => handleFilterChange('dateFilter', value)}
                      options={staticFilterOptions.dateOptions}
                      placeholder="Date"
                      icon={Calendar}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

         {loading ? (
  // Show loading spinner ONLY when loading
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
  </div>
) : error ? (
  // Show error ONLY when there's an error and not loading
  <div className="text-center py-12">
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
      <p className="text-red-600 font-medium">{error}</p>
    </div>
  </div>
) : (
  // Show EventCards ONLY when not loading and no error
  <div className="mt-10">
    <EventCards events={events} />

   
  </div>
)}


           {events.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className=" p-8 max-w-md mx-auto">
              
                <h3 className="text-xl font-bold text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
                <Button 
                  onClick={resetToFeatured}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold"
                >
                  View All Featured Events
                </Button>
              </div>
            </div>
          )}

          <div className="text-center mt-12">
            <Button className="text-black font-semibold border-2 bg-white hover:bg-gray-50 hover:shadow-lg border-green-500 px-8 py-6 rounded-full transition-all duration-200 ">
              <Link href="/EventSearchPage" className="flex items-center">
              
              View More Events
              </Link>
              <svg
                className="w-4 h-4 ml-2"
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
            </Button>
          </div> 
        </div>
      </section>

      <WhyBookEventsSection />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-16 px-6 max-w-7xl mx-auto">
        {[
          {
            title: "One-Click Booking Experience",
            description: "No hassle, no delays.",
            iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
          },
          {
            title: "Secure & Instant Payments",
            description: "Safe and quick transactions every time.",
            iconPath: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
          },
          {
            title: "Smart Notifications & Reminders",
            description: "Stay updated, never miss a moment.",
            iconPath: "M15 17h5l-5 5-5-5h5v-12a3 3 0 106 0v12z",
          },
          {
            title: "Access to Event History",
            description: "Make authenticated requests against any provider endpoint.",
            iconPath: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
          },
          {
            title: "Trusted by Top Incubators",
            description: "Preferred by India's leading startup enablers.",
            iconPath: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
          },
          {
            title: "Unified Ecosystem",
            description: "Discover, connect, and grow through a connected platform",
            iconPath: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-sm border border-primary p-8  hover:shadow-lg transition-all duration-300"
          >
            <div className="mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={feature.iconPath}
                />
              </svg>
            </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
            {feature.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
      <br/>
      
      {/* Call to Action Section */}
      <section className="py-16 px-16 ">
        <NewsletterSignup />
      </section>
      <br/><br/>
      <br/><br/>
    </div>
  );
};

export default EventsPage;
