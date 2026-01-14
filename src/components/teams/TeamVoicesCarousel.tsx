'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;

}

const testimonials: Testimonial[] = [
  // Full Stack Developer (Focus on robust, scalable code and technical growth)
  {
    id: 1,
    name: 'Abhishek Singh Tomar',
    role: 'Full Stack Developer',
    quote: 'I am getting to work with cutting edge tech that pushes my skills every day. Our goal is to build highly scalable and robust systems',
  },
  // Full Stack Developer (Focus on project ownership, efficiency, and impact)
  // {
  //   id: 2,
  //   name: 'Sam',
  //   role: 'Full Stack Developer',
  //   quote: 'I came here to move beyond feature development and gain **end-to-end ownership of major projects**. The pace of innovation challenges me to write cleaner, more efficient code, helping me achieve my personal goal of becoming a **tech lead** faster.',
  // },
  // BD Executive (Focus on market expansion, client relationship, and revenue goals)
  {
    id: 3,
    name: 'Nisath Moorthi',
    role: 'BD Executive',
    quote: 'I am here to support the company’s vision of supporting enablers and ensure monetisation support system for enablers. By building a strong portfolio of enablers, we are on a united mission of making innovation infra accessible to all.',
  },
  // UI/UX Designer (Focus on user-centered design, measurable impact, and design system creation)
  {
    id: 4,
    name: 'Sivashankar Velliangiri',
    role: 'UI/UX Designer',
    quote: 'My objective is to create measurable impact through design, specifically by improving conversion and retention metrics by 20%. My goal is to ensure that our designs interact with our users and reflect perfect blend of creativity and structure.',
  },
  // // General Engineering (Adjusted for ambition)
  // {
  //   id: 5,
  //   name: 'Michael Ross',
  //   role: 'Engineering',
  //   quote: 'My personal mission is to master a new programming language and contribute a major feature to a public open-source project. This team gives me the **autonomy and high-bar standards** needed to make that level of growth happen.',
  // },
  // // Marketing/Product (Adjusted for strategic achievement)
  // {
  //   id: 6,
  //   name: 'Priya Sharma',
  //   role: 'Marketing',
  //   quote: 'I’m focused on executing a marketing strategy that **positions our product as the market leader** in its niche. My goal is to use this experience to transition into a **Director of Product Marketing** role by achieving clear, strategic business wins here.',
  // }
];

const decorativeColors = [
  'bg-orange-400',
  'bg-green-400',
  'bg-green-500',
  'bg-blue-500',
  'bg-red-500',
  'bg-purple-500'
];

export default function TeamVoicesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const itemsPerPage = 3;
  const totalPages = Math.ceil(testimonials.length / itemsPerPage);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const currentTestimonials = testimonials.slice(
    currentIndex * itemsPerPage,
    currentIndex * itemsPerPage + itemsPerPage
  );

  return (
    <div className="relative min-h-screen bg-gray-50 py-20 px-4 overflow-hidden">
      {/* Decorative Dots */}
      <div className="absolute top-12 left-12">
        <div className={`w-2 h-2 ${decorativeColors[0]} rounded-full`}></div>
      </div>
      <div className="absolute top-32 left-32">
        <div className={`w-3 h-3 ${decorativeColors[1]} rounded-full`}></div>
      </div>
      <div className="absolute top-20 left-48">
        <div className={`w-4 h-4 ${decorativeColors[2]} rounded-full`}></div>
      </div>
      <div className="absolute top-8 right-1/3">
        <div className={`w-3 h-3 ${decorativeColors[4]} rounded-full`}></div>
      </div>
      <div className="absolute bottom-32 left-20">
        <div className={`w-2 h-2 ${decorativeColors[5]} rounded-full`}></div>
      </div>
      <div className="absolute top-48 left-64">
        <div className={`w-2 h-2 ${decorativeColors[3]} rounded-full`}></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Voices Of <span className="text-green-500">Our Team</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Community development is often linked with community work or community planning, 
            and may involve stakeholders, foundations,
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {currentTestimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Stars */}
            

              {/* Quote */}
              <p className="text-gray-700 text-base leading-relaxed mb-12">
                {testimonial.quote}
              </p>

              {/* Author */}
              <div>
                <h3 className="text-gray-900 font-semibold text-lg">
                  {testimonial.name}
                </h3>
                <p className="text-gray-500 text-sm">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handlePrevious}
            className="w-12 h-12 flex items-center justify-center rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-colors duration-200 disabled:opacity-50"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={handleNext}
            className="w-12 h-12 flex items-center justify-center rounded-lg bg-green-500 hover:bg-green-600 transition-colors duration-200"
            aria-label="Next testimonials"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex ? 'bg-green-500 w-6' : 'bg-gray-300'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}