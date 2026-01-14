'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 font-jakarta">
      {/* Back button in top left corner */}
      <div className="absolute top-4 left-4 z-10">
        <Button asChild variant="secondary" size="sm" className="flex items-center gap-1 bg-white/80 hover:bg-white/90 backdrop-blur-sm shadow-md">
          <Link href="/landing">
            <ArrowLeft size={16} />
            <span>Back to home</span>
          </Link>
        </Button>
      </div>

      {/* Background image with blur */}
      <div 
        className="absolute inset-0 bg-[url('/auth-bg.jpg')] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/auth-bg.jpg')`
        }}
      >
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>

      {/* Card Container */}
      <div className="relative w-full max-w-[440px]">
        <div className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 rounded-xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/logo.png"
              alt="FacilitiEase Logo"
              width={200}
              height={40}
              priority
            />
          </div>

          {children}
        </div>
      </div>
    </div>
  )
} 