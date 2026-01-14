import { FiSearch } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { UserCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface SearchHeaderProps {
  onSearch: (query: string) => void;
}

export default function SearchHeader({ onSearch }: SearchHeaderProps) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);

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
          setProfile(data);
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

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="bg-white py-4 px-4 sm:px-6 lg:px-8 border-b">
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo-green.png" 
              alt="Cumma Logo" 
              width={100} 
              height={30} 
              className="h-8 w-auto"
            />
          </Link>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            {session?.user ? (
              <div className="flex items-center gap-4">
                <Link href={session.user.userType === 'startup' ? '/startup/bookings' : '/service-provider/dashboard'}>
                  <button className="h-10 px-6 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium">
                    Dashboard
                  </button>
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
                    className="w-[220px] p-5 bg-white rounded-[25px] shadow-lg mt-2 border-none font-jakarta"
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
                        href={session.user.userType === 'startup' ? '/startup/profile' : '/service-provider/profile'}
                        className="block w-full"
                      >
                        <div className="font-bold text-[16px] tracking-tight text-[#222222] hover:text-green-600 transition-colors">
                          Profile
                        </div>
                      </Link>
                      <Link 
                        href={session.user.userType === 'startup' ? '/startup/bookings' : '/service-provider/dashboard'}
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
              <div className="flex items-center gap-4">
                <Link href="/sign-in">
                  <button className="h-10 px-6 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium">
                    Sign In
                  </button>
                </Link>
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
                    className="w-[220px] p-5 bg-white rounded-[25px] shadow-lg mt-2 border-none font-jakarta"
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
        </div>

        {/* Title Section */}
        <div className="text-center mt-8 mb-6">
          <h1 className="text-5xl font-bold text-gray-900 mb-1 tracking-tight">
            Explore All <span className="text-green-500">Enablers</span>
          </h1>
          <h2 className="text-2xl text-gray-600 tracking-tight font-medium">with Cumma</h2>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Keyword"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-full bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 