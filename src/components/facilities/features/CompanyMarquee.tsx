"use client";
import Marquee from "react-fast-marquee";
import { useRouter } from "next/navigation";

type Mode = "user" | "enabler";

interface CompanyMarqueeProps {
  mode: Mode;
}

const CompanyMarquee: React.FC<CompanyMarqueeProps> = ({ mode }) => {
  const router = useRouter();

  const handleCTAClick = () => {
    if (mode === "user") router.push("/SearchPage");
    else router.push("/sign-up/service-provider");
  };

  const marqueeData = {
    enabler: [
      { id: 1, logoUrl: "/workspace/amet.png", name: "AMET" },
      { id: 2, logoUrl: "/workspace/edii.png", name: "EDII Periyakulam" },
      { id: 3, logoUrl: "/enablers/satyabhama.png", name: "Sathyabama TBI" },
      { id: 4, logoUrl: "/workspace/sona.png", name: "SONA" },
      { id: 5, logoUrl: "/workspace/tbi.png", name: "Bharath TBI" },
      { id: 6, logoUrl: "/workspace/grg.png", name: "GRG" },
      { id: 7, logoUrl: "/enablers/veltech.png", name: "VEL TECH" },
    ],
    startup: [
      { id: 1, logoUrl: "/startups/1.png" },
      { id: 2, logoUrl: "/startups/2.png" },
      { id: 3, logoUrl: "/startups/3.png" },
      { id: 5, logoUrl: "/startups/5.png" },
      { id: 6, logoUrl: "/startups/6.png" },
      { id: 7, logoUrl: "/startups/7.png" },
      { id: 8, logoUrl: "/startups/8.png" },
      { id: 9, logoUrl: "/startups/9.png" },
      { id: 10, logoUrl: "/startups/10.png" },
      { id: 11, logoUrl: "/startups/11.png" },
      { id: 12, logoUrl: "/startups/12.png" },
      { id: 14, logoUrl: "/startups/14.png" },
      { id: 15, logoUrl: "/startups/15.png" },
      { id: 16, logoUrl: "/startups/16.png" },
      { id: 17, logoUrl: "/startups/17.png" },
      { id: 18, logoUrl: "/startups/18.png" },
      { id: 19, logoUrl: "/startups/19.png" },
    ],
  };

  return (
    <div className="w-full py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900">
          {mode === "user"
            ? "The best Startups trust Cumma"
            : "The best Enablers trust Cumma"}
        </h2>

        {/* Marquee Container */}
        <div className="relative overflow-hidden">
          {/* Gradient overlays */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <Marquee speed={40} pauseOnHover={true} gradient={false}>
            {(mode === "enabler"
              ? marqueeData.enabler
              : marqueeData.startup
            ).map((company) => (
              <div
                key={company.id}
                className="mx-8 md:mx-12 opacity-80 hover:opacity-100 transition-all duration-300"
              >
                <img
                  src={company.logoUrl}
                  alt="Company Logo"
                  className={
                    mode === "enabler"
                      ? "h-10 w-auto object-contain"
                      : "h-24 w-auto object-contain"
                  }
                />
              </div>
            ))}
          </Marquee>
        </div>

        {/* Subheading */}
        <p className="text-center text-gray-600 mt-12 text-lg">
          Cumma is used by over 550+ companies across the Tamilnadu
        </p>

        {/* CTA Button */}
        <div className="flex justify-center mt-8">
          <button
            className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            onClick={handleCTAClick}
          >
            {mode === "user"
              ? "Start your Startup Journey"
              : "Start your Enablers Journey"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyMarquee;
