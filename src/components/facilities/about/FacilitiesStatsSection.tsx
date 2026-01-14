import { useRouter } from "next/navigation";
import React from "react";

type Mode = "user" | "enabler";

interface FacilitiesStatsSectionProps {
  mode: Mode;
}

export default function FacilitiesStatsSection({ mode }: FacilitiesStatsSectionProps) {
  const router = useRouter();
  const stats = {
    user: [
      { label: "Users", value: "65+" },
      { label: "Facilities Booked", value: "100+" },
      { label: "Bookings", value: "100+" },
    ],
    enabler: [
      { label: "Enablers", value: "50" },
      { label: "Facilities", value: "190+" },
      { label: "Bookings", value: "100+" },
    ],
  };

  const handleStartJourney = () => {
    router.push("/sign-up")
   // console.log("Navigating to /sign-up");
  };

  const selectedStats = stats[mode];

  return (
    <section className="py-16 bg-white relative overflow-hidden mt-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Stats Grid */}
        <div className="absolute -top-6 left-16 sm:left-40 md:left-82 w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 pointer-events-none">
          <img src="/facility/angle.svg" alt="" className="w-full h-full object-contain opacity-60" />
        </div>
        
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 pointer-events-none">
          <img src="/facility/concentric-two.svg" alt="" className="w-full h-full object-contain opacity-30" />
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-8 sm:gap-12 md:gap-20 mb-12">
          {selectedStats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center w-full sm:w-auto">
              {/* Stat Content */}
              <div className="text-center relative z-10">
                <p className="text-green-500 text-sm font-medium mb-2">
                  {stat.label}
                </p>
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center px-4">
          <button 
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-medium text-base sm:text-lg transition-colors shadow-md mt-10"
            onClick={handleStartJourney}
          >
            Start your journey
          </button>
        </div>

        {/* Decorative dots - bottom right */}
        <div className="relative -top-4 left-8 sm:left-16 md:left-24 flex gap-2">
          <img src="/facility/concentric-two.svg" alt="" className="w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 object-contain opacity-80" />
        </div>
      </div>
    </section>
  );
}