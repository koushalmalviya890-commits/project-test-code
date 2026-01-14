// components/BookingPage.tsx

import React from "react";
import {
  CheckCircle,
  Download,
  MoreHorizontal,
  MessageCircle,
  MapPin,
  Wifi,
  Users,
  Coffee,
  Printer,
  Shield,
  Headset,
  Linkedin,
  Instagram
} from "lucide-react";
import Image from "next/image";

type Mode = "startup" | "enabler";

// --- Utility Components for Reusability ---

const FeatureBox: React.FC<{ icon: React.ReactNode; label: string }> = ({
  icon,
  label,
}) => (
  <div className="flex items-center justify-center w-[150px] md:w-auto gap-2 px-2 py-2 md:p-2 rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md cursor-pointer">
    <div className="text-gray-600 mb-1">{icon}</div>
    <span className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
      {label}
    </span>
  </div>
);

const CheckStep: React.FC<{ label: string; active: boolean }> = ({
  label,
  active,
}) => (
  <div className="flex items-center space-x-2">
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center ${active ? "bg-green-500" : "bg-gray-200"}`}
    >
      <CheckCircle
        className={`w-4 h-4 ${active ? "text-white" : "text-gray-500"}`}
        fill={active ? "currentColor" : "none"}
        strokeWidth={3}
      />
    </div>
    <span
      className={`text-sm font-medium ${active ? "text-green-600" : "text-gray-600"} hidden sm:inline`}
    >
      {label}
    </span>
  </div>
);

interface BookingPageProps {
  mode: Mode;
}

// --- Main Page Component ---

const BookingPage: React.FC<BookingPageProps> = ({ mode }) => {
  // Icons used in Key Amenities section
  const amenityIcons = [
    { icon: <Wifi className="w-6 h-6" />, label: "Wi-Fi" },
    { icon: <Users className="w-6 h-6" />, label: "Community" },
    { icon: <Coffee className="w-6 h-6" />, label: "Cafe" },
    { icon: <Printer className="w-6 h-6" />, label: "Printer" },
    { icon: <Shield className="w-6 h-6" />, label: "Security" },
  ];

  return (
    <div className="h-[70vh] sm:h-[800px] bg-gray-50 p-4 sm:p-8 lg:p-12 font-sans overflow-hidden relative">
      {/* Globe SVG for Desktop - positioned at bottom center */}
      <div className="hidden lg:block absolute -bottom-40 left-1/2 transform -translate-x-1/2 w-[900px] h-[600px] z-0">
        <Image 
          src="/workspace/globedesktop.svg" 
          alt="Globe Background" 
          fill
          className="object-contain"
        />
      </div>
      <div className="block md:hidden absolute bottom-10 left-1/2 transform -translate-x-1/2 w-[900px] h-[600px] z-0">
        <Image 
          src="/workspace/globemobile.svg" 
          alt="Globe Background" 
          fill
          className="object-contain"
        />
      </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        {/* --- Left Column: Header, Text, and Features --- */}
        <div className="lg:col-span-5 space-y-6 sm:space-y-8">
          {/* Header/Title Section */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
            <h2 className="text-base sm:text-lg font-semibold text-green-600">
              {mode === "startup" ? "Flexible Booking Options" : "Set availability"}
            </h2>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-gray-900">
              {mode === "startup" ? (
                <>
                  Book by the hour,
                  <br />
                  day, month, or year
                </>
              ) : (
                <>
                  Hourly, daily,
                  <br />
                  monthly or Yearly
                </>
              )}
            </h1>
          </div>


          <div className="space-y-3 sm:space-y-4 text-gray-600 text-base sm:text-lg text-center sm:text-left">
            {mode === "startup" ? (
              <>
                <p>Whatever fits your team best.</p>
                <p>Easily switch plans as your startup grows.</p>
              </>
            ) : (
              <>
                <p>Attract promising startups instantly</p>
                <p>Seamlessly manage and scale plans as startups grow</p>
              </>
            )}
            <ul className="hidden md:block list-none space-y-2 mt-4">
              <li className="flex items-start">
                <Image
                  src="/workspace/check.svg"
                  alt="Check"
                  width={24}
                  height={24}
                />
                <span className="text-base text-gray-700">
                  {mode === "startup" 
                    ? "The spaces, plans, and amenities that fuel your growth."
                    : "Offer spaces, resources, and tools that accelerate innovation"}
                </span>
              </li>
              <li className="flex items-start">
                <Image
                  src="/workspace/check.svg"
                  alt="Check"
                  width={24}
                  height={24}
                />
                <span className="text-base text-gray-700">
                  {mode === "startup"
                    ? "how your flexible options adapt to every stage of the journey."
                    : "Show how your flexible solutions empower startups at every stage"}
                </span>
              </li>
            </ul>
          </div>

          {/* Feature Boxes */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:flex md:flex-nowrap">
            {/* Left column for mobile (1st and 3rd items) */}
            <div className="space-y-3 sm:space-y-4">
              <FeatureBox
                icon={<img src="/icons/categories/coworking.svg" alt="" className="w-6 h-6 sm:w-8 sm:h-8" />}
                label="Co-Working Space"
              />
              <div className="md:hidden ml-24">
                <FeatureBox
                  icon={<img src="/icons/categories/meeting.svg" alt="" className="w-6 h-6 sm:w-8 sm:h-8" />}
                  label="Meeting Area"
                />
              </div>
            </div>
            
            {/* Right column for mobile (2nd item) */}
            <div className="flex items-start justify-center md:items-center">
              <FeatureBox
                icon={<img src="/icons/categories/cabin.svg" alt="" className="w-6 h-6 sm:w-8 sm:h-8" />}
                label="Private Cabins"
              />
            </div>
            
            {/* This will only show on md screens and up */}
            <div className="hidden md:block">
              <FeatureBox
                icon={<img src="/icons/categories/meeting.svg" alt="" className="w-6 h-6 sm:w-8 sm:h-8" />}
                label="Meeting Area"
              />
            </div>
          </div>

          {/* Key Amenities */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Key Amenities</h3>
            <div className="flex flex-wrap items-center gap-6">
              {amenityIcons.map((item, index) => (
                <div
                  key={index}
                  className="text-gray-500 transition-colors hover:text-green-500 cursor-pointer"
                  title={item.label}
                >
                  {item.icon}
                </div>
              ))}
              <div className="text-green-600 text-sm font-medium border border-green-200 bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 cursor-pointer">
                +more
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="flex items-center space-x-4 pt-8">
            <button className="flex items-center bg-white border border-green-500 text-green-500 px-6 py-3 rounded-full font-semibold shadow-md hover:bg-green-50 transition-colors">
              Get Free Trial
              <span className="ml-2">↗</span>
            </button>
            <button className="flex items-center text-gray-600 px-6 py-3 rounded-xl font-semibold hover:text-green-600 transition-colors">
              See How It Works
              <span className="ml-2">↗</span>
            </button>
          </div>
        </div>

        {/* --- Right Column: Booking Widget/Summary or SVG --- */}
        <div className="hidden md:block lg:col-span-7 relative">
          {mode === "startup" ? (
            <>
              {/* Booking Period Card (Top) */}
              <div className="relative p-3 bg-white w-[500px] rounded-2xl shadow-2xl shadow-gray-200 border border-gray-100 opacity-60">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">
                  Booking Period
                </h3>

                {/* Search Bar */}
                <div className="flex items-center mb-6 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    type="text"
                    placeholder="Search by Keyword"
                    className="flex-grow text-xs bg-transparent outline-none text-gray-600 placeholder-gray-400"
                  />
                  <span className="text-gray-400 mx-3">|</span>
                  <MapPin className="w-5 h-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Where"
                    className="w-20 text-xs bg-transparent outline-none text-gray-600 placeholder-gray-400"
                  />
                  <button className="ml-1 bg-green-500 text-white px-3 py-2 rounded-xl text-xs font-medium">
                    Explore
                  </button>
                </div>

                {/* Steps/Booking Options */}
                <div className="space-y-4">
                  {["Hourly Basis", "Daily Basis", "Monthly Basis", "Yearly"].map(
                    (basis) => (
                      <div
                        key={basis}
                        className="flex items-center justify-between text-gray-600"
                      >
                        <div className="flex items-center">
                          <Image
                            src="/workspace/check.svg"
                            alt="Check"
                            width={24}
                            height={24}
                          />
                          <span className="text-base">{basis}</span>
                        </div>
                        {/* Active Step Indicator for Daily Basis only */}
                        {basis === "Daily Basis" && (
                          <div className="flex items-center space-x-6">
                            <Image
                              src="/workspace/check.svg"
                              alt="Check"
                              width={24}
                              height={24}
                            />
                            Booking Summary
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                            <CheckStep label="Payment" active={false} />
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Booking Summary Card (Bottom) */}
              <div className="-mt-[40px] w-[550px] h-[430px] ml-44 relative z-50 p-8 bg-white rounded-3xl shadow-2xl shadow-gray-200 border border-gray-500 opacity-70">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                  {/* Check In */}
                  <div className="w-1/2 pr-2">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Check In
                    </h4>
                    <p className="text-md font-bold text-gray-900">
                      Sun, 02 May 2025
                    </p>
                    <p className="text-sm text-gray-600">by 02:00 PM</p>
                  </div>
                  {/* Vertical Separator */}
                  <div className="w-[1px] h-12 bg-gray-200 mx-4"></div>
                  {/* Check Out */}
                  <div className="w-1/2 pl-2">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Check Out
                    </h4>
                    <p className="text-md font-bold text-gray-900">
                      Sun, 02 May 2025
                    </p>
                    <p className="text-sm text-gray-600">by 05:00 PM</p>
                  </div>
                </div>

                {/* Invoice & QR Code */}
                <div className="border-b border-gray-100 w-full">
                  <div className="flex w-full justify-between items-center space-x-2 text-gray-700 cursor-pointer hover:text-green-500">
                    <span className="text-sm font-medium">
                      Download Invoice (PDF)
                    </span>
                    <div className="w-16 h-16 flex items-center justify-center rounded-lg"><img src="/workspace/qr.png" alt="Invoice Icon" className="w-16 h-16" /></div>
                    <Download className="w-5 h-5" />
                  </div>
                </div>

                {/* Booking Reference */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">
                    Booking Reference Number
                  </span>
                  <span className="text-lg font-extrabold text-gray-900">
                    #321FABC
                  </span>
                </div>

                {/* Contact Section */}
                <div className="flex flex-col items-center pt-4">
                  <div className="flex items-center text-green-600 mb-2">
                    <Headset className="w-6 h-6 mr-2" />
                    <span className="text-lg font-semibold">
                      Booking Related Queries
                    </span>
                  </div>
                  <p className="text-center text-sm text-gray-600">
                    Send a whatsapp message to +91 78459 55939 <br />
                    (or) contact our customer team.
                  </p>

                  {/* Logo and Socials */}
                  <div className="text-center mt-4">
                    <div className="relative w-[160px] h-[35px] scale-110">
                      <Image 
                        src="/logo-green.png" 
                        alt="Cumma Logo" 
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex justify-center space-x-4 mt-2 text-gray-400">
                      <span className="hover:text-green-500 cursor-pointer">
                        <Linkedin className="w-4 h-4" />
                      </span>
                      <span className="hover:text-green-500 cursor-pointer">
                        <Instagram className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Enabler Mode - Show Building SVG Illustration */
            <div className="flex flex-col relative w-full h-full flex items-center justify-center">
              {/* Booking Period Card (Top) */}
              <div className="relative p-3 bg-white w-[500px] rounded-2xl shadow-2xl shadow-gray-200 border border-gray-100 opacity-60">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">
                  Booking Period
                </h3>

                {/* Search Bar */}
                <div className="flex items-center mb-6 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    type="text"
                    placeholder="Search by Keyword"
                    className="flex-grow text-xs bg-transparent outline-none text-gray-600 placeholder-gray-400"
                  />
                  <span className="text-gray-400 mx-3">|</span>
                  <MapPin className="w-5 h-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Where"
                    className="w-20 text-xs bg-transparent outline-none text-gray-600 placeholder-gray-400"
                  />
                  <button className="ml-1 bg-green-500 text-white px-3 py-2 rounded-xl text-xs font-medium">
                    Explore
                  </button>
                </div>

                {/* Steps/Booking Options */}
                <div className="space-y-4">
                  {["Hourly Basis", "Daily Basis", "Monthly Basis", "Yearly"].map(
                    (basis) => (
                      <div
                        key={basis}
                        className="flex items-center justify-between text-gray-600"
                      >
                        <div className="flex items-center">
                          <Image
                            src="/workspace/check.svg"
                            alt="Check"
                            width={24}
                            height={24}
                          />
                          <span className="text-base">{basis}</span>
                        </div>
                        {/* Active Step Indicator for Daily Basis only */}
                        {basis === "Daily Basis" && (
                          <div className="flex items-center space-x-6">
                            <Image
                              src="/workspace/check.svg"
                              alt="Check"
                              width={24}
                              height={24}
                            />
                            Booking Summary
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                            <CheckStep label="Payment" active={false} />
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="relative mt-[40px] w-[600px] h-[500px] z-50">
                <Image 
                  src="/workspace/printer.svg" 
                  alt="Building Illustration" 
                  fill
                  className="w-[600px] h-[500px] -mt-[113px] ml-[150px]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;