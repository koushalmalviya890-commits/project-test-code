import React from 'react';
import Image from "next/image";


export default function WhoBookCumma() {
  return (
    <div className="w-full py-16 px-6 lg:px-12 relative overflow-hidden mb-20">
      {/* Background SVG - Full Width, Behind Content */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none">
        <div className="absolute right-20 bottom-0 w-full h-full flex items-end justify-center">
          <Image 
            src='/workspace/designsection.svg' 
            alt='Workspace illustration' 
            height={800} 
            width={1000}
            className="object-contain object-right-bottom"
            style={{ maxHeight: '90%', width: '90%' }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Who Can</h3>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Book with <span className="text-green-500">Cumma?</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The platform trusted by founders, teams, and professionals to find the
            right space for work, growth, and collaboration.
          </p>
        </div>

        {/* Content List */}
        <div className="max-w-xl relative left-5 lg:left-40">
          <div className="space-y-8">
            {/* Founders & Entrepreneurs */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                Founders & Entrepreneurs
              </h3>
              <p className="text-gray-600">
                looking for flexible office space to build their teams.
              </p>
            </div>

            {/* SMEs & Growing Businesses */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                SMEs & Growing Businesses
              </h3>
              <p className="text-gray-600">
                Who need scalable spaces without long-term commitments.
              </p>
            </div>

            {/* Freelancers & Remote Workers */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                Freelancers & Remote Workers
              </h3>
              <p className="text-gray-600">
                Seeking professional co-working environments.
              </p>
            </div>

            {/* Corporate Innovation Teams */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                Corporate Innovation Teams
              </h3>
              <p className="text-gray-600">
                Booking spaces for short-term projects, hackathons, or satellite teams.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}