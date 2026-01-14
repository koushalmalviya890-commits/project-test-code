import { ArrowRight } from 'lucide-react';

type Mode = "user" | "enabler";

interface CTASectionProps {
  mode: Mode;
}

export default function CTASection({ mode }: CTASectionProps) {
  const handleCTAClick = () => {
    if (mode === "user") {
     // console.log("Navigating to /SearchPage");
    } else {
     // console.log("Navigating to /sign-up/service-provider");
    }
  };

  return (
    <section className="w-full bg-gradient-to-br from-green-600 via-green-500 to-emerald-700 py-2 md:py-2 mt-10">
      <div className="w-full px-4 md:px-8 lg:px-8">
        <div className="relative flex items-center">
          {/* Green Background Card */}
          <div className="relative bg-gradient-to-br from-green-600 via-green-500 to-emerald-700 rounded-3xl min-h-[300px] md:min-h-[400px] flex items-center justify-center w-full md:w-full z-10 shadow-2xl overflow-hidden md:overflow-visible">
            {/* Content Container */}
            <div className="relative z-10 p-8 md:p-12 lg:p-16 max-w-4xl text-center mr-0 md:mr-[258px]">
              <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 leading-tight">
                {mode === "user"
                  ? "Ready to Work Smarter?"
                  : "Ready to Enable Smarter Facility?"}
              </h2>
              <p className="text-white/90 text-base md:text-lg mb-8 leading-relaxed">
                {mode === "user"
                  ? "Power your innovation with instant access to world class facilities."
                  : "Join our enabler network and support the next generation of innovators."}
              </p>
              <button 
                className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors shadow-lg"
                onClick={handleCTAClick}
              >
                {mode === "user" ? "Start Booking Today" : "List Your Facility Today"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            
            {/* Illustration - Hidden on mobile, visible and positioned absolutely on md+ */}
            <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[50%] md:w-[45%] lg:w-[40%] h-auto z-20 pointer-events-none">
              <img 
                src={mode === "user" ? "/facility/victoryman.svg" : "/facility/dedicatedman.svg"}
                alt={mode === "user" ? "User illustration" : "Facility illustration"}
                className="w-full h-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}