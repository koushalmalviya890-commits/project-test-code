import React from 'react';

export default function WorkspaceListingBenefits() {
  const benefits = [
    {
      number: "01",
      title: "Fill Idle Capacity",
      description: "Keep your spaces active with steady, qualified startup demand.",
      alignment: "right"
    },
    {
      number: "02",
      title: "Lower Acquisition Cost",
      description: "Cumma markets your hub so you can focus on delivering value.",
      alignment: "left"
    },
    {
      number: "03",
      title: "Unified Facility Interface (UFI)",
      description: "Simple, transparent pricing across all your listings.",
      alignment: "right"
    },
    {
      number: "04",
      title: "Faster Conversions",
      description: "Verified founders, quick KYC, and instant booking holds.",
      alignment: "left"
    },
    {
      number: "05",
      title: "Guaranteed Payout Flows",
      description: "On-time settlements with GST-ready invoicing.",
      alignment: "right"
    },
    {
      number: "06",
      title: "Operational Control",
      description: "Manage slots, blackout dates, rules, and add-ons with ease.",
      alignment: "left"
    },
    {
      number: "07",
      title: "Insights That Matter",
      description: "Track utilization, revenue, and repeat trends in real time.",
      alignment: "right"
    },
    {
      number: "08",
      title: "Human Support",
      description: "Get onboarding help, listing reviews, and partner success support.",
      alignment: "left"
    }
  ];

  return (
    <div className="relative w-full min-h-screen bg-[#FAFAF8] py-16 px-4 md:px-8 lg:px-16 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-4">
        <p className="text-gray-600 text-sm mb-2">Why</p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
          List Your <span className="text-[#2ECC71]">Workspace</span> at Cumma
        </h1>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block relative max-w-7xl mx-auto mt-16">
        {/* Central Timeline */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-200 transform -translate-x-1/2" />

        {/* Left Illustration Placeholder - Top */}
        {/* <div className="absolute left-[5%] top-[15%] w-32 h-32 lg:w-40 lg:h-40">
          <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 rounded-full opacity-30 flex items-center justify-center">
            <span className="text-xs text-gray-500 text-center px-2">Overview<br/>Illustration</span>
          </div>
        </div> */}

        {/* Left Illustration Placeholder - Middle */}
        <div className="absolute left-[1%] top-[45%] w-28 h-36 lg:w-56 lg:h-56">
          <div className="w-full h-full opacity-60 flex items-center justify-center">
            {/* <span className="text-xs text-gray-500 text-center px-2">Stats<br/>Bubble</span> */}
            <img src="/workspace/monthly.png" alt="" />
          </div>
        </div>

        {/* Right Illustration Placeholder - Top */}
        {/* <div className="absolute right-[5%] top-[20%] w-36 h-36 lg:w-44 lg:h-44">
          <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 rounded-[40px] opacity-30 flex items-center justify-center rotate-12">
            <span className="text-xs text-gray-500 text-center px-2 -rotate-12">New Leads<br/>Badge</span>
          </div>
        </div> */}

        {/* Right Illustration Placeholder - Bottom */}
        <div className="absolute right-[0%] top-[45%] w-28 h-36 lg:w-[269px] lg:h-[100px]">
          <div className="w-full h-full opacity-80 flex items-center justify-center -rotate-6">
           <img src="/workspace/leads.png" alt="" />
          </div>
        </div>

        {/* Benefits List */}
        <div className="relative">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`flex items-center mb-12 ${
                benefit.alignment === 'right' ? 'justify-end' : 'justify-start'
              }`}
            >
              {benefit.alignment === 'left' ? (
                <>
                  {/* Left Side Content */}
                  <div className="w-5/12 text-right">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {benefit.description}
                    </p>
                  </div>

                  {/* Center Circle */}
                  <div className="relative flex items-center justify-center ml-[82px] mb-[3px]">
                    <div className="w-12 h-12 rounded-full bg-white border-2 hover:border-[#2ECC71] border-gray-200 flex items-center justify-center z-10 shadow-sm">
                      <span className="text-sm font-medium text-gray-600">
                        {benefit.number}
                      </span>
                    </div>
                  </div>

                  <div className="w-5/12" />
                </>
              ) : (
                <>
                  <div className="w-5/12" />

                  {/* Center Circle */}
                  <div className="relative flex items-center justify-center mr-[82px] mb-[3px]">
                    <div className="w-12 h-12 rounded-full bg-white border-2 hover:border-[#2ECC71] flex items-center justify-center z-10 shadow-sm">
                      <span className="text-sm font-semibold text-gray-800">
                        {benefit.number}
                      </span>
                    </div>
                  </div>

                  {/* Right Side Content */}
                  <div className="w-5/12 text-left pr-12">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {benefit.description}
                    </p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Layout - Vertical Connected List */}
      <div className="md:hidden relative max-w-md mx-auto mt-12">
        {/* Vertical Timeline */}
        <div className="absolute left-6 top-0 bottom-20 w-0.5 bg-gray-200" />

        {benefits.map((benefit, index) => (
          <div key={index} className="relative flex mb-8 pl-0">
            {/* Circle */}
            <div className="relative flex-shrink-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 shadow-sm ${
                index === 0 ? 'bg-white border-2 border-[#2ECC71]' : 'bg-white border-2 border-gray-200'
              }`}>
                <span className={`text-sm font-medium ${
                  index === 0 ? 'text-gray-800 font-semibold' : 'text-gray-600'
                }`}>
                  {benefit.number}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="ml-6 pb-4">
              <h3 className="text-base font-semibold text-gray-800 mb-1">
                {benefit.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="flex justify-center mt-12">
        <button className="bg-[#2ECC71] hover:bg-[#27AE60] text-white font-medium px-8 py-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5">
          Start a new journey!
        </button>
      </div>
    </div>
  );
}