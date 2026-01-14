// import Image from "next/image";
import React from "react";
import { Mode } from "@/app/(landing)/offices/about/page";
import { ArrowRight } from "lucide-react";

interface BenefitsSectionProps {
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
}

export default function BenefitsSection({
  mode,
  setMode,
}: BenefitsSectionProps) {
  const benefits: Record<Mode, string[]> = {
    startup: [
      "UFI flat pricing keeps expenses predictable.",
      "Quick, flexible booking flows save valuable time.",
      "Analytics help optimize workspace use and spending.",
      "Workspaces that grow as your team grows.",
      "Less admin, more energy for your startup journey.",
    ],
    enabler: [
      "More visibility to startups.",
      "Higher occupancy with smart bookings.",
      "Transparent UI Pricing.",
      "Real-time analytics for growth.",
      "Simple workspace management.",
    ],
  };

  const selectedMode = mode;

  return (
    <section className="py-16 bg-white relative px-4">
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
        Key <span className="text-green-600">Benefits</span> of Using Cumma
      </h2>
      <div className="text-gray-400 text-center text-base sm:text-lg max-w-2xl mx-auto mb-6 px-4">
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
                selectedMode === "startup"
                  ? "bg-green-500 text-white shadow-green-100 shadow-md"
                  : "text-green-500 bg-white"
              }`}
              style={
                selectedMode === "startup"
                  ? { boxShadow: "0 2px 12px 0 #A7F3D0" }
                  : {}
              }
              onClick={() => setMode("startup")}
            >
              <span className="flex items-center justify-center">
                User{" "}
                {selectedMode === "startup" && (
                  <span className="inline-block ml-1 rotate-[315deg]">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </span>
                )}
              </span>
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
              <span className="flex items-center justify-center">
                Enablers{" "}
                {selectedMode === "enabler" && (
                  <span className="inline-block ml-1 rotate-[315deg]">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center px-4">
       
        <img
          src={
            selectedMode === "startup"
              ? "/workspace/startup-illustration.png"
              : "/workspace/enabler-illustration.png"
          }
          alt="illustration"
          width={500}
          height={400}
          className="w-full h-auto max-w-md mx-auto"
        />
        <ul className="space-y-4 sm:space-y-6">
          <p className="text-xl sm:text-2xl font-medium text-green-500">Why You Use</p>
          {benefits[selectedMode].map((item, idx) => (
            <li
              key={idx}
              className="flex items-start space-x-3 text-base sm:text-lg border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-green-600 text-lg sm:text-xl mt-1 flex-shrink-0">✔</span>
              <span className="text-gray-700 font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}