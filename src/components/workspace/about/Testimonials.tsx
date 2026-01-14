import { useState } from "react";
import { Mode } from "@/app/(landing)/offices/about/page";

interface TestimonialsProps {
  mode: Mode;
}

export default function Testimonials({ mode }: TestimonialsProps) {
   const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  const testimonials: Record<Mode, { name: string; role: string; text: string; image: string }[]> = {
    startup: [
      {
        name: "Priya S.",
        role: "Startup Founder",
        text: "Booking workspaces has never been this easy. Transparent pricing and zero hidden charges make it stress-free",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      },
      {
        name: "Raj K.",
        role: "Tech Entrepreneur",
        text: "The team dashboard helps us manage bookings and track usage. It feels built just for growing startups like us",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      },
      {
        name: "Sneha M.",
        role: "Startup Founder",
        text: "Finally, a platform that understands startup needs. Flexible booking and great workspace quality",
        image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
      },
      {
        name: "Arjun P.",
        role: "Product Manager",
        text: "The variety of workspace options is amazing. We can find the perfect space for any team size or meeting type",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      },
      {
        name: "Kavya L.",
        role: "CEO",
        text: "Best decision for our remote team. Easy booking, great locations, and excellent support",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      },
    ],
    enabler: [
      {
        name: "Anita R.",
        role: "Co-working Space Founder",
        text: "Partnering as an enabler has been seamless. We fill unused space and attract more startups.",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      },
      {
        name: "Vikram S.",
        role: "Property Manager",
        text: "The platform has helped us maximize our space utilization. Great revenue stream for our business",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      },
      {
        name: "Meera D.",
        role: "Co-working Space Owner",
        text: "Easy onboarding process and consistent bookings. Exactly what we needed to grow our business",
        image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop",
      },
       {
        name: "Anita R.",
        role: "Co-working Space Founder",
        text: "Partnering as an enabler has been seamless. We fill unused space and attract more startups.",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      },
      {
        name: "Vikram S.",
        role: "Property Manager",
        text: "The platform has helped us maximize our space utilization. Great revenue stream for our business",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      },
    ],
  };

  const currentTestimonials = testimonials[mode];
  const itemsPerPage = 3;
  const maxIndex = Math.max(0, currentTestimonials.length - itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
  };

  const visibleTestimonials = currentTestimonials.slice(
    currentIndex,
    currentIndex + itemsPerPage
  );

  return (
    <section className="py-20 bg-gray-50 relative overflow-hidden">
      {/* Decorative dots - top right */}
      <div className="absolute top-8 right-8 grid grid-cols-5 gap-2">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="w-4 h-3 rounded-full bg-green-200"></div>
        ))}
      </div>
      
      {/* Decorative dots - bottom left */}
      <div className="absolute bottom-8 left-8 grid grid-cols-3 gap-2">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="w-4 h-3 rounded-full bg-green-200"></div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl text-center font-bold mb-12">
          What our{" "}
          <span className="text-green-500">
            {mode === "startup" ? "Users" : "Enablers"}
          </span>{" "}
          say about us
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {visibleTestimonials.map((t, idx) => (
            <div key={currentIndex + idx} className="bg-white p-8 rounded-lg shadow-sm relative">
              {/* Quote icon */}
              <div className="absolute top-6 right-6 text-green-500 text-3xl font-serif">"</div>
              
              {/* Profile */}
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={t.image} 
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900">{t.name}</div>
                  <div className="text-sm text-gray-500">{t.role}</div>
                </div>
              </div>
              
              {/* Testimonial text */}
              <p className="text-gray-600 leading-relaxed">{t.text}</p>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        {currentTestimonials.length > itemsPerPage && (
          <div className="flex justify-center gap-4 mt-8">
            <button 
              onClick={handlePrev}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-500 transition-colors"
            >
              ←
            </button>
            <button 
              onClick={handleNext}
              className="w-10 h-10 rounded-full border-2 border-green-500 flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-colors"
            >
              →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
