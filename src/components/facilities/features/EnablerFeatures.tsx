import React from "react";
import { Check, Star, Sparkles, Atom, Layers, Plus, Eye } from "lucide-react";

const EnablerFeatures = () => {
  return (
    <div className="w-full bg-white overflow-hidden">
      {/* ==========================================
          SECTION 1: Facility Management
      ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative order-2 lg:order-1">
            <img
              src="/facility/pin.svg"
              alt=""
              className="absolute z-1 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[700px] opacity-80 pointer-events-none"
            />

            <div className="relative bg-gray-50 rounded-xl shadow-2xl border border-gray-100 overflow-hidden w-[438px] h-[360px] ml-[1px] sm:ml-[42px]">
              <div className="h-8 bg-white border-b border-gray-100 flex items-center px-4 gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              </div>

              <img
                src="/facility/addfacility.png"
                alt=""
                className="object-cover h-[334px]"
              />
            </div>
          </div>

          {/* RIGHT: Text Content */}
          <div className="order-1 lg:order-2">
            <span className="text-green-500 font-medium tracking-wide text-sm uppercase">
              Set availability
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              One Platform To Manage Your{" "}
              <span className="text-green-500">Facility</span> With Ease
            </h2>
            <p className="mt-6 text-lg text-gray-500 leading-relaxed">
              List Your Facilities, Customize Your Offerings, And Connect With
              Startups.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                "Custom Pricing & Availability",
                "Flexible Facility Management",
                "Custom User Access",
                "Secure Payments & Transactions",
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" strokeWidth={3} />
                  </div>
                  <span className="text-gray-600 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 2: Smart Dashboard
      ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* LEFT: Text Content */}
          <div>
            <span className="text-green-500 font-medium tracking-wide text-sm uppercase">
              Set it and forget it
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Smart <span className="text-green-500">Dashboard</span>
              <br />
              Seamless Communication
            </h2>
            <p className="mt-6 text-lg text-gray-500 leading-relaxed">
              Track requests, partnerships, and engagement data to understand
              your facility's performance.
            </p>
          </div>

          {/* RIGHT: Constructed Graphic Side */}
          <div className="relative">
            {/* Background Decorative Stars */}

            {/* Stacked Papers Illustration - Top Right */}
            <div className="absolute -top-8 right-8 hidden lg:block">
              <div className="relative">{/* Paper stack */}</div>
            </div>

            {/* --- CARD 1: Main Stats Board --- */}
            <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 md:p-8 relative z-10 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 text-lg">
                  Daily Usage Reports
                </h3>
                <div className="p-2 bg-gray-50 rounded-full">
                  <div className="w-1 h-1 bg-gray-300 rounded-full mb-0.5"></div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full mb-0.5"></div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                </div>
              </div>
              <Sparkles className="absolute -top-10 right-20 text-gray-200 w-20 h-20 opacity-80 animate-pulse" />
              <Sparkles className="absolute top-20 -right-16 text-gray-100 w-12 h-12 opacity-30" />
              <Star className="absolute bottom-10 -left-10 text-gray-100 w-12 h-12 fill-gray-400 opacity-80 z-20" />
              <Star className="absolute top-1/3 -right-8 text-gray-100 w-8 h-8 fill-gray-800 opacity-80 z-20" />
              <Star className="absolute top-1/3 -left-8 text-gray-100 w-8 h-8 fill-gray-300 opacity-80 z-20" />

              <Plus className="absolute bottom-32 -right-4 text-gray-200 w-10 h-10 opacity-30" />
              {/* <div className="relative"> */}
              <Layers className="absolute w-24 h-24 top-4 -right-14 text-gray-200 opacity-60" />
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-300 opacity-70" />
              <Star className="absolute -bottom-1 -right-2 w-6 h-6 text-yellow-200 fill-yellow-200 opacity-80" />
              <Atom className="absolute -bottom-24 right-8 w-36 h-36 text-gray-100 fill-gray-800 opacity-20" />
                            <Atom className="absolute -top-14 left-36 w-20 h-20 text-gray-400 fill-gray-100 opacity-20" />

              {/* </div> */}
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Stat 1 */}
                <div className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors">
                  <div className="text-3xl font-bold text-green-500">13.2</div>
                  <div className="text-xs font-semibold text-gray-500 mt-1">
                    Total Hours
                  </div>
                </div>
                {/* Stat 2 */}
                <div className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors">
                  <div className="text-3xl font-bold text-green-500">4.2</div>
                  <div className="text-xs font-semibold text-gray-500 mt-1">
                    Billable Hours
                  </div>
                </div>
                {/* Stat 3 */}
                <div className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors">
                  <div className="text-3xl font-bold text-green-500">50K</div>
                  <div className="text-xs font-semibold text-gray-500 mt-1">
                    Revenue
                  </div>
                </div>
                {/* Stat 4 */}
                <div className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors">
                  <div className="text-3xl font-bold text-green-500">6</div>
                  <div className="text-xs font-semibold text-gray-500 mt-1">
                    Users
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 -right-6 lg:-right-12 -translate-y-1/2 z-30 hidden md:block">
              <div className="relative w-40 h-40">
                {/* Donut Chart Background */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Light green segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="20"
                    strokeDasharray="75 251"
                    strokeDashoffset="0"
                    className="opacity-90"
                  />
                  {/* Medium green segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="20"
                    strokeDasharray="113 251"
                    strokeDashoffset="-75"
                    className="opacity-90"
                  />
                  {/* Dark green segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#15803d"
                    strokeWidth="20"
                    strokeDasharray="63 251"
                    strokeDashoffset="-188"
                    className="opacity-90"
                  />
                </svg>

                {/* White Center Circle with Toggle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full shadow-xl flex flex-col items-center justify-center gap-2 p-3">
                  {/* Toggle Switch */}
                  <div className="relative bg-gray-200 rounded-full w-14 h-8 p-0.5 flex items-center">
                    <div className="absolute inset-0 bg-green-500 rounded-full" />
                    <div className="relative w-7 h-7 bg-white rounded-full shadow-md ml-auto flex items-center justify-center z-10">
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Status Text */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                      On
                    </span>
                  </div>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute -right-6 top-6 w-10 h-14 bg-gray-100 rounded-lg opacity-20" />
                <div className="absolute -right-3 top-16 w-6 h-10 bg-gray-100 rounded opacity-20" />
              </div>
            </div>

            {/* --- CARD 3: Bottom Notification --- */}
            <div className="absolute -bottom-12 md:-bottom-16 left-4 md:left-12 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center gap-4 max-w-xs w-full hover:shadow-2xl transition-shadow">
              
              <img src="/facility/3dprinter.jpg" alt="printer" className="w-20 object-cover" />
              {/* 3D Printer Image - Replace with actual image */}
              {/* <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden relative"> */}
                {/* Simulated 3D printer - replace with <img src="your-image.jpg" alt="3D Printer" className="w-full h-full object-cover" /> */}
                {/* <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 opacity-80"></div> */}
                {/* <div className="relative">
                  <div className="w-8 h-6 border-2 border-white rounded-sm relative">
                    <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div> */}
              {/* </div> */}
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-800">3D Printer</h4>
                <p className="text-xs text-gray-400">
                  booked by Student Research
                </p>
              </div>
              <div className="text-green-500 font-bold text-sm bg-green-50 px-2 py-1 rounded-md">
                .7 hrs
              </div>
            </div>

            {/* Bottom decorative icons */}
            <div className="absolute -bottom-24 right-12 hidden md:block">
              <Eye className="w-12 h-12 text-gray-200 opacity-40" />
            </div>
            <div className="absolute -bottom-28 right-32 hidden lg:block">
              <Plus className="w-8 h-8 text-gray-100 opacity-30" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnablerFeatures;
