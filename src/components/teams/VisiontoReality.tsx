const VisiontoReality = () => {
  return (
    <div className="relative bg-white mt-[80px] md:mt-[144px] py-8 md:py-[114px] overflow-hidden">
      <div className="absolute left-0 right-0 pointer-events-none" style={{ top: '85px', height: 'calc(100% + 5px)' }}>
        <img
          src="/teams/waves.svg"
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
      </div>
      <div
        className="relative max-w-7xl mx-auto px-4 md:px-8"
        style={{ marginTop: "-50px" }}
      >
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Left side content */}
          <div className="flex-1 flex flex-col items-start mt-8 md:mt-16 font-medium text-gray-900">
            <p className="text-2xl md:text-3xl lg:text-5xl mb-4 md:mb-6 font-semibold">
              From Vision to <span className="text-green-600">Reality</span>
            </p>
            
            <div className="space-y-4 md:space-y-6 text-sm md:text-base">
              <p className="text-gray-500 pl-4 md:pl-[30px]">
               {"   "}Cumma was born from a simple belief — innovation
                should never be limited by access. Startups across India face a
                common challenge: finding the right physical spaces to build,
                test, and grow. We set out to change that.
              </p>
              
              <p className="text-gray-500 pl-4 md:pl-[30px]">
                What started as an idea is now a unified platform that connects
                founders with co-working spaces, incubation centres, R&D labs, and
                technical facilities — all in one place. By bridging the gap
                between startups and infrastructure, Cumma empowers bold ideas to
                take shape and thrive.
              </p>
              
              <p className="text-gray-500 pl-4 md:pl-[30px]">
                Our team works at the intersection of technology, community, and
                opportunity, building not just a marketplace, but the backbone of
                India's next wave of innovation. With every partner onboarded and
                every startup supported, we move closer to a world where location
                or stage is never a barrier to growth.
              </p>
            </div>

            <button className="h-[50px] w-[260px] bg-green-400 text-gray-900 font-semibold mt-6 md:mt-10 flex items-center justify-center rounded-lg hover:bg-green-500 transition-colors">
              <span className="pl-2">Join with us at careers@cumma.in</span>
              {/* <svg 
                width="20px" 
                height="20px" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                className="ml-2"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <path 
                    fillRule="evenodd" 
                    clipRule="evenodd" 
                    d="M12.2929 4.29289C12.6834 3.90237 13.3166 3.90237 13.7071 4.29289L20.7071 11.2929C21.0976 11.6834 21.0976 12.3166 20.7071 12.7071L13.7071 19.7071C13.3166 20.0976 12.6834 20.0976 12.2929 19.7071C11.9024 19.3166 11.9024 18.6834 12.2929 18.2929L17.5858 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H17.5858L12.2929 5.70711C11.9024 5.31658 11.9024 4.68342 12.2929 4.29289Z" 
                    fill="#000000"
                  />
                </g>
              </svg> */}
            </button>
          </div>

          {/* Right side image */}
          <div className="relative w-full md:w-1/2 mt-8 md:mt-12">
            <img
              src="/teams/vision-to-reality.png"
              alt="Vision to Reality"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisiontoReality;