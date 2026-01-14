import React from "react";
import {
  CheckCircle2,
  Database,
  FileText,
  Star,
  Download,
  Smartphone,
  Headset,
  Linkedin,
  Twitter,
  Facebook,
  LayoutGrid, // Icon for Dashboard
  Wallet,     // Icon for Billing
  Banknote    // Icon for Sales
} from "lucide-react";
import Image from "next/image";

// Define props to handle the mode switch
type Mode = "startup" | "enabler";

interface FeaturesSectionProps {
  mode: Mode;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ mode }) => {
  
  const isBusiness = mode === "enabler";

  return (
    <section className="w-full py-20 bg-white overflow-hidden">
      {/* Background decoration */}
      <div>
        {/* Ensure this file exists or remove if not needed */}
        <img src="/workspace/meshup.svg" alt="" className="absolute w-full -z-10 opacity-50" /> 
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-20">
          <span className="text-green-500 font-semibold tracking-wider uppercase text-sm">
            Powerful
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold text-gray-900">
            Our product has These{" "}
            <span className="text-green-500">big Features</span>
          </h2>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
          
          {/* ==========================
              FEATURE 1: LEFT COLUMN 
             ========================== */}
          <div className="flex flex-col items-center">
            
            {isBusiness ? (
              // BUSINESS MODE: IMAGE
              <div className="w-full max-w-sm h-[300px] bg-gray-50 rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8 relative group">
                {/* Replace with your actual filename */}
                <Image 
                  src="/workspace/enablerdashboard.png" 
                  alt="Enabler Dashboard"
                  fill
                  className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              // CUSTOMER MODE: CSS MOCKUP
              <div className="w-full max-w-sm bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-5 mb-8 transform transition hover:-translate-y-1 duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Facility</p>
                    <h4 className="font-semibold text-green-500">Workspace</h4>
                    <div className="mt-1 text-xs text-green-500">
                      Facilities Listed So Far <br />
                      <span className="font-bold text-sm">24</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="font-bold text-gray-700">3.5</span>
                      <div className="flex text-green-400 text-[10px]">
                        <Star size={10} fill="currentColor" />
                        <Star size={10} fill="currentColor" />
                        <Star size={10} fill="currentColor" />
                        <Star size={10} className="text-gray-300" />
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400">122 ratings</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    {["High-Demand Hub","Top-Rated","Fast Mover","Corporate Friendly"].map((tag, i) => (
                      <div key={i} className="flex items-center gap-2 border rounded px-2 py-1 shadow-sm bg-gray-50">
                        <span className="text-[10px] text-gray-600">{tag}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col justify-center gap-3 w-24">
                    <button className="w-full border border-red-300 text-red-400 text-[10px] py-2 rounded hover:bg-red-50">Reject / Hold</button>
                    <button className="w-full border border-green-400 text-green-500 text-[10px] py-2 rounded hover:bg-green-50">View Details</button>
                  </div>
                </div>
              </div>
            )}

            {/* Text Content 1 */}
            <div className="text-center px-4">
              <div className="flex gap-4 items-center justify-center">
                <div className="flex justify-center mb-3">
                  <div className="p-2 rounded-lg bg-green-50">
                    {isBusiness ? (
                      <LayoutGrid className="text-green-500 w-6 h-6" />
                    ) : (
                       // Gamepad Icon logic from your original code
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                         <path d="M11.146 15.854a1.207 1.207 0 0 1 1.708 0l1.56 1.56A2 2 0 0 1 15 18.828V21a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2.172a2 2 0 0 1 .586-1.414z" />
                         <path d="M18.828 15a2 2 0 0 1-1.414-.586l-1.56-1.56a1.207 1.207 0 0 1 0-1.708l1.56-1.56A2 2 0 0 1 18.828 9H21a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1z" />
                         <path d="M6.586 14.414A2 2 0 0 1 5.172 15H3a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2.172a2 2 0 0 1 1.414.586l1.56 1.56a1.207 1.207 0 0 1 0 1.708z" />
                         <path d="M9 3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2.172a2 2 0 0 1-.586 1.414l-1.56 1.56a1.207 1.207 0 0 1-1.708 0l-1.56-1.56A2 2 0 0 1 9 5.172z" />
                       </svg>
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {isBusiness ? "Enabler Dashboard" : "Verified Workspaces"}
                </h3>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                {isBusiness 
                  ? "All your listings in one place." 
                  : "Every space is checked for quality, amenities, and reliability."}
              </p>
            </div>
          </div>

          {/* ==========================
              FEATURE 2: MIDDLE COLUMN 
             ========================== */}
          <div className="flex flex-col items-center">
            
            {isBusiness ? (
              // BUSINESS MODE: IMAGE
              <div className="w-full max-w-sm h-[300px] bg-gray-50 rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8 relative group">
                 {/* Replace with your actual filename */}
                 <Image 
                  src="/workspace/enablersales.png" 
                  alt="Sales Tracking"
                  fill
                  className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              // CUSTOMER MODE: CSS MOCKUP
              <div className="w-full max-w-sm bg-white rounded-xl shadow-[0_20px_50px_rgb(0,0,0,0.1)] border border-gray-100 p-6 mb-8 relative">
                <h4 className="text-gray-500 mb-4 font-medium">Choose Booking Duration</h4>
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="w-4 h-4 rounded-full border-4 border-green-400"></div>Hourly
                  </label>
                  <label className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                    <div className="w-4 h-4 rounded-full border border-gray-300"></div>Daily
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="border rounded p-2 text-gray-400 text-sm">Choose Date</div>
                  <div className="border rounded p-2 text-gray-400 text-sm">Choose Time</div>
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-5 h-5 bg-green-400 rounded flex items-center justify-center">
                    <CheckCircle2 size={14} className="text-white" />
                  </div>
                  <span className="text-[10px] text-gray-500">Requires <span className="font-bold">Technical Support</span></span>
                </div>
                <button className="w-full bg-green-400 hover:bg-green-500 text-white font-semibold py-3 rounded-lg shadow-lg shadow-green-200 transition-all">Reserve</button>
              </div>
            )}

            {/* Text Content 2 */}
            <div className="text-center px-4">
              <div className="flex gap-4 items-center justify-center">
                <div className="flex justify-center mb-3">
                  <div className="p-2 rounded-lg bg-green-50">
                    {isBusiness ? <Banknote className="text-green-500 w-6 h-6" /> : <Database className="text-green-500 w-6 h-6" />}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                   {isBusiness ? "Sales & Booking Tracking" : "Real-Time Availability"}
                </h3>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                {isBusiness 
                  ? "Real time occupancy & revenue insights." 
                  : "No back-and-forth calls, see what's open instantly."}
              </p>
            </div>
          </div>

          {/* ==========================
              FEATURE 3: RIGHT COLUMN 
             ========================== */}
          <div className="flex flex-col items-center">
            
            {/* NOTE: The 3rd column visually looks similar in both designs (QR code/Invoice),
              so we keep the same structure but can swap the inner logic if needed.
            */}
            <div className="w-full max-w-sm bg-white rounded-xl flex flex-col items-center justify-center min-h-[300px]">
              {/* QR Code Placeholder */}
              <div className="mb-4 relative group cursor-pointer">
                <div className="w-16 h-16 flex items-center justify-center rounded-lg">
                  <img src="/workspace/qr.png" alt="Invoice Icon" className="w-16 h-16" />
                </div>
              </div>

              <div className="w-full flex justify-between items-center border-b pb-2 mb-4">
                <div className="text-left">
                  <p className="text-gray-400 text-xs">Download Invoice (PDF)</p>
                  <p className="text-gray-400 text-xs">Booking Reference Number</p>
                </div>
                <div className="text-right">
                  <Download size={14} className="ml-auto text-gray-400 mb-1" />
                  <p className="font-bold text-gray-600 text-sm">#321FABC</p>
                </div>
              </div>

              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-2 text-gray-500 font-bold text-sm">
                  <Headset size={16} className="text-green-500" />
                  Booking Related Queries
                </div>
                <p className="text-[10px] text-gray-400 px-4">
                  Send a whatsapp message to +91 78459 55939 (or) contact our customer team.
                </p>
                <div>
                  <img src="/logo-green.png" alt="Cumma Logo" className="w-36 h-18 object-contain mb-2 items-center mx-auto" />
                </div>
                <div className="flex justify-center gap-3 text-gray-400">
                  <Linkedin size={14} />
                  <Smartphone size={14} />
                  <Twitter size={14} />
                  <Facebook size={14} />
                </div>
              </div>
            </div>

            {/* Text Content 3 */}
            <div className="text-center px-4">
              <div className="flex gap-4 items-center justify-center">
                <div className="flex justify-center mb-3">
                  <div className="p-2 rounded-lg bg-green-50">
                    {isBusiness ? <Wallet className="text-green-500 w-6 h-6" /> : <FileText className="text-green-500 w-6 h-6" />}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {isBusiness ? "Automated Billing" : "Easy Management"}
                </h3>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                {isBusiness 
                  ? "No hidden costs, no manual work." 
                  : "Track bookings, invoices, and usage from one dashboard."}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;