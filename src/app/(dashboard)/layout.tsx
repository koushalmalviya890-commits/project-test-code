'use client'

import Image from 'next/image'
import Link from 'next/link'
// import { useSession } from 'next-auth/react'
import {useAuth } from "@/context/AuthContext"
import { ProfilePicture } from '@/components/ui/profile-picture'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface StartupProfile {
  startupName: string | null
  logoUrl: string | null
}

interface ServiceProviderProfile {
  serviceName: string
  logoUrl: string | null
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // const { data: session } = useSession()
  const { user } = useAuth();
  const session = user ? { user } : null;
  const pathname = usePathname()
  const [profile, setProfile] = useState<StartupProfile | ServiceProviderProfile | null>(null)
  
  // Check if the current route is in the service provider section
  const isServiceProviderRoute = pathname?.startsWith('/service-provider')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user?.id) return


        // ✅ 1. Point to Express Backend
        const API_URL = "http://localhost:3001";
        
        // ✅ 2. Determine the correct endpoint
        // Note: Make sure these routes exist in your Express backend!
        const endpoint = user.userType === 'startup' 
          ? '/api/startup/profile' 
          : '/api/service-provider/profile';

        const response = await fetch(`${API_URL}${endpoint}`, {
           method: "GET",
           headers: {
             "Content-Type": "application/json",
           },
           // ✅ 3. CRITICAL: Send the cookie to Express
           credentials: 'include'
        });


        // const response = await fetch(
        //   user.userType === 'startup' 
        //     ? '/api/startup/profile'
        //     : '/api/service-provider/profile'
        // )
        
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

    fetchProfile()
  // }, [session])
}, [user?.id, user?.userType]);

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-jakarta">
      {/* Header - Only show for startup users */}
      {!isServiceProviderRoute && (
        <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
          <div className="flex h-20 items-center justify-between px-6 sm:px-8">
            <div className="flex items-center gap-8">
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="Cumma Logo"
                  width={150}
                  height={32}
                  priority
                />
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm font-medium">
                Welcome back, {
                  session?.user?.userType === 'startup'
                    ? (profile as StartupProfile)?.startupName
                    : (profile as ServiceProviderProfile)?.serviceName
                  || 'User'
                }!
              </span>
              <div className="h-12 w-12">
                <ProfilePicture
                  imageUrl={profile?.logoUrl}
                  size={40}
                />
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Page Content */}
      {children}
    </div>
  )
} 