"use client";
import { Mode } from "@/app/(landing)/offices/about/page";
import { ArrowRight } from "lucide-react";

interface BenefitsSectionProps {
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
}

export default function HeroSection({ mode, setMode }: BenefitsSectionProps) {
  const selectedMode = mode;

  return (
<section className="relative h-[550px] md:h-[750px] bg-white overflow-hidden flex flex-col items-center justify-start md:justify-between text-center px-4 pt-20 md:py-0">
      <div className="relative z-10 max-w-4xl mx-auto pt-8 md:pt-0">
        {/* Badge */}
        <div className="inline-block bg-green-50 text-green-600 text-xs md:text-sm px-3 md:px-4 py-1 md:py-1.5 rounded-full mb-6 md:mb-8 font-medium">
          #Features
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-3 md:mb-4 px-2">
          Work. <span className="text-green-600">Collaborate.</span> Grow.
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 max-w-2xl mx-auto mb-8 md:mb-10 text-sm md:text-base lg:text-lg px-4">
          Book flexible workspaces or list your own with Cumma's transparent UFI pricing and powerful dashboard.
        </p>

        {/* Toggle Buttons */}
        <div className="hidden md:block flex justify-center mb-8 md:mb-16">
          <div className="inline-flex items-center rounded-full p-1 border-2 border-green-400 bg-white overflow-hidden shadow-sm">
            <button
              className={`rounded-full py-2 px-4 sm:py-2.5 sm:px-6 md:px-8 text-xs sm:text-sm md:text-base font-medium transition-all duration-150 whitespace-nowrap ${
                selectedMode === "startup"
                  ? "bg-green-500 text-white shadow-green-100 shadow-md"
                  : "text-green-600 bg-white"
              }`}
              onClick={() => setMode("startup")}
            >
              <span className="flex items-center justify-center">
                I'm a User{" "}
                {selectedMode === "startup" && (
                  <span className="inline-block ml-1 rotate-[315deg]">
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                  </span>
                )}
              </span>
            </button>
            <button
              className={`rounded-full py-2 px-4 sm:py-2.5 sm:px-6 md:px-8 text-xs sm:text-sm md:text-base font-medium transition-all duration-150 whitespace-nowrap ${
                selectedMode === "enabler"
                  ? "bg-green-500 text-white shadow-green-100 shadow-md"
                  : "text-green-600 bg-white"
              }`}
              onClick={() => setMode("enabler")}
            >
              <span className="flex items-center justify-center">
                I'm an Enabler{" "}
                {selectedMode === "enabler" && (
                  <span className="inline-block ml-1 rotate-[315deg]">
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* SVG Illustration - Desktop */}
      <div className="hidden md:block h-auto relative w-full mt-auto z-0 bottom-96">
        <div className="max-w-5xl mx-auto">
          <img
          src={selectedMode === "startup" ? "/workspace/sharedworkspace.svg" : "/workspace/sharedworkspace2.svg"}
            alt="Shared workspace illustration"
            className="w-full h-auto transition-opacity duration-300"
          />
        </div>
      </div>

      {/* Mobile Phone Mockup */}
      <div className="block md:hidden relative w-full max-w-sm mx-auto -mt-20 px-4">
        <img
          src={selectedMode === "startup" ? "/workspace/user-mobile.png" : "/workspace/enabler-mobile.png"}
          alt={`${selectedMode} mobile interface`}
          className="w-full h-auto transition-opacity duration-300"
        />       
      </div>
      <div className="block md:hidden flex justify-center mt-8">
          <div className="inline-flex items-center rounded-full p-1 border-2 border-green-400 bg-white overflow-hidden shadow-sm">
            <button
              className={`rounded-full py-2 px-4 sm:py-2.5 sm:px-6 md:px-8 text-xs sm:text-sm md:text-base font-medium transition-all duration-150 whitespace-nowrap ${
                selectedMode === "startup"
                  ? "bg-green-500 text-white shadow-green-100 shadow-md"
                  : "text-green-600 bg-white"
              }`}
              onClick={() => setMode("startup")}
            >
              <span className="flex items-center justify-center">
                Users{" "}
                {selectedMode === "startup" && (
                  <span className="inline-block ml-1 rotate-[315deg]">
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                  </span>
                )}
              </span>
            </button>
            <button
              className={`rounded-full py-2 px-4 sm:py-2.5 sm:px-6 md:px-8 text-xs sm:text-sm md:text-base font-medium transition-all duration-150 whitespace-nowrap ${
                selectedMode === "enabler"
                  ? "bg-green-500 text-white shadow-green-100 shadow-md"
                  : "text-green-600 bg-white"
              }`}
              onClick={() => setMode("enabler")}
            >
              <span className="flex items-center justify-center">
                Enablers{" "}
                {selectedMode === "enabler" && (
                  <span className="inline-block ml-1 rotate-[315deg]">
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
    </section>
  );
}