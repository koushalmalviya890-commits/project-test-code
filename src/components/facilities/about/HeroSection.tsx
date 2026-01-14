import { Rocket } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FacilitiesHero() {
  const router = useRouter();

  const handleListFacility = () => {
    router.push("/sign-up/service-provider");
    // console.log('Navigate to service provider signup');
  };

  const handleBookFacility = () => {
    router.push("/SearchPage");
    // console.log('Navigate to search page');
  };

  return (
 <section className="text-center pt-28 md:pt-12 relative h-full md:min-h-screen overflow-hidden mt-0 md:mt-0">
      
    {/* --- GREEN GRADIENT BLOB (Behind the SVGs) --- */}
    {/* 1. absolute top-0 left-0: Positions it in the top left corner.
        2. w-64 h-64: Gives it size.
        3. bg-gradient-to-br: Creates the green fade.
        4. blur-3xl: Softens it into a glow.
        5. -z-10: Ensures it sits BEHIND the stars and text.
    */}
    <div className="absolute top-[-20px] left-[-20px] md:left-10 md:top-10 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-br from-green-200/60 via-green-100/30 to-transparent rounded-full blur-3xl -z-10 pointer-events-none"></div>

    {/* Decorative Elements - Top Left */}
    <div className="absolute top-8 left-4 md:top-20 md:left-32 w-8 h-10 md:w-16 md:h-20">
        <img src="/facility/star.svg" alt="" className="w-full h-full opacity-80" />
    </div>

    {/* Small decorative circle */}
    <div className="absolute top-4 left-20 md:top-12 md:left-48 w-2 h-2 md:w-3 md:h-3 bg-green-300 rounded-full opacity-80"></div>

      {/* Decorative Elements - Top Right */}
      <div className="absolute top-6 right-4 md:top-16 md:right-32 w-10 h-10 md:w-20 md:h-20">
        <img
          src="/facility/squiggle.svg"
          alt=""
          className="w-full h-full opacity-70"
        />
      </div>

      {/* Header Content */}
      <div className="relative z-10 px-4 md:px-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 mb-2">
          Facilities. <span className="text-green-500">Power</span>
          <span className="text-gray-900"> Innovation.</span>
        </h1>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 mb-4 md:mb-6 relative inline-block">
          Accelerate
          <span className="text-green-500 relative inline-block pl-[8px] md:pl-[15px]">
            Growth
            {/* Decorative circles around Growth */}
            <img
              src="/facility/growth-circle.svg"
              alt=""
              className="absolute top-[2px] md:top-[4px] left-1 md:left-2 w-32 h-12 md:w-46 md:h-16 pointer-events-none opacity-70"
            />
          </span>
          <span className="text-green-500">.</span>
        </h2>

        <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg px-2">
          Unlock access to world class equipment and facilities at anytime,
          anywhere.
        </p>

        {/* CTA Buttons */}
        <div className="mt-6 md:mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-4 px-4">
          <button
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-6 md:px-8 py-3 rounded-full font-medium transition-colors"
            onClick={handleListFacility}
          >
            List Your Facility
          </button>
          <button
            className="w-full sm:w-auto bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 px-6 md:px-8 py-3 rounded-full font-medium transition-colors flex items-center justify-center gap-2"
            onClick={handleBookFacility}
          >
            Book Your Facility <Rocket className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Link */}
        <div className="mt-4 md:mt-6 px-4">
          <span className="text-gray-500 text-xs md:text-sm">
            Want to talk or get a live demo?{" "}
          </span>
          <a
            href="#"
            className="text-gray-900 font-semibold text-xs md:text-sm hover:text-green-500 transition-colors"
          >
            Get a Demo
          </a>
        </div>
      </div>

      {/* Illustration Section */}
      <div className="relative w-full h-[150px] sm:h-[180px] md:h-[200px] flex justify-center items-center mt-4 md:mt-0">
        {/* Left Illustration - Laboratory Worker */}
        <div className="hidden md:block absolute left-[2%] sm:left-[5%] md:left-[8%] bottom-0 z-10">
          <img
            src="/facility/manufacture.svg"
            alt="Laboratory worker"
            className="h-[180px] sm:h-[240px] md:h-[310px] w-auto object-contain"
          />
        </div>

        {/* Right Illustration - Researcher */}
        <div className="absolute right-[2%] sm:right-[5%] md:right-[8%] bottom-0 z-10">
          <img
            src="/facility/microscope.svg"
            alt="Researcher"
            className="h-[140px] sm:h-[180px] md:h-60 w-auto object-contain"
          />
        </div>
      </div>

      {/* Background decorative gradient circles */}
      <div className="absolute top-40 left-0 w-48 h-48 md:w-96 md:h-96 bg-green-100 rounded-full opacity-20 blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 md:w-96 md:h-96 bg-blue-100 rounded-full opacity-20 blur-3xl -z-10"></div>
    </section>
  );
}
