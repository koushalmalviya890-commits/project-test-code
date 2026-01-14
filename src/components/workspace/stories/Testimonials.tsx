"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Types
export type TestimonialsMode = "users" | "enablers";

type Highlight = {
  title: string;
  desc?: string;
  button?: string;
  icon: string;
};

type TestimonialConfig = {
  title: string;
  subtitle: string;
  video: string;
  person: string;
  role: string;
  company: string;
  highlights: Highlight[];
};

// Data
export const testimonials: Record<TestimonialsMode, TestimonialConfig[]> = {
  users: [
    {
      title: "Why Users Trust Cumma?",
      subtitle:
        "Cumma gave us the right space at the right time. From flexible bookings to real-time support, it's designed with startups in mind.",
      video: "/videos/user1.mp4",
      person: "Prethi dgnjfg",
      role: "Startup Founder",
      company: "X PENG",
      highlights: [
        {
          title: "Seamless Workspace Access",
          desc: "Made it easy for us to find and book a workspace that fits our budget and team size.",
          icon: "/workspace/pc.svg",
          button: "Book if you need",
        },
        { title: "100+ Active Facilities", icon: "/workspace/global.svg" },
        {
          title: "Cool Customer Support",
          icon: "/workspace/customersupport.svg",
        },
        {
          title: "Built for Startups",
          desc: "We saved time, reduced costs, and got access to cabins, coworking areas, and even raw spaces",
          icon: "/workspace/addbutton.svg",
          button: "Explore Now",
        },
      ],
    },
    {
      title: "Why Users Trust Cumma?",
      subtitle:
        "Cumma gave us the right space at the right time. From flexible bookings to real-time support, it's designed with startups in mind.",
      video: "/videos/user2.mp4",
      person: "Noorin",
      role: "Startup Founder",
      company: "TECH SOLUTIONS",
      highlights: [
        {
          title: "Seamless Workspace Access",
          desc: "Made it easy for us to find and book a workspace that fits our budget and team size.",
          icon: "/workspace/pc.svg",
        },
        { title: "100+ Active Facilities", icon: "/workspace/global.svg" },
        {
          title: "Cool Customer Support",
          icon: "/workspace/customersupport.svg",
        },
        {
          title: "Built for Startups",
          desc: "We saved time, reduced costs, and got access to cabins, coworking areas, and even raw spaces.",
          icon: "/workspace/addbutton.svg",
          button: "Explore Now",
        },
      ],
    },
  ],
  enablers: [
    {
      title: "Why Enablers Trust Cumma?",
      subtitle:
        "Helps us showcase our spaces to the right startups. The dashboard makes it simple to track bookings, manage sales, and maximize occupancy.",
      video: "/videos/enabler1.mp4",
      person: "Priya Sgckh./",
      role: "Incubation Manager",
      company: "VEL TECH",
      highlights: [
        {
          title: "Visibility Boost",
          desc: "Manage everything from one dashboard.",
          icon: "📊",
        },
        {
          title: "Partner Access",
          desc: "Find & attract investors easily.",
          icon: "🤝",
        },
      ],
    },
    {
      title: "Why Enablers Trust Cumma?",
      subtitle:
        "Helps us showcase our spaces to the right startups. The dashboard makes it simple to track bookings, manage sales, and maximize occupancy.",
      video: "/videos/enabler2.mp4",
      person: "Vijay Shekhar",
      role: "Incubation Owner",
      company: "INNOVATION HUB",
      highlights: [
        {
          title: "Visibility Boost",
          desc: "Manage everything from one dashboard.",
          icon: "📊",
        },
        {
          title: "Partner Access",
          desc: "Find & attract investors easily.",
          icon: "🤝",
        },
      ],
    },
  ],
};

type Mode = "startup" | "enabler";

function VideoPlayer({ videoSrc }: { videoSrc: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  return (
    <div className="relative group">
      <video
        ref={videoRef}
        className="w-full h-[500px] object-cover"
        onPause={handlePause}
        onEnded={handlePause}
        loop
        playsInline
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div
        className="absolute inset-0 flex items-center justify-center cursor-pointer"
        onClick={handleTogglePlay}
      >
        <div
          className={`w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all ${isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}
        >
          {isPlaying ? (
            // Pause icon
            <div className="flex gap-1">
              <div className="w-1.5 h-6 bg-green-500 rounded-sm"></div>
              <div className="w-1.5 h-6 bg-green-500 rounded-sm"></div>
            </div>
          ) : (
            // Play icon
            <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-green-500 border-b-8 border-b-transparent ml-1"></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Testimonials({ mode }: { mode: Mode }) {
  const mappedMode: TestimonialsMode =
    mode === "startup" ? "users" : "enablers";
  const slides = testimonials[mappedMode];
  const currentSlide = slides[0];
  const [activeIndex, setActiveIndex] = useState(0);

  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.update();
    }
  }, [mode]);

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto text-center relative overflow-hidden">
      {/* Pagination styles */}
      <style jsx global>{`
        .swiper-pagination-custom {
          position: relative !important;
          display: flex !important;
          justify-content: center !important;
          gap: 8px !important;
          margin-top: 2rem !important;
        }

        .swiper-pagination-custom .swiper-pagination-bullet {
          width: 10px !important;
          height: 10px !important;
          background: #d1d5db !important;
          opacity: 1 !important;
          border-radius: 5px !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
        }

        .swiper-pagination-custom .swiper-pagination-bullet-active {
          background: #22c55e !important;
          width: 24px !important;
        }

        .swiper-pagination-custom .swiper-pagination-bullet:hover {
          background: #9ca3af !important;
        }

        /* Ensure navigation buttons are visible */
        .swiper-button-prev-custom-enabler,
        .swiper-button-next-custom-enabler {
          position: absolute !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          z-index: 10 !important;
        }

        /* Mobile Fix for Enabler Mode Pagination + Buttons */
@media (max-width: 768px) {
  /* Move arrows to bottom center */
  .swiper-button-prev-custom-enabler,
  .swiper-button-next-custom-enabler {
    top: auto !important;
    bottom: -20px !important;
    width: 42px !important;
    height: 42px !important;
    transform: none !important;
    position: relative !important;
  }

  .swiper-button-prev-custom-enabler {
    margin-right: 8px;
  }
  .swiper-button-next-custom-enabler {
    margin-left: 8px;
  }

  /* Ensure they align to center */
  .enabler-navigation-container {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    margin-top: 1rem !important;
    gap: 12px !important;
  }
}
  @media (max-width: 768px) {
  .swiper-button-prev-custom-enabler,
  .swiper-button-next-custom-enabler {
    display: none !important; /* hide desktop buttons */
  }

  /* Show only the centered mobile buttons */
  .enabler-navigation-mobile {
    display: flex !important;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.5rem;
  }
}

      `}</style>

      {/* Green blur background - only for startup mode */}
      {mode === "startup" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      )}

      <h2 className="text-4xl md:text-5xl font-bold mb-4 relative z-10">
        {currentSlide.title.split(" ").map((word, i) =>
          word === "Users" || word === "Enablers" ? (
            <span key={i} className="text-green-500">
              {word}{" "}
            </span>
          ) : (
            word + " "
          )
        )}
      </h2>
      <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto mb-16 relative z-10">
        {currentSlide.subtitle}
      </p>

      {/* CAROUSEL */}
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        modules={[Navigation, Pagination]}
        navigation={
          mode === "startup"
            ? {
                prevEl: ".swiper-button-prev-custom",
                nextEl: ".swiper-button-next-custom",
              }
            : {
                prevEl: ".swiper-button-prev-custom-enabler",
                nextEl: ".swiper-button-next-custom-enabler",
              }
        }
        pagination={false}
        spaceBetween={40}
        slidesPerView={1}
        className="relative pb-16"
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
      >
        {slides.map((item, idx) => (
          <SwiperSlide key={idx}>
            {mode === "startup" ? (
              // USERS/STARTUP MODE - Centered video with floating highlights
              <div className="relative min-h-[500px] flex items-center justify-center">
                {/* VIDEO CARD - CENTER */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative z-10 w-full max-w-sm mx-auto"
                >
                  <div className="ml-96">
                    <svg
                      width="75"
                      height="37"
                      viewBox="0 0 75 37"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.16814 15.4389C5.59471 13.8555 9.54437 13.9751 13.2782 14.3481C13.3026 14.3499 13.3271 14.3467 13.3502 14.3386C13.3733 14.3306 13.3945 14.3178 13.4125 14.3011C13.4304 14.2844 13.4447 14.2642 13.4544 14.2417C13.4642 14.2193 13.4691 14.195 13.469 14.1705C13.4681 14.0984 13.4441 14.0284 13.4003 13.971C13.3566 13.9136 13.2956 13.8718 13.2262 13.8517C10.3003 12.9925 7.23031 12.7369 4.20263 13.1007C17.6005 4.80626 37.0979 -1.73426 50.7803 9.20416C46.584 11.0653 42.4627 13.6957 40.1464 17.8119C38.7257 20.155 38.0507 22.8746 38.211 25.6101C38.5704 32.2904 44.9637 37.5612 51.4272 35.8413C63.1568 32.7198 63.2786 17.1121 55.2827 8.74405C61.2998 6.39022 67.6392 4.8299 74.0139 3.77514C74.0485 3.76993 74.0796 3.75136 74.1007 3.72343C74.1217 3.6955 74.131 3.66043 74.1264 3.62575C74.1233 3.59748 74.1145 3.5701 74.1008 3.5452C74.087 3.5203 74.0685 3.49837 74.0462 3.48063C74.024 3.4629 73.9985 3.44972 73.9711 3.44186C73.9438 3.434 73.9152 3.43159 73.8869 3.4348C67.2552 4.18884 60.6803 5.52855 54.3723 7.75765C40.5699 -5.93361 17.7854 0.486224 4.69319 11.6745C6.7029 9.95571 6.93941 5.88174 6.36855 3.92925C6.35526 3.86477 6.31738 3.80798 6.26295 3.77093C6.20851 3.73389 6.1418 3.71949 6.07693 3.73079C6.01862 3.74572 5.96548 3.77625 5.92319 3.81908C5.88089 3.86192 5.85106 3.91545 5.83688 3.97394C4.96095 7.56591 3.27878 10.4893 0.698437 13.7893C-0.359835 15.1434 -0.465143 16.6548 2.16814 15.4389ZM54.4016 13.1529C59.5355 19.7389 58.337 31.9869 50.385 33.4643C45.7769 34.3223 41.3064 31.1733 40.4846 26.5579C40.0122 23.8751 40.4852 21.1114 41.823 18.7385C43.9497 14.7422 47.9146 12.1514 51.9118 10.2148C52.8334 11.1126 53.6671 12.0965 54.4016 13.1529Z"
                        fill="#23BB4E"
                      />
                    </svg>
                  </div>
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-green-50 to-blue-50">
                    <VideoPlayer videoSrc={item.video} />
                    <div className="bg-white py-4 px-6 text-center">
                      <p className="font-semibold text-gray-900">
                        {item.person}
                      </p>
                      <p className="text-gray-500 text-sm">{item.role}</p>
                    </div>
                  </div>

                  {/* Decorative curved lines */}
                  <div className="-ml-28">
                    <svg
                      width="95"
                      height="66"
                      viewBox="0 0 95 66"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M94.669 51.0524C89.7843 53.138 85.4604 53.2935 80.3063 52.0494C79.5093 52.1799 80.5479 52.8825 80.8062 53.1019C83.1694 54.9708 87.0184 55.018 90.0564 54.8597C82.6945 59.1363 73.3193 62.7992 64.7856 61.855C54.8772 60.958 44.6272 53.8767 43.6136 43.449C49.7508 41.269 55.9685 37.4784 59.1288 31.5717C62.4778 23.5877 54.2135 19.55 47.5153 24.3903C42.0834 28.317 39.2426 35.0679 39.026 41.6994C13.283 46.8897 -3.49573 24.5319 1.89169 0.285793C1.89949 0.256223 1.90117 0.225373 1.89665 0.195128C1.89212 0.164884 1.88148 0.135878 1.86536 0.109887C1.84925 0.0838955 1.828 0.0614631 1.80293 0.0439605C1.77785 0.0264579 1.74947 0.0142528 1.71951 0.00809099C1.6907 0.000146579 1.66059 -0.00197514 1.63095 0.00184826C1.6013 0.00567166 1.57272 0.015364 1.54687 0.0303595C1.52101 0.0453551 1.49841 0.0653525 1.48037 0.0891841C1.46233 0.113016 1.44922 0.140204 1.44181 0.169158C-5.30356 25.34 12.3472 49.0197 39.1898 44.582C40.0646 52.3049 45.5575 58.9086 52.3917 62.2632C64.5634 68.4254 80.534 64.2321 90.7868 56.0066C90.5257 57.3951 89.7454 58.6392 89.4788 60.0222C89.1678 61.6412 89.7815 64.6043 90.5174 63.6879C90.844 62.1435 91.2887 60.6265 91.8476 59.1502C92.3863 57.6478 93.0417 55.9678 93.6499 54.4932L93.772 54.2155L94.9773 51.3885C94.9977 51.3442 95.0046 51.2949 94.997 51.2468C94.9895 51.1986 94.9679 51.1538 94.935 51.1179C94.902 51.082 94.8592 51.0566 94.8119 51.0449C94.7646 51.0333 94.7149 51.0359 94.669 51.0524ZM46.5406 31.4495C50.6811 23.4933 60.1479 24.8235 54.6994 32.3131C51.71 35.8451 47.8942 38.5838 43.5914 40.2859C43.8832 37.1531 44.8923 34.1296 46.5406 31.4495Z"
                        fill="#23BB4E"
                      />
                    </svg>
                  </div>
                </motion.div>

                {/* HIGHLIGHTS - FLOATING AROUND */}
                <div className="hidden lg:block absolute inset-0 pointer-events-none">
                  {item.highlights.map((h, i) => {
                    const positions = [
                      "left-24 top-24",
                      "left-24 bottom-32",
                      "right-32 top-32",
                      "right-32 bottom-40",
                    ];

                    return (
                      <motion.div
                        key={i}
                        initial={{ x: i % 2 === 0 ? -50 : 50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        className={`absolute ${positions[i]} pointer-events-auto max-w-xs hidden lg:block`}
                      >
                        <motion.div
                          whileHover={{ scale: 1.05, y: -5 }}
                          className="p-5 border border-gray-200 rounded-2xl shadow-lg bg-white flex flex-col gap-4 items-center w-[250px] h-auto"
                        >
                          <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-xl">
                            <img
                              src={h.icon}
                              alt={h.title}
                              className="w-16 h-12"
                            />
                          </div>
                          <div className="text-center">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {h.title}
                            </h3>
                            {h.desc && (
                              <p className="text-gray-500 text-sm mb-2">
                                {h.desc}
                              </p>
                            )}
                            {h.button && (
                              <button className="mt-2 bg-green-500 items-center text-white text-sm px-4 py-2 rounded-full hover:bg-green-600 transition-all shadow-sm hover:shadow-md">
                                {h.button}
                              </button>
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // ENABLER MODE - Side by side layout with testimonial quote
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="grid lg:grid-cols-2 gap-8 items-center max-w-5xl mx-auto"
                >
                  {/* LEFT SIDE - Video with quote */}
                  <div className="relative">
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      className="relative rounded-2xl overflow-hidden shadow-xl"
                    >
                      <video
                        controls
                        className="w-full h-80 object-cover"
                        poster="/images/placeholder.jpg"
                      >
                        <source src={item.video} type="video/mp4" />
                      </video>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                          <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-green-500 border-b-8 border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* RIGHT SIDE - Company logo and testimonial quote */}
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-left space-y-6"
                  >
                    {/* Company Logo */}
                    <div className="inline-block px-4 py-2 bg-white rounded-lg shadow-md border border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {item.company.charAt(0)}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {item.company}
                        </span>
                      </div>
                    </div>

                    {/* Testimonial Quote */}
                    <div className="space-y-4">
                      <p className="text-gray-700 leading-relaxed">
                        Being part of Cumma as an Enabler gave us visibility
                        like never before. With real-time booking insights,
                        access to startups, and tools to manage everything in
                        one place, we scaled faster and attracted the right
                        partners. Cumma is truly a growth partner for enablers
                        like us.
                      </p>

                      {/* Person Info with Image */}
                      <div className="flex items-center gap-3 pt-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden">
                          <img
                            src="/images/person-placeholder.jpg"
                            alt={item.person}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const initials = item.person
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase();
                                parent.innerHTML = `<span class="text-gray-600 font-semibold">${initials}</span>`;
                              }
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.person}
                          </p>
                          <p className="text-gray-500 text-sm">{item.role}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Navigation arrows for Enabler mode - positioned on sides */}
                <button
                  className="swiper-button-prev-custom-enabler absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-all shadow-lg"
                  onClick={() => swiperRef.current?.slidePrev()}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  className="swiper-button-next-custom-enabler absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-all shadow-lg"
                  onClick={() => swiperRef.current?.slideNext()}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation - Only for startup mode */}
      {mode === "startup" && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            className="swiper-button-prev-custom w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-green-500 hover:bg-green-50 transition-all group"
            onClick={() => swiperRef.current?.slidePrev()}
          >
            <svg
              className="w-4 h-4 text-gray-400 group-hover:text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-yellow-500 font-bold text-sm tracking-wider mx-2">
              {slides[activeIndex]?.company || "COMPANY"}
            </span>
          </div>

          <button
            className="swiper-button-next-custom w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-green-500 hover:bg-green-50 transition-all group"
            onClick={() => swiperRef.current?.slideNext()}
          >
            <svg
              className="w-4 h-4 text-gray-400 group-hover:text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Pagination for enabler mode */}
   {mode === "enabler" && (
  <div className="enabler-navigation-mobile lg:hidden">
    <button
      className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center"
      onClick={() => swiperRef.current?.slidePrev()}
    >
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <button
      className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center"
      onClick={() => swiperRef.current?.slideNext()}
    >
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
)}



      {/* See all reviews button */}
      <div className="flex items-center justify-center mt-12">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden lg:flex items-center justify-center bg-green-500 text-white px-8 py-3 rounded-full font-medium hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
        >
          See all the reviews
        </motion.button>
      </div>
    </section>
  );
}
