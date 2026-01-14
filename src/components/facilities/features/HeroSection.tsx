import React from "react";
import Image from "next/image";
import { Rocket } from "lucide-react";
import { useRouter } from "next/navigation";

type Mode = "user" | "enabler";

interface HeroSectionProps {
  mode: Mode;
}

const HeroSection: React.FC<HeroSectionProps> = ({ mode }) => {

    const router = useRouter();

  return (
    <section className="relative w-full pt-28 md:pt-10 min-h-[580px] flex items-center justify-center overflow-hidden bg-white px-4 md:px-8 lg:px-16">
      {/* Main Container */}
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 sm:gap-12 items-center">
        {/* Left Column: Robot Illustration */}
        <div className="relative flex justify-center lg:justify-end order-2 lg:order-1">
          {/* Background Glow Effect */}
           {mode === "enabler" ? ( <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] md:h-[300px] bg-green-400/20 rounded-full blur-[80px] pointer-events-none" />) :(<div className="absolute top-[200px] left-[450px] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-green-300 rounded-full blur-[80px] pointer-events-none" />)}

          <div className="relative w-full max-w-[500px] h-[285px] md:h-auto aspect-square flex items-center justify-center">
            {/* Render different visuals depending on `mode` */}
            {mode === "enabler" ? (
              <>
              <img
                src="/facility/coolrobot.svg"
                alt="Robot on wheel"
                className="hidden md:block object-contain z-10 w-[500px] h-auto drop-shadow-xl"
              />
                <img src="/facility/mobilerobot.svg"
                alt="Robot on wheel"
                className="block md:hidden object-contain z-10 w-[700px] h-auto drop-shadow-xl"
                />
              </>
            ) : (
              <>
                <div className="top-0 left-0 w-full h-full relative flex items-center justify-center">
                  <img
                    src="/facility/window.svg"
                    alt="Window background"
                    className="absolute z-0 w-[120px] sm:w-[180px] h-auto opacity-90 -translate-y-4 -translate-x-20 sm:-translate-x-36"
                  />
                  <img
                    src="/facility/findfacility.png"
                    alt="add facility"
                    className="absolute -translate-y-[40px] sm:-translate-y-[90px] translate-x-10 object-contain w-[220px] sm:w-[360px] h-auto drop-shadow-lg"
                  />
                  {/* Foreground/character for 'user' mode */}
                  <img
                    src="/facility/officegirl.svg"
                    alt="Office user"
                    className="relative z-10 object-contain w-[240px] sm:w-[460px] translate-y-20 sm:translate-y-28 h-auto drop-shadow-lg"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Text Content */}
        <div className="flex flex-col h-full items-center lg:items-start lg:justify-around text-center lg:text-left order-1 lg:order-2 space-y-4">
          {/* Headlines */}
          <div>
          {mode === "enabler" ? 
          (
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.2]">
            {/* Line 1 */}
            <span className="block mb-2">
              Showcase<span className="text-green-500">.</span>
            </span>

            {/* Line 2 */}
            <span className="block">
              <span className="text-green-500">Connect</span>
              <span className="text-green-500">.</span> <span>Monetize</span>
              <span className="text-green-500">.</span>
            </span>
          </h1>
          )
          :
          (
            <>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.2]">
              {/* Line 1 */}
              <span className="block mb-2 text-green-500">
              Search.
              </span>
               <span className="block">
              <span>Connect.</span>
              <span className="text-green-500">Build.</span>
            
            </span>  
            </h1>
             </>
          )}

          {/* Subheadline */}

          {mode === "enabler" ? (
          <p className="text-gray-600 text-lg md:text-xl font-medium pt-6">
            Unlock the full potential of your facilities with Cumma
          </p>)
          :
          (
            <p className="text-gray-600 text-lg md:text-xl font-medium pt-6">
            Find the perfect facility to kickstart your startup journey with Cumma
          </p>
          )}
</div>
          {mode === "user" && (
            <button className="hidden md:block mt-14 px-20 py-3 flex gap-4 bg-green-500 text-white rounded-xl text-lg font-medium hover:bg-green-600 transition">
               <span className="flex items-center gap-2" onClick={() => router.push("/SearchPage")}>Book a Facility <Rocket /></span>
            </button>
          )}

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
