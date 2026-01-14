'use client'

import { Footer } from '@/components/layout/footer'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function AboutUsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="w-full border-b bg-white shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="relative w-16 h-16">
              <Image
                src="/logo.png"
                alt="Cumma Logo"
                fill
                className="object-contain"
              />
            </div>
          </Link>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">About Us</h1>
          
          <div className="prose prose-gray max-w-none">
            <p>
              Cumma is redefining how startups access physical infrastructure across India. 
              We are a unified platform that connects startups with a curated network of co-working spaces, 
              incubation centres, R&D labs, and technical facilities — all in one place.
            </p>
            
            <p className="mt-6">
              Born from the belief that innovation shouldn't be limited by access, Cumma bridges the gap 
              between promising ideas and the spaces they need to thrive. Whether you're a founder seeking 
              the right environment to build, or a facility aiming to maximize your utilization and impact, 
              Cumma creates a seamless, mutually empowering ecosystem.
            </p>
            
            <p className="mt-6">
              We work at the intersection of technology, community, and opportunity. Our platform is regionally 
              rooted yet globally scalable, enabling startups to find and book verified spaces, while empowering 
              institutions and facility providers to unlock new revenue streams and foster entrepreneurial growth.
            </p>
            
            <p className="mt-6">
              With a growing network of partners, and a strong presence across emerging startup hubs, Cumma is 
              not just building a marketplace — we're building the backbone for India's next wave of innovation.
            </p>
            
            <p className="mt-8 text-xl font-semibold text-primary">
              Innovation deserves a launchpad. Cumma makes it accessible.
            </p>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Our Mission</h2>
                <p>
                  To democratize access to physical infrastructure for startups across India, making it 
                  easier for innovative ideas to find the spaces they need to grow and succeed.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Our Vision</h2>
                <p>
                  A world where every startup has seamless access to the physical resources they need, 
                  regardless of their location or stage, enabling innovation to flourish without barriers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
