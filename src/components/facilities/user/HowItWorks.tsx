'use client';

import { ArrowRight, Briefcase, TrendingUp } from 'lucide-react';
import Image from 'next/image';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight">
              How It Works
            </h1>

            <div className="relative space-y-6">
                <div className='bg-gradient-to-br from-blue-50 to-teal-50 '>
              <div className="flex items-start gap-6">
                
                <div className="text-8xl font-bold text-green-200 leading-none select-none">
                  01
                </div>
                
                <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-green-300 transform transition-all hover:shadow-md ">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <img src="/workspace/logout.svg" alt="" className='w-6 h-6'/>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Sign Up and create Account
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Register your startup and unlock workspace access.
                  </p>
                </div></div>
              </div>

              <div className="flex items-start gap-6">
              
                <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-green-300 transform transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Choose Your Workspace
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Pick from cabins, co-working desks, or raw space to match your needs.
                  </p>
                </div>
                <div className="text-8xl font-bold text-green-200 leading-none select-none">
                  02
                </div>
              </div>

              <div className="flex items-start gap-6">
                 <div className="text-8xl font-bold text-green-200 leading-none select-none">
                  03
                </div>
                <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-green-300 transform transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Start Growing
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Work, collaborate, and scale with flexible plans that adapt to you.
                  </p>
                </div>
               
              </div>
            </div>
          </div>

          {/* Right Side - Illustration Scene */}
          <div className="relative lg:pl-12 h-[500px] flex items-center justify-center">
            {/* This inner div acts as the "Canvas". 
                'relative' allows children to use absolute positioning relative to this box.
            */}
            <div className="relative w-full h-full max-w-xl">
              
              {/* 1. Wall Frame/Window (Back Layer) */}
              {/* Positioned top-right based on the design */}
              {/* <img 
                src="/facility/picture.svg" 
                alt="" 
                className="absolute top-10 right-4 w-24 opacity-90 z-0"
              /> */}

              {/* 2. Application Screen (Middle-Back Layer) */}
              {/* This sits behind the girl but creates the backdrop */}
              <img 
                src="/facility/screen.svg" 
                alt="" 
                className="absolute top-20 left-1/2 -translate-x-1/2 w-[35%] z-10 ml-8"
              />

              <img
                src="/facility/stats.svg" 
                alt="" 
                className="absolute top-[75%] left-[15%] -translate-x-1/2 w-[40%] z-10 ml-8"
              />

              {/* 3. Girl at Table (Main Layer) */}
              {/* Centered at the bottom */}
              <img 
                src="/facility/girltable.svg" 
                alt="" 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] z-20 opacity-90 ml-20"
              />

              {/* 4. Plant (Front-Right Layer) */}
           

              {/* 5. Signup Floating Window (Front-Left Layer) */}
              {/* Floating on the left side */}
              <img 
                src="/facility/signup.svg" 
                alt="" 
                className="absolute top-[10%] left-0 w-48 shadow-xl rounded-lg z-60 transform -translate-x-4 hover:scale-105 transition-transform duration-300"
              />

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}