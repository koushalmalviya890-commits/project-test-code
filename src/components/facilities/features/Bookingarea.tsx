"use client"
import React from "react";
import { Search, Zap, Sparkles, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Bookingarea() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-green-50 text-green-600 text-xs font-medium px-3 py-1 rounded-full border border-green-200">
              Flexible
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-2">
            Book <span className="text-green-500">Smarter</span>. Build{" "}
            <span className="text-green-500">Faster</span>.
          </h1>
        </div>
        <div className="bg-gray-200 p-4 rounded-2xl">
          {/* Main Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Search & Book Instantly Card */}
            <div className="bg-white rounded-3xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Search & Book Instantly
              </h2>
              <p className="text-gray-600 mb-6">
                Find the right facility with filters and reserve it in just a
                few clicks.
              </p>

              {/* Resolve Box */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <span className="text-base font-semibold text-gray-900">
                    Resolve
                  </span>
                </div>

                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search based on user needs"
                      className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded">
                      <Sparkles className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Category Icons */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    {
                      name: "Labs",
                      icon: "/icons/categories-gif/labspace.gif",
                    },
                    {
                      name: "Equipment",
                      icon: "/icons/categories-gif/equipment.gif",
                    },
                    {
                      name: "Machines",
                      icon: "/icons/categories-gif/machine.gif",
                    },
                    {
                      name: "Production",
                      icon: "/icons/categories-gif/production.gif",
                    },
                  ].map((category) => (
                    <div
                      key={category.name}
                      className="flex flex-col items-center p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition-all duration-300 cursor-pointer group"
                    >
                      <div className=" mb-2 group-hover:scale-110 transition-transform">
                        <img
                          src={category.icon}
                          alt={category.name}
                          width={60}
                          height={60}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 text-center">
                        {category.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Compare & Choose Card */}
            <div className="bg-white rounded-3xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Compare & Choose
              </h2>
              <p className="text-gray-600 mb-6">
                Easily compare facilities and pricing to make the best decision.
              </p>

              {/* Affordable Access Box */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <span className="text-base font-semibold text-gray-900">
                    Affordable Access
                  </span>
                  <Sparkles className="w-5 h-5 text-green-500" />
                </div>

                <div className="space-y-4 grid grid-cols-2">
                  <div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">
                        Hi-Resolution Transmission Electron Microscope (HRTEM)
                      </label>
                      <div className="text-sm font-semibold text-gray-900">
                        Rs. 1,000 /Slot
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">
                        Category
                      </label>
                      <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option>Intra/Low</option>
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">
                          Choose Slot
                        </label>
                        <input
                          type="text"
                          className="w-full px-0 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">
                          Contact Number
                        </label>
                        <input
                          type="text"
                          placeholder="    Enter your Contact Number"
                          className="w-full px-0 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                        <span>₹1000 * 2 slots</span>
                        <span className="text-gray-900">₹2,000</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Platform Fee</span>
                        <span>₹200</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>GST 18%</span>
                        <span>₹336</span>
                      </div>
                      <div className="flex justify-between text-base font-bold pt-2 border-t">
                        <span className="text-gray-900">Total Price</span>
                        <span className="text-gray-900">₹2,536</span>
                      </div>
                    </div>

                    <button className="ml-10 w-[80px] sm:w-1/2 bg-green-500 text-white text-sm sm:font-medium py-3 rounded-xl hover:bg-green-600 transition-colors duration-300 shadow-md">
                      Reserve!
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Flexible Booking Card */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="grid lg:grid-cols-5 gap-0">
              {/* Left Content */}
              <div className="lg:col-span-2 p-8 flex flex-col justify-between">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-3">
                    Flexible Booking
                  </h2>
                  <p className="text-gray-600 mb-8 text-xl">
                    Book by hour, day, or <br /> custom durations perfect <br />{" "}
                    for tests, trials, or full projects.
                  </p>
                </div>

                <button className="bg-green-500 text-white font-medium py-4 px-6 rounded-xl hover:bg-green-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center group"
                onClick={() => router.push("/SearchPage")}
                >
                  Book a Facility
                  <Rocket className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Right Content - Filter Box */}
              <div className="lg:col-span-3 p-8">
                <div className="bg-white rounded-2xl p-3 sm:p-6 border border-gray-200 shadow-sm h-full relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <span className="text-base font-semibold text-gray-900">
                      Filter
                    </span>
                  </div>
                  <hr className="hidden sm:block"/>

                  {/*green blur area*/}
                  <div className="absolute top-3/4 left-[10px] -translate-y-1/2 w-[300px] h-[100px] bg-green-400 z-0 rounded-full blur-[80px] pointer-events-none" />
                  {/* Content inside Filter box */}
                  <div className="space-y-4 object-cover">
                    {/* <p className="text-sm text-gray-500 text-center py-8"> */}
                    <img
                      src="/facility/searchfacility.png"
                      alt="Booking Illustration"
                      className="hidden sm:block w-full sm:w-[580px] ml-0 sm:ml-16 h-96 relative z-10"
                    />
                     <img
                      src="/facility/facilitysearch.png"
                      alt="Booking Illustration"
                      className="block sm:hidden w-full sm:w-[580px] ml-0 sm:ml-16 h-96 relative z-10"
                    />
                    {/* </p> */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Image Boxes */}
          {/* <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div 
              key={item}
              className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 cursor-pointer group"
            >
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-gray-400 text-sm font-medium">Image {item}</span>
              </div>
            </div>
          ))}
        </div> */}
        </div>
      </div>
    </div>
  );
}
