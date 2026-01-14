"use client";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";


// ✅ FAQ DATA based on mode
const faqData = [
    {
      question: "What types of office spaces does Cumma offer?",
      answer:
        "Incubators, co-working spaces, business centers, and innovation hubs are listed for users, startups, freelancers, and teams to book.",
    },
    {
      question: "Can I book an office space for a short term?",
      answer:
        "Yes, you can book co-working desks, private cabins, meeting rooms, event spaces, and any flexible workspaces available for daily, weekly, or monthly durations.",
    },
    {
      question: "Are the office spaces startup-friendly?",
      answer:
        "Absolutely! Cumma focuses on providing office spaces that cater specifically to the needs of startups, freelancers, and small teams.",
    },
    {
      question: "Do I need to sign a long-term contract?",
      answer:
        "No long-term contracts are required. You can book spaces as needed without any commitment.",
    }
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
              className="flex justify-between items-center w-full text-left p-5 font-medium text-gray-900 border border-b-gray-300"
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