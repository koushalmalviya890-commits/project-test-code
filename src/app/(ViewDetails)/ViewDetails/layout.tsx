'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
// import { useSession, signOut } from 'next-auth/react'
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { UserCircle, Menu, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { MobileMenu } from '@/components/layout/mobile-menu'
import { MegaDropdown } from '@/components/layout/mega-dropdown'
import { ProfilePicture } from '@/components/ui/profile-picture'
import { Footer } from '@/components/layout/footer'

// Define dropdown background images
const dropdownBackgrounds = {
  'Offices': '/facilities/coworking.jpg',
  'Sciences': '/facilities/lab.jpg',
  'Engineering': '/facilities/equipment.jpg',
  'Studios': '/facilities/meeting.jpg',
}

// Define interfaces for profile data
interface StartupProfile {
  startupName: string | null
  logoUrl: string | null
}

interface ServiceProviderProfile {
  serviceName: string
  logoUrl: string | null
}

// Define category icons
const categoryIcons = {
  'Offices': {
    white: '/icons/offices-white.png',
    green: '/icons/offices-green.png',
  },
  'Sciences': {
    white: '/icons/sciences-white.png',
    green: '/icons/sciences-green.png',
  },
  'Engineering': {
    white: '/icons/engineering-white.png',
    green: '/icons/engineering-green.png',
  },
  'Studios': {
    white: '/icons/studios-white.png',
    green: '/icons/studios-green.png',
  },
}

const navigation = {
  main: [
    { name: 'Workspaces', 
      href: '/offices',
      dropdown: [
        { name: 'Meeting Area', href: '/SearchPage?type=Meeting Room' },
        { name: 'Co-Working Space', href: '/SearchPage?type=Coworking space' },
        { name: 'Private Cabins', href: '/SearchPage?type=Individual Cabin' },
        { name: 'Board Rooms', href: '/SearchPage?type=Board Rooms' },
        { name: 'Raw Space', href: '/SearchPage?type=Raw Space Office' }
      ]
    },
    {
      name: "Facilities",
      href: "/sciences",
      dropdown: [
        { name: "Labs", href: "/SearchPage?type=Bio Allied" },
        { name: "Equipment", href: "/SearchPage?type=Lab Equipment" },
        { name: "Lab space", href: "/SearchPage?type=Raw Space Lab" },
        { name: "Production", href: "/SearchPage?type=Production" },
        { name: "Machines", href: "/SearchPage?type=Manufacturing" },
        {
          name: "Manufacturing space",
          href: "/SearchPage?type=Manufacturing Raw Space",
        },
      ],
    },
    {
      name: "Events",
      href: "/events-page",
      // dropdown: [
      //   { name: 'Production', href: '/SearchPage?type=Production' },
      //   { name: 'Machines', href: '/SearchPage?type=Manufacturing' },
      //   { name: 'Manufacturing space', href: '/SearchPage?type=Manufacturing Raw Space' }
      // ]
    },
    // { 
    //   name: 'Engineering', 
    //   href: '/engineering',
    //   dropdown: [
    //     { name: 'Production', href: '/SearchPage?type=Production' },
    //     { name: 'Manufacturing', href: '/SearchPage?type=Manufacturing' },
    //     { name: 'Manufacturing Raw Space', href: '/SearchPage?type=Manufacturing Raw Space' }
    //   ]
    // },
    // { 
    //   name: 'Studios', 
    //   href: '/studios',
    //   dropdown: [
    //     { name: 'Video', href: '/SearchPage?type=Video Studio' },
    //     { name: 'Podcast', href: '/SearchPage?type=Podcast Studio' },
    //     { name: 'Edit', href: '/SearchPage?type=Edit Studio' }
    //   ]
    // }
  ]
}

export default function ViewDetailsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  // const { data: session } = useSession()
  const { user, logout } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const [logoHovered, setLogoHovered] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [profile, setProfile] = useState<StartupProfile | ServiceProviderProfile | null>(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 50)
    }
    
    handleResize()
    handleScroll()
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [activeDropdown])

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // if (!session?.user) return
        if (!user) return

        const response = await fetch(
          // session.user.userType === 'startup' 
          user.userType === 'startup' 
            ? '/api/startup/profile'
            : '/api/service-provider/profile'
        )
        
        if (response.ok) {
          const data = await response.json()
          // Transform the data to match our interface
          setProfile({
            startupName: data.startupName,
            serviceName: data.serviceName,
            logoUrl: data.logoUrl
          })
        } else {
          console.error('Failed to fetch profile:', await response.text())
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

  //   if (session?.user) {
  //     fetchProfile()
  //   }
  // }, [session])
   if(user?.id){
    fetchProfile()
  }
}, [user?.id, user?.userType])

  const getBookingLink = () => {
    // if (!session?.user) return '/sign-up'
    // return session.user.userType === 'startup'
        if (!user) return '/sign-up'
    return user.userType === 'startup' 
      ? '/startup/bookings' 
      : '/service-provider/dashboard'
  }

  const handleSignOut = async () => {
    // await signOut({ callbackUrl: '/' })
    await logout();
    window.location.href = '/';
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header 
        ref={headerRef}
        className="relative bg-white border-b border-gray-200 shadow-sm z-10"
      >
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex-shrink-0 relative"
            >
              <div className="relative h-10 w-[150px]">
                <Image
                  src="/logo-green.png"
                  alt="Cumma Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>

            {/* Empty space where navigation was */}
            <div className="hidden md:block flex-1"></div>

            {/* Auth Buttons / Profile */}
            <div className="hidden md:flex items-center gap-4">
              {/* {session?.user ? ( */}
              {user ? (
                <div className="flex items-center gap-4">
                  {/* <Link href={session.user.userType === 'startup' ? '/startup/bookings' : '/service-provider/dashboard'}> */}
                 <Link href={user.userType === 'startup' ? '/startup/bookings' : '/service-provider/dashboard'}>
                    <Button size="sm" className="h-10 px-6 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium">
                      Dashboard
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors">
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
                          // href={session.user.userType === 'startup' ? '/startup/profile' : '/service-provider/profile'}
                         href = {user.userType === 'startup' ? '/startup/profile' : '/service-provider/profile'}
                          className="block w-full"
                        >
                          <div className="font-bold text-[16px] tracking-tight text-[#222222] hover:text-green-600 transition-colors">
                            Profile
                          </div>
                        </Link>
                        <Link 
                          // href={session.user.userType === 'startup' ? '/startup/bookings' : '/service-provider/dashboard'}
                         href={user.userType === 'startup' ? '/startup/bookings' : '/service-provider/dashboard'}
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
                      <button className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors">
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <UserCircle className="w-7 h-7 text-gray-500" />
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
                        <Link 
                          href="/sign-in"
                          className="block w-full"
                        >
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

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-700 p-2"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        navigation={navigation.main}
        pathname={pathname}
         session={user} 
        profile={profile as any}
      />

      {/* Page Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
    </div>
  )
}

