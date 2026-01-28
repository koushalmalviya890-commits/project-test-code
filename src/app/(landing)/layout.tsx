"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
// import { useSession, signOut } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UserCircle, Menu, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { MobileMenu } from "@/components/layout/mobile-menu";
import type {
  StartupProfile,
  ServiceProviderProfile,
  Profile as SharedProfile,
} from "@/types/profile";
import { MegaDropdown } from "@/components/layout/mega-dropdown";
import { ProfilePicture } from "@/components/ui/profile-picture";
import { Footer } from "@/components/layout/footer";
import { is } from "date-fns/locale";
import Cummaicon from "../../../public/cummasymbol.svg";
import { log } from "console";

// Define dropdown background images
const dropdownBackgrounds = {
  Offices: "/facilities/coworking.jpg",
  Sciences: "/facilities/lab.jpg",
  Engineering: "/facilities/machines.jpeg",
  Studios: "/facilities/video.jpeg",
};

// Using shared profile types from src/types/profile.ts

// Define category icons
const categoryIcons = {
  Offices: {
    white: "/icons/offices-white.png",
    green: "/icons/offices-green.png",
  },
  Sciences: {
    white: "/icons/sciences-white.png",
    green: "/icons/sciences-green.png",
  },
  Engineering: {
    white: "/icons/engineering-white.png",
    green: "/icons/engineering-green.png",
  },
  Studios: {
    white: "/icons/studios-white.png",
    green: "/icons/studios-green.png",
  },
};

const navigation = {
  main: [
    {
      name: "Workspaces",
      href: "/offices/about",
      dropdown: [
        {
          name: "Meeting Area",
          href: "/SearchPage?type=Meeting Room",
          icon: "/icons/categories-gif/meeting.gif",
        },
        {
          name: "Co-Working Space",
          href: "/SearchPage?type=Coworking space",
          icon: "/icons/categories-gif/coworking.gif",
        },
        {
          name: "Individual Cabin",
          href: "/SearchPage?type=Individual Cabin",
          icon: "/icons/categories-gif/cabin.gif",
        },
        {
          name: "Board Room",
          href: "/SearchPage?type=Board Rooms",
          icon: "/icons/categories-gif/boardroom.gif",
        },
        {
          name: "Raw space",
          href: "/SearchPage?type=Raw Space Office",
          icon: "/icons/categories-gif/rawspace.gif",
        },
      ],
    },
    {
      name: "Facilities",
      href: "/sciences/about",
      dropdown: [
        {
          name: "Labs",
          href: "/SearchPage?type=Bio Allied",
          icon: "/icons/categories-gif/labspace.gif",
        },
        {
          name: "Equipment",
          href: "/SearchPage?type=Lab Equipment",
          icon: "/icons/categories-gif/equipment.gif",
        },
        {
          name: "Lab space",
          href: "/SearchPage?type=Raw Space Lab",
          icon: "/icons/categories-gif/lab.gif",
        },
        {
          name: "Production",
          href: "/SearchPage?type=Production",
          icon: "/icons/categories-gif/production.gif",
        },
        {
          name: "Machines",
          href: "/SearchPage?type=Manufacturing",
          icon: "/icons/categories-gif/machine.gif",
        },
        {
          name: "Manufacturing space",
          href: "/SearchPage?type=Manufacturing Raw Space",
          icon: "/icons/categories-gif/manufacturing.gif",
        },
      ],
    },
    {
      name: "Events",
      href: "/events-page",
    },
    {
      name: "Partner Connect",
      href: "/partnerconnection",
      newTab: true,
    },
  ],
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // const { data: session } = useSession();
  const { user, logout } = useAuth();
  const session = { user }; // Adapted to match useSession structure
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [logoHovered, setLogoHovered] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profile, setProfile] = useState<SharedProfile>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCareerPage = pathname.startsWith("/career");
  const isTeamPage = pathname.startsWith("/teams");
  const isJobPage = pathname.startsWith("/jobs");
  const isworkspace = pathname.startsWith("/offices");
  const isSciences = pathname.startsWith("/sciences");

  const apiUrl = "http://localhost:3001";

  // Function to handle dropdown opening with no delay
  const handleDropdownOpen = (name: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setActiveDropdown(name);
  };

  // Function to handle dropdown closing with a small delay
  const handleDropdownClose = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }

    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 100); // 100ms delay before closing
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    handleResize();
    handleScroll();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeDropdown &&
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // if (!session?.user) return;

        if (!user) return;

        const endpoint =
          user.userType === "startup"
            ? `${apiUrl}/api/startup/profile`
            : `${apiUrl}/api/service-provider/profile`;

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // ✅ 3. CRITICAL: This allows the browser to send the 'token' cookie to Express
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          // Assign profile depending on user type to match shared types
          if (user?.userType === "startup") {
            setProfile({
              startupName: data.startupName ?? null,
              logoUrl: data.logoUrl ?? null,
            });
          } else {
            setProfile({
              serviceName: data.serviceName ?? null,
              logoUrl: data.logoUrl ?? null,
            });
          }
        } else {
          const errorText = await response.text();
          console.error("Failed to fetch profile:", errorText);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const getBookingLink = () => {
    // if (!session?.user) return "/sign-up";
    // return session.user.userType === "startup"
     if (!user) return "/sign-up";
    return user.userType === "startup"
      ? "/startup/bookings"
      : "/service-provider/dashboard";
  };

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      {pathname !== "/partnerconnection" && (
        <header
          ref={headerRef}
          className={cn(
            "site-header",
            isCareerPage ? "force-black" : isScrolled ? "scrolled" : "",
            isTeamPage ? "force-black" : isScrolled ? "scrolled" : "",
            isJobPage ? "force-black" : isScrolled ? "scrolled" : "",
            isworkspace ? "force-black" : isScrolled ? "scrolled" : "",
            isSciences ? "force-black" : isScrolled ? "scrolled" : "",
            activeDropdown ? "with-dropdown" : "",
          )}
        >
          <div className="container px-12 md:px-16">
            <div className="flex h-20 items-center justify-between">
              <button
                className="md:hidden text-white p-2"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              {/* Logo */}
              <Link
                href="/"
                className="flex-shrink-0 relative"
                onMouseEnter={() => setLogoHovered(true)}
                onMouseLeave={() => setLogoHovered(false)}
              >
                <div className="relative h-10 w-[140px]">
                  <Image
                    src="/logo-white.png"
                    alt="Cumma Logo"
                    fill
                    className={cn(
                      "object-contain transition-opacity duration-200 ease-in-out",
                      logoHovered ? "opacity-0" : "opacity-100",
                    )}
                  />
                  <Image
                    src="/logo-green.png"
                    alt="Cumma Logo"
                    fill
                    className={cn(
                      "object-contain transition-opacity duration-200 ease-in-out",
                      logoHovered ? "opacity-100" : "opacity-0",
                    )}
                  />
                </div>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center">
                <div className="flex items-center space-x-10">
                  {navigation.main.map((item) => (
                    <div
                      key={item.name}
                      className="relative group"
                      onMouseEnter={() => handleDropdownOpen(item.name)}
                      onMouseLeave={handleDropdownClose}
                    >
                      <Link
                        href={item.href}
                        target={item.newTab ? "_blank" : undefined}
                        rel={item.newTab ? "noopener noreferrer" : undefined}
                        className={cn(
                          "header-nav-item flex items-center h-20 px-2 relative",
                          pathname.startsWith(item.href) ||
                            activeDropdown === item.name
                            ? "text-green-400 active"
                            : "text-white hover:text-green-400",
                        )}
                        aria-label={item.name}
                        title={item.name}
                      >
                        <span className="font-jakarta text-base font-medium transition-colors duration-200 flex items-center">
                          {item.name}
                          <Image
                            src="/cummasymbol.svg"
                            alt=""
                            width={16}
                            height={16}
                            className="mt-4 ml-1 inline-block"
                          />
                        </span>
                      </Link>

                      {/* Mega Dropdown */}
                      {item.dropdown && activeDropdown === item.name && (
                        <MegaDropdown
                          isOpen={true}
                          title={item.name}
                          items={item.dropdown}
                          backgroundImage={
                            dropdownBackgrounds[
                              item.name as keyof typeof dropdownBackgrounds
                            ] || "/auth-bg.jpg"
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              </nav>

              {/* Auth Buttons / Profile */}
              <div className="md:flex items-center gap-4">
            {/*    {session?.user ? ( */}
                    {user ? (
                  <div className="flex items-center gap-4">
                    <Link
                      href={
                        // session.user.userType === "startup"
user.userType === "startup"
                        ? "/startup/bookings"
                          : "/service-provider/dashboard"
                      }
                    >
                      <Button
                        size="sm"
                        className="hidden md:block h-10 px-6 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium"
                      >
                        Dashboard
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-10 w-10 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/40 transition-colors">
                          <ProfilePicture
                            imageUrl={profile?.logoUrl}
                            size={40}
                          />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-[220px] p-5 bg-white rounded-[25px] shadow-lg mt-2 border-none font-jakarta"
                        sideOffset={12}
                        alignOffset={0}
                        avoidCollisions={true}
                      >
                        {/* Header with logo */}
                        <div className="mb-4 flex justify-center">
                          <Image
                            src="/logo-green.png"
                            alt="Cumma"
                            width={90}
                            height={24}
                            priority
                          />
                        </div>

                        {/* Account section */}
                        <div className="space-y-4 mb-4">
                          <Link
                            href={
                              // session.user.userType === "startup"
                              user.userType === "startup"
                              ? "/startup/profile"
                                : "/service-provider/profile"
                            }
                            className="block w-full"
                          >
                            <div className="font-bold text-[16px] tracking-tight text-[#222222] hover:text-green-600 transition-colors">
                              Profile
                            </div>
                          </Link>
                          <Link
                            href={
                              // session.user.userType === "startup"
                               user.userType === "startup"
                                ? "/startup/bookings"
                                : "/service-provider/dashboard"
                            }
                            className="block w-full"
                          >
                            <div className="font-bold text-[16px] tracking-tight text-[#222222] hover:text-green-600 transition-colors">
                              Dashboard
                            </div>
                          </Link>
                        </div>

                        {/* Logout section */}
                        <DropdownMenuSeparator className="my-3 bg-gray-200" />
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-10 w-10 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/40 transition-colors">
                          <div className="w-full h-full bg-white/10 flex items-center justify-center">
                            <UserCircle className="w-7 h-7 text-white" />
                          </div>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-[220px] p-5 bg-white rounded-[25px] shadow-lg mt-2 border-none font-jakarta"
                        sideOffset={12}
                        alignOffset={0}
                        avoidCollisions={true}
                      >
                        {/* Header with logo */}
                        <div className="mb-4 flex justify-center">
                          <Image
                            src="/logo-green.png"
                            alt="Cumma"
                            width={90}
                            height={24}
                            priority
                          />
                        </div>

                        {/* Account section */}
                        <div className="space-y-4 mb-4">
                          <Link
                            href="/sign-up/startup"
                            className="block w-full"
                          >
                            <div className="font-bold text-[16px] tracking-tight text-[#222222] hover:text-green-600 transition-colors">
                              Sign Up
                            </div>
                          </Link>
                          <Link href="/sign-in" className="block w-full">
                            <div className="font-bold text-[16px] tracking-tight text-[#222222] hover:text-green-600 transition-colors">
                              Login
                            </div>
                          </Link>
                          <Link
                            href="/sign-up/service-provider"
                            className="block w-full"
                          >
                            <div className="font-bold text-[16px] tracking-tight text-[#222222] hover:text-green-600 transition-colors">
                              Become an Enabler
                            </div>
                          </Link>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navigation={navigation.main}
        pathname={pathname}
        session={user}
        profile={profile}
      />

      {/* Page Content */}
      <main className="flex-grow">{children}</main>

      {pathname !== "/partnerconnection" && <Footer />}
    </div>
  );
}
