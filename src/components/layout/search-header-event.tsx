'use client'
import { Button } from "@/components/ui/button";
import {UserCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, Suspense } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from "next/navigation";



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
              <span className="text-[#222222]">Discover </span>
              <span className="text-[#23bb4e]">All Events</span>
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