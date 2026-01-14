import { Rocket } from "lucide-react";
import { useRouter } from 'next/navigation'
import { highlight } from "pdfkit";
export default function HeroSection() {

  const router = useRouter();
  const handleListWorkspace = () => {
    router.push('/sign-up/service-provider')
   // console.log('Navigate to service provider signup');
  };

  const handleFindSpace = () => {
    router.push('/SearchPage')
   // console.log('Navigate to search page');
  };

  const content = {
    startup: {
      title: "The Smarter Way to ",
      highlight1: "Work",
      mid:" & ",
      highlight2: "Grow",
      subtitle:
        "Cumma connects Users with flexible workspaces and hubs — while helping enablers fill capacity, streamline bookings, and grow their communities.",
      btn1: "List Your Workspace",
      btn2: "Find Your Space",
    },
  };

  return (
    <section className="text-center pt-28 md:pt-10 md:pt-12 bg-white relative min-h-screen overflow-hidden px-4 md:px-0">
      {/* Header Content */}
      <div className="relative z-10 mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-6xl font-bold text-gray-900 px-2">
          {content.startup.title} <span className="text-green-600">{content.startup.highlight1}</span> {content.startup.mid} <span className="text-green-600">{content.startup.highlight2}</span>
        </h1>
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto mt-3 md:mt-4 px-4">
          {content.startup.subtitle}
        </p>
        <div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-4 px-4">
          <button 
            className="w-full sm:w-auto bg-green-500 text-white px-6 py-3 rounded-full font-medium hover:bg-green-600 transition-colors shadow-md"
            onClick={handleListWorkspace}
          >
            {content.startup.btn1} 
          </button>
          <button 
            className="w-full sm:w-auto bg-white border border-green-500 text-green-500 px-6 py-3 rounded-full font-medium hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
            onClick={handleFindSpace}
          >
            {content.startup.btn2} <Rocket className="w-4 h-4" />
          </button>
        </div>

        {/* Demo Link */}
        <div className="mt-3 md:mt-4">
          <span className="text-gray-500 text-xs md:text-sm">
            Want to talk or get a live demo?{" "}
          </span>
          <a href="https://calendly.com/team-facilitiease/30min" className="text-gray-900 font-semibold text-xs md:text-sm hover:text-green-500 transition-colors">
            Get a Demo
          </a>
        </div>
      </div>

      {/* Desktop Version - Hidden on Mobile */}
      <div className="hidden lg:block relative w-full h-[600px]">
        {/* Background SVGs and Center Content Container */}
        <div className="relative w-full h-full flex justify-center items-center">
          {/* Background SVGs positioned to fill the space */}
          <div className="absolute inset-0 flex justify-center items-center">
            <img
              src="/workspace/LeftDesign.svg"
              alt="Left design"
              className="h-full w-auto object-none"
            />
            {/* Center Logo and Brand */}
            <div className="relative z-20 flex flex-col items-center top-[102px]">
              {/* Cumma Brand Text */}
              <div className="text-green-500 text-3xl font-bold mb-3">
                <img src="/logo.png" alt="Logo" className="inline-block h-18 w-40 ml-5" />
              </div>

              {/* Center Icon */}
              <div className="">
                <img
                  src="/workspace/center.png"
                  alt="Center design"
                  className="h-24 w-24 ml-[10px]"
                />
              </div>

              {/* Workspace Text */}
              <div className="text-gray-900 text-center">
                <img src="/workspace/cummworkspace.png" alt="workspace" className="h-14 w-36 mt-6 ml-[5px]" />
              </div>
            </div>
            <img
              src="/workspace/RightDesign.svg"
              alt="Right design"
              className="h-full w-auto object-contain mt-[20px] ml-[-20px]"
            />
          </div>

          {/* Left Side Icons */}
          <div className="absolute left-[5%] top-[15%] z-10 space-y-6">
            {/* SONA Logo */}
            <div className="w-[110px] h-[45px] items-center justify-center text-sm font-bold ml-[110px]">
              <img src="/workspace/sona.png" alt="Sona" />
            </div>

            <div
              className="w-[410px] h-15 items-center justify-center text-sm font-bold ml-[180px]"
              style={{ marginTop: "50px" }}
            >
              <img src="/workspace/grg.png" alt="GRG" className="h-[60px]"/>
              <div className="bg-white p-2 rounded-lg shadow-md max-w-[250px] max-h-[90px] ml-[60px]">
                <div className="flex items-start space-x-3 mb-2">
                  <div className=" h-[50px] rounded-full">
                    <img src="/workspace/privatecabin.svg" alt="" className="h-[80px]" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-semibold text-green-500 items-start">
                      Private Cabin
                    </span>
                    <p className="text-[9px] text-gray-600 font-normal">
                      Dedicated quiet workspaces for individuals or small teams
                      needing privacy
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="w-[490px] h-10 items-center justify-center text-sm font-bold ml-[130px]"
              style={{ marginTop: "-10px" }}
            >
              <img src="/workspace/edii.png" alt="edii" className="h-[80px]" />
              <div
                className="bg-white p-2 rounded-lg shadow-md max-w-[260px] max-h-[85px] ml-[220px]"
                style={{ marginTop: "-50px" }}
              >
                <div className="flex items-start space-x-3">
                  <div className=" h-[30px] w-1/2 rounded-full">
                    <img src="/workspace/meetingarea.png" alt="" className="h-[40px]" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-semibold text-green-500">
                      Meeting Area
                    </span>
                    <p className="text-[8px] text-gray-600 font-normal">
                      Fully equipped spaces for conferences, client meetings and
                      team collaborations
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="w-[410px] h-15 items-center justify-center text-sm font-bold ml-[260px]"
              style={{ marginTop: "20px" }}
            >
              <img src="/workspace/amet.png" alt="amet" className="h-[50px]"/>
              <div className="bg-white p-2 rounded-lg shadow-md max-w-[250px] max-h-[70px] ml-[40px]">
                <div className="flex items-start space-x-3 mb-2">
                  <div className=" h-[20px] w-1/2 rounded-full">
                    <img src="/workspace/coworking.svg" alt="" className="h-[35px]" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-semibold text-green-500">
                      Co-working spaces
                    </span>
                    <p className="text-[9px] text-gray-600 font-normal">
                    Flexible shared workspaces designed for professionals,startups and teams.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[80px] h-8 items-center justify-center text-sm font-bold ml-[120px]">
              <img src="/workspace/tbi.png" alt="tbi" className="h-[65px]" />
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="absolute right-[8%] top-0 z-10 h-full">
            {/* Blue Icon */}
            <div className="relative top-[39%] right-[80px] w-12 h-12 flex items-center justify-center">
              <img src="/workspace/blue.svg" alt="Blue" className="w-12 h-12" />
            </div>

            {/* Circle Icon */}
            <div className="relative top-[42%] right-[215px] w-12 h-12 flex items-center justify-center">
              <img src="/workspace/circle.svg" alt="Circle" className="w-12 h-12" />
            </div>

            {/* Curve One Icon */}
            <div className="relative top-[43%] right-[285px] w-12 h-12 flex items-center justify-center">
              <img src="/workspace/curveone.svg" alt="Curve One" className="w-12 h-12" />
            </div>

            {/* Curve Two Icon */}
            <div className="relative top-[48%] right-[260px] w-12 h-12 flex items-center justify-center">
              <img src="/workspace/curvetwo.svg" alt="Curve Two" className="w-12 h-12" />
            </div>

            {/* Horse Icon */}
            <div className="relative top-[28%] right-[120px] w-12 h-12 flex items-center justify-center">
              <img src="/workspace/horse.svg" alt="Horse" className="w-12 h-12" />
            </div>

            {/* Tens Icon */}
            <div className="relative top-[36%] right-[120px] w-12 h-12 flex items-center justify-center">
              <img src="/workspace/tens.svg" alt="Tens" className="w-12 h-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Version - Hidden on Desktop */}
      <div className="lg:hidden relative w-full mt-8 pb-12">
        {/* Center Logo and Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="text-green-500 text-2xl font-bold mb-3">
            <img src="/logo.png" alt="Logo" className="inline-block h-12 w-32" />
          </div>
          <div className="mb-3">
            <img
              src="/workspace/center.png"
              alt="Center design"
              className="h-20 w-20"
            />
          </div>
          <div className="text-gray-900 text-center">
            <img src="/workspace/cummworkspace.png" alt="workspace" className="h-10 w-28" />
          </div>
        </div>

        {/* Workspace Features Cards */}
        <div className="space-y-6 max-w-md mx-auto px-4">
          {/* Private Cabin Card */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img src="/workspace/privatecabin.svg" alt="" className="h-16 w-16" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-sm font-semibold text-green-500 mb-1">
                  Private Cabin
                </h3>
                <p className="text-xs text-gray-600">
                  Dedicated quiet workspaces for individuals or small teams needing privacy
                </p>
              </div>
            </div>
          </div>

          {/* Meeting Area Card */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img src="/workspace/meetingarea.png" alt="" className="h-16 w-16" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-sm font-semibold text-green-500 mb-1">
                  Meeting Area
                </h3>
                <p className="text-xs text-gray-600">
                  Fully equipped spaces for conferences, client meetings and team collaborations
                </p>
              </div>
            </div>
          </div>

          {/* Co-working Spaces Card */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img src="/workspace/coworking.svg" alt="" className="h-16 w-16" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-sm font-semibold text-green-500 mb-1">
                  Co-working spaces
                </h3>
                <p className="text-xs text-gray-600">
                  Flexible shared workspaces designed for professionals, startups and teams.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Logos - Mobile Grid */}
        <div className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto px-4">
          <div className="flex items-center justify-center">
            <img src="/workspace/sona.png" alt="Sona" className="h-8 w-auto" />
          </div>
          <div className="flex items-center justify-center">
            <img src="/workspace/grg.png" alt="GRG" className="h-10 w-auto" />
          </div>
          <div className="flex items-center justify-center">
            <img src="/workspace/edii.png" alt="EDII" className="h-12 w-auto" />
          </div>
          <div className="flex items-center justify-center">
            <img src="/workspace/amet.png" alt="AMET" className="h-8 w-auto" />
          </div>
          <div className="flex items-center justify-center">
            <img src="/workspace/tbi.png" alt="TBI" className="h-10 w-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}