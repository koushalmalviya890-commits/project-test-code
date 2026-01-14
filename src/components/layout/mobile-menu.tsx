"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ProfilePicture } from "@/components/ui/profile-picture";
import type { Profile } from "@/types/profile";

import {
  X,
  ChevronDown,
  ChevronUp,
  UserCircle,
  Monitor,
  Users,
  Briefcase,
  Layout,
  FlaskConical,
  Factory,
  Armchair,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";

interface NavigationItem {
  name: string;
  href: string;
  dropdown?: {
    name: string;
    href: string;
    icon?: string;
  }[];
}

// Using shared Profile type from src/types/profile.ts

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: NavigationItem[];
  pathname: string;
  session: Session | null;
  profile?: Profile;
}

export function MobileMenu({
  isOpen,
  onClose,
  navigation,
  pathname,
  session,
  profile,
}: MobileMenuProps) {
  const [mounted, setMounted] = useState(false);
  // State to track which accordion is open. 'Workspace' is open by default to match image.
  const [openSection, setOpenSection] = useState<string | null>("Workspace");
  const [showAllGrid, setShowAllGrid] = useState(false);

  // Extract Workspaces and Facilities from navigation for mapping
  const workspacesNav =
    navigation.find((n) => n.name === "Workspaces")?.dropdown || [];
  const facilitiesNav =
    navigation.find((n) => n.name === "Facilities")?.dropdown || [];
  const eventsNav = navigation.find((n) => n.name === "Events");

  // Function to render icon from path
  const renderIcon = (iconPath: string, alt: string) => {
    return (
      <div className="relative w-6 h-6">
        <Image src={iconPath} alt={alt} fill className="object-contain" />
      </div>
    );
  };

  useEffect(() => {
    setMounted(true);

    // Lock body scroll
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleSection = (name: string) => {
    setOpenSection(openSection === name ? null : name);
  };
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Get icon for grid items from navigation data
  const getGridIcon = (item: { name: string; href: string; icon?: string }) => {
    if (!item) return <Briefcase className="w-6 h-6" />;
    if (item.icon) {
      return renderIcon(item.icon, item.name);
    }
    return <Briefcase className="w-6 h-6" />;
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (!mounted) return null;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col h-[705px] overflow-hidden font-jakarta">
      {/* --- Mobile Header --- */}
      <div className="flex items-center justify-evenly px-6 py-4 bg-black/95 text-white flex-shrink-0 z-10 shadow-md">
        {/* Close Button (Left) */}
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
        >
          <div className="bg-gray-800/50 rounded-full p-1">
            <X className="h-5 w-5" />
          </div>
        </button>
        <Link href="/" className="flex-shrink-0 relative">
          {/* Logo (Center) */}
          <div className="relative w-[140px] h-10">
            <Image
              src="/logo-white.png"
              alt="Cumma Logo"
              fill
              className={cn(
                "object-contain transition-opacity duration-200 ease-in-out"
              )}
            />
          </div>
        </Link>
        {/* Profile Icon (Right) */}
        <div className="md:flex items-center gap-4">
          {session?.user ? (
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-10 w-10 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/40 transition-colors">
                    <ProfilePicture imageUrl={profile?.logoUrl} size={40} />
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
                        session.user.userType === "startup"
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
                        session.user.userType === "startup"
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
                    <Link href="/sign-up/startup" className="block w-full">
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

      <div className="flex-1 flex flex-col pb-24 overflow-y-auto overscroll-contain">
        <div className="px-6 pt-6 border-b border-gray-100">
          <button
            onClick={() => toggleSection("Workspace")}
            className="flex items-center justify-between w-full mb-6"
          >
            <span className="text-xl font-medium text-gray-900">Workspace</span>
            {openSection === "Workspace" ? (
              <ChevronUp className="w-5 h-5 text-green-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {openSection === "Workspace" && (
            <>
              <div className="grid grid-cols-4 gap-y-6 gap-x-2 max-h-[200px] overflow-y-auto">
                {workspacesNav.map((item, index) => {
                  const displayName = item.name
                    .replace(" Space", "")
                    .replace(" Room", "");

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className="flex flex-col items-center text-center gap-2 group"
                    >
                      <div className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 group-hover:border-green-500 group-hover:text-green-600 transition-all bg-white shadow-sm">
                        {getGridIcon(item)}
                      </div>
                      <span className="text-[11px] font-medium text-gray-600 leading-tight">
                        {displayName}
                      </span>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-10 gap-8">
                <Link
                  href="/offices/about"
                  onClick={onClose}
                  className={cn(
                    "block text-lg pl-6 mt-4 border-l-2 transition-all",
                    isActive("/offices/about")
                      ? "text-green-600 border-green-500 font-medium"
                      : "text-gray-600 border-transparent hover:border-green-500 hover:text-green-600"
                  )}
                >
                  About
                </Link>

                <Link
                  href="/offices/user"
                  onClick={onClose}
                  className={cn(
                    "block text-lg pl-6 mt-4 border-l-2 transition-all",
                    isActive("/offices/user")
                      ? "text-green-600 border-green-500 font-medium"
                      : "text-gray-600 border-transparent hover:border-green-500 hover:text-green-600"
                  )}
                >
                  Users
                </Link>

                <Link
                  href="/offices/enabler"
                  onClick={onClose}
                  className={cn(
                    "block text-lg pl-6 mt-4 border-l-2 transition-all",
                    isActive("/offices/enabler")
                      ? "text-green-600 border-green-500 font-medium"
                      : "text-gray-600 border-transparent hover:border-green-500 hover:text-green-600"
                  )}
                >
                  Enablers
                </Link>

                <Link
                  href="/offices/features"
                  onClick={onClose}
                  className={cn(
                    "block text-lg pl-6 mt-4 border-l-2 transition-all",
                    isActive("/offices/features")
                      ? "text-green-600 border-green-500 font-medium"
                      : "text-gray-600 border-transparent hover:border-green-500 hover:text-green-600"
                  )}
                >
                  Features
                </Link>

                {/* <Link
                  href="/stories"
                  onClick={onClose}
                  className="block text-gray-600 text-lg hover:text-green-600 pl-6 mt-4 border-l-2 border-transparent hover:border-green-500 transition-all"
                >
                  Stories
                </Link> */}
              </div>
            </>
          )}
        </div>
        <div className="px-6 pt-6 border-b border-gray-100">
          <button
            onClick={() => toggleSection("Facility")}
            className="flex items-center justify-between w-full mb-6"
          >
            <span className="text-xl font-medium text-gray-900">Facility</span>
            {openSection === "Facility" ? (
              <ChevronUp className="w-5 h-5 text-green-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {openSection === "Facility" && (
            <>
              <div className="grid grid-cols-4 gap-y-6 gap-x-2 max-h-[200px] overflow-y-auto">
                {/* Map existing navigation to grid, limit to first 8 to match visual density */}
                {facilitiesNav.map((item, index) => {
                  // Simple logic to show clean names
                  const displayName = item.name
                    .replace(" Space", "")
                    .replace(" Room", "");

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className="flex flex-col items-center text-center gap-2 group"
                    >
                      <div className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 group-hover:border-green-500 group-hover:text-green-600 transition-all bg-white shadow-sm">
                        {getGridIcon(item)}
                      </div>
                      <span className="text-[11px] font-medium text-gray-600 leading-tight">
                        {displayName}
                      </span>
                    </Link>
                  );
                })}

                {/* Static Menu Items from Screenshot */}
              </div>
              <div className="mt-10 gap-8">
                <Link
                  href="/sciences/about"
                  onClick={onClose}
                  className={cn(
                    "block text-lg pl-6 mt-4 border-l-2 transition-all",
                    isActive("/sciences/about")
                      ? "text-green-600 border-green-500 font-medium"
                      : "text-gray-600 border-transparent hover:border-green-500 hover:text-green-600"
                  )}
                >
                  About
                </Link>

                <Link
                  href="/sciences/user"
                  onClick={onClose}
                  className={cn(
                    "block text-lg pl-6 mt-4 border-l-2 transition-all",
                    isActive("/sciences/user")
                      ? "text-green-600 border-green-500 font-medium"
                      : "text-gray-600 border-transparent hover:border-green-500 hover:text-green-600"
                  )}
                >
                  Users
                </Link>

                <Link
                  href="/sciences/enabler"
                  onClick={onClose}
                  className={cn(
                    "block text-lg pl-6 mt-4 border-l-2 transition-all",
                    isActive("/sciences/enabler")
                      ? "text-green-600 border-green-500 font-medium"
                      : "text-gray-600 border-transparent hover:border-green-500 hover:text-green-600"
                  )}
                >
                  Enablers
                </Link>

                <Link
                  href="/sciences/features"
                  onClick={onClose}
                  className={cn(
                    "block text-lg pl-6 mt-4 border-l-2 transition-all",
                    isActive("/sciences/features")
                      ? "text-green-600 border-green-500 font-medium"
                      : "text-gray-600 border-transparent hover:border-green-500 hover:text-green-600"
                  )}
                >
                  Features
                </Link>

                {/* <Link
                  href="/sciences/stories"
                  onClick={onClose}
                  className="block text-gray-600 text-lg hover:text-green-600 pl-6 mt-4 border-l-2 border-transparent hover:border-green-500 transition-all"
                >
                  Stories
                </Link> */}
              </div>
            </>
          )}
        </div>

        <div className="px-6 pt-6 border-b border-gray-100">
          {/* {eventsNav?.dropdown ? (
              <>
                <button
                  onClick={() => toggleSection("Events")}
                  className="flex items-center justify-between w-full text-lg text-gray-800 font-medium"
                >
                  <span>Events</span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 transition-transform text-gray-400",
                      openSection === "Events"
                        ? "rotate-180 text-green-500"
                        : ""
                    )}
                  />
                </button>
                {openSection === "Events" && (
                  <div className="mt-4 ml-4 space-y-4 border-l border-gray-100 pl-4">
                 
                    <Link
                      href="/events-page"
                      onClick={onClose}
                      className="block text-gray-500"
                    >
                      All Events
                    </Link>
                  </div>
                )}
              </>
            ) : ( */}

          <Link
            href="/events-page"
            onClick={onClose}
            className="flex items-center justify-between w-full text-xl text-gray-800 font-medium"
          >
            <span>Events</span>
            {/* <ChevronDown className="w-5 h-5 text-gray-400" /> */}
          </Link>
          {/* )} */}
        </div>

        {/* --- Section 2: List Items --- */}
        {/* <div className="px-8 py-4 space-y-6"> */}
        {/* <div className="pt-2">
            <button
              onClick={() => toggleSection("Facility")}
              className="flex items-center justify-between w-full text-lg text-gray-800 font-medium group"
            >
              <span>Facility</span>
              <ChevronDown
                className={cn(
                  "w-5 h-5 transition-transform text-gray-400",
                  openSection === "Facility" ? "rotate-180 text-green-500" : ""
                )}
              />
            </button>

            {openSection === "Facility" && (
              <div className="mt-4 ml-4 space-y-4 border-l border-gray-100 pl-4">
                {facilitiesNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className="block text-gray-500 hover:text-green-600 text-base"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div> */}

        {/* Events Accordion/Link */}
        {/* <div className="pt-2">
            {eventsNav?.dropdown ? (
    
              <>
                <button
                  onClick={() => toggleSection("Events")}
                  className="flex items-center justify-between w-full text-lg text-gray-800 font-medium"
                >
                  <span>Events</span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 transition-transform text-gray-400",
                      openSection === "Events"
                        ? "rotate-180 text-green-500"
                        : ""
                    )}
                  />
                </button>
                {openSection === "Events" && (
                  <div className="mt-4 ml-4 space-y-4 border-l border-gray-100 pl-4">
                   
                    <Link
                      href="/events-page"
                      onClick={onClose}
                      className="block text-gray-500"
                    >
                      All Events
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/events-page"
                onClick={onClose}
                className="flex items-center justify-between w-full text-lg text-gray-800 font-medium"
              >
                <span>Events</span>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </Link>
            )}
          </div> */}

        {/* Paydesk Accordion (Placeholder based on image) */}
        {/* <div className="pt-2">
            <button
              onClick={() => toggleSection("Paydesk")}
              className="flex items-center justify-between w-full text-lg text-gray-800 font-medium"
            >
              <span>Paydesk</span>
              <ChevronDown
                className={cn(
                  "w-5 h-5 transition-transform text-gray-400",
                  openSection === "Paydesk" ? "rotate-180 text-green-500" : ""
                )}
              />
            </button>
            {openSection === "Paydesk" && (
              <div className="mt-4 ml-4 space-y-4 border-l border-gray-100 pl-4">
                <Link
                  href="/paydesk/invoices"
                  onClick={onClose}
                  className="block text-gray-500"
                >
                  Invoices
                </Link>
                <Link
                  href="/paydesk/settings"
                  onClick={onClose}
                  className="block text-gray-500"
                >
                  Settings
                </Link>
              </div>
            )}
          </div> */}
        {/* </div> */}

        {/* Footer / Auth Actions */}
        {/* <div className="mt-auto px-6 py-8 bg-gray-50 space-y-3">
          {!session ? (
            <>
              <Link href="/sign-in" className="w-full" onClick={onClose}>
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-semibold border-gray-300"
                >
                  Log in
                </Button>
              </Link>
              <Link
                href="/sign-up/startup"
                className="w-full"
                onClick={onClose}
              >
                <Button className="w-full h-12 text-base font-semibold bg-green-500 hover:bg-green-600 text-white">
                  Sign up
                </Button>
              </Link>
            </>
          ) : (
            <Button
              variant="ghost"
              className="w-full h-12 text-base font-semibold text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign Out
            </Button>
          )}
        </div> */}
      </div>
    </div>
  );
}
