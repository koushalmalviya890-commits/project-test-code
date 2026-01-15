import React, { useState } from "react";
import { TrendingUp, Calendar, MapPin, Building2, Users } from "lucide-react";

export default function FacilityDashboard() {
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedEnabler, setSelectedEnabler] = useState("All Enablers");
  const [searchQuery, setSearchQuery] = useState("");

  const occupancyData = [
    { day: "Mon", percentage: 65 },
    { day: "Tue", percentage: 72 },
    { day: "Wed", percentage: 78 },
    { day: "Thu", percentage: 82 },
    { day: "Fri", percentage: 88 },
    { day: "Sat", percentage: 92 },
    { day: "Sun", percentage: 95 },
  ];

  return (
    <>
    <div className="bg-gray-50 py-8 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-5xl font-bold text-center text-gray-900 mb-2 md:mb-3">
          From Signup to Revenue
        </h2>
        <p className="text-lg md:text-xl text-center text-gray-600 mb-8 md:mb-16">
          5 Simple Steps
        </p>

        {/* Steps Container - Desktop Horizontal */}
        <div className="hidden md:flex items-start justify-between max-w-6xl mx-auto relative">
          {/* Connecting Line */}
          <div
            className="absolute top-12 left-0 right-0 h-0.5 bg-green-500 z-0"
            style={{
              width: "calc(100% - 160px)",
              left: "80px",
            }}
          ></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center z-10 flex-1">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <span className="text-sm text-gray-400 mb-2">Step 1</span>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Choose Role
            </h3>
            <p className="text-sm text-gray-600 text-center max-w-xs">
              Facility, Startup, Affiliate, or Partner
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center z-10 flex-1">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-sm text-gray-400 mb-2">Step 2</span>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Quick Signup
            </h3>
            <p className="text-sm text-gray-600 text-center max-w-xs">
              Fill simple form in 2 minutes
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center z-10 flex-1">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
                />
              </svg>
            </div>
            <span className="text-sm text-gray-400 mb-2">Step 3</span>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Access Dashboard
            </h3>
            <p className="text-sm text-gray-600 text-center max-w-xs">
              Instant activation & onboarding
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center z-10 flex-1">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-sm text-gray-400 mb-2">Step 4</span>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Generate Value
            </h3>
            <p className="text-sm text-gray-600 text-center max-w-xs">
              Start using or earning immediately
            </p>
          </div>

          {/* Step 5 */}
          <div className="flex flex-col items-center z-10 flex-1">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <span className="text-sm text-gray-400 mb-2">Step 5</span>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Lock Founding Benefits
            </h3>
            <p className="text-sm text-gray-600 text-center max-w-xs">
              Exclusive early access perks
            </p>
          </div>
        </div>

        {/* Steps Container - Mobile Vertical */}
        <div className="md:hidden flex flex-col max-w-md mx-auto relative">
          {/* Vertical Connecting Line */}
          <div
            className="absolute left-8 top-0 bottom-0 w-0.5 bg-green-500 z-0"
            style={{
              height: "calc(100% - 120px)",
              top: "60px",
            }}
          ></div>

          {/* Step 1 */}
          <div className="flex items-start z-10 mb-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg mr-4 flex-shrink-0">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <div className="flex-1 pt-2">
              <span className="text-sm text-gray-400 mb-1 block">Step 1</span>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Choose Role
              </h3>
              <p className="text-sm text-gray-600">
                Facility, Startup, Affiliate, or Partner
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start z-10 mb-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg mr-4 flex-shrink-0">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="flex-1 pt-2">
              <span className="text-sm text-gray-400 mb-1 block">Step 2</span>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Quick Signup
              </h3>
              <p className="text-sm text-gray-600">
                Fill simple form in 2 minutes
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start z-10 mb-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg mr-4 flex-shrink-0">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
                />
              </svg>
            </div>
            <div className="flex-1 pt-2">
              <span className="text-sm text-gray-400 mb-1 block">Step 3</span>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Access Dashboard
              </h3>
              <p className="text-sm text-gray-600">
                Instant activation & onboarding
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start z-10 mb-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg mr-4 flex-shrink-0">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="flex-1 pt-2">
              <span className="text-sm text-gray-400 mb-1 block">Step 4</span>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Generate Value
              </h3>
              <p className="text-sm text-gray-600">
                Start using or earning immediately
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex items-start z-10">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg mr-4 flex-shrink-0">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div className="flex-1 pt-2">
              <span className="text-sm text-gray-400 mb-1 block">Step 5</span>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Lock Founding Benefits
              </h3>
              <p className="text-sm text-gray-600">
                Exclusive early access perks
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: "url(/background2.png)" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Side - Dashboard */}
            <div className="backdrop-blur-md bg-opacity-10 rounded-3xl p-8 border border-green-600 border-opacity-20 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-8">
                Facility Revenue Dashboard
              </h2>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Revenue Card */}
                <div className="backdrop-blur-sm bg-opacity-15 rounded-2xl p-6 border border-white border-opacity-20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-200 text-sm">Revenue</span>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">
                    ₹1.2M
                  </div>
                  <div className="flex items-center gap-1 text-green-400 text-sm">
                    <TrendingUp size={16} />
                    <span>+13% this month</span>
                  </div>
                </div>

                {/* Bookings Card */}
                <div className="backdrop-blur-sm bg-opacity-15 rounded-2xl p-6 border border-white border-opacity-20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-200 text-sm">Bookings</span>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">247</div>
                  <div className="flex items-center gap-1 text-green-400 text-sm">
                    <TrendingUp size={16} />
                    <span>+18% this month</span>
                  </div>
                </div>
              </div>

              {/* Occupancy Chart */}
              <div className="backdrop-blur-sm bg-opacity-10 rounded-2xl p-6 border border-white border-opacity-20">
                <h3 className="text-white text-lg font-semibold mb-6">
                  Occupancy %
                </h3>

                {/* Chart Container */}
                <div className="bg-opacity-5 rounded-xl p-4 mb-6">
                  <div className="flex items-end justify-between gap-2 h-40">
                    {occupancyData.map((data, index) => (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center justify-end h-full"
                      >
                        {/* Bar Container with background */}
                        <div className="w-full flex flex-col justify-end h-full mb-3">
                          <div
                            className="w-full bg-gradient-to-t from-green-500 via-green-400 to-white rounded-t-2xl shadow-lg transition-all duration-300 hover:scale-105"
                            style={{ height: `${data.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-xs font-medium">
                          {data.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* QR Check-ins */}
                <div className="mt-8 pt-6 border-t border-white border-opacity-20">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-200">QR Check-ins</span>
                    <span className="text-white text-3xl font-bold">142</span>
                  </div>
                  <div className="mt-3 w-full bg-opacity-20 rounded-full h-2">
                    <div
                      className="bg-green-400 h-2 rounded-full"
                      style={{ width: "70%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Search */}
            <div className="backdrop-blur-md bg-opacity-95 rounded-3xl  border border-green-600 border-opacity-20 p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-2">
                Find Your Perfect Space
              </h2>
              <p className="text-white mb-8">
                Search from 100+ verified partner facilities
              </p>

              {/* Filter Dropdowns */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* City */}
                <div>
                  <label className="block text-sm text-white mb-2">City</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      placeholder="All Cities"
                      className="w-full pl-4 pr-12 py-4 
                               bg-white/20           /* Semi-transparent white */
                               backdrop-blur-md      /* Blurs the image behind the input */
                               text-gray-700            /* Matches the white text in the image */
                               placeholder:text-gray-900 
                               rounded-2xl           /* Larger corner radius as seen in image */
                               border border-white/30 /* Subtle light border */
                               outline-none 
                               focus:ring-2 focus:ring-green-400 
                               transition-all"
                    />
                    <MapPin
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 text-green-800 z-10 pointer-events-none"
                      size={20}
                    />
                  </div>
                </div>

                {/* Facility Type */}
                <div>
                  <label className="block text-sm text-white mb-2">
                    Facility Type
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      placeholder="All Cities"
                      className="w-full pl-4 pr-12 py-4 
                               bg-white/20           /* Semi-transparent white */
                               backdrop-blur-md      /* Blurs the image behind the input */
                               text-gray-900            /* Matches the white text in the image */
                               placeholder:text-gray-900 
                               rounded-2xl           /* Larger corner radius as seen in image */
                               border border-white/30 /* Subtle light border */
                               outline-none 
                               focus:ring-2 focus:ring-green-400 
                               transition-all"
                    />
                    <Building2
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 text-green-800 z-10 pointer-events-none"
                      size={20}
                    />
                  </div>
                </div>

                {/* Enabler */}
                <div>
                  <label className="block text-sm text-white mb-2">
                    Enabler
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={selectedEnabler}
                      onChange={(e) => setSelectedEnabler(e.target.value)}
                      placeholder="All Cities"
                      className="w-full pl-4 pr-12 py-4 
                               bg-white/20           /* Semi-transparent white */
                               backdrop-blur-md      /* Blurs the image behind the input */
                               text-gray-900            /* Matches the white text in the image */
                               placeholder:text-gray-900 
                               rounded-2xl           /* Larger corner radius as seen in image */
                               border border-white/30 /* Subtle light border */
                               outline-none 
                               focus:ring-2 focus:ring-green-400 
                               transition-all"
                    />
                    <Users
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 text-green-800 z-10 pointer-events-none"
                      size={20}
                    />
                  </div>
                  {/* <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" size={20} />
                  <select 
                    value={selectedEnabler}
                    onChange={(e) => setSelectedEnabler(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-100 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option>All Enablers</option>
                    <option>Partner A</option>
                    <option>Partner B</option>
                  </select>
                </div> */}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Search BIP partner facilities by city, facility, or enabler"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-12 py-4 
                               bg-white/20           /* Semi-transparent white */
                               backdrop-blur-md      /* Blurs the image behind the input */
                               text-gray-900            /* Matches the white text in the image */
                               placeholder:text-gray-900 
                               rounded-2xl           /* Larger corner radius as seen in image */
                               border border-white/30 /* Subtle light border */
                               outline-none 
                               focus:ring-2 focus:ring-green-400 
                               transition-all"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Search Button */}
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-xl transition-colors mb-6">
                Search Facilities and Book Instantly
              </button>

              {/* Facility Card */}
              <div className="backdrop-blur-md bg-white bg-opacity-80 rounded-2xl p-6 border border-gray-100 shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        Venture Studio Mumbai
                      </h3>
                      <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full font-semibold">
                        Curnma Partner
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <MapPin size={16} />
                      <span>Mumbai, Maharashtra</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">From</div>
                    <div className="text-2xl font-bold text-green-600">
                      ₹1,070/day
                    </div>
                    <div className="text-xs text-gray-400 line-through">
                      ₹1,259/day
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <span className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 font-medium">
                    Coworking
                  </span>
                  <span className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 font-medium">
                    Meeting Rooms
                  </span>
                  <span className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 font-medium">
                    Labs
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
