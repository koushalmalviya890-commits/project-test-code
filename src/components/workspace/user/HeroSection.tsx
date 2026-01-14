import { Rocket, ChevronRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Marquee from "@/components/layout/Marquee";
import CompanyMarquee from "./ExploreServices";
export default function HeroSection() {
  const router = useRouter();
   const pathname = usePathname();
  const handleListWorkspace = () => {
    router.push("/sign-up/service-provider");
   // console.log("Navigate to service provider signup");
  };

  const handleFindSpace = () => {
    router.push("/SearchPage");
   // console.log("Navigate to search page");
  };

   const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Category', path: '/' }];
    
    if (paths.length > 0) {
      const lastPath = paths[paths.length - 1];
      // Format the last path part (remove hyphens, capitalize)
      const formattedName = lastPath
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        name: formattedName,
        path: pathname
      });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const companyData = [
  { id: 1, logoUrl: '/workspace/amet.png', name: 'AMET' },
  { id: 2, logoUrl: '/workspace/edii.png', name: 'EDII Periyakulam' },
    { id: 3, logoUrl: '/enablers/satyabhama.png', name: 'Sathyabama TBI' },
  { id: 4, logoUrl: '/workspace/sona.png', name: 'SONA' },
  { id: 5, logoUrl: '/workspace/tbi.png', name: 'Bharath TBI' },
  { id: 6, logoUrl: '/workspace/grg.png', name: 'GRG' },
{ id: 7, logoUrl: '/enablers/veltech.png', name: 'VEL TECH' },
  // NOTE: You would need to create a 'public/logos' folder and add these SVG/PNG files.
];

  const content = {
    startup: {
      highlight1: "Supercharge ",
      title: "Your Workday with ",
      mid: "the Right ",
      highlight2: "Office",
      subtitle:
        "Cumma connects you with flexible office spaces designed to help your team focus, collaborate seamlessly, and grow faster. Say goodbye to distractions and hello to productivity.",
      btn2: "Book a Workspace",
    },
  };

  return (
    <section className="text-center pt-8 md:pt-12 bg-white relative min-h-screen overflow-hidden px-4 md:px-0">
      
        <nav className="flex items-center justify-start max-w-7xl ml-[45px] mb-4 px-4 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            )}
            <button
              onClick={() => router.push(crumb.path)}
              className={`${
                index === breadcrumbs.length - 1
                  ? 'text-green-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              } transition-colors`}
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </nav>
      
      {/* Header Content */}

      <div className="relative z-10 mb-6 md:mb-8">
        <div className="bg-green-100 text-green-600 text-xs md:text-sm mb-4 px-4 py-2 rounded-full inline-block shadow-sm">
          #1 Productivity Area
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-6xl font-bold text-gray-900 px-2">
          <span className="text-green-600">{content.startup.highlight1}</span>{" "}
          {content.startup.title}
          <br />
          {content.startup.mid}{" "}
          <span className="text-green-600">{content.startup.highlight2}</span>
        </h1>
        <p className="text-sm md:text-base text-gray-600 max-w-4xl mx-auto mt-3 md:mt-4 px-4">
          {content.startup.subtitle}
        </p>
        <div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-4 px-4">
          <button
            className="w-full sm:w-auto border border-green-500 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl font-medium hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
            onClick={handleFindSpace}
          >
            {content.startup.btn2} <Rocket className="w-4 h-4" />
          </button>
        </div>

        {/* Demo Link */}
        <div className="mt-3 md:mt-4">
          <span className="text-gray-500 text-xs md:text-xs">
            Pay only for what you use.
          </span>
        </div>

        <div className="mt-3 md:mt-4 flex items-center justify-center">
          <img
            src="/workspace/star_icon.png"
            alt="Star rating"
            className="h-5 w-5"
          />
          <img
            src="/workspace/star_icon.png"
            alt="Star rating"
            className="h-5 w-5"
          />
          <img
            src="/workspace/star_icon.png"
            alt="Star rating"
            className="h-5 w-5"
          />
          <img
            src="/workspace/star_icon.png"
            alt="Star rating"
            className="h-5 w-5"
          />
          <img
            src="/workspace/star_icon.png"
            alt="Star rating"
            className="h-5 w-5"
          />

          <span className="text-gray-500 text-xs md:text-xs ml-2">
            1K+ rating on Office
          </span>
        </div>

{/* <div 
          className="relative mx-auto max-w-7xl justify-center items-center max-w-7xl" // Centering and width limit
          style={{ 
            padding: '10px 0', 
            margin: '40px 40px 0 150px', 
            // CSS for fading edges (adjust background color as needed)
            maskImage: `linear-gradient(to right, transparent, black 150px, black calc(100% - 150px), transparent)`,
            WebkitMaskImage: `linear-gradient(to right, transparent, black 150px, black calc(100% - 150px), transparent)`,
          }}
        >
          <Marquee 
            companies={companyData} 
            speed={80}
          />
        </div> */}
      {/* <CompanyMarquee /> */}
      
      </div>
    </section>
  );
}
