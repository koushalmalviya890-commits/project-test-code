'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
// import { useSession, signOut } from 'next-auth/react'
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  // const { data: session } = useSession()
  const { user, logout } = useAuth(); 

  return (
    <nav className="w-full border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image
              src="/logo.png"
              alt="Cumma Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-semibold text-xl">Cumma</span>
        </Link>

        <div className="flex items-center gap-4">
          {/* {session ? ( */}
          {user ? (
            <>
              <Button variant="ghost" onClick={() => logout()}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
} 