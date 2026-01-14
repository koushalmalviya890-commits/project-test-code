import { Suspense } from 'react'
import BookingDetailsClient from './BookingDetailsClient'

export default function BookingDetailsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading booking details...</div>}>
      <BookingDetailsClient />
    </Suspense>
  )
} 