import { Rocket, ChevronRight } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function HeroSection() {
  const [currentPath] = useState("/enablers");

  const handleListWorkspace = () => {
    // console.log("Navigate to service provider signup");
  };

  const handleFindSpace = () => {
    // console.log("Navigate to search page");
  };

  const getBreadcrumbs = () => {
    const paths = currentPath.split("/").filter(Boolean);
    const breadcrumbs = [{ name: "Category", path: "/" }];

    if (paths.length > 0) {
      const lastPath = paths[paths.length - 1];
      const formattedName = lastPath
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      breadcrumbs.push({
        name: formattedName,
        path: currentPath,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const companyData = [
    { id: 1, name: "Pan-India coverage", icon: "/workspace/action.svg" },
    { id: 2, name: "Verified founders & teams", icon: "/workspace/verified.svg" },
    { id: 3, name: "Flat, transparent UPI model", icon: "/workspace/ufi.svg" },
    { id: 4, name: "Secure payouts", icon: "/workspace/secure.svg" },
    { id: 5, name: "#1 Platform For Workspaces", icon: "/workspace/bitcoin.svg" },
  ];

  return (
    <section className="text-center pt-28 md:pt-12 bg-white relative min-h-screen overflow-hidden px-4 md:px-0">
      {/* Breadcrumbs */}
      <nav className="flex items-center justify-start max-w-7xl ml-[45px] mb-4 px-4 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            )}
            <button
              onClick={() => console.log(`Navigate to ${crumb.path}`)}
              className={`${
                index === breadcrumbs.length - 1
                  ? "text-green-600 font-medium"
                  : "text-gray-500 hover:text-gray-700"
              } transition-colors`}
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </nav>

      {/* Hero Content */}
      <div className="text-center pt-12 pb-8 px-4 z-10 relative max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-block bg-green-100 text-green-600 text-sm px-4 py-2 rounded-full mb-6 font-medium">
          #1 Productivity Area
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
          <span className="text-green-600">Supercharge</span> Your Hub with the
          <br />
          Right <span className="text-green-600">Partners</span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 max-w-3xl mx-auto mt-6 text-lg">
          Cumma connects enablers with startups, streamline bookings, grow your
          community, and turn vacant slots into value.
        </p>

        {/* CTA Button */}
        <div className="mt-8 flex justify-center">
          <button
            className="bg-green-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center gap-2 shadow-lg"
            onClick={handleListWorkspace}
          >
            List Your Workspace
            <Rocket className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center mt-6">
          <div className="relative">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-green-500 border-2 border-white"></div>
              <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-white"></div>
              <div className="w-10 h-10 rounded-full bg-purple-500 border-2 border-white"></div>
              <div className="w-10 h-10 rounded-full bg-orange-500 border-2 border-white"></div>
              <div className="w-10 h-10 rounded-full bg-pink-500 border-2 border-white"></div>
              <div className="w-10 h-10 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                +3
              </div>
            </div>
          </div>
          {/* Stats Badge */}
          <div className="mt-4 text-sm text-gray-500">
            9 people booked a workspace within last 24 hours
          </div>
        </div>
      </div>

      {/* Office Image Section */}
      <div className="w-full md:max-w-7xl mx-auto px-0 md:px-4 pb-0 md:pb-12">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-50 to-gray-100 -mt-28">
          <Image
            src="/workspace/office.png"
            alt="Office Workspace"
            width={1200}
            height={600}
            className="object-cover w-full h-auto opacity-60"
            priority
          />
        </div>
      </div>

      {/* Company Marquee Section */}
      <div className="bg-gradient-to-b from-white to-green-50 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative overflow-hidden">
            {/* Gradient overlays for fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-green-50 to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-green-50 to-transparent z-10"></div>

            {/* Marquee */}
            <div className="flex animate-marquee">
              {[...companyData, ...companyData].map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex-shrink-0 mx-8 flex items-center justify-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-100 shadow-sm min-w-fit"
                >
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      // Fallback if icon doesn't load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <p className="text-sm font-medium text-green-700 whitespace-nowrap">
                    {item.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}