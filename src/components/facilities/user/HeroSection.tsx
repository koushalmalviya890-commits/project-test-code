"use client";
import React from 'react';
import { Rocket, AlertCircle, Star } from 'lucide-react';
// import { useSession } from "next-auth/react";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const HeroSection = () => {
    //  const { data: session } = useSession();
    const { user } = useAuth();
     const router = useRouter();
  return (
    <section className="w-full bg-white pt-28 md:pt-10 pb-16 px-4 md:px-8 flex flex-col items-center text-center font-sans">
      {/* Top Breadcrumb */}
      <div className="w-full max-w-7xl flex justify-start mb-10 text-sm text-gray-500">
        <span>Category &gt; <span className="text-green-600 font-medium">User</span></span>
      </div>

      {/* Badge */}
      <div className="inline-block px-4 py-1.5 rounded-full border border-gray-200 bg-white shadow-sm text-sm font-medium text-gray-700 mb-6">
        #1 Innovation Hub
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight max-w-4xl mb-6">
        <span className="text-green-500">Supercharge</span> Your Ideas with the
        <br className="hidden md:block" />
        Right <span className="text-green-500">Facilities</span>
      </h1>

      {/* Subheadline */}
      <p className="text-gray-500 text-lg md:text-xl max-w-2xl mb-10">
        We connect you with flexible workspaces to focus, collaborate, and grow. 
        Goodbye distractions, hello productivity.
      </p>
 <div className="block sm:hidden w-[300px] h-[240px] mr-50 md:mr-0 mb-10 md:mb-0 md:w-[500px] md:h-[380px] pointer-events-none z-10">
        {/* Replace the div below with your <Image /> component */}
        {/* <div className="w-full h-full border-4 border-dashed border-green-300 bg-green-50/50 rounded-tl-[100px] flex items-center justify-center text-green-700 font-bold">
            [Robotic Arm Illustration Here]
        </div> */}
        <img src='/facility/mobilerobotarm.svg' alt='Robotic Arm Illustration' className="w-full h-full object-contain" />
      </div>
      {/* CTA Button */}
      <div className="flex flex-col items-center gap-3">
        <button className="group relative bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-green-200 transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-1"
        onClick={() => {
                                // if (!session) {
                                if (!user) {
                                  router.push("/sign-up/startup");
                                } else if (
                                  // session.user?.userType === "startup"
                                  user?.userType === "startup"
                                ) {
                                  router.push("/SearchPage");
                                } else {
                                  toast.error(
                                    "A Startup account is required to book facilities",
                                    {
                                      duration: 5000,
                                      icon: (
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                      ),
                                    }
                                  );
                                }
                              }}
        >
          Book a Facility
          <Rocket className="w-4 h-4" />
        </button>
        <span className="text-xs text-gray-400 font-medium">Pay only for what you use</span>
      </div>

      {/* Ratings */}
      <div className="mt-8 flex items-center gap-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-5 h-5 fill-green-500 text-green-500" />
          ))}
        </div>
        <span className="text-sm text-gray-500 font-medium">1k+ rating on Facility</span>
      </div>
    </section>
  );
};

export default HeroSection;