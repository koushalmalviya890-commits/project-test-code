"use client";

import { Mode } from "@/app/(landing)/offices/about/page";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown, Rocket } from "lucide-react";

interface HeaderProps {
  mode?: Mode; // optional so Header can still be reused everywhere
  setMode?: (m: Mode) => void;
}

export default function Header({ mode, setMode }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileStoriesOpen, setMobileStoriesOpen] = useState(false);

  const isStoriesActive = pathname?.startsWith("/sciences/stories");

  const handleStoriesSelect = (nextMode: Mode) => {
    // change page "mode" like your other pages
    if (setMode) {
      setMode(nextMode);
    }
    router.push("/sciences/stories");
  };

  const baseLink = "hover:text-green-600 transition-colors";

  const activeLink = "text-green-600 font-semibold";

  return (
    <header className="hidden sm:block mt-[82px] left-0 right-0 bg-white shadow z-50">
      <div className="flex items-center justify-between px-4 sm:px-6 pt-4">
        {/* Logo Section */}
        <div className="flex items-center">
          {/* <img
            src="/facility/facilitylogo.svg"
            alt="Logo2"
            className="h-10 w-10 sm:h-14 sm:w-14"
          /> */}
          <img
            src="/facility/facilitylogo.svg"
            alt="Logo"
            className="h-14 w-32 sm:h-18 sm:w-40 ml-2"
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8 md:space-x-12 gap-12">
          <nav className="flex space-x-6 xl:space-x-8 text-gray-700">
            <Link href="/sciences/about" legacyBehavior>
              <a
                className={`${baseLink} ${
                  pathname === "/sciences/about" ? activeLink : ""
                }`}
              >
                About
              </a>
            </Link>

            <Link href="/sciences/user" legacyBehavior>
              <a
                className={`${baseLink} ${
                  pathname === "/sciences/user" ? activeLink : ""
                }`}
              >
                User
              </a>
            </Link>

            <Link href="/sciences/enabler" legacyBehavior>
              <a
                className={`${baseLink} ${
                  pathname === "/sciences/enabler" ? activeLink : ""
                }`}
              >
                Enabler
              </a>
            </Link>

            <Link href="/sciences/features" legacyBehavior>
              <a
                className={`${baseLink} ${
                  pathname === "/sciences/features" ? activeLink : ""
                }`}
              >
                Features
              </a>
            </Link>

            {/* Stories with dropdown */}
            {/* Stories with dropdown */}
            {/* <div className="relative group">
              <button
                type="button"
                className={`${baseLink} inline-flex items-center gap-1 ${
                  isStoriesActive ? activeLink : ""
                }`}
              >
                Stories
                <ChevronDown className="w-4 h-4" />
              </button>

              <div className="absolute left-0 top-full pt-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 z-50">
                <div className="w-44 rounded-xl border border-gray-100 bg-white shadow-lg py-2">
                  <button
                    type="button"
                    onClick={() => handleStoriesSelect("startup")}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      mode === "startup" && isStoriesActive
                        ? "text-green-600 font-semibold bg-green-50"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Users
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStoriesSelect("enabler")}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      mode === "enabler" && isStoriesActive
                        ? "text-green-600 font-semibold bg-green-50"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Enablers
                  </button>
                </div>
              </div>
            </div> */}
          </nav>

          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors whitespace-nowrap"
            onClick={() =>
              router.push("https://calendly.com/team-facilitiease/30min")
            }
          >
            Book a Demo <Rocket className="inline-block w-4 h-4 ml-2" />
          </button>
        </div>

        {/* Mobile Menu Button & CTA */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            className="bg-green-600 text-white px-3 py-1.5 text-sm rounded hover:bg-green-700 transition-colors"
            onClick={() =>
              router.push("https://calendly.com/team-facilitiease/30min")
            }
          >
            Demo
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-700 hover:text-green-600 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="hidden lg:hidden border-t border-gray-200 bg-white">
          <nav className="flex flex-col px-4 py-4 space-y-3">
            <Link href="/sciences/about" legacyBehavior>
              <a
                className="text-gray-700 hover:text-green-600 py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
            </Link>
            <Link href="/sciences/user" legacyBehavior>
              <a
                className="text-gray-700 hover:text-green-600 py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                User
              </a>
            </Link>
            <Link href="/sciences/enabler" legacyBehavior>
              <a
                className="text-gray-700 hover:text-green-600 py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Enabler
              </a>
            </Link>
            <Link href="/sciences/features" legacyBehavior>
              <a
                className="text-gray-700 hover:text-green-600 py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
            </Link>

            {/* Mobile Stories dropdown */}
            <button
              type="button"
              className="flex items-center justify-between text-gray-700 hover:text-green-600 py-2 transition-colors"
              onClick={() => setMobileStoriesOpen((prev) => !prev)}
            >
              <span>Stories</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  mobileStoriesOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {mobileStoriesOpen && (
              <div className="ml-4 flex flex-col space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    handleStoriesSelect("startup");
                    setMobileMenuOpen(false);
                  }}
                  className="text-sm text-gray-700 hover:text-green-600 py-1 text-left"
                >
                  Users
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleStoriesSelect("enabler");
                    setMobileMenuOpen(false);
                  }}
                  className="text-sm text-gray-700 hover:text-green-600 py-1 text-left"
                >
                  Enablers
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
