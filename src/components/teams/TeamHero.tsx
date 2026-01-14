"use client";
import React, { useState, useEffect } from "react";
import { Menu, User } from "lucide-react";

export default function CummaHero() {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-gradient-to-b from-white to-green-50 overflow-hidden">

      {/* Hero Section */}
      <div className="relative flex flex-col items-center justify-center min-h-[50vh] md:min-h-[85vh] px-4 pb-8 md:pb-16">
        {/* Decorative Icons - Top Left */}
        <div
          className={`absolute top-12 left-4 md:top-20 md:left-12 transition-all duration-700 ${
            animationComplete ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
        >
          <div className="w-8 h-8 md:w-12 md:h-12 bg-green-400 rounded-lg rotate-45 animate-pulse"></div>
        </div>

        {/* Decorative Icons - Top Right */}
        <div
          className={`absolute top-16 right-4 md:top-32 md:right-16 transition-all duration-700 delay-100 ${
            animationComplete ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
        >
          <div className="w-6 h-6 md:w-8 md:h-8 bg-orange-400 rounded-full animate-bounce"></div>
        </div>

        {/* Decorative Icons - Middle Right */}
        <div
          className={`absolute top-1/2 right-4 md:right-20 transition-all duration-700 delay-150 ${
            animationComplete ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
        >
          <div className="w-6 h-6 md:w-10 md:h-10 bg-yellow-400 rounded-lg rotate-12"></div>
         
        </div>
{/* New Decorative Icon - Bottom Left */}
<div
  className={`absolute bottom-32 left-4 md:bottom-45 md:left-[134px] transition-all duration-700 delay-200 rotate-45 ${
    animationComplete ? "opacity-100 scale-100" : "opacity-0 scale-50"
  }`}
>
  <svg
            fill="#ffa200"
            version="1.1"
            id="Capa_1"
            xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 560.317 560.316"
            stroke="#ffa200"
            className="w-10 h-10 md:w-16 md:h-16"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <g>
                {" "}
                <g>
                  {" "}
                  <path d="M207.523,560.316c0,0,194.42-421.925,194.444-421.986l10.79-23.997c-41.824,12.02-135.271,34.902-135.57,35.833 C286.96,122.816,329.017,0,330.829,0c-39.976,0-79.952,0-119.927,0l-12.167,57.938l-51.176,209.995l135.191-36.806 L207.523,560.316z"></path>{" "}
                </g>{" "}
              </g>{" "}
            </g>
          </svg>
        </div>
        {/* Decorative Icons - Middle Left */}
        <div
          className={`absolute top-1/2 left-4 md:left-16 transition-all duration-700 delay-200 ${
            animationComplete ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
        >
          <div className="w-4 h-4 md:w-6 md:h-6 bg-green-500 rounded-full animate-pulse"></div>
        </div>

        {/* Hero Text - Animates from top */}
        <div
          className={`text-center transition-all duration-700 ${
            animationComplete
              ? "translate-y-0 opacity-100"
              : "-translate-y-20 opacity-0"
          }`}
        >
        <div className="bg-green-100 text-green-600 text-xs md:text-sm mb-4 px-4 py-2 rounded-full inline-block shadow-sm">
  #1 ProductiveTeam
</div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 px-4">
            Meet <span className="text-green-500">Superheroes</span> Powering
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>Cumma
          </h1>
          <p className="text-gray-500 text-base md:text-lg px-4">
            Builders, creators, and changemakers on a mission.
          </p>
        </div>

        {/* Fist Bump Illustration Container - Only visible on desktop */}
        <div
          className={`hidden md:flex relative w-full h-56 mb-12 items-center justify-center transition-opacity ${
            animationComplete ? "opacity-0" : "opacity-100"
          }`}
          style={{ transitionDuration: "2000ms" }}
        >
          {/* Left Fist - Slides from left to center */}
          <div
            className={`absolute transition-all duration-1000 ease-out delay-200 ${
              animationComplete
                ? "left-1/2 -translate-x-[255px] opacity-100"
                : "left-0 -translate-x-full opacity-0"
            }`}
          >
            <img
              src="/teams/leftfist.svg"
              alt="Left Fist"
              className="w-[250px] h-[300px] object-contain"
            />
          </div>

          {/* Right Fist - Slides from right to center */}
          <div
            className={`absolute transition-all duration-1000 ease-out delay-200 ${
              animationComplete
                ? "right-1/2 translate-x-[255px] opacity-100"
                : "right-0 translate-x-full opacity-0"
            }`}
          >
            <img
              src="/teams/rightfist.svg"
              alt="Right Fist"
              className="w-[250px] h-[350px] object-contain"
            />
          </div>
        </div>

        {/* Bottom Hands Section - Animates from bottom */}
        <div
          className={`absolute -bottom-4 md:bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl transition-all duration-800 delay-300 ${
            animationComplete
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
          }`}
        >
          <img
            src="/teams/bottomhand.svg"
            alt="Bottom Hands"
            className="w-full h-[160px] md:h-[280px] object-contain"
          />
        </div>

        {/* Bottom Decorative Icons */}
        <div
          className={`absolute bottom-20 right-4 md:bottom-32 md:right-24 transition-all duration-700 delay-300 ${
            animationComplete ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
        >
          <div className="w-6 h-6 md:w-10 md:h-10 bg-yellow-400 rounded-lg rotate-45"></div>
        </div>
      </div>
    </div>
  );
}