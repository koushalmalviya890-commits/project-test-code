import React from "react";
import { User, Mail, CreditCard } from "lucide-react";

const OnboardingSteps = () => {
  const steps = [
    {
      number: 1,
      title: "Sign Up & Set Up",
      description:
        "Create an account and invite your team members in under 5 minutes.",
      imagePosition: "right",
      icons: [
        { Icon: User, position: "top-8 left-4 lg:left-36" },
        { Icon: Mail, position: "top-24 left-4 lg:left-36" },
        { Icon: CreditCard, position: "top-40 left-4 lg:left-36" },
      ],
    },
    {
      number: 2,
      title: "Integrate & Automate",
      description:
        "Link your favorite tools and automate everyday tasks with a few clicks.",
      imagePosition: "left",
      icons: [],
    },
    {
      number: 3,
      title: "Track & Optimize",
      description:
        "Use live dashboards and reports to keep everyone aligned on goals.",
      imagePosition: "right",
      icons: [],
    },
  ];

  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="flex flex-col items-center">
        <p className="text-gray-700 text-sm mb-4 text-center tracking-wider border-b border-gray-200">
          Get Started in Minutes
        </p>
        <h2 className="font-bold text-4xl md:text-5xl mb-3 text-center">
          How Cumma <span className="text-green-500">Works?</span>
        </h2>
        <p className="text-gray-400 mb-12 md:mb-20 items-center text-center max-w-2xl leading-relaxed">
          From setup to success in three simple steps. Here's how you can start
          maximizing productivity right away.
        </p>
      </div>
      <div className="max-w-7xl mx-auto space-y-24">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-12 ${
              step.imagePosition === "left" ? "lg:flex-row-reverse" : ""
            }`}
          >
            {/* Image Section */}
            <div className="flex-1 w-full">
              <div className="relative bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-4 lg:p-8 min-h-[350px] lg:h-[400px] overflow-hidden">
                {/* Decorative Icons for Step 1 */}
                {step.number === 1 && (
                  <>
                    {step.icons.map((item, idx) => (
                      <div
                        key={idx}
                        className={`absolute ${item.position} flex items-center justify-center z-10`}
                      >
                        <div className="w-32 lg:w-40 h-12 lg:h-16 bg-white rounded-full flex items-center px-2 lg:px-3 shadow-md opacity-60">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-full flex items-center justify-center shadow">
                            <item.Icon className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Placeholder Dashboard/Screen */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {step.number === 1 && (
                    <div className="w-full flex justify-center items-center">
                      <img
                        src="/workspace/signup.svg"
                        alt="Sign up illustration"
                        className="w-3/4 lg:w-auto max-w-sm lg:ml-24 object-contain"
                      />
                    </div>
                  )}

                  {step.number === 2 && (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* Large Puzzle Piece */}
                      <div className="absolute top-4 lg:top-8 right-4 lg:right-8 z-10">
                        <img
                          src="/workspace/puzzle.svg"
                          alt="Puzzle piece"
                          className="w-32 lg:w-[370px] h-32 lg:h-[370px] opacity-100"
                        />
                      </div>
                      <img
                        src="/workspace/addfacility.png"
                        alt="Add facility"
                        className="w-3/4 lg:w-auto max-w-md opacity-60 object-contain"
                      />
                    </div>
                  )}

                  {step.number === 3 && (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* Green Arrow */}
                      <div className="absolute top-8 lg:top-20 right-4 lg:right-8 z-30">
                        <img
                          src="/workspace/arrow.svg"
                          alt="Arrow"
                          className="w-24 lg:w-48 h-24 lg:h-48"
                        />
                      </div>

                      {/* Dashboard with Charts */}
                      <div className="flex items-center justify-center">
                        <img
                          src="/workspace/dashboard.png"
                          alt="Dashboard"
                          className="w-3/4 lg:w-auto max-w-md opacity-90 object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 space-y-4 lg:space-y-6 text-center lg:text-left">
              <div className="text-sm font-medium text-gray-500">
                Step {step.number}
              </div>
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
                {step.title}
              </h2>
              <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
                {step.description}
              </p>
              <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-green-500/30">
                Take the first step
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnboardingSteps;