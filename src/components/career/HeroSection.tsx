// components/HeroSection.tsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HeroSection() {
  const [showSecond, setShowSecond] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Show second hero after 2 seconds
    const timer = setTimeout(() => setShowSecond(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <div>
        <div>
          <div></div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 px-4">
            <img
              src="/teams/magnifying.svg"
              alt="search"
              className="hidden sm:block w-12 sm:w-16 md:w-20"
            />{" "}
            <span>Build your future with us</span>{" "}
            <img
              src="/teams/internet.svg"
              alt="search"
              className="hidden sm:block w-12 sm:w-16 md:w-20"
            />
          </h1>
          <p className="text-sm sm:text-base text-gray-600 text-center mb-8 px-4 sm:ml-[80px] mt-4">
            Discover exciting opportunities and grow your career in a thriving
            environment.
          </p>
        </div>
      </div>
      <div className="w-full relative min-h-[400px] sm:min-h-[500px] flex items-center justify-center overflow-hidden bg-white">
        {/* First Hero Section */}

        <AnimatePresence>
          {!showSecond && (
            <motion.div
              key="heroFirst"
              initial={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -200 }}
              transition={{ duration: 0.9 }}
              className="absolute w-full flex items-center justify-center"
            >
              {/* Hero 1 Content */}
              <div className="flex flex-col md:flex-row items-center md:items-start w-full md:w-3/4 px-4 sm:px-6 md:px-24">
                <div className="flex-1 text-center md:text-left py-8 md:py-12">
                  <h1 className="text-green-600 text-2xl sm:text-3xl font-semibold mb-2">
                    At Cumma
                  </h1>
                  <br className="hidden md:block" />
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
                    Beyond <br /> work, We&apos;re <br />a{" "}
                    <span className="text-green-500">family</span>
                  </h1>
                </div>
                <div className="w-full max-w-[250px] sm:max-w-[300px] md:max-w-[400px] flex justify-center mt-4 md:mt-0">
                  <img
                    src="/teams/hero1.svg"
                    alt="Hero Illustration 1"
                    width={400}
                    height={400}
                    className="object-contain w-full h-auto"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Second Hero Section */}
        <AnimatePresence>
          {showSecond && (
            <motion.div
              key="heroSecond"
              initial={{ opacity: 0, x: 200 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -200 }}
              transition={{ duration: 0.8 }}
              className="absolute w-full flex items-center justify-center"
            >
              {/* Hero 2 Content */}
              <div className="flex flex-col md:flex-row items-center md:items-start w-full px-4 sm:px-6 md:px-24 md:ml-[200px]">
                <div className="w-full max-w-[250px] sm:max-w-[300px] md:max-w-[500px] flex justify-center order-2 md:order-1 mt-4 md:mt-0">
                  <img
                    src="/teams/hero1.svg"
                    alt="Hero Illustration 2"
                    width={400}
                    height={400}
                    className="object-contain w-full h-auto"
                  />
                </div>
                <div className="flex-1 text-center md:text-left py-8 md:py-12 md:ml-[50px] order-1 md:order-2">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                    Grow Beyond Limits
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl mb-6">
                    We make building your career simple,
                    <br className="hidden sm:block" /> meaningful, and something
                    you'll look
                    <br className="hidden sm:block" /> forward to every day.
                  </p>
                  <button
                    onClick={() => {
                      const el = document.getElementById("open-positions");
                      if (el)
                        el.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      else router.push("/careers");
                    }}
                    className="inline-block mt-2 px-6 sm:px-8 py-3 bg-green-300 text-black font-semibold rounded transition hover:bg-green-400 text-sm sm:text-base"
                  >
                    View Open positions{" "}
                    <img
                      src="/teams/rightarrow.svg"
                      alt=""
                      className="w-6 sm:w-8 inline"
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
