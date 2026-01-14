import React, { useState } from "react";
import { ArrowRight } from "lucide-react";

type Mode = "user" | "enabler";

interface FacilitiesBenefitsSectionProps {
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
}

export default function FacilitiesBenefitsSection({
  mode,
  setMode,
}: FacilitiesBenefitsSectionProps) {

  const benefits: Record<Mode, string[]> = {
    user: [
      "No waiting lists. Secure your slot in minutes.",
      "Discover labs and facilities beyond your city.",
      "Skip huge setup costs. Pay only for what you use.",
      "Test, build, and refine your ideas without delays.",
      "Connect with enablers, mentors, and researchers while booking.",
      "See availability, pricing, and rules upfront no surprises.",
    ],
    enabler: [
      "Turn your labs, equipment, and workspaces into valuable resources for innovators.",
      "Connect with verified startups, researchers, and companies actively seeking access to facilities.",
      "Streamline bookings, improve utilization, and ensure every resource drives impact.",
      "Set availability, pricing, usage rules, and access permissions effortlessly.",
      "Track facility usage, revenue, and trends with real-time analytics.",
    ],
  };

  const headings: Record<Mode, { title: string; highlight: string; middle: string; submiddle: string; }> = {
    user: {
      title: "Your ",
      middle: "Facility,",
      submiddle:" When You",
      highlight: " Need",
   
    },
    enabler: {
      title: "Turn Facilities into ",
        middle:"",
        submiddle:"",
      highlight: "Opportunities",
       
    },
  };

  const selectedMode = mode;
  const heading = headings[selectedMode];

  return (
    <section className="py-16 bg-white relative">
      {/* Why Cumma pill */}
      <div className="absolute left-1/2 -translate-x-1/2 top-6 z-10">
        <div
          className="bg-white shadow-md rounded-full px-4 sm:px-6 py-2 text-gray-900 font-medium text-base sm:text-lg text-center"
          style={{ boxShadow: "0 2px 12px 0 rgba(0,0,0,0.07)" }}
        >
          Why Cumma?
        </div>
      </div>

      {/* Heading and subtitle */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mt-8 mb-2 px-4">
        {heading.title}
        <span className="text-green-600">{heading.middle}</span>
        {heading.submiddle}
        <span className="text-green-600">{heading.highlight}</span>
        {selectedMode === "user" && " It"}
      </h2>
      <div className="text-gray-400 text-center text-base sm:text-lg max-w-4xl mx-auto mb-6 px-4">
        A seamless platform powered by transparent UFI pricing, smart booking
        flows, and real-time analytics.
      </div>

      {/* Toggle Button */}
      <div className="flex justify-center mb-10 px-4">
        <div className="w-full max-w-[365px] rounded-full p-2 border-2 border-green-400 bg-white overflow-hidden shadow-sm">
          <div
            className="flex rounded-full bg-white overflow-hidden shadow-sm w-full"
          >
            <button
              className={`flex-1 rounded-full py-2 sm:py-3 px-4 sm:px-8 text-base sm:text-lg font-medium transition-all duration-150 ${
                selectedMode === "user"
                  ? "bg-green-500 text-white shadow-green-100 shadow-md"
                  : "text-green-500 bg-white"
              }`}
              style={
                selectedMode === "user"
                  ? { boxShadow: "0 2px 12px 0 #A7F3D0" }
                  : {}
              }
              onClick={() => setMode("user")}
            >
              User{" "}
              {selectedMode === "user" && (
                <span className="inline-block ml-1 align-middle rotate-[315deg]">
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </span>
              )}
            </button>
            <button
              className={`flex-1 rounded-full py-2 sm:py-3 px-4 sm:px-8 text-base sm:text-lg font-medium transition-all duration-150 ${
                selectedMode === "enabler"
                  ? "bg-green-500 text-white shadow-green-100 shadow-md"
                  : "text-green-500 bg-white"
              }`}
              style={
                selectedMode === "enabler"
                  ? { boxShadow: "0 2px 12px 0 #A7F3D0" }
                  : {}
              }
              onClick={() => setMode("enabler")}
            >
              Enablers{" "}
              {selectedMode === "enabler" && (
                <span className="inline-block ml-1 align-middle rotate-[315deg]">
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto items-center px-4">
        {/* Illustration */}
        <div className="flex justify-center order-2 md:order-1">
          <img
            src={
              selectedMode === "user"
                ? "/facility/user-illustration.svg"
                : "/facility/enabler-illustration.svg"
            }
            alt="illustration"
            className="w-full max-w-md"
          />
        </div>

        {/* Benefits List */}
        <div className="order-1 md:order-2">
          <p className="text-2xl sm:text-3xl font-medium text-green-500 mb-6">
            Why You Use
          </p>
          <ul className="space-y-4">
            {benefits[selectedMode].map((item, idx) => (
              <li
                key={idx}
                className="flex items-start space-x-3 text-sm sm:text-base border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow bg-white"
              >
                <span className="text-green-600 text-xl mt-0.5 flex-shrink-0">
                  ✓
                </span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}