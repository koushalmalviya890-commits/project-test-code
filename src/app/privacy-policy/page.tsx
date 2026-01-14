'use client'

import { Footer } from '@/components/layout/footer'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 mb-6">Effective Date: {effectiveDate}</p>
          
          <div className="prose prose-gray max-w-none">
            <p>
              At Cumma, we value your privacy and are committed to protecting your personal information. 
              This Privacy Policy outlines how we collect, use, and safeguard your personal data when you 
              access or use our website (the "Site"). By using the Site, you agree to the practices described 
              in this Privacy Policy.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
            <p>
              We collect personal information that you provide to us when using our Site. This information may include:
            </p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li className="mb-2">
                <strong>Account Information:</strong> When you create an account, we collect your name, email address, 
                phone number, company name, billing information, and any other details you provide.
              </li>
              <li className="mb-2">
                <strong>Booking Information:</strong> We collect details about the facilities you book through our platform, 
                such as the location, date, and time of booking, as well as any preferences or special requests.
              </li>
              <li className="mb-2">
                <strong>Payment Information:</strong> To process your payments, we collect payment details such as credit 
                card numbers or other payment methods. Payment processing is handled by third-party payment providers, and 
                Cumma does not store your payment details directly.
              </li>
              <li>
                <strong>Usage Data:</strong> We collect information about your interactions with the Site, such as IP addresses, 
                browser types, device information, and browsing patterns. This information helps us improve the functionality 
                and user experience of the Site.
              </li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
            <p>
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li className="mb-2">
                <strong>To Provide Services:</strong> We use your information to create and manage your account, process your 
                bookings, and provide you with the facilities and services you request.
              </li>
              <li className="mb-2">
                <strong>Customer Support:</strong> To respond to your inquiries, resolve issues, and provide customer service.
              </li>
              <li className="mb-2">
                <strong>Communication:</strong> We may use your contact information to send you updates about your bookings, 
                new features, promotions, or other relevant communications related to our services.
              </li>
              <li className="mb-2">
                <strong>Improvement of Services:</strong> We analyze usage data to improve the Site, enhance functionality, 
                and optimize the user experience.
              </li>
              <li>
                <strong>Legal Compliance:</strong> We may use your information to comply with legal obligations, resolve 
                disputes, and enforce our Terms and Conditions.
              </li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">3. How We Share Your Information</h2>
            <p>
              We respect your privacy and will not sell, trade, or rent your personal information to third parties. 
              However, we may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li className="mb-2">
                <strong>Service Providers:</strong> We may share your personal data with trusted third-party service providers 
                who assist us in operating the Site, processing payments, and providing customer support. These providers are 
                obligated to protect your data and use it only for the services they provide to us.
              </li>
              <li className="mb-2">
                <strong>Legal Compliance:</strong> We may disclose your information if required by law, court order, or 
                governmental regulation, or in response to requests from law enforcement or other legal authorities.
              </li>
              <li>
                <strong>Business Transfers:</strong> In the event that Cumma undergoes a merger, acquisition, or sale of assets, 
                your personal information may be transferred as part of that transaction. We will notify you of any such changes, 
                and your information will continue to be protected under this Privacy Policy.
              </li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">4. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and other tracking technologies to enhance your experience on the Site. Cookies are small files 
              stored on your device that help us remember your preferences, keep you logged in, and analyze how you use the Site.
            </p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li className="mb-2">
                <strong>Types of Cookies:</strong> We use session cookies (which expire when you close your browser) and 
                persistent cookies (which remain on your device until they expire or you delete them).
              </li>
              <li>
                <strong>Third-Party Cookies:</strong> We may allow third-party services (such as Google Analytics) to use 
                cookies to track and analyze Site usage to improve our services. These third parties may collect and use data 
                according to their own privacy policies.
              </li>
            </ul>
            <p>
              You can manage your cookie preferences through your browser settings. However, disabling cookies may affect 
              some features and functionality of the Site.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">5. Data Security</h2>
            <p>
              We take reasonable steps to protect your personal information from unauthorized access, loss, misuse, or alteration. 
              This includes using encryption technologies, secure servers, and access controls to safeguard your data.
            </p>
            <p>
              However, no method of data transmission or storage can be 100% secure. While we strive to protect your information, 
              we cannot guarantee the security of any data transmitted to or from the Site.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">6. Your Rights and Choices</h2>
            <p>
              Depending on your location and applicable laws, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li className="mb-2">
                <strong>Access:</strong> You may request access to the personal information we hold about you.
              </li>
              <li className="mb-2">
                <strong>Correction:</strong> You may request that we update or correct any inaccurate information.
              </li>
              <li className="mb-2">
                <strong>Deletion:</strong> You may request that we delete your personal information, subject to certain 
                exceptions (e.g., if we need to retain it for legal or operational reasons).
              </li>
              <li>
                <strong>Opt-Out:</strong> You can opt-out of receiving marketing communications by following the unsubscribe 
                instructions in the emails we send you or by contacting us directly.
              </li>
            </ul>
            <p>
              If you would like to exercise any of these rights, please contact us using the details provided below.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Children's Privacy</h2>
            <p>
              The Site is not intended for children under the age of 18. We do not knowingly collect personal information from 
              children. If we learn that we have collected personal data from a child under the age of 18, we will take steps 
              to delete that information as soon as possible.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Third-Party Links</h2>
            <p>
              Our Site may contain links to third-party websites, services, or platforms that are not operated or controlled 
              by Cumma. This Privacy Policy only applies to the information collected on the Site. We are not responsible for 
              the privacy practices of third-party websites. We encourage you to review their privacy policies before providing 
              any personal information.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">9. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, or legal 
              obligations. Any changes will be posted on this page with an updated effective date. We encourage you to review 
              this policy periodically to stay informed about how we are protecting your information.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">10. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
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