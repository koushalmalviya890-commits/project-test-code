"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Star,
  ArrowRight,
  ArrowLeft,
  HomeIcon,
  Beaker,
  Code,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Mail,
  Loader2,
  Car,
  Coffee,
  Check,
  Wifi,
  Wind,
  Camera,
  Phone,
  Printer,
  Droplets,
  Sun,
  Dumbbell,
  UtensilsCrossed,
  Users,
  CalendarRange,
  MoreHorizontal,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import Marquee from "@/components/layout/Marquee";
export default function ExploreServices() {
  const router = useRouter();
  const [featureSlide, setFeatureSlide] = useState(0);
const [featuredSlide, setFeaturedSlide] = useState(0);
    const [maxFeaturedSlides, setMaxFeaturedSlides] = useState(1);
    const [maxFeatureSlides, setMaxFeatureSlides] = useState(1);

    //   useEffect(() => {
    //     const adjustCardAlignment = () => {
    //       // For each tab, check if scrolling is needed and adjust alignment
    //       for (let i = 0; i < 4; i++) {
    //         const container = document.getElementById(`card-container-${i}`);
    //         if (container) {
    //           const parentScrollContainer = container.parentElement;
    
    //           if (parentScrollContainer) {
    //             const parentWidth = parentScrollContainer.clientWidth;
    //             const contentWidth = container.scrollWidth;
    
    //             // If content is wider than container, left align
    //             if (contentWidth > parentWidth) {
    //               container.style.marginLeft = "0";
    //               container.style.marginRight = "auto";
    //             } else {
    //               // Otherwise center
    //               container.style.marginLeft = "auto";
    //               container.style.marginRight = "auto";
    //             }
    //           }
    //         }
    //       }
    //     };
    
    //     // Run on mount, window resize, and tab change
    //     adjustCardAlignment();
    
    //     const handleResize = () => {
    //       adjustCardAlignment();
    //     };
    
    //     window.addEventListener("resize", handleResize);
    
    //     // Cleanup
    //     return () => {
    //       window.removeEventListener("resize", handleResize);
    //     };
    //   }, [featureSlide]); // Re-run when tab changes

    //     const nextFeatureSlide = () => {
    //       setFeatureSlide((current) =>
    //         current === maxFeatureSlides ? 0 : current + 1
    //       );
    //     };
      
    //     const prevFeatureSlide = () => {
    //       setFeatureSlide((current) =>
    //         current === 0 ? maxFeatureSlides : current - 1
    //       );
    //     };
      
        // Reset slides when screen size changes
        useEffect(() => {
          const handleResize = () => {
            setFeatureSlide(0);
            setFeaturedSlide(0);
          };
      
          window.addEventListener("resize", handleResize);
          return () => window.removeEventListener("resize", handleResize);
        }, []);
  
  return (
    <section className="text-center pt-8 md:pt-1 bg-white relative min-h-screen overflow-hidden px-4 md:px-0">
    <section className="py-16 sm:py-20 md:py-2 bg-white">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="flex flex-col items-center">
              <h2 className="text-2xl md:text-3xl font-medium">Explore</h2>
              <h2 className="text-5xl md:text-7xl font-bold text-green-500 mb-4 tracking-tight">
                Workspace
              </h2>
            </div>
            <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto">
              One-stop facility marketplace, offering flexible and
              cost-effective spaces for businesses, startups, and innovators.
            </p>
          </div>

            <div className="flex justify-center w-full">
              <div className="relative w-full max-w-[1400px] px-4">
                <div className="flex flex-nowrap gap-3 sm:gap-4 md:gap-5 lg:gap-6 overflow-x-auto scrollbar-hide pb-4 w-full px-2 sm:px-0">
                  {/* Container that centers when all cards fit, left-aligns when scrolling is needed */}
                  <div
                    id="card-container-0"
                    className="flex flex-nowrap gap-3 sm:gap-4 md:gap-5 lg:gap-6 min-w-min mx-auto"
                  >
                    {[
                      {
                        name: "Co-Working Spaces",
                        image: "/facilities/coworking-features.png",
                        description:
                          "A dynamic, tech-enabled workspace where freelancers, startups, and professionals connect, innovate, and grow.",
                      },
                      {
                        name: "Private Cabins",
                        image: "/facilities/private-cabins.png",
                        description:
                          "Dedicated private office spaces designed for teams seeking privacy, focus, and a professional environment.",
                      },
                      {
                        name: "Meeting Area",
                        image: "/facilities/meeting-area.jpeg",
                        description:
                          "Versatile meeting spaces equipped with modern technology for productive team collaborations and client presentations.",
                      },
                      {
                        name: "Board Rooms",
                        image: "/facilities/board-room.png",
                        description:
                          "Professional board rooms with premium furnishings and presentation tools for important meetings and discussions.",
                      },
                      {
                        name: "Raw Spaces",
                        image: "/facilities/raw-space.png",
                        description:
                          "Customizable blank canvas spaces that can be transformed to suit your specific business needs and requirements.",
                      },
                    ].map((item, index) => (
                      <Card
                        key={index}
                        className="flex-shrink-0 w-[calc(50vw-30px)] sm:w-[200px] h-[310px] bg-[#23bb4e] rounded-[30px] relative overflow-hidden cursor-pointer group"
                        onClick={() => router.push("/SearchPage")}
                      >
                        <CardContent className="p-0 h-full flex flex-col justify-between">
                          {/* Normal state */}
                          <div className="relative h-[275px] w-full">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-200 ease-in-out rounded-b-[30px]"
                            />
                          </div>
                          <div className="px-[40px] py-3 font-medium text-white text-lg tracking-[-1.40px] font-['Plus_Jakarta_Sans',Helvetica] group-hover:opacity-0 transition-opacity duration-200 ease-in-out">
                            {item.name}
                          </div>

                          {/* Hover state */}
                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out flex flex-col rounded-[30px]">
                            <div className="p-5 flex-grow">
                              <h3 className="text-xl font-bold text-gray-800 mb-3">
                                {item.name}
                              </h3>
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                            <div className="mt-auto bg-[#23bb4e] py-3 px-5 text-white flex items-center justify-center">
                              <span className="font-medium text-base mr-2">
                                Explore All
                              </span>
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          {/* )} */}

    <div>
      <button className="bg-green-500 text-white px-4 py-2 mt-20 rounded-lg shadow-md shadow-green-300">View All Workspaces</button>
    </div>
        </div>
      </section>
    </section>
  );
}
