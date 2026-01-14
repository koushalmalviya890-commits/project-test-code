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

          <div className="relative lg:pl-12">
            
            <img src="/workspace/signingUp.svg" alt="" />
          </div>
        </div>
      </div>
    </div>
  );
}
{/* <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="text-center mb-8">
                <div className="inline-block">
                  <h2 className="text-3xl font-bold text-green-400 mb-1">cumma</h2>
                  <p className="text-gray-600 text-sm">Welcome</p>
                </div>
              </div>

              <div className="flex justify-end mb-6">
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                    Startup Details
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                    Contact Details
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                    Additional Details
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Startup Name*
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                    placeholder="Enter startup name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type of Entity*
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all appearance-none bg-white">
                    <option>Select entity type</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DPIIT Number (if applicable)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                    placeholder="Enter DPIIT number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry*
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all appearance-none bg-white">
                    <option>Select industry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sector*
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all appearance-none bg-white">
                    <option>Select sector</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stage*
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all appearance-none bg-white">
                    <option>Select stage</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-white"></div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-500">10K+</div>
                      <div className="text-sm text-gray-600">Registered</div>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
