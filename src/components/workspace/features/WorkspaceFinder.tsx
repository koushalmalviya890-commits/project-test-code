import React from 'react';

// Workspace type definition
import { Mode } from "@/app/(landing)/offices/about/page";

interface WorkspaceOption {
  id: string;
  name: string;
  icon: string;
}

interface WorkspaceFinderProps {
  mode: Mode;
}

const WorkspaceFinder: React.FC<WorkspaceFinderProps> = ({ mode }) => {
  const workspaceOptions: WorkspaceOption[] = [
    {
      id: 'cabins',
      name: 'Cabins',
      icon: "/icons/categories-gif/cabin.gif"
    },
    {
      id: 'raw-space',
      name: 'Raw space',
      icon: "/icons/categories-gif/rawspace.gif"
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing space',
      icon: "/icons/categories-gif/manufacturing.gif"
    },
    {
      id: 'meeting',
      name: 'Meeting Area',
      icon: "/icons/categories-gif/meeting.gif"
    },
    {
      id: 'coworking',
      name: 'Co-Working Space',
      icon: "/icons/categories-gif/coworking.gif"
    },
    {
      id: 'boardroom',
      name: 'Board Room',
      icon: "/icons/categories-gif/boardroom.gif"
    }
  ];

  return (
    <div className="h-[75vh] md:h-[750px] bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Status Badge */}
        <div className="flex justify-center mb-8">
          <span className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-medium ${
            mode === 'startup' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {mode === 'startup' ? 'Available' : 'You can list'}
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
          {mode === 'startup' 
            ? 'Find Your Perfect Startup Workspace' 
            : 'Turn Your Workspace into Opportunities.'}
        </h1>

         {/* Mobile Layout - 3x2 Grid */}
         <div className="lg:hidden">
          <div className="flex justify-center">
            <div className="relative max-w-[320px] w-full">
              {/* Phone Mockup */}
              {mode === 'startup' 
                ? <img src='/workspace/mobile.svg' alt='Mobile view' className="w-full"/>
                : <img src='/workspace/mobilee.svg' alt='Mobile view' className="w-full"/>
              }
              
              {/* Top Row Icons */}
              <div className="absolute top-[20%] left-0 right-0 grid grid-cols-3 px-10">
                {workspaceOptions.slice(0, 3).map((option) => (
                  <div
                    key={option.id}
                    className="flex flex-col items-center text-center group cursor-pointer"
                  >
                    <div className="text-gray-600 group-hover:text-green-600 transition-colors mb-1">
                      <img src={option.icon} alt={option.name} className="w-8 h-8" />
                    </div>
                    <span className="text-gray-700 font-medium text-[9px] leading-tight">
                      {option.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom Row Icons */}
              <div className="absolute bottom-[16%] left-0 right-0 grid grid-cols-3 px-10">
                {workspaceOptions.slice(3, 6).map((option) => (
                  <div
                    key={option.id}
                    className="flex flex-col items-center text-center group cursor-pointer"
                  >
                    <div className="text-gray-600 group-hover:text-green-600 transition-colors mb-1">
                      <img src={option.icon} alt={option.name} className="w-8 h-8" />
                    </div>
                    <span className="text-gray-700 font-medium text-[9px] leading-tight">
                      {option.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>


        {/* Main Content Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8 items-center">
          {/* Left Column - Workspace Options */}
          <div className="space-y-8">
            {workspaceOptions.slice(0, 3).map((option) => (
              <div
                key={option.id}
                className="flex flex-col items-center text-center group cursor-pointer transition-transform hover:scale-105"
              >
                <div className="text-gray-600 group-hover:text-green-600 transition-colors mb-3">
                  <img src={option.icon} alt={option.name} className="w-12 h-12" />
                </div>
                <span className="text-gray-700 font-medium text-sm">
                  {option.name}
                </span>
              </div>
            ))}
          </div>

          {/* Center Column - Phone Mockup */}
          <div className="flex justify-center">
            <div className="relative">
          
             
              {mode === 'startup' 
            ? <img src='/workspace/mobile.svg' alt=''/>
            : <img src='/workspace/mobilee.svg' alt=''/>
            }
            </div>
          </div>

          {/* Right Column - Workspace Options */}
          <div className="space-y-8">
            {workspaceOptions.slice(3, 6).map((option) => (
              <div
                key={option.id}
                className="flex flex-col items-center text-center group cursor-pointer transition-transform hover:scale-105"
              >
                <div className="text-gray-600 group-hover:text-green-600 transition-colors mb-3">
                 <img src={option.icon} alt={option.name} className="w-12 h-12" />
                </div>
                <span className="text-gray-700 font-medium text-sm">
                  {option.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceFinder;

 {/* <div className="w-72 h-[580px] bg-black rounded-[3rem] p-3 shadow-2xl">
              
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
             
                  <div className="px-6 pt-3 pb-2 flex justify-between items-center text-xs">
                    <span className="font-semibold">9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-3 bg-gray-300 rounded-sm"></div>
                      <div className="w-4 h-3 bg-gray-300 rounded-sm"></div>
                      <div className="w-6 h-3 bg-gray-300 rounded-sm"></div>
                    </div>
                  </div>

                  
                  <div className="flex-1 flex flex-col items-center justify-center px-8">
             
                    <div className="mb-8">
                      <h2 className="text-5xl font-bold text-green-600 mb-2">cumma</h2>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 7h18M3 12h18M3 17h18" />
                          </svg>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">workspace</h3>
                      </div>
                    </div>

                   
                    <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-xl flex items-center gap-2 transition-colors shadow-lg">
                      Book Now
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>

                
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl"></div>
              </div> */}