'use client'

import Link from 'next/link'
import Image from 'next/image'
import { 
  Search, 
  Star, 
  ArrowRight, 
  ArrowLeft,
  HomeIcon, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Wifi,
  Coffee,
  Car,
  Printer,
  Building2,
  Plus,
  Minus,
  Phone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSession } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { FacilityCard, FacilityCardSkeleton } from "@/components/ui/facility-card"
import { ExploreEnablers } from "@/components/sections/explore-enablers"
import { NewsletterSignup } from "@/components/sections/newsletter-signup"

// Import AMENITY_ICONS from components
import { AMENITY_ICONS } from '@/components'

const scienceSpaceTypes = [
  {
    name: "Labs",
    description: "Cutting-edge laboratory spaces equipped for scientific research and experimentation.",
    image: "/facilities/labs.jpg",
    link: "/SearchPage?type=Labs"
  },
  {
    name: "Equipments",
    description: "Access to advanced scientific instruments and specialized research equipment.",
    image: "/facilities/lab-equipment.jpg",
    link: "/SearchPage?type=Lab+Equipment"
  },
  {
    name: "Lab Space",
    description: "Flexible research spaces designed for bio and allied science startups and innovators.",
    image: "/facilities/lab-space.jpg",
    link: "/SearchPage?type=Lab+Space"
  }
]

// Benefits of Science Spaces
const scienceBenefits = [
  {
    icon: <Building2 className="h-6 w-6 text-white" />,
    title: "Well-Equipped Lab Spaces",
    description: "Access cutting-edge facilities tailored for research and innovation."
  },
  {
    icon: <Wifi className="h-6 w-6 text-white" />,
    title: "Advanced Instruments",
    description: "Utilize high-quality equipment essential for scientific advancements"
  },
  {
    icon: <Coffee className="h-6 w-6 text-white" />,
    title: "Campus Integration",
    description: "Located within colleges, ensuring accessibility and academic collaboration."
  },
  {
    icon: <Car className="h-6 w-6 text-white" />,
    title: "Seamless Booking",
    description: "Essential services and infrastructure to streamline research operations"
  },
  {
    icon: <Printer className="h-6 w-6 text-white" />,
    title: "Cost-Effective Solutions",
    description: "Affordable options for startups, researchers, and innovators"
  },
  {
    icon: <Building2 className="h-6 w-6 text-white" />,
    title: "Customizable Raw Spaces",
    description: "Design and build labs to meet your specific research needs."
  }
]

interface FeaturedFacility {
  _id: string
  details: {
    name: string
    images: string[]
    rentalPlans?: Array<{
      name: string
      price: number
      duration: string
    }>
  }
  address: string
  features: string[]
  serviceProvider?: {
    serviceName: string
    features?: string[]
  }
  facilityType: string
  isFeatured: boolean
}

export default function SciencesPage() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [featuredFacilities, setFeaturedFacilities] = useState<FeaturedFacility[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null)
  const [openFaqIndex, setOpenFaqIndex] = useState<number>(1) // Set the 2nd FAQ open by default
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  
  // State for Science Space Info form
  const [scienceFormName, setScienceFormName] = useState('')
  const [scienceFormEmail, setScienceFormEmail] = useState('')
  const [scienceFormPhone, setScienceFormPhone] = useState('')
  const [scienceFormDescription, setScienceFormDescription] = useState('')
  const [scienceFormLoading, setScienceFormLoading] = useState(false)
  const [scienceFormSuccess, setScienceFormSuccess] = useState(false)
  const [scienceFormError, setScienceFormError] = useState(false)

  const faqItems = [
    {
      question: "How do I get started?",
      answer: "Getting started with Cumma is easy! First, create an account on our platform. Then browse our available science spaces based on your requirements - you can filter by location, lab type, available equipment, and price range. Once you find the perfect space, you can book it directly through our platform. For specialized lab spaces, you may request a tour before booking. Our customer support team is available to help you throughout the process."
    },
    {
      question: "Can I book a facility for multiple days?",
      answer: "Yes, you can book on an hourly, daily, or multi-day basis, depending on the provider's availability."
    },
    {
      question: "Are there any discounts or credits available?",
      answer: "Yes! We offer several discount programs for researchers and academic institutions. New users receive a welcome discount on their first booking. We also have loyalty programs for returning customers, with points that can be redeemed for future bookings. Additionally, we run seasonal promotions and offer special rates for long-term research projects. Subscribe to our newsletter to stay updated on our latest promotions and special offers."
    },
    {
      question: "How can I modify or cancel a booking?",
      answer: "To modify or cancel a booking, log into your Cumma account and navigate to 'My Bookings'. Select the reservation you want to change, and you'll see options to modify dates, times, or cancel completely. Please note that cancellation policies vary by service provider - some allow free cancellation up to 24 hours before your booking, while others may have different terms. Any applicable refunds will be processed according to the provider's policy, which is always displayed before you complete your booking."
    },
    {
      question: "How can I list my facility on Cumma?",
      answer: "To list your science facility on Cumma, start by creating a service provider account. Once registered, you can add your facility details including location, available equipment, high-quality photos, availability schedules, and pricing options. Our team will review your listing to ensure it meets our quality standards before it goes live. We also offer optional premium features to boost your visibility on our platform. For more detailed guidance, visit our 'Become a Provider' page or contact our partner support team."
    }
  ]

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index)
  }

  // Fetch science space facilities
  useEffect(() => {
    const fetchScienceFacilities = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Create a comma-separated list of science-related property types
        const scienceTypes = [
          'Lab',
          'Research Facility',
          'Lab Equipment',
          'Bio Lab'
        ].join(',')
        
        const response = await fetch(`/api/facilities/search?` + new URLSearchParams({
          propertyTypes: scienceTypes,
          limit: '8',
          isFeatured: 'true'
        }))
        
        if (!response.ok) throw new Error('Failed to fetch science facilities')
        
        const data = await response.json()
        
        const formattedFacilities = data.facilities.map((facility: any) => {
          return {
            _id: facility._id,
            details: {
              name: facility.details.name,
              images: facility.details.images || [],
              rentalPlans: facility.details.rentalPlans || []
            },
            address: facility.address,
            features: facility.features || [],
            serviceProvider: facility.serviceProvider,
            facilityType: facility.facilityType || "Other",
            isFeatured: facility.isFeatured
          };
        });
        
        setFeaturedFacilities(formattedFacilities)
      } catch (error) {
        console.error('Error fetching science facilities:', error)
        setError('Failed to load science facilities')
      } finally {
        setLoading(false)
      }
    }
    
    fetchScienceFacilities()
  }, [])

  const handleSearch = () => {
    setIsSearching(true)
    const searchParams = new URLSearchParams()
    
    if (searchTerm) {
      searchParams.set('search', searchTerm)
    }

    // Add science property types
    const propertyTypes = [
      'Lab',
      'Research Facility',
      'Lab Equipment',
      'Bio Lab'
    ]
    searchParams.set('propertyTypes', propertyTypes.join(','))

    // Set default sort
    searchParams.set('sortBy', 'newest')

    router.push(`/SearchPage?${searchParams.toString()}`)
  }

  const handleCallbackRequest = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)
    setSubmitError(false)
    
    // In a real implementation, this would be an API call to send an email
    // For demo purposes, we'll simulate a successful submission
    
    // Simulate sending email to support@cumma.in
    setTimeout(() => {
     // console.log("Callback request submitted:", { name, email, phone })
      setSubmitLoading(false)
      setSubmitSuccess(true)
      
      // Reset form
      setTimeout(() => {
        setName('')
        setEmail('')
        setPhone('')
        setSubmitSuccess(false)
      }, 3000)
    }, 1500)
  }

  // Function to handle the Science Space Info form submission
  const handleScienceFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setScienceFormLoading(true)
    setScienceFormError(false)
    
    // Simulate sending email to support@cumma.in
    setTimeout(() => {
     // console.log("Science Space Info request submitted:", { 
      //   name: scienceFormName, 
      //   email: scienceFormEmail, 
      //   phone: scienceFormPhone,
      //   description: scienceFormDescription
      // })
      setScienceFormLoading(false)
      setScienceFormSuccess(true)
      
      // Reset form
      setTimeout(() => {
        setScienceFormName('')
        setScienceFormEmail('')
        setScienceFormPhone('')
        setScienceFormDescription('')
        setScienceFormSuccess(false)
      }, 3000)
    }, 1500)
  }

  return (
    <div className="font-jakarta">
      {/* Hero Section */}
      <div className="relative min-h-[720px] flex items-center justify-center py-16 md:py-24">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/SciencesHero.jpg"
            alt="Science Spaces"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/80" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[100px] font-black text-green-500 tracking-[-0.09em] leading-[90px] mb-6">
            Sciences
          </h1>
          <p className="text-md md:text-xl text-white max-w-3xl mx-auto mb-8 tracking-[-0.05em]">
            Discover state-of-the-art labs, cutting-edge equipment hubs, and flexible research spaces—designed to empower bio and allied startups
          </p>
          
          <Button 
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white font-extrabold text-lg px-8 py-6 rounded-xl border border-black/30 transition-all tracking-[-0.05em]"
            onClick={() => router.push('/SearchPage?propertyTypes=Lab,Research+Facility,Lab+Equipment,Bio+Lab')}
          >
            Explore all Science Spaces
          </Button>
        </div>
      </div>

      {/* Science Types Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="flex flex-col items-center">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-[-1.4px]">
                Explore
              </h2>
              <h2 className="text-5xl md:text-6xl lg:text-[84px] font-extrabold text-green-500 mb-4 tracking-[-3.4px] leading-[75px]">
                Science Spaces
              </h2>
            </div>
            <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto tracking-[-1.4px]">
              One-stop facility marketplace, offering flexible and cost-effective spaces for businesses, startups, and innovators.
            </p>
          </div>

          {/* Science Type Cards */}
          <div className="flex justify-center w-full">
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 max-w-[1400px]">
              {[
                { 
                  name: "Labs", 
                  image: "/facilities/labs-features.jpeg",
                  description: "State-of-the-art laboratory spaces equipped with essential infrastructure for scientific research and experimentation."
                },
                { 
                  name: "Equipments", 
                  image: "/facilities/equipments.jpeg",
                  description: "Advanced scientific instruments and equipment available for research, testing, and development activities."
                },
                { 
                  name: "Lab Space", 
                  image: "/facilities/labspace-features.jpeg",
                  description: "Customizable laboratory environments designed to accommodate various scientific disciplines and research needs."
                }
              ].map((item, index) => (
                <Card 
                  key={index}
                  className="w-full sm:w-[280px] h-[380px] bg-[#23bb4e] rounded-[30px] relative overflow-hidden cursor-pointer group"
                  onClick={() => router.push('/SearchPage?type=' + encodeURIComponent(item.name))}
                >
                  <CardContent className="p-0 h-full flex flex-col justify-between">
                    {/* Normal state */}
                    <div className="relative h-[327px] w-full">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-200 ease-in-out"
                      />
                    </div>
                    <div className="px-[40px] py-3 font-medium text-white text-lg tracking-[-1.40px] font-['Plus_Jakarta_Sans',Helvetica] group-hover:opacity-0 transition-opacity duration-200 ease-in-out">
                      {item.name}
                    </div>
                    
                    {/* Hover state */}
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out flex flex-col rounded-[30px]">
                      <div className="p-5 flex-grow">
                        <h3 className="text-xl font-bold text-gray-800 mb-3">{item.name}</h3>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      <div className="mt-auto bg-[#23bb4e] py-3 px-5 text-white flex items-center justify-center">
                        <span className="font-medium text-base mr-2">Explore All</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-20 bg-[#58B571] text-white rounded-[40px] mx-4 sm:mx-6 lg:mx-8 xl:mx-auto max-w-[1920px]">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column - Heading and Description */}
            <div className="flex flex-col justify-start lg:col-span-5 px-4 md:px-8 lg:px-12">
              <h2 className="text-3xl md:text-4xl lg:text-[52px] font-extrabold mb-3 text-black tracking-[-0.07em] leading-[72px]">
                Why Choose
              </h2>
              <div className="relative w-[300px] h-[90px] sm:w-[320px] sm:h-[90px] md:w-[380px] md:h-[110px] mb-6">
                <Image
                  src="/logo-white.png"
                  alt="Cumma Logo"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
              <p className="text-sm md:text-lg text-white leading-[23px] tracking-[-0.05em] max-w-md mb-8 lg:mb-0">
                Cumma provides a research-driven ecosystem where science and innovation thrive—empowering startups, researchers, and future pioneers.
              </p>
            </div>

            {/* Right Column - Benefits in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-[60px] gap-y-10 md:gap-y-12 lg:col-span-7 px-4 md:px-6 lg:px-8">
              {scienceBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-[54px] h-[54px] bg-transparent flex items-center justify-center">
                    {index === 0 && (
                      <Image
                        src="/icons/quality-certificate.svg"
                        alt={benefit.title}
                        width={54}
                        height={54}
                        className="text-white"
                      />
                    )}
                    {index === 1 && (
                      <Image
                        src="/icons/science-lab.svg"
                        alt={benefit.title}
                        width={54}
                        height={54}
                        className="text-white"
                      />
                    )}
                    {index === 2 && (
                      <Image
                        src="/icons/education.svg"
                        alt={benefit.title}
                        width={54}
                        height={54}
                        className="text-white"
                      />
                    )}
                    {index === 3 && (
                      <Image
                        src="/icons/online-booking.png"
                        alt={benefit.title}
                        width={54}
                        height={54}
                        className="text-white"
                      />
                    )}
                    {index === 4 && (
                      <Image
                        src="/icons/cost-cutting.svg"
                        alt={benefit.title}
                        width={54}
                        height={54}
                        className="text-white"
                      />
                    )}
                    {index === 5 && (
                      <Image
                        src="/icons/customize.svg"
                        alt={benefit.title}
                        width={54}
                        height={54}
                        className="text-white"
                      />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-xl font-extrabold leading-6 tracking-[-0.09em] mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm md:text-lg leading-[23px] tracking-[-0.05em] text-white/90 max-w-[300px]">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-500 mb-12 pl-4 sm:pl-8 md:pl-12 opacity-60 tracking-[-0.05em]">
            FAQ
          </h2>
          
          <div className="max-w-5xl mx-auto">
            {faqItems.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 mb-6">
                <button 
                  className="flex justify-between items-center w-full text-left focus:outline-none group"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaqIndex === index}
                >
                  <h3 className="text-xl font-semibold text-gray-800 group-hover:text-green-600 transition-colors tracking-[-0.05em] pl-16 relative">
                    <div className="absolute left-8 top-1/2 -translate-y-1/2">
                      {openFaqIndex === index ? (
                        <div className="w-[25px] h-[5px] bg-[#23bb4e] rounded-[10px]" />
                      ) : (
                        <div className="relative">
                          <div className="w-[25px] h-[5px] bg-[#23bb4e] rounded-[10px]" />
                          <div className="w-[25px] h-[5px] bg-[#23bb4e] rounded-[10px] absolute top-0 left-0 rotate-90 origin-center" />
                        </div>
                      )}
                    </div>
                    {faq.question}
                  </h3>
                </button>
                <div 
                  className={`mt-4 text-gray-600 transition-all duration-300 ${
                    openFaqIndex === index ? 'max-h-96 opacity-100 pl-16' : 'max-h-0 opacity-0 overflow-hidden'
                  }`}
                >
                  <p className="text-base opacity-60">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Science Space Info Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-[#161616] rounded-[40px] shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left column - Text */}
                <div className="p-8 md:p-12 lg:p-16 relative">
                  <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-extrabold text-white leading-[68px] mb-4 relative z-10 tracking-[0.01em]">
                    Get Know<br />
                    More About<br />
                    <span className="text-white">Science Spaces</span>
                  </h2>
                  {/* Cumma logo background */}
                  <div className="absolute -z-0 -bottom-10 -left-5 opacity-10">
                    <div className="relative w-[268px] h-[384px]">
                      <Image
                        src="/cumma-symbol.png"
                        alt="Cumma Symbol"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Right column - Form */}
                <div className="p-8 md:p-12 lg:p-16 bg-[#161616]">
                  <form onSubmit={handleScienceFormSubmit} className="space-y-5">
                    <div>
                      <input
                        type="text"
                        id="scienceFormName"
                        placeholder="Full Name"
                        className="w-full px-12 py-6 rounded-[13px] bg-white text-gray-800 focus:outline-none"
                        value={scienceFormName}
                        onChange={(e) => setScienceFormName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <input
                        type="email"
                        id="scienceFormEmail"
                        placeholder="Mail Address"
                        className="w-full px-12 py-6 rounded-[13px] bg-white text-gray-800 focus:outline-none"
                        value={scienceFormEmail}
                        onChange={(e) => setScienceFormEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <input
                        type="tel"
                        id="scienceFormPhone"
                        placeholder="Mobile Number"
                        className="w-full px-12 py-6 rounded-[13px] bg-white text-gray-800 focus:outline-none"
                        value={scienceFormPhone}
                        onChange={(e) => setScienceFormPhone(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <textarea
                        id="scienceFormDescription"
                        placeholder="Description"
                        rows={4}
                        className="w-full px-12 py-6 rounded-[13px] bg-white text-gray-800 resize-none focus:outline-none"
                        value={scienceFormDescription}
                        onChange={(e) => setScienceFormDescription(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="pt-5 flex justify-center">
                      <button
                        type="submit"
                        className={`px-10 py-5 rounded-[53px] bg-[#23bb4e] text-white font-extrabold hover:bg-green-600 transition-colors text-2xl flex items-center justify-center w-[289px] tracking-[-0.05em] ${scienceFormLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        disabled={scienceFormLoading}
                      >
                        {scienceFormLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            <span>Processing...</span>
                          </>
                        ) : scienceFormSuccess ? (
                          'Request Submitted!'
                        ) : (
                          'Request Call Back'
                        )}
                      </button>
                      
                      {scienceFormError && (
                        <p className="text-red-500 text-sm mt-3 text-center">
                          Something went wrong. Please try again.
                        </p>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
} 