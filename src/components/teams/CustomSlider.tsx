"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  quote: string;
  linkedIn?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Gautham Palaniswamy",
    role: "Founder and CEO",
    image: "/teams/gautham.png",
    quote: "At Cumma, we're not just building a platform We're building the backbone of the startup ecosystem.",
    linkedIn: "https://www.linkedin.com/in/gauthampalaniswamy"
  },
    {
    name: "Brabasuthan Murugesan",
    role: "Co-Founder and CBO",
    image: "/teams/braba.png",
    quote: "Technology should empower, not overwhelm. Our goal is to make complex systems feel simple.",
  linkedIn: "https://www.linkedin.com/in/brabasuthan-murugesan",
  },
{
  name: "Prakash Balakrishnan", 
  role: "Chief Product Officer",
  image: "/teams/prakashh.png", // Replace with the CPO's image path
  linkedIn: "https://www.linkedin.com/in/prakash-b-06334010",
  quote: "The product is the conversation we have with our users. We listen intently to build features that truly unlock growth and value."
},
 {
    name: "Kavya",
    role: "Admin & Development",
    image: "/teams/kavya.png",
     linkedIn: "https://www.linkedin.com/in/kavyasree-gautham-981848207",
    quote: "Behind every smooth journey is strong support and structure that's what I bring to the team"
  },
  {
    name: "Nisath Moorthi",
    role: "Business & Development",
    image: "/teams/nisath.png",
    quote: "Opportunities don't just happen, We create them by connecting vision with action.",
  linkedIn: "https://www.linkedin.com/in/nisathm2912",
  },
  {
    name: "Sivashankar Velliangiri",
    role: "Product Development",
    image: "/teams/siva.png",
    quote: "Great design is invisible, it makes every experience feel natural and effortless",
    linkedIn: "https://www.linkedin.com/in/sivashankargiri",
  },
  {
    name: "Abishek Singh Tomar",
    role: "Product Development",
    image: "/teams/abhishek.png",
    quote: "For me, every line of code is a step toward making startups stronger and smarter.",
    linkedIn: "https://www.linkedin.com/in/abhishek-singh-tomar1",
  },
  
];

export default function TestimonialsCarousel() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0);

  const handleSlideClick = (idx: number) => {
    setActiveIndex(activeIndex === idx ? null : idx);
  };

  const nextSlide = () => {
    setCurrentMobileIndex((prev) => (prev + 1) % teamMembers.length);
  };

  const prevSlide = () => {
    setCurrentMobileIndex((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);
  };

  const currentMember = teamMembers[currentMobileIndex];

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center py-8 sm:py-12 md:py-4 px-4">
      <div className="relative w-full max-w-[1400px] mx-auto">

        {/* Main carousel container */}
        <div className="w-full lg:w-[70%] min-h-[400px] sm:min-h-[500px] md:h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-4 mx-auto">
          {/* Desktop View - Horizontal Carousel */}
          <div className="hidden md:flex relative w-full max-w-7xl h-[400px] lg:h-[480px] flex-row gap-3 lg:gap-5 overflow-hidden rounded-2xl shadow-2xl">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                onClick={() => handleSlideClick(idx)}
                className={`relative cursor-pointer transition-all duration-700 ease-in-out overflow-hidden rounded-xl border border-1 border-gray-800 ${
                  activeIndex === null
                    ? "flex-1"
                    : activeIndex === idx
                    ? "flex-[5]"
                    : "flex-[0.3]"
                }`}
              >
                {/* Gradient Overlay - Behind image */}
                <div
                  className={`absolute inset-0 transition-all duration-700 ${
                    activeIndex === idx
                      ? "bg-gradient-to-br from-green-400/90 via-green-500/85 to-yellow-400/90"
                      : "bg-gradient-to-br from-green-400/30 to-green-600/30"
                  }`}
                />

                {/* Image - In front of gradient */}
                <div
                  className={`absolute transition-all duration-700 ${
                    activeIndex === idx 
                      ? "right-0 top-0 w-1/2 h-full" 
                      : "inset-0"
                  }`}
                  style={{
                    backgroundImage: `url(${member.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: activeIndex === idx ? 0.9 : 1,
                  }}
                />

                {/* Content - Only show when expanded */}
                {activeIndex === idx && (
                  <div className="relative h-full flex flex-col justify-center p-6 lg:p-12 text-white w-1/2">
                    {/* Quote Icon */}
                    <div className="mb-4 lg:mb-6">
                      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" className="text-gray-800 lg:w-12 lg:h-12">
                        <path d="M12 21C12 16.5817 15.5817 13 20 13V16C17.2386 16 15 18.2386 15 21V22H20V31H11V21H12ZM29 21C29 16.5817 32.5817 13 37 13V16C34.2386 16 32 18.2386 32 21V22H37V31H28V21H29Z" fill="currentColor"/>
                      </svg>
                    </div>

                    {/* Quote Text */}
                    <div className="max-w-lg mb-6 lg:mb-8">
                      <p className="text-base lg:text-lg font-bold leading-tight mb-6 lg:mb-8 text-gray-900">
                        {member.quote}
                      </p>
                      
                      {/* Name and Role */}
                      <div className="mb-3 lg:mb-4">
                        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{member.name}</h2>
                        <p className="text-sm lg:text-base font-medium text-gray-800">{member.role}</p>
                      </div>

                      {/* LinkedIn Icon */}
<a 
                        href={member.linkedIn} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="w-7 h-7 lg:w-8 lg:h-8 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white font-bold text-xs lg:text-sm">in</span>
                        </div>
                        <span className="text-gray-800 text-xs lg:text-sm">{member.name}</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Collapsed state - show minimal info */}
                {activeIndex !== idx && (
                  <div className="absolute inset-0 flex items-end justify-center pb-6 lg:pb-8">
                    <div className="transform -rotate-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-semibold text-xs lg:text-sm tracking-wider">
                        {member.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile/Tablet View - Swipeable Carousel with Navigation */}
          <div className="md:hidden w-full max-w-lg mx-auto">
            {/* Main Card */}
            <div className="relative bg-gradient-to-br from-green-400/95 via-green-500/90 to-yellow-400/95 rounded-3xl shadow-2xl overflow-hidden">
              {/* Background Image with Overlay */}
              <div className="absolute inset-0 opacity-20">
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${currentMember.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              </div>

              {/* Content */}
              <div className="relative p-8 sm:p-10 min-h-[550px] flex flex-col">
                {/* Profile Image Circle */}
                <div className="flex justify-center mb-6">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden">
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${currentMember.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  </div>
                </div>

                {/* Quote Icon */}
                <div className="mb-4 flex justify-center">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-white/80">
                    <path d="M12 21C12 16.5817 15.5817 13 20 13V16C17.2386 16 15 18.2386 15 21V22H20V31H11V21H12ZM29 21C29 16.5817 32.5817 13 37 13V16C34.2386 16 32 18.2386 32 21V22H37V31H28V21H29Z" fill="currentColor"/>
                  </svg>
                </div>

                {/* Quote */}
                <p className="text-white text-lg sm:text-xl font-bold text-center leading-relaxed mb-8 flex-grow">
                  {currentMember.quote}
                </p>

                {/* Member Info */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {currentMember.name}
                  </h3>
                  <p className="text-base sm:text-lg text-white/90 font-medium">
                    {currentMember.role}
                  </p>
                </div>

                {/* LinkedIn */}
                <a 
                  href={currentMember.linkedIn} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-base">in</span>
                  </div>
                  <span className="text-white font-medium">{currentMember.name}</span>
                </a>
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={prevSlide}
                className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>

              {/* Dots Indicator */}
              <div className="flex gap-2">
                {teamMembers.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentMobileIndex(idx)}
                    className={`transition-all duration-300 rounded-full ${
                      idx === currentMobileIndex
                        ? "w-8 h-3 bg-green-500"
                        : "w-3 h-3 bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to testimonial ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Counter */}
            <div className="text-center mt-4 text-gray-500 text-sm">
              {currentMobileIndex + 1} / {teamMembers.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}