"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Star, ArrowLeft, ArrowRight, Quote, CheckCircle2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for cleaner tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types (Matching your existing Mode type conceptually) ---
// Assuming 'startup' maps to 'Users' and 'enabler' maps to 'Enablers' based on your Header logic
export type Mode = "startup" | "enabler"; 

interface Review {
  id: string;
  name: string;
  role: string;
  company?: string;
  avatarUrl: string; // Using placeholder logic in this example
  rating: number;
  text: string;
}

// --- Dummy Data ---
const DATA: Record<Mode, Review[]> = {
  startup: Array.from({ length: 24 }).map((_, i) => ({
    id: `user-${i}`,
    name: i % 2 === 0 ? "Kyle Roberts" : "Sophia Anderson",
    role: i % 2 === 0 ? "Customer Web Director" : "Internal Integration Officer",
    avatarUrl: i % 2 === 0 ? "https://i.pravatar.cc/150?u=kyle" : "https://i.pravatar.cc/150?u=sophia",
    rating: 5,
    text: i % 2 === 0 
      ? "Website design did exactly what you said it does. Just what I was looking for. Nice work on your website design."
      : "I will let my mum know about this, she could really make use of software! Very easy to use. Since I invested in software I made over 100,000 dollars profits.",
  })),
  enabler: Array.from({ length: 24 }).map((_, i) => ({
    id: `enabler-${i}`,
    name: i % 2 === 0 ? "Stephen Brekke" : "Sarah Jenkins",
    role: i % 2 === 0 ? "Regional Operations Producer" : "Facility Manager",
    avatarUrl: i % 2 === 0 ? "https://i.pravatar.cc/150?u=stephen" : "https://i.pravatar.cc/150?u=sarah",
    rating: 5,
    text: "If you want real marketing that works and effective implementation - mobile app's got you covered. This has revolutionized how we manage our facility assets.",
  })),
};

interface StoriesSectionProps {
  mode: Mode;
}

export default function StoriesSection({ mode }: StoriesSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState<number>(0); // -1 for left, 1 for right
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Reset pagination when mode switches
  useEffect(() => {
    setCurrentPage(1);
    setDirection(0);
  }, [mode]);

  // Configuration - responsive items per page
  const isMobile = windowWidth < 768;
  const itemsPerPage = isMobile ? 3 : 6; // 3 for mobile, 6 for desktop
  const currentData = DATA[mode];
  const totalPages = Math.ceil(currentData.length / itemsPerPage);

  // Slice data for current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleReviews = currentData.slice(startIndex, startIndex + itemsPerPage);

  // Separate into 3 columns for the Masonry layout effect
  // We distribute items: 0->Col1, 1->Col2, 2->Col3, 3->Col1...
  const col1 = visibleReviews.filter((_, i) => i % 3 === 0);
  const col2 = visibleReviews.filter((_, i) => i % 3 === 1);
  const col3 = visibleReviews.filter((_, i) => i % 3 === 2);

  // Handlers
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setDirection(newPage > currentPage ? 1 : -1);
    setCurrentPage(newPage);
  };

  // Animation Variants
  const containerVariants: Variants = {
    hidden: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeIn" }
    })
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-br from-green-50/50 via-emerald-50/30 to-green-50/50 overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Background Glow Effect (Green) - Multiple blurs for better coverage */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-green-300/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-300/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-200/15 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
          Are my <span className="text-green-600 capitalize">{mode === 'startup' ? 'Users' : 'Enablers'}</span> happy?
        </h2>
      </div>

      {/* Reviews Grid Container with Animation */}
      <div className="max-w-7xl mx-auto min-h-[600px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage + mode} // Re-render on page or mode change
            custom={direction}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {/* Column 1 */}
            <div className="flex flex-col gap-6 lg:gap-8">
              {col1.map((review) => (
                <ReviewCard key={review.id} review={review} variants={itemVariants} />
              ))}
            </div>

            {/* Column 2 (Offset down for Masonry look on desktop, normal on mobile) */}
            <div className="flex flex-col gap-6 lg:gap-8 lg:pt-12">
              {col2.map((review) => (
                <ReviewCard key={review.id} review={review} variants={itemVariants} />
              ))}
            </div>

            {/* Column 3 (Hidden on mobile, shown on desktop) */}
            <div className="hidden md:flex flex-col gap-6 lg:gap-8">
              {col3.map((review) => (
                <ReviewCard key={review.id} review={review} variants={itemVariants} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination */}
      <div className="max-w-7xl mx-auto mt-20 flex items-center justify-center gap-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-gray-400 hover:text-green-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={cn(
                  "w-8 h-8 rounded-full text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-green-600 text-white shadow-md shadow-green-200 scale-110"
                    : "text-gray-500 hover:bg-gray-100"
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-400 hover:text-green-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
        >
          <ArrowRight size={20} />
        </button>
      </div>
    </section>
  );
}

// --- Review Card Component ---
function ReviewCard({ review, variants }: { review: Review; variants: any }) {
  return (
    <motion.div
      variants={variants}
      className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-shadow duration-300 border border-gray-50 relative group"
    >
      {/* Top Section: Avatar & Stars */}
      <div className="flex justify-between items-start mb-4">
        <img 
          src={review.avatarUrl} 
          alt={review.name} 
          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
        />
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={14} 
              className={cn(
                "fill-current", 
                i < review.rating ? "text-green-500" : "text-gray-200"
              )} 
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-600 text-sm leading-relaxed mb-6">
        "{review.text}"
      </p>

      {/* Footer: Name & Tag */}
      <div className="flex items-end justify-between border-t border-gray-100 pt-4 mt-auto">
        <div>
          <h4 className="text-sm font-bold text-gray-900">{review.name}</h4>
          <p className="text-xs text-gray-400 mt-0.5">{review.role}</p>
        </div>
        
        <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <CheckCircle2 size={12} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Testimonial</span>
        </div>
      </div>
    </motion.div>
  );
}