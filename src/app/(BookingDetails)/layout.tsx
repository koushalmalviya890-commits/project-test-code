import React from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Toaster } from 'sonner'

export const metadata = {
  title: 'Booking Confirmation | Cumma',
  description: 'Confirm your booking details and proceed to payment'
}

export default function BookingDetailsLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* <Navbar /> */}
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
      {/* <Footer /> */}
      <Toaster />
    </>
  )
} 