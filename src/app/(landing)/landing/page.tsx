"use client";

import Link from "next/link";
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
  Rocket,
  CalendarRange,
  MoreHorizontal,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FacilityBadge } from "@/components/ui/facility-badge";
import { cn } from "@/lib/utils";
import {
  FacilityCard,
  FacilityCardSkeleton,
} from "@/components/ui/facility-card";
import { ExploreEnablers } from "@/components/sections/explore-enablers";
import { NewsletterSignup } from "@/components/sections/newsletter-signup";

// Import AMENITY_ICONS from components
import { AMENITY_ICONS } from "@/components";

// Dummy data for featured facilities
const featuredFacilities = [
  {
    id: 1,
    name: "Modern Co-working Space",
    description:
      "A vibrant workspace designed for productivity and collaboration.",
    image: "/facilities/coworking-1.jpg",
  },
  {
    id: 2,
    name: "Bio Research Lab",
    description:
      "State-of-the-art laboratory facilities for biotechnology research.",
    image: "/facilities/lab-1.jpg",
  },
  {
    id: 3,
    name: "Private Office Suite",
    description: "Fully furnished private offices for teams of all sizes.",
    image: "/facilities/office-1.jpg",
  },
];

// Dummy data for reviews
const reviews = [
  {
    id: 1,
    name: "Vasanthan Selvam",
    businessType: "CEO, EDII PERIYAKULAM HORTI BUSINESS INCUBATION FORUM",
    rating: 4.5,
    text: "Glad to share that onboarding in CUMMA was hassle free and user friendly. Uploaded the facilities of our Incubation Forum so that the startups can utilise them. Wishes to the Team CUMMA.",
    logo: "/reviews/vasanthan-selvam.jpeg",
  },
  {
    id: 2,
    name: "Sudhakar",
    businessType: "Entrepreneur in Residence Aquaconnect",
    rating: 5.0,
    text: "Efficiency has long been the silent struggle of startups — which often go unnoticed Cumma turns that struggle into strategy, enabling founders to do more with less, and move faster with focus.",
    logo: "/reviews/sudhakar.jpeg",
  },
  {
    id: 3,
    name: "Pon Maa Kishan",
    businessType: "Co-ordinator, Hindustan TBI",
    rating: 5.0,
    text: "Congratulations on the grand inauguration of Cumma Platform! This marks the beginning of an exciting journey, filled with innovation and endless possibilities. Wishing the team great success in achieving new milestones and making a lasting impact.",
    logo: "/reviews/pon-maa-kishan.jpeg",
  },
  {
    id: 4,
    name: "Ajith PK",
    businessType: "Founder & CEO - Plaskon Plastics",
    rating: 4.0,
    text: "As a startup, I struggled to find the workspace, R&D space. I am very happy that Cumma takes the finest step to solve the problem of stressing the entrepreneurs out there. My best wishes for cumma for their launch of this amazing product.",
    logo: "/reviews/ajith-plaskon.jpeg",
  },
  {
    id: 5,
    name: "Dr.Anand Thirunavukarasou",
    businessType: "SRIIC Chennai",
    rating: 4.5,
    text: "cumma is a game-changer for the startup ecosystem. At SRIIC, we see tremendous value in this platform, as it optimizes the utilization of incubation resources and fosters greater collaboration among entrepreneurs.",
    logo: "/reviews/anand-thirunavukarasou.jpeg",
  },
];

// Dummy data for trusted brands
const trustedBrands = [
  {
    name: "Weebsite Studio",
    logo: "/brands/weebsite-studio.png",
  },
  {
    name: "Creative Poster Designer",
    logo: "/brands/creative-poster.png",
  },
  {
    name: "Artifex",
    logo: "/brands/artifex.png",
  },
  {
    name: "Madrasi Buddha",
    logo: "/brands/madrasi-buddha.png",
  },
  {
    name: "Proud International",
    logo: "/brands/proud-international.png",
  },
  {
    name: "Man & Rani",
    logo: "/brands/man-and-rani.png",
  },
  {
    name: "Online Education Channel",
    logo: "/brands/online-education.png",
  },
];

const facilityTypes = [
  {
    name: "Co-working Space",
    available: "22 Available",
    image: "/facilities/coworking.jpg",
  },
  {
    name: "Private Cabins",
    available: "7 Available",
    image: "/facilities/cabin.jpg",
  },
  {
    name: "Meeting Rooms",
    available: "10 Available",
    image: "/facilities/meeting.jpg",
  },
  {
    name: "Training Halls",
    available: "15 Available",
    image: "/facilities/training.jpg",
  },
  {
    name: "Labs",
    available: "22 Available",
    image: "/facilities/lab.jpg",
  },
  {
    name: "Equipments",
    available: "135 Available",
    image: "/facilities/equipment.jpg",
  },
  {
    name: "Validation & Analysis",
    available: "3 Available",
    image: "/facilities/validation.jpg",
  },
];

interface FeaturedFacility {
  _id: string;
  details: {
    name: string;
    images: string[];
    rentalPlans?: Array<{
      name: string;
      price: number;
      duration: string;
    }>;
  };
  address: string;
  features: string[];
  serviceProvider?: {
    serviceName: string;
    features?: string[];
  };
  facilityType: string;
  isFeatured: boolean;
}

export default function Home() {
  const { data: session } = useSession();
  // const [activeTab, setActiveTab] = useState("facility");
    const [activeTab, setActiveTab] = useState<string[]>(["facility"])
    const toggleTab = (value: string) => {
    setActiveTab((prev) =>
      prev.includes(value)
        ? prev.filter((tab) => tab !== value)
        : [...prev, value]
    )
  }
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [featuredFacilities, setFeaturedFacilities] = useState<
    FeaturedFacility[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [featureSlide, setFeatureSlide] = useState(0);
  const [featuredSlide, setFeaturedSlide] = useState(0);
  const [maxFeaturedSlides, setMaxFeaturedSlides] = useState(1);
  const [maxFeatureSlides, setMaxFeatureSlides] = useState(1);
  const [testimonialSlide, setTestimonialSlide] = useState(0); // Start from the first card
  const maxTestimonialSlides = 4; // Total number of testimonial slides minus 1

  // Track hovered card index
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  // Calculate max slides based on window width
  useEffect(() => {
    const calculateMaxSlides = () => {
      // Calculate for featured facilities
      if (!featuredFacilities.length) {
        setMaxFeaturedSlides(0);
      } else {
        const itemsPerView =
          typeof window !== "undefined"
            ? window.innerWidth >= 1024
              ? 4
              : window.innerWidth >= 768
                ? 2
                : 1
            : 1;
        setMaxFeaturedSlides(
          Math.max(0, Math.ceil(featuredFacilities.length / itemsPerView) - 1)
        );
      }

      // Calculate for features
      const itemsPerView =
        typeof window !== "undefined"
          ? window.innerWidth >= 1024
            ? 4
            : window.innerWidth >= 768
              ? 3
              : 1
          : 1;
      setMaxFeatureSlides(
        Math.max(0, Math.ceil(facilityTypes.length / itemsPerView) - 1)
      );
    };

    // Initial calculation
    calculateMaxSlides();

    // Add resize listener
    window.addEventListener("resize", calculateMaxSlides);

    // Cleanup
    return () => window.removeEventListener("resize", calculateMaxSlides);
  }, [featuredFacilities.length]);

  // Handle dynamic card alignment based on whether scrolling is needed
  useEffect(() => {
    const adjustCardAlignment = () => {
      // For each tab, check if scrolling is needed and adjust alignment
      for (let i = 0; i < 4; i++) {
        const container = document.getElementById(`card-container-${i}`);
        if (container) {
          const parentScrollContainer = container.parentElement;

          if (parentScrollContainer) {
            const parentWidth = parentScrollContainer.clientWidth;
            const contentWidth = container.scrollWidth;

            // If content is wider than container, left align
            if (contentWidth > parentWidth) {
              container.style.marginLeft = "0";
              container.style.marginRight = "auto";
            } else {
              // Otherwise center
              container.style.marginLeft = "auto";
              container.style.marginRight = "auto";
            }
          }
        }
      }
    };

    // Run on mount, window resize, and tab change
    adjustCardAlignment();

    const handleResize = () => {
      adjustCardAlignment();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [featureSlide]); // Re-run when tab changes

  const totalSlides = Math.ceil(facilityTypes.length - 4);

  const nextSlide = () => {
    setCurrentSlide((current) => (current === totalSlides ? 0 : current + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((current) => (current === 0 ? totalSlides : current - 1));
  };

  const getBookingLink = () => {
    if (!session?.user) return "/sign-up";
    return session.user.userType === "startup"
      ? "/startup/bookings"
      : "/service-provider/dashboard";
  };

  const getPropertyTypesByTab = (tab: string) => {
    switch (tab) {
      case "offices":
        return [
          "Individual Cabin",
          "Coworking space",
          "Meeting Room",
          "Raw Space Office",
        ];
      case "labs":
        return [
          "Bio Allied",
          "Manufacturing",
          "Prototype Labs",
          "Raw Space Lab",
        ];
      case "software":
        return ["Software", "SaaS Allied"];
      case "all":
        return ["All"]; // Return 'All' for no filtering
      default:
        return ["All"];
    }
  };

  // const handleSearch = () => {
  //   setIsSearching(true);
  //   const searchParams = new URLSearchParams();

  //   if (searchTerm) {
  //     searchParams.set("search", searchTerm);
  //   }

  //   // Add property types based on active tab
  //   const propertyTypes = getPropertyTypesByTab(activeTab);
  //   if (propertyTypes.length > 0) {
  //     searchParams.set("propertyTypes", propertyTypes.join(","));
  //   }

  //   // Set default sort
  //   searchParams.set("sortBy", "newest");

  //   router.push(`/SearchPage?${searchParams.toString()}`);
  // };
const handleSearch = () => {
  setIsSearching(true);
  const searchParams = new URLSearchParams();

  if (searchTerm) {
    searchParams.set("search", searchTerm);
  }

  searchParams.set("searchScope", activeTab.join(",")); // <- Send the tab names as a comma-separated string to backend
  searchParams.set("sortBy", "newest");

  const propertyTypes = activeTab.flatMap((tab) => getPropertyTypesByTab(tab));
  if (propertyTypes.length > 0) {
    searchParams.set("propertyTypes", propertyTypes.join(","));
  }

  router.push(`/SearchPage?${searchParams.toString()}`);
};

  const fetchFeaturedFacilities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        "/api/facilities/search?" +
          new URLSearchParams({
            isFeatured: "true",
            limit: "8",
          })
      );
      if (!response.ok) throw new Error("Failed to fetch featured facilities");
      const data = await response.json();

      // Log the data structure to debug
     // console.log("Featured facilities data:", data.facilities[0]);

      // Ensure the data structure is correct for the FacilityCard component
      const formattedFacilities = data.facilities.map((facility: any) => {
        // Log the rental plans to debug
        //// console.log(
        //   `Facility ${facility._id} rental plans:`,
        //   facility.details?.rentalPlans
        // );

        return {
          _id: facility._id,
          details: {
            name: facility.details.name,
            images: facility.details.images || [],
            rentalPlans: facility.details.rentalPlans || [],
          },
          address: facility.address,
          features: facility.features || [],
          serviceProvider: facility.serviceProvider,
          facilityType: facility.facilityType || "Other",
          isFeatured: facility.isFeatured,
        };
      });

      setFeaturedFacilities(formattedFacilities);
    } catch (error) {
      console.error("Error fetching featured facilities:", error);
      setError("Failed to load featured facilities");
    } finally {
      setLoading(false);
    }
  };

  // Fetch featured facilities
  useEffect(() => {
    fetchFeaturedFacilities();
  }, []);

  const nextFeaturedSlide = () => {
    setFeaturedSlide((current) =>
      current === maxFeaturedSlides ? 0 : current + 1
    );
  };

  const prevFeaturedSlide = () => {
    setFeaturedSlide((current) =>
      current === 0 ? maxFeaturedSlides : current - 1
    );
  };

  const nextFeatureSlide = () => {
    setFeatureSlide((current) =>
      current === maxFeatureSlides ? 0 : current + 1
    );
  };

  const prevFeatureSlide = () => {
    setFeatureSlide((current) =>
      current === 0 ? maxFeatureSlides : current - 1
    );
  };

  // Reset slides when screen size changes
  useEffect(() => {
    const handleResize = () => {
      setFeatureSlide(0);
      setFeaturedSlide(0);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Add keyframes for the facility type badge hover effect to the global styles
  useEffect(() => {
    // Add keyframes for the facility type badge hover effect
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes badgeSlideIn {
        from { max-width: 0; opacity: 0; }
        to { max-width: 200px; opacity: 1; }
      }
      
      @keyframes badgeSlideOut {
        from { max-width: 200px; opacity: 1; }
        to { max-width: 0; opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const nextTestimonialSlide = () => {
    setTestimonialSlide((current) =>
      current === maxTestimonialSlides ? 0 : current + 1
    );
  };

  const prevTestimonialSlide = () => {
    setTestimonialSlide((current) =>
      current === 0 ? maxTestimonialSlides : current - 1
    );
  };

  return (
    <div className="font-jakarta">
      {/* Hero Section */}
      <div className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center py-16 md:py-24">
        {/* Background Video/GIF with Overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/hero-bg.jpg"
            alt="Hero Background"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/80" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center pt-8 md:pt-12">
          <div className="flex flex-col items-center mb-0">
            <Image
              src="/logo-green.png"
              alt="Cumma Logo"
              width={580}
              height={190}
              className="mb-1"
            />
            <div className="relative">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-12">
                Access{" "}
                <span className="relative inline-block">
                  {/* New SVG */}
                  <svg
                    className="absolute -inset-3 sm:-inset-4 md:-inset-5 lg:-inset-6 w-[calc(100%+2.5rem)] sm:w-[calc(100%+3.5rem)] md:w-[calc(100%+4.5rem)] lg:w-[calc(100%+5.5rem)] h-[calc(100%+2rem)] sm:h-[calc(100%+3rem)] md:h-[calc(100%+4rem)] lg:h-[calc(100%+5rem)] -z-10 -translate-x-[8%] -translate-y-[10%]"
                    viewBox="0 0 448 156"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M220.54.111c-.135.075-5.996.258-13.047.406-7.053.15-13.101.392-13.47.542s-3.844.353-7.724.451c-3.878.099-8.813.507-10.965.905-2.143.396-6.596 1.062-9.84 1.472-8.391 1.06-9.316 1.212-11.918 1.943-1.269.357-3.13.664-4.089.676-.972.012-2.681.331-3.81.71-2.014.676-12.272 2.782-16.432 3.375-1.27.182-2.752.6-3.385.954-.63.355-2.574.962-4.409 1.38-1.833.418-3.45.894-3.669 1.084-.215.189-2.361.73-4.83 1.22-2.469.488-4.852 1.091-5.36 1.354-1.408.727-5.218 2.085-9.66 3.446-2.116.649-3.878 1.394-3.878 1.64 0 .244-1.375.69-2.998.972-1.62.281-3.871 1.153-4.901 1.898-1.061.768-2.81 1.509-3.948 1.673-1.129.161-2.63.7-3.349 1.198-.716.497-1.654.904-2.082.904-.424 0-1.482.412-2.327.909-1.833 1.074-9.102 4.336-9.661 4.336-.234 0-2.045 1.013-4.02 2.246-7.194 4.494-10.678 6.533-11.567 6.766-1.761.463-6.983 3.863-6.983 4.548 0 .363-.46.678-.987.678-.544 0-1.79.588-2.776 1.31-3.023 2.216-6.602 5.328-6.602 5.742 0 .195-1.02.851-2.22 1.423s-2.223 1.436-2.223 1.876-.6 1.052-1.304 1.334c-.725.29-2.084 1.492-3.068 2.712-.981 1.22-2.045 2.191-2.399 2.191-.344 0-.667.384-.704.836s-.72 1.492-1.482 2.26c-.762.769-1.605 1.756-1.833 2.148-.24.408-.747 1.108-1.162 1.605-.418.496-.867 1.215-1.027 1.649-1.251 3.344-2.186 5.165-2.967 5.786-1.34 1.062-1.851 4.204-1.934 11.842-.09 8.272.015 9.403.889 9.752.387.155.704.689.704 1.186s.316.905.704.905c.381 0 .54.542.353 1.174-.196.658.314 1.922 1.163 2.87.848.949 1.516 2.014 1.516 2.418 0 .406.587 1.289 1.34 2.012.741.713 2.303 2.237 3.493 3.413 4.77 4.7 17.438 12.708 22.883 14.46 1.624.522 3.76 1.413 4.726 1.97.962.556 2.644 1.305 3.702 1.65s2.614.981 3.42 1.401c.805.418 4.018 1.468 7.053 2.306 3.032.835 6.085 1.823 6.7 2.164 1.344.745 15.87 4.783 18.477 5.137 1.014.138 4.16.818 7.053 1.528 5.29 1.297 11.159 2.394 15.233 2.846 1.27.141 2.937.463 3.668.709.735.248 2.679.451 4.302.451 1.624 0 3.155.205 3.385.452.231.246 2.362.607 4.69.79 2.327.185 4.762.504 5.359.7.606.201 3.244.512 5.925.701 2.678.187 5.083.44 5.396.566.308.124 2.15.319 4.056.429 1.903.111 4.597.318 5.925.452 2.328.238 2.414.195 1.974-.972-.289-.769-.144-1.22.388-1.22.461 0 1.055.678 1.304 1.492.415 1.356.651 1.464 2.573 1.198 1.199-.167 2.666-.108 3.386.134 5.663 1.908 71.228 2.909 78.774 1.204 1.761-.398 2.979-.467 3.244-.185.255.272.691.353 1.091.203.366-.136 3.527-.331 6.983-.429 3.456-.099 7.413-.397 8.745-.655 1.344-.262 4.726-.607 7.545-.768s5.729-.517 6.488-.791c.757-.274 3.386-.589 5.855-.699 2.469-.113 5.427-.528 6.592-.927 1.193-.407 3.21-.723 4.619-.723 1.377 0 4.867-.508 7.758-1.129s5.46-1.009 5.713-.859c.249.148 1.233.029 2.149-.258 2.398-.749 17.326-3.901 18.476-3.901.545 0 3.349-.752 6.242-1.673 2.891-.92 5.698-1.673 6.242-1.673.532 0 2.011-.396 3.21-.859 1.2-.463 3.131-1.005 4.198-1.175 3.173-.508 14.325-3.985 15.367-4.791.551-.425 2.3-.898 3.921-1.062 1.62-.163 3.099-.565 3.315-.904.215-.341 1.34-.862 2.539-1.175 1.2-.315 2.15-.755 2.15-.995 0-.227.636-.43 1.34-.43.729 0 3.174-.855 5.36-1.876a241 241 0 0 1 7.545-3.344c1.974-.822 3.527-1.677 3.527-1.944 0-.256 1.024-.703 2.223-.971 1.2-.268 2.22-.652 2.22-.836s1.553-1.054 3.386-1.898c1.832-.845 3.693-2.077 4.055-2.69.376-.632 1.135-1.129 1.729-1.129 1.801 0 16.007-9.627 16.007-10.849 0-.266.67-.727 1.445-.995.772-.266 1.676-.972 1.94-1.514.262-.54 1.289-1.537 2.187-2.124.922-.603 1.934-1.786 2.223-2.6.289-.813 1.171-1.901 1.94-2.396.787-.504 1.411-1.334 1.411-1.876 0-.538.806-1.74 1.799-2.69s1.627-1.89 1.411-2.101c-.202-.201 0-.384.425-.384.464 0 .735-.747.633-1.74-.104-1.041.194-1.823.741-1.944.52-.116.917-.79.917-1.558 0-.77.35-1.494.811-1.674.489-.19.643-.971.388-1.966-.268-1.041-.046-2.026.599-2.667.794-.79.96-2.554.744-7.887-.304-7.457-1.067-9.601-5.255-14.78-.547-.678-1.023-1.56-1.023-1.898 0-.982-7.22-7.548-11.43-10.396-7.351-4.972-16.659-10.441-17.766-10.441-.314 0-1.691-.633-3.102-1.425-1.412-.79-2.977-1.423-3.527-1.423-.566 0-1.427-.339-2.011-.79-.569-.44-2.998-1.393-5.464-2.146-2.46-.751-8.253-2.61-12.976-4.166-8.566-2.82-10.368-3.311-19.255-5.237-2.61-.565-5.405-1.24-6.134-1.48-1.756-.577-7.121-1.695-9.802-2.041a620 620 0 0 1-9.24-1.25c-1.814-.258-5.993-.768-9.24-1.127-3.244-.359-6.771-.86-7.792-1.108-1.03-.25-4.901-.603-8.64-.79s-8.539-.642-10.719-1.017c-2.189-.376-6.275-.682-9.169-.688-6.629-.012-24.679-1.17-27.858-1.787-7.687-1.494-20.804-2.65-28.491-2.517-2.045.036-5.111-.128-6.771-.364-1.7-.24-3.149-.37-3.287-.296m15.199 4.468c.317.181-.987.349-2.961.38-4.585.073-29.924 2.871-30.961 3.421-.424.225-2.115.524-3.739.66-4.935.416-17.735 2.695-20.521 3.654-.707.245-1.94.438-2.786.438-.845 0-1.703.319-1.94.723-.224.382-.987.73-1.62.735-1.529.016-6.488 1.116-9.379 2.081-1.27.424-2.736.765-3.351.777-.588.011-1.762.337-2.54.7-.775.364-1.986.677-2.611.677-.636 0-3.668.777-6.7 1.719-3.031.94-7.05 2.045-8.886 2.44-1.833.396-3.843.989-4.443 1.31-.6.323-2.082.741-3.281.926s-2.998.747-3.985 1.244-2.226.905-2.752.905c-.51 0-1.673.587-2.506 1.265-2.22 1.807-.913 2.406 2.611 1.196 2.558-.877 6.063-1.87 10.297-2.91.821-.202 4.548-1.132 8.358-2.082 3.809-.952 7.364-1.716 7.97-1.716.618 0 1.78-.52 2.681-1.199.898-.678 2.275-1.198 3.173-1.198.846 0 1.851-.158 2.149-.339.339-.203.763-.345 1.058-.357.563-.02 3.244-.678 9.732-2.386 2.257-.593 4.754-1.24 5.572-1.439a986 986 0 0 1 6.312-1.492c2.681-.626 5.492-1.22 6.313-1.334.805-.11 4.019-.652 7.053-1.186 6.983-1.232 13.76-2.168 16.503-2.277 1.175-.047 3.985-.386 6.313-.762 2.327-.377 6.629-.808 9.661-.972s5.654-.366 5.888-.459c.449-.175 18.901-.89 21.933-.851 3.668.047 14.611 1.492 15.728 2.073.492.258 1.208.364 1.552.23.351-.135 1.27.058 2.045.43.778.375 2.328.686 3.456.696 1.947.015 6.488 1.111 11.002 2.652 1.058.361 2.663.674 3.456.674.846 0 1.873.3 2.398.702.502.382 1.446.7 2.082.7.637 0 4.619 1.076 8.779 2.372 6.066 1.89 8.379 2.373 11.355 2.373 2.045 0 3.739-.215 3.739-.475 0-.272-.317-.475-.741-.475-.409 0-1.374-.398-2.149-.883-1.325-.83-3.173-1.328-12.696-3.429-2.186-.483-4.775-1.216-5.676-1.61-.917-.4-2.162-.723-2.786-.723-.637 0-1.129-.207-1.129-.475 0-.254-.67-.475-1.445-.475s-1.654-.209-1.894-.451c-.51-.517-7.733-1.898-9.919-1.898-.846 0-1.553-.237-1.553-.52 0-.322.916-.426 2.398-.272 1.326.138 5.538.49 9.415.79 3.881.3 9.179.765 11.848 1.04 2.681.276 6.811.684 9.273.919 8.948.847 11.989 1.257 22.216 3.005 5.713.976 11.54 1.94 12.976 2.146 2.398.343 4.867.885 8.462 1.859 10.297 2.785 12.09 3.295 15.586 4.426 1.224.396 3.739 1.183 5.713 1.788 3.576 1.093 6.067 2.057 17.702 6.854 3.527 1.452 6.608 2.645 6.841 2.645.554 0 14.618 8.994 18.449 11.797 1.544 1.129 2.78 2.224 2.78 2.463 0 .246.317.43.741.43.4 0 .741.541.741 1.174s.357 1.319.775 1.484c2.205.877 5.359 7.556 6.257 13.252.163 1.04.698 2.727 1.181 3.728.566 1.175.63 1.943.175 2.148-.396.178-.781 1.13-.882 2.17-.099 1.04-.332 2.002-.529 2.192-.206.197.104.575.741.904.707.367.879.836.489 1.334-2.171 2.757-3.013 4.549-2.611 5.56.323.814.099 1.265-.731 1.468-.64.156-1.2.769-1.2 1.31 0 .558-1.002 2.283-2.223 3.82-1.217 1.537-2.22 3.22-2.22 3.728 0 .515-.987 1.65-2.223 2.555-1.233.904-2.426 2.15-2.681 2.802-.246.633-.686 1.175-.953 1.175-.271 0-1.759 1.243-3.278 2.735s-4.597 3.701-6.771 4.86c-2.186 1.165-4 2.349-4.019 2.621-.018.274-.953 1.064-2.081 1.762-1.129.697-2.537 1.59-3.14 1.988-2.395 1.583-12.591 6.916-13.222 6.916-.396 0-1.798.62-3.21 1.425-1.411.802-3.52 1.641-4.83 1.921-1.27.272-2.518.806-2.752 1.175-.237.378-1.092.678-1.94.678-.846 0-1.688.299-1.904.677-.212.373-2.54 1.352-5.147 2.17-2.611.818-5.027 1.778-5.35 2.125-.674.723-5.286 1.791-6.181 1.43-.347-.139-.633-.029-.633.243 0 .282-.812.625-1.869.79-1.058.168-1.87.471-1.87.702 0 .236-.354.406-.846.406-.79 0-7.474 1.89-13.612 3.847-1.62.518-3.471.934-4.089.922-.606-.012-1.799.282-2.574.633-.793.358-2.611.817-4.019 1.016-1.411.2-3.084.525-3.702.72-3.456 1.096-6.866 1.882-9.381 2.166-1.621.181-3.542.553-4.373.845-.845.298-1.752.469-2.115.402-.689-.128-5.572.891-6.7 1.397-.428.194-2.432.501-4.477.688s-4.775.623-6.101.972c-1.322.349-3.489.632-4.83.632-1.347 0-3.914.308-5.747.688-3.468.72-12.554 1.66-18.83 1.949-1.974.091-3.804.369-4.056.617-.261.258-1.092.308-1.94.112-.793-.181-2.398-.171-3.456.022-3.453.629-14.67 1.064-28.35 1.098-7.334.018-13.726.197-14.212.396-.467.191-1.694.181-2.611-.024-.947-.211-4.231-.435-7.262-.496-3.06-.063-8.853-.345-12.942-.631-7.632-.534-8.816-.601-20.03-1.149-3.668-.179-7.213-.514-7.933-.753-.907-.299-1.798-.209-2.927.294-1.341.597-1.756.621-2.383.136-.938-.723-8.188-1.957-9.181-1.563-.348.138-2.715-.156-5.255-.652-2.54-.497-5.064-.792-5.606-.657-.553.14-2.257 0-3.88-.319-3.263-.64-7.758-1.273-13.259-1.868-2.115-.229-4.437-.627-5.218-.897-1.448-.498-7.263-1.76-14.67-3.181-2.469-.473-5.602-1.214-7.053-1.667-1.421-.443-4.973-1.401-7.792-2.101-2.82-.701-5.504-1.484-5.888-1.718-.397-.241-1.2-.43-1.833-.43-.615 0-3.49-.979-6.313-2.146-2.82-1.169-5.473-2.148-5.817-2.148-.341 0-1.657-.54-2.857-1.175-1.199-.634-3.08-1.31-4.09-1.47-1.042-.163-2.979-1.084-4.372-2.079s-3.566-2.065-4.9-2.418c-1.341-.353-3.051-1.161-3.881-1.831-.84-.678-2.245-1.608-3.244-2.142-4.868-2.607-12.112-8.189-13.271-10.22-.23-.406-1.003-1.22-1.753-1.853-.75-.632-1.34-1.527-1.34-2.034 0-.496-.51-1.537-1.129-2.305-.618-.769-1.254-1.993-1.411-2.712-.157-.727-.643-2.576-1.092-4.159-1.31-4.611-1.485-7.25-.535-8.135.504-.47 1.003-1.83 1.098-3.005s.51-2.537.916-3.006c.403-.465.643-1.468.529-2.191s.181-1.85.649-2.463c3.268-4.295 6.122-8.721 6.122-9.494 0-.496.332-.904.74-.904.4 0 .954-.542 1.2-1.175.246-.632.75-1.174 1.092-1.174.347 0 1.497-1.084 2.54-2.397 1.042-1.31 2.558-2.814 3.348-3.322.775-.497 1.445-1.242 1.445-1.605 0-.372 2.337-2.236 5.184-4.136 2.848-1.898 5.184-3.733 5.184-4.068 0-.315.443-.61.917-.61 1.199 0 6.488-3.353 6.488-4.114 0-.323.916-.912 2.044-1.31 1.117-.395 3.054-1.402 4.262-2.215 2.488-1.674 8.025-4.25 9.135-4.25.39 0 1.904-.738 3.386-1.649 1.472-.906 5.396-2.74 8.71-4.067 3.315-1.33 6.698-2.827 7.513-3.323.845-.517 2.084-.905 2.89-.905.76 0 2.192-.542 3.102-1.174.917-.637 3.069-1.486 4.69-1.853 1.62-.366 4.307-1.206 5.854-1.83 1.553-.627 4.031-1.443 5.43-1.786 1.405-.345 4.689-1.352 7.229-2.215s5.249-1.583 5.959-1.583c.701 0 1.974-.325 2.752-.7.775-.376 1.903-.71 2.432-.723.551-.011 2.786-.544 5.043-1.198s4.446-1.174 4.935-1.174c.477 0 1.903-.343 3.103-.745 1.233-.414 4.197-1.027 6.663-1.38 2.469-.35 5.43-.853 6.663-1.13 1.227-.273 4.056-.728 6.312-1.014 5.077-.643 9.419-1.366 11.777-1.96 1.005-.251 4.514-.573 7.758-.709s6.946-.524 8.179-.859c1.254-.339 4.231-.64 6.7-.678 2.451-.037 10.931-.222 18.901-.414 13.342-.319 20.241-.069 21.736.79M33.685 31.297c-1.5.842-4.16 2.405-5.854 3.44-1.694 1.034-5.218 3.09-7.758 4.52-2.534 1.427-6.39 4.022-8.462 5.696s-4.034 3.184-4.302 3.314c-.498.243-3.431 3.6-5.91 6.766-1.417 1.807-1.857 3.69-.857 3.671.307-.005 1.737-1.523 3.139-3.332 1.402-1.807 2.832-3.323 3.14-3.323.304 0 1.472-.926 2.54-2.012 1.063-1.084 2.185-2.115 2.431-2.237.253-.124 3.417-2.35 7.063-4.972 5.852-4.204 14.704-9.948 15.891-10.313.234-.07 1.23-.717 2.226-1.44 2.63-1.916.24-1.755-3.287.222m2.608 9.836c0 .246-.458.475-.953.475-.523 0-3.49 1.559-6.596 3.465-5.783 3.551-10.814 7.833-12.816 10.91-1.03 1.582-1.033 1.764-.018 1.764 1.18 0 5.572-3.526 5.572-4.476 0-.298.922-1.175 2.044-1.943a59 59 0 0 0 4.004-3.075c2.044-1.746 2.838-2.254 7.847-5.021 3.314-1.83 3.905-2.572 2.044-2.572-.633-.002-1.128.205-1.128.473m409.535 62.873c0 .394-.818 1.265-1.87 1.989-1.048.723-1.869 1.555-1.869 1.898 0 .337-.458.782-1.024.995-.557.209-1.716 1.22-2.54 2.215s-2.208 2.14-3.032 2.509c-.845.378-1.515.896-1.515 1.174 0 .996-13.133 10.351-14.529 10.351-.434 0-1.753.678-2.986 1.537-3.419 2.377-10.553 5.849-16.195 7.883-1.62.583-3.966 1.486-5.184 1.994-1.227.513-7.37 2.556-13.717 4.565-6.346 2.01-11.115 3.726-10.648 3.835.753.173 3.527-.564 15.445-4.107 7.97-2.369 17.207-5.444 18.901-6.291.996-.499 3.739-1.711 5.996-2.653 8.957-3.734 11.776-5.094 11.776-5.677 0-.318.262-.588.566-.588 2.214 0 18.689-12.114 18.689-13.742 0-.272.304-.496.67-.496.375 0 1.215-.678 1.904-1.538.688-.859 1.685-2.055 2.257-2.711 1.417-1.628 1.439-3.843.033-3.843-.636 0-1.128.307-1.128.701m-21.475 2.238c-.858.588-1.516 1.305-1.516 1.65 0 .333-.704.918-1.552 1.289-.846.37-1.615.985-1.692 1.356-.077.37-1.552 1.521-3.244 2.53-1.691 1.011-3.102 2.06-3.102 2.306 0 .495-15.304 10.26-16.078 10.26-.231 0-1.833.812-3.527 1.785-1.722.989-4.972 2.631-7.3 3.683-2.54 1.149-3.763 1.961-3.102 2.058.602.087 2.011-.233 3.139-.715a235 235 0 0 1 7.121-2.933 45 45 0 0 0 4.019-1.866c1.058-.57 2.171-1.063 2.399-1.063 1.374 0 19.709-11.481 20.791-13.016.646-.921 3.487-3.662 5.009-4.837.351-.272.874-1.174 1.15-1.988.612-1.809-.332-1.996-2.515-.499"
                      fill="#fff"
                      fill-opacity=".3"
                    />
                  </svg>
                  Engine
                </span>{" "}
                for Startup
                <br />
                Facilities
              </h1>

              {/* Enablers Tag */}
              <div className="absolute left-[20%] -translate-x-1/2 sm:top-[65%] md:top-[85%] -translate-y-1/2">
                <div className="relative">
                  <Image
                    src="/enabler_chip.svg"
                    alt="Enablers"
                    width={143}
                    height={51}
                    className="w-auto h-auto"
                  />
                </div>
              </div>

              {/* Startups Tag */}
              <div className="absolute right-1/4 translate-x-1/2 bottom-0 translate-y-1/2">
                <div className="relative">
                  <Image
                    src="/startup_chip.svg"
                    alt="Startups"
                    width={162}
                    height={72}
                    className="w-auto h-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="max-w-4xl mx-auto px-4 mb-16 mt-16">
           
            <Tabs
              defaultValue="all"
              className="w-full relative"
              onValueChange={toggleTab}
            >
             
             
              <span className="text-[12px] text-gray-500  absolute left-11 top-1">Search by</span>
  
    {/* <span className="text-sm text-gray-500">Search by</span>/ */}

              <TabsList className="flex gap-6  overflow-x-auto overflow-y-hidden flex-start rounded-b-none bg-white h-[50px] py-2  w-full sm:w-1/2  border-b-2">
               
                <TabsTrigger
                  value="facility"
                  className={`mt-4 text-sm rounded-none bg-transparent ml-32 sm:ml-0 font-semibold ${
                    activeTab.includes("facility")
                      ? "data-[state=active]:text-[#23BB4E] border-b-2 border-green-600"
                      : "text-gray-800"
                  }`}
                >
                  Facility
                </TabsTrigger>

                <TabsTrigger
                  value="enabler"
                  className={` mt-4 text-sm font-semibold rounded-none    bg-transparent  ${
                     activeTab.includes("enabler")
                      ? "data-[state=active]:text-[#23BB4E] border-b-2 border-green-600"
                      : "text-gray-800"
                  }`}
                >
                  Enabler
                </TabsTrigger>

                <TabsTrigger
                  value="sector"
                  className={` mt-4 text-sm font-semibold rounded-none   bg-transparent ${
                     activeTab.includes("sector")
                      ? "data-[state=active]:text-[#23BB4E] border-b-2 border-green-600"
                      : "text-gray-800"
                  }`}
                >
                  Sector
                </TabsTrigger>

                <TabsTrigger
                  value="location"
                  className={`mt-4 text-sm  rounded-none bg-transparent  font-semibold ${
                     activeTab.includes("location")
                      ? "data-[state=active]:text-[#23BB4E] border-b-2 border-green-600"
                      : "text-gray-800"
                  }`}
                >
                  Location
                </TabsTrigger>
              </TabsList>

              <div className="relative">
                 
                <div className="w-auto bg-white rounded-lg rounded-tl-none rounded-tr-none sm:rounded-tr-lg py-6 px-4">
                 
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-1">
                    {/* Updated input style here */}
                   
                    <div className="flex-1">
                      <div className="w-full relative flex items-center bg-[#F7F7F7] rounded-xl h-16 px-4">
                        <Search className="h-5 w-5 text-gray-400 mr-2" />
                        <input
                          type="text"
                          placeholder="Enter a Keyword, Facilities, City, or ZIP code for Quick Search"
                          className="w-full bg-transparent focus:outline-none  text-sm md:text-lg placeholder:text-gray-500 h-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSearch();
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Button section unchanged */}
                    <div className="flex gap-2 sm:gap-3 items-center h-16">
                      <Button
                        size="lg"
                        className="gap-2 h-[38px] md:h-[60px] px-4 md:px-6 text-sm font-semibold rounded-full sm:rounded-xl whitespace-nowrap bg-green-500 hover:bg-green-600"
                        onClick={handleSearch}
                        disabled={isSearching}
                      >
                        {isSearching ? (
                          <>
                            Searching...
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </>
                        ) : (
                          <>
                            Explore All
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              
            </div>
            </Tabs>

          </div>

          {/* Trusted By Section */}
          {/* <div className="mt-auto">
            <p className="text-white/70 text-sm mb-4">Trusted by 100+ Startups</p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 px-4 md:px-12">
              <Image src="/brands/artifex.png" alt="Artifex" width={120} height={40} className="h-6 w-auto opacity-80 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
              <Image src="/brands/creative-poster.png" alt="Creative Poster" width={120} height={40} className="h-6 w-auto opacity-80 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
              <Image src="/brands/weebsite-studio.png" alt="Weebsite Studio" width={120} height={40} className="h-6 w-auto opacity-80 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
              <Image src="/brands/madrasi-buddha.png" alt="Madrasi Buddha" width={120} height={40} className="h-6 w-auto opacity-80 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
              <Image src="/brands/proud-international.png" alt="Proud International" width={120} height={40} className="h-6 w-auto opacity-80 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
            </div>
          </div> */}

          {/* Version Notice Section */}
          {/* <div className="mt-auto">
            <div className="max-w-2xl mx-auto px-5 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm">
              <p className="text-white/60 text-xs text-center font-medium">
                Dear user, you are currently experiencing the first version of Cumma,
                We are adding new facilities and features everyday. Stay tuned and keep supporting us.
                Note: You can start booking facilities with Payment through cumma, from April 1, 2025".
                For support, write to us at support@cumma.in
              </p>
            </div>
          </div> */}
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="flex flex-col items-center">
              <h2 className="text-2xl md:text-3xl font-medium">Explore</h2>
              <h2 className="text-5xl md:text-6xl font-bold text-green-500 mb-4 tracking-tight">
                Services
              </h2>
            </div>
            <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto">
              One-stop facility marketplace, offering flexible and
              cost-effective spaces for businesses, startups, and innovators.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-full sm:rounded-full border border-gray-200 p-1">
              {["Offices,", "Sciences,", "Engineering,", "Studios,"].map(
                (category, index) => (
                  <button
                    key={index}
                    onClick={() => setFeatureSlide(index)}
                    className={`px-3  sm:px-6 py-2 rounded-full text-base transition-all ${
                      featureSlide === index
                        ? "bg-green-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {category}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Service Cards - Only show for "Offices" tab */}
          {featureSlide === 0 && (
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
                        className="flex-shrink-0 w-[calc(50vw-30px)] sm:w-[240px] h-[320px] bg-[#23bb4e] rounded-[30px] relative overflow-hidden cursor-pointer group"
                        onClick={() => router.push("/SearchPage")}
                      >
                        <CardContent className="p-0 h-full flex flex-col justify-between">
                          {/* Normal state */}
                          <div className="relative h-[275px] w-full">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-200 ease-in-out"
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
          )}

          {/* Sciences section */}
          {featureSlide === 1 && (
            <div className="flex justify-center w-full">
              <div className="relative w-full max-w-[1400px] px-4">
                <div className="flex flex-nowrap gap-3 sm:gap-4 md:gap-5 lg:gap-6 overflow-x-auto scrollbar-hide pb-4 w-full px-2 sm:px-0">
                  {/* Container that centers when all cards fit, left-aligns when scrolling is needed */}
                  <div
                    id="card-container-1"
                    className="flex flex-nowrap gap-3 sm:gap-4 md:gap-5 lg:gap-6 min-w-min mx-auto"
                  >
                    {[
                      {
                        name: "Labs",
                        image: "/facilities/labs-features.jpeg",
                        description:
                          "State-of-the-art laboratory spaces equipped with essential infrastructure for scientific research and experimentation.",
                      },
                      {
                        name: "Equipments",
                        image: "/facilities/equipments.jpeg",
                        description:
                          "Advanced scientific instruments and equipment available for research, testing, and development activities.",
                      },
                      {
                        name: "Lab Space",
                        image: "/facilities/labspace-features.jpeg",
                        description:
                          "Customizable laboratory environments designed to accommodate various scientific disciplines and research needs.",
                      },
                    ].map((item, index) => (
                      <Card
                        key={index}
                        className="flex-shrink-0 w-[calc(50vw-30px)] sm:w-[240px] h-[320px] bg-[#23bb4e] rounded-[30px] relative overflow-hidden cursor-pointer group"
                        onClick={() => router.push("/SearchPage")}
                      >
                        <CardContent className="p-0 h-full flex flex-col justify-between">
                          {/* Normal state */}
                          <div className="relative h-[275px] w-full">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-200 ease-in-out"
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
          )}

          {featureSlide === 2 && (
            <div className="flex justify-center w-full">
              <div className="relative w-full max-w-[1400px] px-4">
                <div className="flex flex-nowrap gap-3 sm:gap-4 md:gap-5 lg:gap-6 overflow-x-auto scrollbar-hide pb-4 w-full">
                  {/* Container that centers when all cards fit, left-aligns when scrolling is needed */}
                  <div
                    id="card-container-2"
                    className="flex flex-nowrap gap-3 sm:gap-4 md:gap-5 lg:gap-6 min-w-min mx-auto"
                  >
                    {[
                      {
                        name: "Machines",
                        image: "/facilities/machines.jpeg",
                        description:
                          "Advanced machinery and equipment for engineering projects, prototyping, and precision manufacturing applications.",
                      },
                      {
                        name: "Production",
                        image: "/facilities/production.jpeg",
                        description:
                          "Specialized production facilities with technical infrastructure for engineering and manufacturing operations.",
                      },
                      {
                        name: "Manufacturing Space",
                        image: "/facilities/manufacturingspace-features.jpeg",
                        description:
                          "Versatile industrial spaces designed for manufacturing processes, assembly lines, and large-scale production.",
                      },
                    ].map((item, index) => (
                      <Card
                        key={index}
                        className="flex-shrink-0 w-[calc(50vw-30px)] sm:w-[240px] h-[320px] bg-[#23bb4e] rounded-[30px] relative overflow-hidden cursor-pointer group"
                        onClick={() => router.push("/SearchPage")}
                      >
                        <CardContent className="p-0 h-full flex flex-col justify-between">
                          {/* Normal state */}
                          <div className="relative h-[275px] w-full">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-200 ease-in-out"
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
          )}

          {featureSlide === 3 && (
            <div className="flex justify-center w-full">
              <div className="relative w-full max-w-[1400px] px-4">
                <div className="flex flex-nowrap gap-3 sm:gap-4 md:gap-5 lg:gap-6 overflow-x-auto scrollbar-hide pb-4 w-full">
                  {/* Container that centers when all cards fit, left-aligns when scrolling is needed */}
                  <div
                    id="card-container-3"
                    className="flex flex-nowrap gap-3 sm:gap-4 md:gap-5 lg:gap-6 min-w-min mx-auto"
                  >
                    {[
                      {
                        name: "Video",
                        image: "/facilities/video.jpeg",
                        description:
                          "Professional video production studios equipped with lighting, backdrops, and recording equipment for high-quality content creation.",
                      },
                      {
                        name: "Podcast",
                        image: "/facilities/podcast.jpg",
                        description:
                          "Soundproofed podcast studios with professional audio equipment and comfortable recording environments for podcasters and content creators.",
                      },
                    ].map((item, index) => (
                      <Card
                        key={index}
                        className="flex-shrink-0 w-[calc(50vw-30px)] sm:w-[240px] h-[320px] bg-[#23bb4e] rounded-[30px] relative overflow-hidden cursor-pointer group"
                        onClick={() => router.push("/SearchPage")}
                      >
                        <CardContent className="p-0 h-full flex flex-col justify-between">
                          {/* Normal state */}
                          <div className="relative h-[275px] w-full">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-200 ease-in-out"
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
          )}
        </div>
      </section>

      {/* Cumma For Startups Section */}
      <section className="pt-8 pb-16 md:pt-10 md:pb-20 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="relative h-[230px] md:h-[280px] flex items-center justify-center cursor-pointer group">
            {/* Cumma logo that moves up on hover */}
            <div className="relative w-[400px] md:w-[500px] lg:w-[600px] h-[140px] md:h-[160px] lg:h-[190px] transition-all duration-700 ease-out transform group-hover:scale-95 group-hover:-translate-y-4 md:group-hover:-translate-y-6">
              <Image
                src="/logo.png"
                alt="Cumma Logo"
                fill
                className="object-contain"
              />
            </div>

            {/* Animated "for" and "Startups" text (visible on hover) */}
            <div className="absolute top-1/2 left-0 right-0 flex flex-col items-center">
              <div className="text-green-500 text-4xl md:text-5xl font-medium opacity-0 transform translate-y-16 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:translate-y-1 md:group-hover:translate-y-2">
                for
              </div>
              <div className="text-green-500 text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight opacity-0 transform translate-y-16 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:translate-y-1 md:group-hover:translate-y-2 -mt-2">
                Startups
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-10 md:py-16 px-6 md:px-10 bg-[#58B571] text-white">
        <div className="container mx-auto px-6 md:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            {/* Left Column - Heading */}
            <div className="flex flex-col justify-center pl-0 md:pl-8 lg:pl-16">
              <h2 className="text-xl md:text-2xl font-medium mb-[-10px] ml-6 md:ml-12 lg:ml-12">
                Fuel Your Startup with
              </h2>
              <div className="relative w-[240px] h-[70px] md:w-[320px] md:h-[90px] lg:w-[380px] lg:h-[110px] my-[-5px] ml-0 md:ml-0 lg:ml-0">
                <Image
                  src="/logo-white.png"
                  alt="Cumma Logo"
                  fill
                  className="object-contain object-left"
                />
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mt-[-27px] md:mt-[-35px] lg:mt-[-35px] mb-[-40px] ml-7 md:ml-12 lg:ml-12">
                Smart
              </h2>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mt-[35px] md:mt-[35px] lg:mt-[35px] text-black ml-7 md:ml-12 lg:ml-12">
                Facilities
              </h2>
            </div>

            {/* Right Column - Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mx-auto md:mx-auto lg:mx-0 max-w-md md:max-w-2xl lg:max-w-none">
              {/* Plug & Play Spaces */}
              <div className="flex flex-col pl-14 relative">
                <div className="absolute left-0 top-0">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <Image
                      src="/icons/plug-play.png"
                      alt="Plug & Play Spaces"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <h3 className="text-lg font-bold leading-tight mb-2">
                  Plug & Play
                  <br />
                  Spaces
                </h3>
                <p className="text-sm leading-relaxed text-white/90">
                  Provides startups with flexible workspace options designed to
                  meet their unique needs, allowing them to scale efficiently.
                </p>
              </div>

              {/* Cost-Effective Office Alternatives */}
              <div className="flex flex-col pl-14 relative">
                <div className="absolute left-0 top-0">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <Image
                      src="/icons/cost-effective.png"
                      alt="Cost-Effective Office Alternatives"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <h3 className="text-lg font-bold leading-tight mb-2">
                  Cost Effective
                  <br />
                  Office Alternatives
                </h3>
                <p className="text-sm leading-relaxed text-white/90">
                  Helps startups reduce overhead costs associated with
                  traditional office spaces, covering utilities and maintenance.
                </p>
              </div>

              {/* Productivity-Boosting Environment */}
              <div className="flex flex-col pl-14 relative">
                <div className="absolute left-0 top-0">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <Image
                      src="/icons/productivity.png"
                      alt="Productivity-Boosting Environment"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <h3 className="text-lg font-bold leading-tight mb-2">
                  Productivity-Boosting
                  <br />
                  Environment
                </h3>
                <p className="text-sm leading-relaxed text-white/90">
                  Startups benefit from a collaborative workspace, minimizing
                  distractions and enhancing focus on core business activities.
                </p>
              </div>

              {/* Seamless Booking */}
              <div className="flex flex-col pl-14 relative">
                <div className="absolute left-0 top-0">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <Image
                      src="/icons/seamless-booking.png"
                      alt="Seamless Booking"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <h3 className="text-lg font-bold leading-tight mb-2">
                  Seamless
                  <br />
                  Booking
                </h3>
                <p className="text-sm leading-relaxed text-white/90">
                  Book effortlessly in just a few clicks! Secure the perfect
                  facility with ease, ensuring convenience and flexibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Facilities Section */}
      <section className="py-16 bg-white px-6 md:px-10 lg:px-16">
        <div className="max-w-[1400px] mx-auto flex flex-col items-start gap-10">
          {/* Header section */}
          <div className="flex items-center justify-between relative self-stretch w-full">
            <h1 className="font-extrabold text-3xl md:text-4xl lg:text-5xl tracking-[-1.8px] md:tracking-[-2.4px] leading-[1.1]">
              <span className="text-[#222222]">Explore&nbsp;&nbsp;</span>
              <span className="text-[#23bb4e]">Facilities</span>
            </h1>
          </div>

          {/* Facilities cards */}
          <div className="flex w-full overflow-x-auto scrollbar-hide gap-6 md:gap-[30px] pb-4">
            {loading ? (
              // Loading skeletons
              Array(4)
                .fill(0)
                .map((_, i) => <FacilityCardSkeleton key={i} />)
            ) : featuredFacilities.length === 0 ? (
              <div className="w-full text-center py-8">
                <p className="text-gray-500">
                  No featured facilities available at the moment.
                </p>
              </div>
            ) : (
              featuredFacilities.map((facility, index) => (
                <FacilityCard
                  key={facility._id}
                  facility={facility}
                  isHovered={hoveredCardIndex === index}
                  onMouseEnter={() => setHoveredCardIndex(index)}
                  onMouseLeave={() => setHoveredCardIndex(null)}
                  isFeatured={true}
                />
              ))
            )}
          </div>

          {/* Explore all button */}
          <Button
            variant="outline"
            className="h-[60px] md:h-[72px] w-full justify-center text-xl md:text-2xl font-semibold tracking-[-0.60px] rounded-2xl border-[0.5px] border-[#22222280]"
            onClick={() => router.push("/SearchPage")}
          >
            Explore all
          </Button>
        </div>
      </section>

      {/* Explore Enablers Section (Replacing CTA Section) */}
      <ExploreEnablers />

      {/* Testimonials Section */}
      <section className="py-20 md:py-32 bg-gray-50/30 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          {/* Main heading */}
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
              Why Startups <span className="text-[#23bb4e]">Love</span>
            </h2>
            <div className="flex justify-center items-center">
              <div className="relative w-[240px] h-[60px] md:w-[320px] md:h-[70px]">
                <Image
                  src="/logo-green.png"
                  alt="Cumma Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Testimonial cards */}
          <div className="relative max-w-[1400px] mx-auto">
            {/* Left fade gradient */}
            <div className="absolute left-0 top-0 bottom-0 w-[15%] md:w-[20%] bg-gradient-to-r from-gray-50/30 to-transparent z-10 pointer-events-none"></div>

            {/* Right fade gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-[15%] md:w-[20%] bg-gradient-to-l from-gray-50/30 to-transparent z-10 pointer-events-none"></div>

            {/* Scrollable container with increased height to accommodate the zig-zag pattern */}
            <div className="flex overflow-x-auto scrollbar-hide py-16 relative min-h-[500px] md:min-h-[550px]">
              <div className="px-4 md:px-8 lg:px-12 w-full">
                <div
                  className="flex gap-6 md:gap-8 w-max mx-auto transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(${-testimonialSlide * (320 + 32)}px)`,
                  }}
                >
                  {/* Testimonial cards */}
                  {reviews.map((review, index) => (
                    <div
                      key={review.id}
                      className={`flex-shrink-0 w-[280px] md:w-[320px] h-[380px] md:h-[420px] rounded-3xl border border-gray-200 shadow-md overflow-hidden transition-all duration-500 ease-in-out ${
                        index === testimonialSlide ? "shadow-lg" : "shadow-md"
                      } ${
                        index % 2 === 0
                          ? "transform -translate-y-12"
                          : "transform translate-y-12"
                      }`}
                      style={{
                        backgroundImage:
                          "url(/testimonials/card-bg/review-card-bg.png)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="p-6 md:p-8 flex flex-col h-full">
                        <div className="flex-grow mb-6">
                          <p className="text-gray-800 text-lg leading-relaxed">
                            {review.text}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 mt-auto">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden">
                            <Image
                              src={review.logo}
                              alt={review.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {review.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {review.businessType}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center mt-4 gap-2">
            {[0, 1, 2, 3, 4].map((dot) => (
              <div
                key={dot}
                className={`w-2 h-2 rounded-full ${dot === testimonialSlide ? "bg-[#23bb4e]" : "bg-gray-300"}`}
                onClick={() => setTestimonialSlide(dot)}
                style={{ cursor: "pointer" }}
              ></div>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-center mt-12 gap-44">
            <button
              className="w-14 h-14 rounded-full border-2 border-green-500 flex items-center justify-center hover:bg-green-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              aria-label="Previous testimonial"
              onClick={prevTestimonialSlide}
            >
              <ArrowLeft className="w-6 h-6 text-green-500" />
            </button>
            <button
              className="w-14 h-14 rounded-full border-2 border-green-500 flex items-center justify-center hover:bg-green-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              aria-label="Next testimonial"
              onClick={nextTestimonialSlide}
            >
              <ArrowRight className="w-6 h-6 text-green-500" />
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <NewsletterSignup />
    </div>
  );
}
