"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
// import { useSession, signOut } from 'next-auth/react'
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  BanknoteIcon,
  Search,
  LogOut,
  Home,
  UserCircle,
  FerrisWheel,
  HelpCircle,
  Menu,
  Component,
  X,
} from "lucide-react";
import { ProfilePicture } from "@/components/ui/profile-picture";
import { useEffect, useState } from "react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { is } from "date-fns/locale";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useRouter } from "next/navigation";

interface ServiceProviderProfile {
  serviceName: string;
  logoUrl: string | null;
}

export default function ServiceProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  // const { data: session } = useSession()
  const { user, logout } = useAuth();
  // const session = user ? { user } : null;
  const [profile, setProfile] = useState<ServiceProviderProfile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const apiUrl = "http://localhost:3001";
  const handleLogout = async () => {
    // await signOut({ callbackUrl: '/sign-in' })
    await logout();
    router.push("/landing");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user?.id) return;

        const response = await fetch(`${apiUrl}/api/service-provider/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // ✅ 3. CRITICAL: Send the cookie to Express
          credentials: "include",
        });

        // const response = await fetch('/api/service-provider/profile')
        // credentials: 'include'
        if (response.ok) {
          const data = await response.json();
          setProfile({
            serviceName: data.serviceName,
            logoUrl: data.logoUrl,
          });
        } else {
          console.error("Failed to fetch profile:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const navigation = [
    {
      name: "Dashboard",
      href: "/service-provider/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Bookings",
      href: "/service-provider/bookings",
      icon: CalendarDays,
    },

    {
      name: "Facilities",
      href: "/service-provider/my-facilities",
      icon: Building2,
    },
    {
      name: "Events",
      href: "/service-provider/events",
      icon: FerrisWheel,
    },
    {
      name: "Earnings",
      href: "/service-provider/earnings",
      icon: BanknoteIcon,
    },
    {
      name: "Customers",
      href: "/service-provider/customer",
      icon: CalendarDays,
    },
    {
      name: "Coupons",
      href: "/service-provider/coupons",
      icon: Component,
    },
  ];

  return (
    <div className="min-h-screen font-jakarta">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-transparent backdrop-blur-sm">
        <div className="flex h-16 md:h-20 items-center px-4 sm:px-6 md:px-8 justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Cumma Logo"
                width={120}
                height={26}
                className="md:w-[150px] md:h-[90px]"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {navigation.map((item) => {
              let isActive = false;

              // Special handling for Events section
              if (item.name === "Events") {
                isActive =
                  pathname === item.href ||
                  pathname?.startsWith(
                    "/service-provider/events/edit-event/",
                  ) ||
                  pathname?.includes("/service-provider/events/");
              } else {
                // Standard active logic for other navigation items
                isActive = pathname === item.href;
              }
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2.5 xl:py-3.5 text-sm xl:text-base font-semibold rounded-full transition-colors",
                    isActive
                      ? "bg-gradient-to-r from-[#044A18] to-black text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 xl:h-5 xl:w-5",
                      isActive ? "text-white" : "text-gray-500",
                    )}
                  />
                  <span className="hidden xl:inline">{item.name}</span>
                  <span className="xl:hidden">{item.name.split(" ")[0]}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 md:space-x-3.5">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Notifications */}
            <div className="hidden sm:block">
              <NotificationBell />
            </div>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-10 w-10 md:h-[60px] md:w-[60px] rounded-full bg-white/80 border border-gray-200 overflow-hidden cursor-pointer transition-transform hover:scale-105">
                  <ProfilePicture
                    imageUrl={profile?.logoUrl}
                    size={40}
                    className="md:w-[60px] md:h-[60px]"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[200px] md:w-[220px] p-4 md:p-5 bg-white rounded-[20px] md:rounded-[25px] shadow-lg mt-2 border-none font-jakarta"
                sideOffset={12}
                alignOffset={0}
                avoidCollisions={true}
              >
                {/* Header with logo */}
                <div className="mb-3 md:mb-4 flex justify-center">
                  <Image
                    src="/logo-green.png"
                    alt="Cumma"
                    width={80}
                    height={20}
                    className="md:w-[90px] md:h-[24px]"
                    priority
                  />
                </div>

                {/* Account section */}
                <div className="space-y-3 md:space-y-4 mb-3 md:mb-4">
                  <Link
                    href="/service-provider/profile"
                    className="block w-full"
                  >
                    <div className="font-bold text-[14px] md:text-[16px] tracking-tight text-[#222222] hover:text-green-600 transition-colors">
                      My Profile
                    </div>
                  </Link>

                  <Link href="/" className="block w-full">
                    <div className="font-bold text-[14px] md:text-[16px] tracking-tight text-[#222222] hover:text-green-600 transition-colors">
                      Back to Home
                    </div>
                  </Link>
                </div>

                {/* Logout section */}
                <DropdownMenuSeparator className="my-2 md:my-3 bg-gray-200" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 md:gap-3 w-full hover:opacity-70 transition-opacity group"
                >
                  <div className="opacity-60 group-hover:opacity-80 transition-opacity">
                    <Image
                      src="/icons/signout-icon.svg"
                      alt="Sign out"
                      width={18}
                      height={18}
                      className="md:w-[20px] md:h-[20px]"
                    />
                  </div>
                  <span className="font-medium text-[14px] md:text-[16px] tracking-tight text-[#222222] opacity-60 group-hover:opacity-80 transition-opacity">
                    Sign out
                  </span>
                </button>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {/* Mobile Notifications */}
              <div className="sm:hidden mb-3 flex justify-center">
                <NotificationBell />
              </div>

              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-base font-semibold rounded-lg transition-colors w-full",
                      isActive
                        ? "bg-gradient-to-r from-[#044A18] to-black text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-50",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5",
                        isActive ? "text-white" : "text-gray-500",
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>
      <ProtectedRoute>
        {/* Main Content */}
        <main className="overflow-y-auto bg-[#F8F9FC]">{children}</main>
      </ProtectedRoute>
    </div>
  );
}
