'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, Filter, Menu, Search, UserCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, Suspense } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getPropertyTypesForCategory } from "@/lib/category-mappings";

// Category data for the scrollable menu
const categories = [
  { id: 1, name: "Co-Working Space", icon: "/icons/categories/coworking.svg", gifIcon: "/icons/categories-gif/coworking.gif" },
  { id: 2, name: "Meeting Area", icon: "/icons/categories/meeting.svg", gifIcon: "/icons/categories-gif/meeting.gif" },
  { id: 3, name: "Board Room", icon: "/icons/categories/boardroom.svg", gifIcon: "/icons/categories-gif/boardroom.gif" },
  { id: 4, name: "Raw space", icon: "/icons/categories/rawspace.svg", gifIcon: "/icons/categories-gif/rawspace.gif" },
  { id: 5, name: "Cabins", icon: "/icons/categories/cabin.svg", gifIcon: "/icons/categories-gif/cabin.gif" },
  { id: 6, name: "Labs", icon: "/icons/categories/lab.svg", gifIcon: "/icons/categories-gif/lab.gif" },
  { id: 7, name: "Equipment", icon: "/icons/categories/equipment.svg", gifIcon: "/icons/categories-gif/equipment.gif" },
  { id: 8, name: "Lab space", icon: "/icons/categories/labspace.svg", gifIcon: "/icons/categories-gif/labspace.gif" },
  { id: 9, name: "Machines", icon: "/icons/categories/machine.svg", gifIcon: "/icons/categories-gif/machine.gif" },
  { id: 10, name: "Production", icon: "/icons/categories/production.svg", gifIcon: "/icons/categories-gif/production.gif" },
  { id: 11, name: "Manufacturing space", icon: "/icons/categories/manufacturing.svg", gifIcon: "/icons/categories-gif/manufacturing.gif" },
  { id: 12, name: "Video", icon: "/icons/categories/video.svg", gifIcon: "/icons/categories-gif/video.gif" },
  { id: 13, name: "Podcasts", icon: "/icons/categories/podcast.svg", gifIcon: "/icons/categories-gif/podcast.gif" },
  { id: 14, name: "Edit", icon: "/icons/categories/edit.svg", gifIcon: "/icons/categories-gif/edit.gif" },
];

interface ProfileData {
  startupName?: string;
  serviceName?: string;
  logoUrl?: string | null;
}

// Loading component for Suspense
function SearchHeaderLoading() {
  return (
    <div className="w-full bg-white shadow-sm">
      <div className="relative w-full">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="relative h-10 w-[140px] bg-gray-200 animate-pulse rounded"></div>
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
            <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-4 py-5 flex justify-center">
          <div className="w-full max-w-[450px] h-[60px] bg-gray-200 animate-pulse rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-4 pb-2">
          <div className="h-[100px] bg-gray-200 animate-pulse rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}

function SearchHeaderClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('search') || '');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(null);

  // Update keyword when search param changes
  useEffect(() => {
    setKeyword(searchParams.get('search') || '');
  }, [searchParams]);

  // Function to check if any filters are active
  const hasActiveFilters = () => {
    // Check for various filter parameters
    return (
      searchParams.has('propertyTypes') && searchParams.get('propertyTypes') !== 'All' ||
      searchParams.has('minPrice') && searchParams.get('minPrice') !== '0' ||
      searchParams.has('maxPrice') && searchParams.get('maxPrice') !== '100000' ||
      searchParams.has('location') && searchParams.get('location') !== '' ||
      searchParams.has('listingStatus') && searchParams.get('listingStatus') !== 'All' ||
      searchParams.has('sortBy') && searchParams.get('sortBy') !== 'newest'
    );
  };

  // Function to handle search
  const handleSearch = () => {
    // Create a new URLSearchParams object based on current params
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or remove search parameter
    if (keyword) {
      params.set('search', keyword);
    } else {
      params.delete('search');
    }
    
    // Reset to page 1 when searching
    params.set('page', '1');
    
    // Navigate to search page with parameters
    router.push(`/SearchPage?${params.toString()}`);
  };

  // Function to open filter dialog
  const openFilters = () => {
    // Create a new URLSearchParams object based on current params
    const params = new URLSearchParams(searchParams.toString())
    
    // Toggle the showFilters parameter
    if (params.get('showFilters') === 'true') {
      params.delete('showFilters')
    } else {
      params.set('showFilters', 'true')
    }
    
    // Navigate to search page with updated parameters
    router.push(`${pathname}?${params.toString()}`)
  };

  // Function to reset all filters
  const resetFilters = () => {
    window.location.href = '/SearchPage';
  };

  // Function to handle scroll buttons
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollAreaRef.current) {
      const scrollAmount = 300; // Adjust as needed
      const currentScroll = scrollAreaRef.current.scrollLeft;
      
      scrollAreaRef.current.scrollTo({
        left: direction === 'right' ? currentScroll + scrollAmount : currentScroll - scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Update scroll position
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    
    if (scrollArea) {
      const handleScrollEvent = () => {
        setScrollPosition(scrollArea.scrollLeft);
        setMaxScroll(scrollArea.scrollWidth - scrollArea.clientWidth);
      };
      
      handleScrollEvent(); // Initial calculation
      
      scrollArea.addEventListener('scroll', handleScrollEvent);
      
      return () => {
        scrollArea.removeEventListener('scroll', handleScrollEvent);
      };
    }
  }, []);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!session?.user) return;

        const response = await fetch(
          session.user.userType === 'startup' 
            ? '/api/startup/profile'
            : '/api/service-provider/profile'
        );
        
        if (response.ok) {
          const data = await response.json();
          // Transform the data to match our interface
          setProfile({
            startupName: data.startupName,
            serviceName: data.serviceName,
            logoUrl: data.logoUrl
          });
        } else {
          console.error('Failed to fetch profile:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  // Function to get booking link based on user type
  const getBookingLink = () => {
    if (!session?.user) return '/sign-up';
    return session.user.userType === 'startup'
      ? '/startup/bookings'
      : '/service-provider/dashboard';
  };

  // Function to handle sign out
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/landing' });
  };

  // Check if filters are active
  const filtersActive = hasActiveFilters();

  return (
    <div className="w-full bg-white shadow-sm">
      <div className="relative w-full">
        {/* Top section with logo and profile */}
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/landing" className="relative h-10 w-[140px]">
            <Image
              src="/logo-green.png"
              alt="Cumma Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>

          {/* Main heading - visible on larger screens */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
            <h1 className="font-extrabold text-2xl md:text-3xl text-center whitespace-nowrap tracking-tight">
              <span className="text-[#222222]">Find, Book &amp; </span>
              <span className="text-[#23bb4e]">Work Ease</span>
            </h1>
          </div>

          {/* User profile section */}
          {session?.user ? (
            <div className="flex items-center gap-4">
              <Link href={session.user.userType === 'startup' ? '/startup/bookings' : '/service-provider/dashboard'}>
                <Button size="sm" className="h-10 px-6 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium">
                  Dashboard
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors">
                    {profile?.logoUrl ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={profile.logoUrl}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <UserCircle className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-[220px] p-5 bg-white rounded-[25px] shadow-lg mt-2 font-jakarta"
                  sideOffset={12}
                  alignOffset={0}
                  avoidCollisions={true}
                >
                  {/* Logo header */}
                  <div className="flex justify-center mb-5">
                    <Image 
                      src="/logo-green.png" 
                      alt="Cumma Logo" 
                      width={90} 
                      height={24} 
                      className="object-contain"
                    />
                  </div>
                  
                  {/* Account section */}
                  <div className="space-y-2.5 mb-5">
                    <Link 
                      href={session.user.userType === 'startup' ? '/startup/profile' : '/service-provider/profile'}
                      className="flex items-center h-8 text-base font-bold text-gray-800 hover:text-green-500 transition-colors px-2 rounded-md"
                    >
                      Profile
                    </Link>
                    <Link 
                      href={getBookingLink()}
                      className="flex items-center h-8 text-base font-bold text-gray-800 hover:text-green-500 transition-colors px-2 rounded-md"
                    >
                      Dashboard
                    </Link>
                  </div>
                  
                  {/* Sign out section */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full hover:opacity-70 transition-opacity group"
                    >
                      <div className="opacity-60 group-hover:opacity-80 transition-opacity">
                        <Image 
                          src="/icons/signout-icon.svg" 
                          alt="Sign out" 
                          width={20} 
                          height={20}
                        />
                      </div>
                      <span className="font-medium text-[16px] tracking-tight text-[#222222] opacity-60 group-hover:opacity-80 transition-opacity">
                        Sign out
                      </span>
                    </button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <UserCircle className="w-6 h-6 text-gray-500" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-[220px] p-5 bg-white rounded-[25px] shadow-lg mt-2 font-jakarta"
                  sideOffset={12}
                  alignOffset={0}
                  avoidCollisions={true}
                >
                  {/* Logo header */}
                  <div className="flex justify-center mb-5">
                    <Image 
                      src="/logo-green.png" 
                      alt="Cumma Logo" 
                      width={90} 
                      height={24} 
                      className="object-contain"
                    />
                  </div>
                  
                  {/* Options section */}
                  <div className="space-y-2.5">
                    <Link 
                      href="/sign-up"
                      className="flex items-center h-8 text-base font-bold text-gray-800 hover:text-green-500 transition-colors px-2 rounded-md"
                    >
                      Sign Up
                    </Link>
                    <Link 
                      href="/sign-in"
                      className="flex items-center h-8 text-base font-bold text-gray-800 hover:text-green-500 transition-colors px-2 rounded-md"
                    >
                      Login
                    </Link>
                    <Link 
                      href="/service-provider/register"
                      className="flex items-center h-8 text-base font-bold text-gray-800 hover:text-green-500 transition-colors px-2 rounded-md"
                    >
                      Become an Enabler
                    </Link>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Search section */}
        <div className="container mx-auto px-4 py-5 flex justify-center">
          <Card className="w-full max-w-[450px] rounded-full border border-gray-200 shadow-md">
            <CardContent className="p-0 flex items-center h-[60px]">
              <div className="flex items-center justify-between w-full h-full">
                <div className="flex items-center flex-1 pl-6">
                  <Search className="h-5 w-5 text-gray-400 mr-3" />
                  <Input
                    className="border-none text-base font-light placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                    placeholder="Search by name or location"
                    value={keyword}
                    onChange={(e) => {
                      setKeyword(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                  />
                </div>
                <div className="pr-2">
                  <Button 
                    className="h-[40px] w-[40px] bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center p-0"
                    onClick={handleSearch}
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5 text-white" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories section */}
        <div className="container mx-auto px-4 pb-2">
          <div className="flex items-center gap-3">
            {/* Categories slider */}
            <div className="flex-1 overflow-hidden">
              <Card className="w-full rounded-2xl border-none shadow-sm">
                <CardContent className="p-2 md:p-4 relative">
                  <div className="relative">
                    <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide" ref={scrollAreaRef as any}>
                      <div className="flex items-center gap-3 md:gap-4 p-2 md:p-4 min-w-max">
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className="flex flex-col w-[80px] md:w-[100px] h-[90px] md:h-[100px] items-center gap-1 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              // Get the property types for this category from our mapping
                              const propertyTypes = getPropertyTypesForCategory(category.name);
                              
                             // console.log(`Category: ${category.name}, Property Types: ${propertyTypes.join(', ')}`);
                              
                              // Create a new URLSearchParams object based on current params
                              const params = new URLSearchParams(searchParams.toString());
                              
                              // Set the property types parameter
                              params.set('propertyTypes', propertyTypes.join(','));
                              
                              // Reset to page 1 when changing category
                              params.set('page', '1');
                              
                              // Use client-side navigation with a full page update
                              router.push(`/SearchPage?${params.toString()}`);
                            }}
                            onMouseEnter={() => setHoveredCategoryId(category.id)}
                            onMouseLeave={() => setHoveredCategoryId(null)}
                          >
                            <div className="flex flex-col w-[60px] md:w-[70px] h-12 md:h-14 items-center justify-center p-2 bg-white rounded-lg shadow-sm">
                              <div className="relative w-8 h-8 md:w-9 md:h-9">
                                <Image
                                  src={hoveredCategoryId === category.id ? category.gifIcon : category.icon}
                                  alt={category.name}
                                  fill
                                  className="object-contain"
                                  priority={hoveredCategoryId === category.id}
                                />
                              </div>
                            </div>
                            <div className="text-center text-xs md:text-sm font-medium mt-1 line-clamp-2">
                              {category.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Scroll left button - only show if not at start */}
                    {scrollPosition > 0 && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-white shadow-md border-gray-200 z-10"
                        onClick={() => handleScroll('left')}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    )}

                    {/* Scroll right button - only show if not at end */}
                    {scrollPosition < maxScroll && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-white shadow-md border-gray-200 z-10"
                        onClick={() => handleScroll('right')}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Filter and Reset buttons */}
            <div className="flex-shrink-0 flex flex-col gap-2">
              {/* Filter button */}
              <Button
                variant="outline"
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-solid text-sm h-[40px] whitespace-nowrap border-[#222222] text-[#222222]"
                onClick={openFilters}
              >
                <Filter className="w-4 h-4" />
                <span className="font-bold text-[#222222]">
                  Filters
                </span>
              </Button>
            </div>
          </div>
          
          <Separator className="mt-1" />
        </div>
      </div>
    </div>
  );
}

export function SearchHeader() {
  return (
    <Suspense fallback={<SearchHeaderLoading />}>
      <SearchHeaderClient />
    </Suspense>
  );
}