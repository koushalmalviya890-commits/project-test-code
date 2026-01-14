"use client";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";


// ✅ FAQ DATA based on mode
const faqData = [
    {
      question: "Who can list workspaces on Cumma?",
      answer:
        "Incubators, co-working spaces, business centers, and innovation hubs can list their workspaces for startups, freelancers, and teams to book.",
    },
    {
      question: "What types of workspaces can I list?",
      answer:
        "You can list co-working desks, private cabins, meeting rooms, event spaces, and any flexible workspaces available for external use.",
    },
    {
      question: "How do I control bookings and pricing?",
      answer:
        "You have full control over availability, booking approvals, and pricing settings from your dashboard using transparent UFI pricing.",
    },
    {
      question: "How do I get paid?",
      answer:
        "Payments are processed securely through Cumma, and funds are transferred directly to your registered account after each confirmed booking.",
    },
  ];

// ✅ FAQ Section Component
export default function WorkspaceFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);


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
          Find quick answers to some of the most common questions about Workspaces.
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto mt-8 space-y-4 px-4">
        {faqData.map((faq, index) => (
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