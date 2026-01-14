'use client'

import { Footer } from '@/components/layout/footer'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function TermsAndConditionsPage() {
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
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Terms and Conditions</h1>
          <p className="text-gray-600 mb-6">Effective Date: {effectiveDate}</p>
          
          <div className="prose prose-gray max-w-none">
            <p>
              Welcome to Cumma, a platform designed for startups to book facilities across various locations. 
              By accessing or using our website (the "Site"), you agree to comply with and be bound by the 
              following terms and conditions (the "Agreement"). If you do not agree to these terms, you should not use the Site.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Eligibility</h2>
            <p>
              By using the Site, you represent and warrant that you are at least 18 years old and have the legal capacity 
              to enter into binding contracts. The Site is intended for startups, businesses, and entrepreneurs who are 
              legally authorized to use the services provided.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">2. Services Provided</h2>
            <p>
              Cumma offers a platform where users can book various facilities, including but not limited to coworking spaces, 
              meeting rooms, event venues, and other business-related facilities ("Services"). The available facilities are 
              listed on the Site, and users can search for, book, and pay for these spaces via the Site.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">3. Account Registration</h2>
            <p>
              To book facilities, users must create an account. During the registration process, you must provide accurate 
              and complete information. You agree to update your account information to maintain its accuracy.
            </p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li className="mb-2">
                <strong>Username and Password:</strong> You are responsible for maintaining the confidentiality of your 
                username and password. You agree to notify us immediately of any unauthorized use of your account.
              </li>
              <li>
                <strong>Account Termination:</strong> Cumma reserves the right to suspend or terminate your account at any 
                time if you violate any terms or engage in fraudulent or unlawful activities.
              </li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">4. Booking Process</h2>
            <p>
              By booking a facility through the Site, you agree to the following:
            </p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li className="mb-2">
                <strong>Facility Availability:</strong> All bookings are subject to availability. While we aim to provide 
                accurate information regarding facility availability, Cumma makes no guarantees that the facilities will be 
                available at the time of booking.
              </li>
              <li className="mb-2">
                <strong>Booking Confirmation:</strong> Your booking will be confirmed once you receive an email or notification 
                from Cumma. You are responsible for ensuring that the details of the booking are correct.
              </li>
              <li>
                <strong>Payment Terms:</strong> Payments for bookings must be made through the payment methods provided on the 
                Site. Payment is required at the time of booking, unless otherwise stated. You agree to pay all applicable fees, 
                including taxes and additional charges.
              </li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">5. User Responsibilities</h2>
            <p>
              As a user, you agree to:
            </p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li className="mb-2">Use the Services only for lawful business purposes.</li>
              <li className="mb-2">Not engage in any activity that disrupts the operation of the Site or facilities.</li>
              <li className="mb-2">Follow all rules, regulations, and guidelines set by the facility owners or operators.</li>
              <li>Not use the facilities for illegal activities or violate any local, state, or national laws.</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">6. Cancellations and Refunds</h2>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li className="mb-2">
                <strong>Cancellation Policy:</strong> You may cancel your booking in accordance with the cancellation policy 
                specified for each facility. Depending on the facility's policy, cancellations may incur a fee.
              </li>
              <li>
                <strong>Refunds:</strong> Refunds will be provided in accordance with the facility's cancellation policy. 
                If you are entitled to a refund, it will be processed via the same payment method used for booking.
              </li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Fees and Payments</h2>
            <p>
              All fees, including booking fees, facility usage fees, and additional services, will be clearly listed during 
              the booking process. You agree to pay all fees promptly and in full. Cumma reserves the right to adjust prices 
              for services or facilities at any time without prior notice.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Privacy and Data Protection</h2>
            <p>
              Cumma values your privacy. By using the Site, you agree to the collection and use of your personal data as 
              described in our <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>. 
              We take reasonable precautions to protect your data but cannot guarantee its absolute security.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">9. Liability</h2>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li className="mb-2">
                <strong>Limitation of Liability:</strong> Cumma is not responsible for any loss, damage, or injury that occurs 
                during the use of the facilities booked through the Site, unless such damages are caused by our negligence or 
                willful misconduct.
              </li>
              <li>
                <strong>Third-Party Providers:</strong> Cumma does not own or operate the facilities listed on the Site. 
                Therefore, we are not responsible for the actions or inactions of the facility owners, operators, or third-party 
                providers.
              </li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">10. Intellectual Property</h2>
            <p>
              All content on the Site, including but not limited to text, images, logos, and designs, is the property of Cumma 
              or its licensors. You may not use, copy, modify, or distribute any content without prior written consent from Cumma.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">11. Amendments</h2>
            <p>
              Cumma reserves the right to update or modify these Terms and Conditions at any time. Any changes will be posted 
              on this page with an updated effective date. By continuing to use the Site after changes have been made, you agree 
              to the updated Terms and Conditions.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">12. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms and Conditions are governed by the laws of India. Any disputes arising from or related to the use of 
              the Site shall be resolved through binding arbitration in Coimbatore, unless otherwise required by law.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">13. Contact Information</h2>
            <p>
              If you have any questions or concerns about these Terms and Conditions, please contact us at:
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