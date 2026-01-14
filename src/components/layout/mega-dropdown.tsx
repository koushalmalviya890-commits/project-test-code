"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { getPropertyTypesForCategory } from "@/lib/category-mappings";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { AlertCircle, Rocket } from "lucide-react";

interface MegaDropdownProps {
  isOpen: boolean;
  title: string;
  items: {
    name: string;
    href: string;
  }[];
  backgroundImage: string;
}

export function MegaDropdown({
  isOpen,
  title,
  items,
  backgroundImage,
}: MegaDropdownProps) {
  const [mounted, setMounted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // Preload the background image
  useEffect(() => {
    if (backgroundImage) {
      const img = new (window.Image as any)() as HTMLImageElement;
      img.src = backgroundImage;
      img.onload = () => setImageLoaded(true);
      img.onerror = () => {
        // Still set as loaded even if there's an error to avoid blocking the UI
        setImageLoaded(true);
        console.error("Failed to preload image:", backgroundImage);
      };
    }
    setMounted(true);
  }, [backgroundImage]);

  if (!mounted) return null;

  // Animation variants for container
  const containerVariants: Variants = {
    hidden: {
      opacity: 0,
      height: 0,
      transformOrigin: "top",
    },
    visible: {
      opacity: 1,
      height: 400,
      transition: {
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1],
        when: "beforeChildren",
        staggerChildren: 0.02,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.15,
        ease: [0.16, 1, 0.3, 1],
        when: "afterChildren",
        staggerChildren: 0.015,
        staggerDirection: -1,
      },
    },
  };

  // Animation variants for content
 const contentVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.15,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.1,
      },
    },
  };

  // Animation variants for items
 const itemVariants: Variants = {
    hidden: { opacity: 0, y: 5, x: -3, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.12,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -3,
      scale: 0.98,
      transition: {
        duration: 0.08,
      },
    },
  };

  // Function to generate search URL with proper filters
  const getSearchUrl = (categoryName: string) => {
    const propertyTypes = getPropertyTypesForCategory(categoryName);

    // Create search params
    const searchParams = new URLSearchParams();

    // Add property types as a comma-separated list
    if (
      propertyTypes &&
      propertyTypes.length > 0 &&
      propertyTypes[0] !== "All"
    ) {
      searchParams.set("propertyTypes", propertyTypes.join(","));
    }

    // Add category name as a search term
    searchParams.set("category", categoryName);

    // Set default sort
    searchParams.set("sortBy", "newest");

    return `/SearchPage?${searchParams.toString()}`;
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed left-0 right-0 w-full overflow-hidden"
          style={{
            top: "80px",
            zIndex: 90,
            willChange: "opacity, height",
            opacity: 0, // Start with opacity 0 to prevent flash
          }}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
        >
          <div className="w-full h-full relative font-jakarta">
            {/* Combined background and overlay to prevent flash */}
            <motion.div
              className="absolute inset-0 bg-center bg-cover"
              style={{
                backgroundImage: `url(${backgroundImage})`,
                filter: "blur(4px) brightness(0.45)", // Slightly increased brightness
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              variants={contentVariants}
            />

            {/* Gradient overlay with heavier blur on the left - applied immediately */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 via-black/55 to-black/30" // Added more gradient stops
              initial={{ opacity: 1 }} // Start fully visible
              variants={contentVariants}
            >
              {/* Varying blur effect - stronger on the left, lighter on the right */}
              <div
                className="absolute inset-0"
                style={{
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  maskImage:
                    "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.25) 100%)", // More gradient stops
                  WebkitMaskImage:
                    "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.25) 100%)", // More gradient stops
                  willChange: "backdrop-filter",
                }}
              />

              {/* Subtle vignette effect for depth */}
              <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40" />
            </motion.div>

            {/* Content */}
            <div className="container mx-auto max-w-[1400px] w-full h-full relative z-10 px-4">
              <div className="flex w-full pt-10">
                <motion.div
                  className="flex flex-col h-full justify-center"
                  variants={contentVariants}
                >
                  {/* Title */}
                  <div className="mb-12">
                    <motion.h2
                      className="text-5xl font-bold text-white mb-6 tracking-tight drop-shadow-sm"
                      variants={contentVariants}
                    >
                      {title}
                      <Image
                        src="/cummasymbol.svg"
                        alt=""
                        width={16}
                        height={16}
                        className="mt-7 ml-1 inline-block"
                      />
                    </motion.h2>
                    <motion.div
                      className="w-16 h-1 bg-green-500 mb-6"
                      variants={contentVariants}
                    />
                    <motion.p
                      className="text-white/80 max-w-md font-medium drop-shadow-sm"
                      variants={contentVariants}
                    >
                      Explore our {title.toLowerCase()} solutions designed for
                      modern businesses
                    </motion.p>
                  </div>

                  {/* Categories in a single line */}
                  <div className="flex justify-start gap-[50px]">
                    <div className="flex flex-wrap gap-x-12 gap-y-4">
                      {items.map((item, index) => (
                        <motion.div
                          key={item.name}
                          variants={itemVariants}
                          custom={index}
                          className="origin-left"
                        >
                          <Link
                            href={getSearchUrl(item.name)}
                            className="dropdown-item group flex items-center text-white hover:text-green-400 transition-all duration-200"
                          >
                            <span className="relative text-xl font-jakarta font-medium group-hover:scale-105 transition-transform duration-200 tracking-wide drop-shadow-sm">
                              {item.name}
                            </span>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                    <button
                      className="bg-transparent text-[20px] text-green-500 border border-green-500 px-4 py-2 rounded-lg ml-20"
                      onClick={() => {
                        if (!session) {
                          router.push("/sign-up/service-provider");
                        } else if (
                          session.user?.userType === "Service Provider"
                        ) {
                          router.push("/service-provider/my-facilities");
                        } else {
                          toast.error(
                            "A Service Provider account is required to list facilities",
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
                      {title.toLowerCase().includes("facilit")
                        ? "List your facilities"
                        : "List your workspace"}
                      <Rocket className="inline-block ml-2" />
                    </button>
                  </div>
                </motion.div>
                <motion.div
                  className=""
                  variants={contentVariants}
                ></motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
