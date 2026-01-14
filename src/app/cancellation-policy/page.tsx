'use client'

import { Footer } from '@/components/layout/footer'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function CancellationPolicyPage() {
  const [effectiveDate, setEffectiveDate] = useState<string>('')

  useEffect(() => {
    // Set the effective date to the current date in a readable format
    const date = new Date()
    setEffectiveDate(date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }))
  }, [])

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
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Cancellation Policy</h1>
          <p className="text-gray-600 mb-6">Effective Date: {effectiveDate}</p>
          
          <div className="prose prose-gray max-w-none">
            <p>
              At Cumma, we strive to provide the best experience for our customers. If you need to cancel an order or service, 
              we are here to help! Please review our cancellation policy below.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Order Cancellation for Products</h2>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li className="mb-2">
                <strong>Standard Orders:</strong> You may cancel your product order within <strong>24 hours</strong> of placing it. 
                If the cancellation request is received within this time frame, a full refund will be issued to your original 
                payment method.
              </li>
              <li>
                <strong>After 24 Hours:</strong> Orders cannot be cancelled once they have been processed or shipped. 
                {/* However, you may return the product in accordance with our <strong>Refund Policy</strong> once you receive it. */}
              </li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">2. Subscription or Service Cancellation</h2>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li className="mb-2">
                <strong>Subscription Services:</strong> If you have subscribed to a recurring service or subscription with Cumma, 
                you may cancel your subscription at any time before the next billing cycle to avoid future charges.
              </li>
              <li className="mb-2">
                <strong>How to Cancel:</strong> To cancel your subscription, please visit your account settings on our website 
                or contact our customer support team at support@cumma.in. We will assist you in processing the cancellation promptly.
              </li>
              <li>
                <strong>Refunds for Subscriptions:</strong> Cancellations made before the next billing cycle will stop any future 
                payments. However, there will be no refund issued for the current billing period.
              </li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">3. Event or Booking Cancellation</h2>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li>
                <strong>Event Tickets/Bookings:</strong> If you have booked a service or event through our website, you may 
                cancel your booking under the following terms:
                <ul className="list-disc pl-6 mt-2 mb-2">
                  <li className="mb-2">Cancellation before 12 hours of booking time: You will receive a full refund.</li>
                  <li className="mb-2">Cancellation before 4 hours of booking time: A 80% refund will be issued.</li>
                  <li>Cancellation within 4 hours of booking time: No refund will be provided.</li>
                </ul>
              </li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">4. How to Cancel an Order or Service</h2>
            <p>
              To cancel an order or service, please follow these steps:
            </p>
            <ol className="list-decimal pl-6 mt-2 mb-4">
              <li className="mb-2">Go to your Bookings and raise ticket for cancellation</li>
              <li>Contact our support team at support@cumma.in or through our contact form on the website</li>
            </ol>
            <p>
              If required, provide your order number or booking details, along with a brief explanation of your cancellation request.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">5. Late or Missing Cancellations</h2>
            <p>
              If you fail to cancel within the time frames outlined above, we cannot guarantee a refund. In such cases, 
              please contact us, and we will review the situation on a case-by-case basis.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">6. Refund Timeline Policy</h2>
            <p>
              At Cumma, we aim to process all refunds swiftly and transparently. The refund timeline varies depending on the mode of payment used during booking.
            </p>
            <table className="w-full border-collapse border border-gray-200 mt-4 mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 p-2 text-left">Payment Mode</th>
                  <th className="border border-gray-200 p-2 text-left">Refund Processing Time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 p-2">UPI / Wallets</td>
                  <td className="border border-gray-200 p-2">Within 2–4 business days</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-2">Credit / Debit Cards</td>
                  <td className="border border-gray-200 p-2">Within 5–7 business days</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-2">Net Banking</td>
                  <td className="border border-gray-200 p-2">Within 4–6 business days</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-2">Bank Transfers (NEFT/IMPS)</td>
                  <td className="border border-gray-200 p-2">Within 5–7 business days</td>
                </tr>
              </tbody>
            </table>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li className="mb-2">Once your cancellation is approved, you will receive a confirmation email with the refund details.</li>
              <li className="mb-2">All refunds will be processed back to the original source of payment.</li>
              <li>In case of delays beyond the above timelines, please reach out to us at support@cumma.in with your booking ID.</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Contact Us</h2>
            <p>
              If you have any questions regarding cancellations or need assistance, please contact us:
            </p>
            <div className="mt-4">
              <p><strong>Email:</strong> support@cumma.in</p>
              <p><strong>Phone:</strong> +91 87549 47666</p>
              <p><strong>Address:</strong> IDAMUMAI TECHNOLOGIES PRIVATE LIMITED, 46A, Anna Nagar II Street, Linganur, Vadavalli, Coimbatore - 641041</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}