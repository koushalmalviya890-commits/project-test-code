"use client";

import Image from "next/image";
import { Mode } from "@/app/(landing)/offices/about/page";
import { Rocket } from "lucide-react";

interface StoriesHeroSectionProps {
  mode: Mode; // "startup" | "enabler"
}

export default function StoriesHeroSection({ mode }: StoriesHeroSectionProps) {
  const isEnabler = mode === "enabler";

  const headingTop = isEnabler ? "Enablers" : "Users";
  const subLine = isEnabler
    ? "Cumma is trusted by over 300+ Facility Partner in Tamilnadu"
    : "Cumma is trusted by over 300+ Businesses in Tamilnadu";

  // Update these image paths to match your actual files in /public
  const illustrationSrc = isEnabler
    ? "/workspace/enablertestimonial.svg"
    : "/workspace/usertestimonial.svg";

  return (
    <section className="bg-white relative">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-4 pb-12 lg:flex lg:items-center lg:justify-between lg:gap-10 relative z-10">
        {" "}
        {/* The parent container is z-10 */}
        {/* LEFT TEXT */}
        <div className="max-w-xl space-y-6">
          {/* 👇 KEY CHANGE 1: Changed z-0 to -z-10 to push the blur behind everything */}
          <div className="absolute -left-10 top-5 h-64 w-64 rounded-full bg-green-200/80 blur-3xl pointer-events-none -z-10 opacity-50" />
          
          {/* breadcrumb */}
          {/* You also had z-50 and z-100 on the text which is good for ensuring visibility */}
          <div className="hidden lg:block">
          <p className="text-sm text-gray-400 flex items-center gap-2 z-50 m-0">
            <span>Stories</span>
            <span className="h-[1px] w-6 bg-gray-300" />
            <span className="text-gray-600 z-100">
              {isEnabler ? "Enablers" : "Users"}
            </span>
          </p>
          </div>

          <div className="z-50">
            <h1 className="text-3xl sm:text-4xl lg:text-7xl font-semibold text-gray-900 leading-tight">
              <span className="block">{headingTop}</span>
              <span className="block text-green-600 mt-1">Testimonials</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-md">
              {subLine}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button className="inline-flex items-center justify-center rounded-full bg-green-600 px-6 py-2.5 text-sm sm:text-base font-medium text-white shadow hover:bg-green-700 transition-colors">
              Share Your Stories
            </button>

            <button className="inline-flex items-center justify-center rounded-full border border-green-500 px-6 py-2.5 text-sm sm:text-base font-medium text-green-600 bg-white hover:bg-green-50 transition-colors">
              View our customer Stories
             <Rocket className="inline-block w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
        {/* RIGHT ILLUSTRATION */}
        <div className="relative mt-12 lg:mt-0 lg:w-[50%] flex justify-center">
          {/* soft green glow to match your design */}
          <div className="absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-green-200/60 blur-3xl pointer-events-none" />

          <div className="relative">
            <Image
              src={illustrationSrc}
              alt={isEnabler ? "Enablers testimonials" : "Users testimonials"}
              width={520}
              height={440}
              className="w-full max-w-md h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}