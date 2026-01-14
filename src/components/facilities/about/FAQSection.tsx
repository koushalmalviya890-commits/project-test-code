"use client";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

type Mode = "user" | "enabler";


interface FAQSectionProps {
  mode: Mode;
}


// ✅ FAQ DATA based on mode
const faqData = {
  enabler: [
    {
      question: "Who can list facilities on Cumma?",
      answer:
        "Incubators, research institutions, universities, and innovation hubs can list their equipment and facilities for startups, researchers, and companies to book.",
    },
    {
      question: "What types of facilities can I list?",
      answer:
        "You can list labs, manufacturing spaces, testing equipment, or any specialized facilities available for external use.",
    },
    {
      question: "How do I control bookings and pricing?",
      answer:
        "You have full control over availability, booking approvals, and pricing settings from your dashboard.",
    },
    {
      question: "How do I get paid?",
      answer:
        "Payments are processed securely through Cumma, and funds are transferred directly to your registered account after each confirmed booking.",
    },
  ],
  user: [
    {
      question: "What kind of facilities can I book on Cumma?",
      answer:
        "You can book a wide range of equipment and facilities, including manufacturing machines, engineering tools, testing labs, and research spaces.",
    },
    {
      question: "How do I know if the equipment I need is available?",
      answer:
        "Facility availability is shown in real time, so you can check and book instantly without waiting for manual confirmation.",
    },
    {
      question: "Can I book facilities for just a few hours?",
      answer:
        "Yes! You can book for as little as a few hours or for longer durations depending on facility availability.",
    },
    {
      question: "Do I need to sign long-term contracts?",
      answer:
        "No long-term commitments are required. Book and pay only for the time and facilities you actually need.",
    },
  ],
};

// ✅ FAQ Section Component
export default function FAQSection({ mode }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = faqData[mode];

  return (
   <section className="py-16 bg-white">
      <div className="text-center py-1">
        {/* Top pill badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-block border border-gray-300 rounded-full px-6 py-2 text-gray-700 text-sm font-medium">
            Questions? We Have Answers
          </div>
        </div>

        {/* Main heading */}
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
          Frequently Asked <span className="text-green-600">Questions</span>
        </h2>

        {/* Subtitle */}
        <p className="text-gray-400 text-lg mt-4 max-w-2xl mx-auto">
          Find quick answers to some of the most common questions about Facilities.
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto mt-8 space-y-4 px-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md bg-white"
          >
            <button
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
              className="flex justify-between items-center w-full text-left p-5 font-medium text-gray-900"
            >
              <span className="text-lg">{faq.question}</span>
              <div className="flex-shrink-0 ml-4">
                {openIndex === index ? (
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <Minus className="text-white w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <Plus className="text-white w-5 h-5" />
                  </div>
                )}
              </div>
            </button>

            {openIndex === index && (
              <div className="px-5 pb-5">
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}