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
// import { useSession } from 'next-auth/react'
import { useAuth } from '@/context/AuthContext'
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

// Define the studio types
const studioTypes = [
  {
    name: "Video",
    image: "/istockphoto-1461320860-640x640.jpg",
    description: "Professional spaces equipped with lighting, cameras, and sound equipment for high-quality video and photo production.",
    link: "/SearchPage?propertyTypes=Production+Studio"
  },
  {
    name: "Podcast",
    image: "/Podcast-Studio-Space-optimized.png",
    description: "Soundproof spaces with acoustic treatment designed for music recording, voiceovers, and podcast creation.",
    link: "/SearchPage?propertyTypes=Recording+Studio"
  },
  {
    name: "Photography",
    image: "/photography-studio.jpg",
    description: "Versatile spaces with professional lighting setups perfect for photo shoots and small-scale productions.",
    link: "/SearchPage?propertyTypes=Photography+Studio"
  },
  {
    name: "Art",
    image: "/art-studio.jpg",
    description: "Creative spaces designed for painters, sculptors, and visual artists with natural lighting and ample workspace.",
    link: "/SearchPage?propertyTypes=Art+Studio"
  },
  {
    name: "Multimedia",
    image: "/multimedia-studio.jpg",
    description: "All-purpose creative spaces equipped for various media needs from editing to content creation.",
    link: "/SearchPage?propertyTypes=Multimedia+Studio"
  }
]

// Define benefits of choosing Cumma for studio spaces
const benefits = [
  {
    icon: "/icons/professional-grade.svg",
    title: "Professional-Grade Equipment",
    description: "High-quality cameras, lighting, and sound systems."
  },
  {
    icon: "/icons/flexibility.svg",
    title: "Soundproof & Acoustically Optimized",
    description: "Ensures crystal-clear recordings without background noise."
  },
  {
    icon: "/icons/hassle-free.svg",
    title: "Flexible Booking Options",
    description: "Hourly, daily, and long-term studio access."
  },
  {
    icon: "/icons/booking.svg",
    title: "Creative Community",
    description: "Network with film-makers, content creators, and media professionals."
  },
  {
    icon: "/icons/cost.svg",
    title: "On-Site Support",
    description: "Technical assistance for smooth production and post-production."
  },
  {
    icon: "/office-studio_svgrepo.com.svg",
    title: "Premium Work Environment",
    description: "Comfortable and fully equipped spaces to enhance creativity and productivity."
  }
]

// FAQ items for studio spaces
const faqItems = [
  {
    question: "How do I get started?",
    answer: "Getting started with Cumma is easy! First, create an account on our platform. Then browse our available studio spaces based on your requirements - you can filter by location, studio type, amenities, and price range. Once you find the perfect space, you can book it directly through our platform. For premium studio spaces, you may request a tour before booking. Our customer support team is available to help you throughout the process."
  },
  {
    question: "Can I book a facility for multiple days?",
    answer: "Yes, you can book on an hourly, daily, or multi-day basis, depending on the provider's availability. Many of our studio spaces offer flexible booking options, including hourly rentals for meeting rooms, daily passes for co-working spaces, and monthly arrangements for private cabins. You can specify your desired duration during the booking process."
  },
  {
    question: "Are there any discounts or credits available?",
    answer: "Yes! We offer several discount programs for our users. New users receive a welcome discount on their first booking. We also have loyalty programs for returning customers, with points that can be redeemed for future bookings. Additionally, we run seasonal promotions and offer special rates for long-term bookings. Subscribe to our newsletter to stay updated on our latest promotions and special offers."
  },
  {
    question: "How can I modify or cancel a booking?",
    answer: "To modify or cancel a booking, log into your Cumma account and navigate to 'My Bookings'. Select the reservation you want to change, and you'll see options to modify dates, times, or cancel completely. Please note that cancellation policies vary by service provider - some allow free cancellation up to 24 hours before your booking, while others may have different terms. Any applicable refunds will be processed according to the provider's policy, which is always displayed before you complete your booking."
  },
  {
    question: "How can I list my facility on Cumma?",
    answer: "To list your facility on Cumma, start by creating a service provider account. Once registered, you can add your facility details including location, amenities, high-quality photos, availability schedules, and pricing options. Our team will review your listing to ensure it meets our quality standards before it goes live. We also offer optional premium features to boost your visibility on our platform. For more detailed guidance, visit our 'Become a Provider' page or contact our partner support team."
  }
]

// Interface for featured facility data
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

export default function StudiosPage() {
  // const { data: session } = useSession()
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [featuredStudios, setFeaturedStudios] = useState<FeaturedFacility[]>([])
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
  
  // State for Studio Space Info form
  const [studioFormName, setStudioFormName] = useState('')
  const [studioFormEmail, setStudioFormEmail] = useState('')
  const [studioFormPhone, setStudioFormPhone] = useState('')
  const [studioFormDescription, setStudioFormDescription] = useState('')
  const [studioFormLoading, setStudioFormLoading] = useState(false)
  const [studioFormSuccess, setStudioFormSuccess] = useState(false)
  const [studioFormError, setStudioFormError] = useState(false)

  const faqItems = [
    {
      question: "How do I get started?",
      answer: "Getting started with Cumma is easy! First, create an account on our platform. Then browse our available studio spaces based on your requirements - you can filter by location, studio type, amenities, and price range. Once you find the perfect space, you can book it directly through our platform. For premium studio spaces, you may request a tour before booking. Our customer support team is available to help you throughout the process."
    },
    {
      question: "Can I book a facility for multiple days?",
      answer: "Yes, you can book on an hourly, daily, or multi-day basis, depending on the provider's availability. Many of our studio spaces offer flexible booking options, including hourly rentals for meeting rooms, daily passes for co-working spaces, and monthly arrangements for private cabins. You can specify your desired duration during the booking process."
    },
    {
      question: "Are there any discounts or credits available?",
      answer: "Yes! We offer several discount programs for our users. New users receive a welcome discount on their first booking. We also have loyalty programs for returning customers, with points that can be redeemed for future bookings. Additionally, we run seasonal promotions and offer special rates for long-term bookings. Subscribe to our newsletter to stay updated on our latest promotions and special offers."
    },
    {
      question: "How can I modify or cancel a booking?",
      answer: "To modify or cancel a booking, log into your Cumma account and navigate to 'My Bookings'. Select the reservation you want to change, and you'll see options to modify dates, times, or cancel completely. Please note that cancellation policies vary by service provider - some allow free cancellation up to 24 hours before your booking, while others may have different terms. Any applicable refunds will be processed according to the provider's policy, which is always displayed before you complete your booking."
    },
    {
      question: "How can I list my facility on Cumma?",
      answer: "To list your facility on Cumma, start by creating a service provider account. Once registered, you can add your facility details including location, amenities, high-quality photos, availability schedules, and pricing options. Our team will review your listing to ensure it meets our quality standards before it goes live. We also offer optional premium features to boost your visibility on our platform. For more detailed guidance, visit our 'Become a Provider' page or contact our partner support team."
    }
  ]

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index)
  }

  // Fetch studio facilities
  useEffect(() => {
    const fetchStudioFacilities = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Create a comma-separated list of studio-related property types
        const studioTypes = [
          'Production Studio',
          'Recording Studio',
          'Photography Studio',
          'Art Studio',
          'Multimedia Studio'
        ].join(',')
        
        const response = await fetch(`/api/facilities/search?` + new URLSearchParams({
          propertyTypes: studioTypes,
          limit: '8',
          isFeatured: 'true'
        }))
        
        if (!response.ok) throw new Error('Failed to fetch studio facilities')
        
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
        
        setFeaturedStudios(formattedFacilities)
      } catch (error) {
        console.error('Error fetching studio facilities:', error)
        setError('Failed to load studio facilities')
      } finally {
        setLoading(false)
      }
    }
    
    fetchStudioFacilities()
  }, [])

  const handleSearch = () => {
    setIsSearching(true)
    const searchParams = new URLSearchParams()
    
    if (searchTerm) {
      searchParams.set('search', searchTerm)
    }

    // Add studio property types
    const propertyTypes = [
      'Production Studio',
      'Recording Studio',
      'Photography Studio',
      'Art Studio',
      'Multimedia Studio'
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

  // Function to handle the Studio Space Info form submission
  const handleStudioFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStudioFormLoading(true)
    setStudioFormError(false)
    
    // Simulate sending email to support@cumma.in
    setTimeout(() => {
     // console.log("Studio Space Info request submitted:", { 
      //   name: studioFormName, 
      //   email: studioFormEmail, 
      //   phone: studioFormPhone,
      //   description: studioFormDescription
      // })
      setStudioFormLoading(false)
      setStudioFormSuccess(true)
      
      // Reset form
      setTimeout(() => {
        setStudioFormName('')
        setStudioFormEmail('')
        setStudioFormPhone('')
        setStudioFormDescription('')
        setStudioFormSuccess(false)
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
            src="/facilities/StudioHero.jpg"
            alt="Studio Spaces"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/80" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[100px] font-black text-[#23BB4E] tracking-[-0.09em] leading-[90px] mb-6">
            Studios
          </h1>
          <p className="text-md md:text-xl text-white max-w-3xl mx-auto mb-8 tracking-[-0.05em]">
            At Cumma, we offer state-of-the-art studio spaces designed for content creators, filmmakers, podcasters, and editors. Whether you need a professional video studio, a high-quality podcast setup, or an advanced editing suite, we provide the perfect environment to bring your creative vision to life.
          </p>
          
          <Button 
            size="lg"
            className="bg-[#23BB4E] hover:bg-green-600 text-white font-extrabold text-lg px-8 py-6 rounded-xl border border-black/30 transition-all tracking-[-0.05em]"
            onClick={() => router.push('/SearchPage?propertyTypes=Production+Studio,Recording+Studio,Photography+Studio,Art+Studio,Multimedia+Studio')}
          >
            Explore all Studio Spaces
          </Button>
        </div>
      </div>

      {/* Studio Types Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="flex flex-col items-center">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-[-1.4px]">
                Explore
              </h2>
              <h2 className="text-5xl md:text-6xl lg:text-[84px] font-extrabold text-[#23BB4E] mb-4 tracking-[-3.4px] leading-[75px]">
                Studio Spaces
              </h2>
            </div>
            <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto tracking-[-1.4px]">
              One-stop facility marketplace, offering flexible and cost-effective spaces for businesses, startups, and innovators.
            </p>
          </div>

          {/* Studio Type Cards */}
          <div className="flex justify-center w-full">
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 max-w-[1400px]">
              {[
                { 
                  name: "Video", 
                  image: "/facilities/video.jpeg",
                  description: "Professional spaces equipped with lighting, cameras, and sound equipment for high-quality video and photo production."
                },
                { 
                  name: "Podcast", 
                  image: "/facilities/podcast.jpg",
                  description: "Soundproof spaces with acoustic treatment designed for music recording, voiceovers, and podcast creation."
                }
              ].map((item, index) => (
                  <Card 
                    key={index}
                  className="w-full sm:w-[280px] h-[380px] bg-[#23BB4E] rounded-[30px] relative overflow-hidden cursor-pointer group"
                  onClick={() => router.push(`/SearchPage?propertyTypes=${item.name}+Studio`)}
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
                      <div className="mt-auto bg-[#23BB4E] py-3 px-5 text-white flex items-center justify-center">
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
                At Cumma, we provide the perfect creative space to produce, record, and edit high-quality content with ease. Whether you're an independent creator, media professional, or business, our studio spaces are designed to bring your ideas to life.
              </p>
            </div>

            {/* Right Column - Benefits in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-[60px] gap-y-10 md:gap-y-12 lg:col-span-7 px-4 md:px-6 lg:px-8">
              {[
                {
                  icon: "/icons/professional-grade.svg",
                  title: "Professional-Grade Equipment",
                  description: "High-quality cameras, lighting, and sound systems."
                },
                {
                  icon: "/icons/mute.svg",
                  title: "Soundproof & Acoustically Optimized",
                  description: "Ensures crystal-clear recordings without background noise."
                },
                {
                  icon: "/icons/flexi-booking.svg",
                  title: "Flexible Booking Options",
                  description: "Hourly, daily, and long-term studio access."
                },
                {
                  icon: "/icons/creative-community.svg",
                  title: "Creative Community",
                  description: "Network with film-makers, content creators, and media professionals."
                },
                {
                  icon: "/icons/onsite-support.svg",
                  title: "On-Site Support",
                  description: "Technical assistance for smooth production and post-production."
                },
                {
                  icon: "/icons/workspace.svg",
                  title: "Premium Work Environment",
                  description: "Comfortable and fully equipped spaces to enhance creativity and productivity."
                }
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-[54px] h-[54px] bg-transparent flex items-center justify-center">
                    <Image
                      src={benefit.icon}
                      alt={benefit.title}
                      width={54}
                      height={54}
                      className="text-white"
                    />
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
      <section className="py-16 md:py-24 bg-[#F7F7F7]">
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
                  <h3 className="text-xl font-semibold text-gray-800 group-hover:text-[#23BB4E] transition-colors tracking-[-0.05em] pl-16 relative">
                    <div className="absolute left-8 top-1/2 -translate-y-1/2">
                      {openFaqIndex === index ? (
                        <div className="w-[25px] h-[5px] bg-[#23BB4E] rounded-[10px]" />
                      ) : (
                        <div className="relative">
                          <div className="w-[25px] h-[5px] bg-[#23BB4E] rounded-[10px]" />
                          <div className="w-[25px] h-[5px] bg-[#23BB4E] rounded-[10px] absolute top-0 left-0 rotate-90 origin-center" />
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

      {/* Studio Space Info Section */}
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
                    <span className="text-[#23BB4E]">Studio Space</span>
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
                  <form onSubmit={handleStudioFormSubmit} className="space-y-5">
                    <div>
                      <input
                        type="text"
                        id="studioFormName"
                        placeholder="Full Name"
                        className="w-full px-12 py-6 rounded-[13px] bg-white text-gray-800 focus:outline-none"
                        value={studioFormName}
                        onChange={(e) => setStudioFormName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <input
                        type="email"
                        id="studioFormEmail"
                        placeholder="Mail Address"
                        className="w-full px-12 py-6 rounded-[13px] bg-white text-gray-800 focus:outline-none"
                        value={studioFormEmail}
                        onChange={(e) => setStudioFormEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <input
                        type="tel"
                        id="studioFormPhone"
                        placeholder="Mobile Number"
                        className="w-full px-12 py-6 rounded-[13px] bg-white text-gray-800 focus:outline-none"
                        value={studioFormPhone}
                        onChange={(e) => setStudioFormPhone(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <textarea
                        id="studioFormDescription"
                        placeholder="Description"
                        rows={4}
                        className="w-full px-12 py-6 rounded-[13px] bg-white text-gray-800 resize-none focus:outline-none"
                        value={studioFormDescription}
                        onChange={(e) => setStudioFormDescription(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="pt-5 flex justify-center">
                      <button
                        type="submit"
                        className={`px-10 py-5 rounded-[53px] bg-[#23BB4E] text-white font-extrabold hover:bg-green-600 transition-colors text-2xl flex items-center justify-center w-[289px] tracking-[-0.05em] ${studioFormLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        disabled={studioFormLoading}
                      >
                        {studioFormLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            <span>Processing...</span>
                          </>
                        ) : studioFormSuccess ? (
                          'Request Submitted!'
                        ) : (
                          'Request Call Back'
                        )}
                      </button>
                      
                      {studioFormError && (
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