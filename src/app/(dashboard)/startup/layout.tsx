'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSession, signOut } from 'next-auth/react'
import { CalendarDays, UserCircle, LogOut, Home, Menu, X } from 'lucide-react'
import { useState } from 'react'

// Define the navigation item type
interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  onClick?: () => void
}

export default function StartupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/sign-in' })
  }

  const navigation: {
    main: NavigationItem[]
    account: NavigationItem[]
  } = {
    main: [
      {
        name: 'Bookings',
        href: '/startup/bookings',
        icon: CalendarDays,
      },
    ],
    account: [
      {
        name: 'My Profile',
        href: '/startup/profile',
        icon: UserCircle,
      },
      {
        name: 'Logout',
        href: '#',
        icon: LogOut,
        onClick: handleLogout,
      },
      {
        name: 'Go back',
        href: '/',
        icon: Home,
      },
    ],
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const renderNavigationItems = (items: NavigationItem[]) => {
    return items.map((item) => {
      const isActive = pathname === item.href
      if (item.onClick) {
        return (
          <a
            key={item.name}
            href={item.href}
            onClick={(e) => {
              e.preventDefault()
              item.onClick!()
              closeMobileMenu()
            }}
            className={cn(
              'flex items-center gap-3 px-2 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer',
              'text-gray-600 hover:bg-gray-50'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </a>
        )
      }
      return (
        <Link
          key={item.name}
          href={item.href}
          onClick={closeMobileMenu}
          className={cn(
            'flex items-center gap-3 px-2 py-3 text-sm font-medium rounded-lg transition-colors',
            isActive
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-50'
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.name}
        </Link>
      )
    })
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] font-jakarta">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-5 right-20 z-50 p-2 bg-white rounded-lg border shadow-sm md:hidden"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "w-[280px] bg-white h-full p-4 flex flex-col gap-8 border-r transition-transform duration-300 ease-in-out z-40",
        // Desktop: always visible
        "md:flex md:relative md:translate-x-0",
        isMobileMenuOpen 
     ? "fixed top-0 left-0 flex translate-x-0" 
     : "hidden fixed top-0 -translate-x-full"
      )}>
        {/* Mobile Header Spacer */}
        <div className="h-12 md:hidden" />
        
        {/* Main Navigation */}
        <div className="space-y-2">
          <h2 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            MAIN
          </h2>
          <nav className="space-y-1">
            {renderNavigationItems(navigation.main)}
          </nav>
        </div>

        {/* Account Management */}
        <div className="space-y-2">
          <h2 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            MANAGE ACCOUNT
          </h2>
          <nav className="space-y-1">
            {renderNavigationItems(navigation.account)}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 p-8 overflow-y-auto bg-[#F8F9FC]",
        // Mobile: full width, add top padding for menu button
        "w-full pt-16 px-4 md:pt-8 md:px-8"
      )}>
        {children}
      </main>
    </div>
  )
}