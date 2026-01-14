import React from 'react';
import { FlaskConical, Settings, Play } from 'lucide-react';

const BookFacility = () => {
  // Central vertical position for the Hub and Crosshair
  const centerY = '45%'; 

  const facilityUsers = [
    "Startup Founders & Product Teams",
    "R&D Departments of Companies",
    "Consultants",
    "Makers & Innovators",
    "University Students",
    "Freelancers",
    "Project Groups"
  ];

  return (
    <section className="relative w-full py-12 md:py-24 overflow-hidden bg-white">
      {/* Global Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* --- Header --- */}
        <div className="text-center mb-12 md:mb-16 relative z-30">
          <div className="inline-block px-4 py-1 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-600 mb-4 shadow-sm">
            Who
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Book Facility with <span className="text-green-500">Benefits</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Access the right labs, equipment, and facilities for creation, testing, and growth.
          </p>
        </div>

        {/* --- DESKTOP VIEW (Manual Layout) --- */}
        <div className="hidden md:block relative w-full h-[650px] mx-auto max-w-6xl mt-10">
          
          {/* 1. Background Windows */}
          <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
            <div className="absolute left-0 top-0 bottom-0 w-1/2">
               <img src='/facility/windowone.svg' alt="bg" className="absolute left-[-1%] top-[4%] w-[45%] h-auto opacity-80" />
               <img src='/facility/windowtwo.svg' alt="bg" className="absolute left-[45%] top-[-1%] w-[35%] h-[35%] opacity-80" />
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end">
               <img src='/facility/windowthree.svg' alt="bg" className="w-[280px] h-[380px] opacity-80 top-[2%] absolute" />
            </div>
          </div>

    <div className='absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-[43%] z-90'>
    <img src='/facility/facilitieslogo.svg' alt='Facility Icon' className="w-[260px] h-[400px] object-contain" />
</div>
          {/* =========================================================
              MANUAL NODES & LINES
              Adjust 'top' and 'left' here for individual placement.
              Adjust 'src' for specific line SVGs.
             ========================================================= */}

          {/* --- Item 1: Startup Founders --- */}
          {/* Line */}
          <img src="/facility/line1.svg" alt="" className="absolute pointer-events-none z-10 transform -translate-x-1/2 -translate-y-1/2"
               style={{ left: '34%', top: '22%', width: '10%', height: '20%', rotate: '-25deg' }} />
          {/* Node */}
          <div className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-white border-[3px] border-green-500 rounded-full w-36 h-36 shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg z-30 cursor-pointer group"
               style={{ left: '20%', top: '15%' }}>
              <p className="text-center font-bold text-gray-800 text-[15px] px-2 leading-tight group-hover:text-green-600">
                Startup Founders & Product Teams
              </p>
          </div>

          {/* --- Item 2: Consultants --- */}
          {/* Line */}
          <img src="/facility/line2.svg" alt="" className="absolute pointer-events-none z-10 transform -translate-x-1/2 -translate-y-1/2"
               style={{ left: '28%', top: centerY, width: '16%', height: '16%' }} />
          {/* Node */}
          <div className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-white border-[3px] border-green-500 rounded-full w-36 h-36 shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg z-30 cursor-pointer group"
               style={{ left: '10%', top: '45%' }}>
              <p className="text-center font-bold text-gray-800 text-[15px] px-2 leading-tight group-hover:text-green-600">
                Consultants
              </p>
          </div>

          {/* --- Item 3: Makers & Innovators --- */}
          {/* Line */}
          <img src="/facility/line3.svg" alt="" className="absolute pointer-events-none z-10 transform -translate-x-1/2 -translate-y-1/2"
               style={{ left: '29%', top: '62%', width: '16%', height: '22%' }} />
          {/* Node */}
          <div className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-white border-[3px] border-green-500 rounded-full w-36 h-36 shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg z-30 cursor-pointer group"
               style={{ left: '15%', top: '75%' }}>
              <p className="text-center font-bold text-gray-800 text-[15px] px-2 leading-tight group-hover:text-green-600">
                Makers & Innovators
              </p>
          </div>

          {/* --- Item 4: Freelancers --- */}
          {/* Line */}
          <img src="/facility/line4.svg" alt="" className="absolute pointer-events-none z-10 transform -translate-x-1/2 -translate-y-1/2"
               style={{ left: '39%', top: '69%', width: '20%', height: '24%' }} />
          {/* Node */}
          <div className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-white border-[3px] border-green-500 rounded-full w-36 h-36 shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg z-30 cursor-pointer group"
               style={{ left: '35%', top: '90%' }}>
              <p className="text-center font-bold text-gray-800 text-[15px] px-2 leading-tight group-hover:text-green-600">
                Freelancers
              </p>
          </div>

          {/* --- Item 5: R&D Departments --- */}
          {/* Line */}
          <img src="/facility/line8.svg" alt="" className="absolute pointer-events-none z-10 transform -translate-x-1/2 -translate-y-1/2"
               style={{ left: '66%', top: '33%', width: '20%', height: '24%', rotate:'21deg' }} />
          {/* Node */}
          <div className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-white border-[3px] border-green-500 rounded-full w-36 h-36 shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg z-30 cursor-pointer group"
               style={{ left: '80%', top: '15%' }}>
              <p className="text-center font-bold text-gray-800 text-[15px] px-2 leading-tight group-hover:text-green-600">
                R&D Departments of Companies
              </p>
          </div>

          {/* --- Item 6: PhD Scholars --- */}
          {/* Line */}
          <img src="/facility/line7.svg" alt="" className="absolute pointer-events-none z-10 transform -translate-x-1/2 -translate-y-1/2"
               style={{ left: '75%', top: '46%', width: '16%', height: '16%' }} />
          {/* Node */}
          <div className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-white border-[3px] border-green-500 rounded-full w-36 h-36 shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg z-30 cursor-pointer group"
               style={{ left: '90%', top: '45%' }}>
              <p className="text-center font-bold text-gray-800 text-[15px] px-2 leading-tight group-hover:text-green-600">
                PhD Scholars & Research Fellow
              </p>
          </div>

          {/* --- Item 7: University Students --- */}
          {/* Line */}
          <img src="/facility/line6.svg" alt="" className="absolute pointer-events-none z-10 transform -translate-x-1/2 -translate-y-1/2"
               style={{ left: '74%', top: '63%', width: '20%', height: '22%' }} />
          {/* Node */}
          <div className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-white border-[3px] border-green-500 rounded-full w-36 h-36 shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg z-30 cursor-pointer group"
               style={{ left: '85%', top: '75%' }}>
              <p className="text-center font-bold text-gray-800 text-[15px] px-2 leading-tight group-hover:text-green-600">
                University Students
              </p>
          </div>

          {/* --- Item 8: Project Groups --- */}
          {/* Line */}
           <img src="/facility/line5.svg" alt="" className="absolute pointer-events-none z-10 transform -translate-x-1/2 -translate-y-1/2"
               style={{ left: '63%', top: '70%', width: '20%', height: '24%' }} />
           {/* Node */}
          <div className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-white border-[3px] border-green-500 rounded-full w-36 h-36 shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg z-30 cursor-pointer group"
               style={{ left: '65%', top: '90%' }}>
              <p className="text-center font-bold text-gray-800 text-[15px] px-2 leading-tight group-hover:text-green-600">
                Project Groups
              </p>
          </div>

        </div>

        {/* --- MOBILE VIEW (Simplified Grid) --- */}
        <div className="block md:hidden">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 max-w-lg mx-auto">
                <div className="flex flex-col gap-6">
                    {facilityUsers.map((user, index) => (
                        <div key={index} className="flex items-center gap-4 group">
                            {/* Icon looking like the green play button in the image */}
                            <div className="flex-shrink-0">
                                <Play className="w-5 h-5 text-green-500 fill-green-500" />
                            </div>
                            <span className="text-gray-700 font-medium text-base sm:text-lg">
                                {user}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </section>
  );
};

export default BookFacility;