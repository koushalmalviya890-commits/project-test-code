import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import Link from "next/link";

// Data for enabler cards
const enablerData = [
  {
    id: 1,
    name: "EDII Periyakulam",
    image: "/enablers/ediic-periyakulam.jpg",
  },
  {
    id: 2,
    name: "VEL TECH",
    image: "/enablers/vel-tech-university.jpg",
  },
  {
    id: 3,
    name: "TBI Sathyabama",
    image: "/enablers/tbi-sathyabama.jpg",
  },
  // {
  //   id: 4,
  //   name: "TABIF",
  //   image: "/enablers/tabif.jpg",
  // },
  {
    id: 4,
    name: "SREC SPARK",
    image: "/enablers/srec-spark.jpg",
  },
  {
    id: 5,
    name: "SSN Incubation",
    image: "/enablers/ssn-incubation.jpg",
  },
];

// Data for second row of enabler cards - starting from a different position for staggered effect
const secondRowEnablerData = [
  // {
  //   id: 4,
  //   name: "TABIF",
  //   image: "/enablers/tabif.jpg",
  // },
  {
    id: 4,
    name: "SREC SPARK",
    image: "/enablers/srec-spark.jpg",
  },
  {
    id: 5,
    name: "SSN Incubation",
    image: "/enablers/ssn-incubation.jpg",
  },
  {
    id: 1,
    name: "EDII Periyakulam",
    image: "/enablers/ediic-periyakulam.jpg",
  },
  {
    id: 2,
    name: "VEL TECH",
    image: "/enablers/vel-tech-university.jpg",
  },
  {
    id: 3,
    name: "TBI Sathyabama",
    image: "/enablers/tbi-sathyabama.jpg",
  },
];

export function ExploreEnablers() {
  return (
    <div className="px-5 md:px-16 lg:px-24 py-16">
      <section className="relative h-[730px] sm:h-[650px] md:h-[650px] bg-[#161616] rounded-[40px] overflow-hidden mx-auto max-w-[1200px] p-8 md:p-12">
        {/* First row of enabler cards */}
        <div className="absolute top-[50px] left-0 right-0 overflow-hidden px-8">
          <div className="flex space-x-8 animate-[slideLeft_50s_linear_infinite] w-max">
            {/* Duplicate the array multiple times to ensure continuous looping */}
            {[...enablerData, ...enablerData, ...enablerData].map((enabler, index) => (
              <Card
                key={`${enabler.id}-${index}`}
                className="w-[260px] h-[130px] rounded-[16px] border-none overflow-hidden flex-shrink-0"
                style={{
                  backgroundImage: `url(${enabler.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <CardContent className="flex items-center justify-center h-full p-0 bg-[#00000080]">
                  <h3 className="font-extrabold text-white text-lg text-center tracking-[-1px] leading-7">
                    {enabler.name}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Second row of enabler cards - staggered from the first row */}
        <div className="absolute top-[200px] left-0 right-0 overflow-hidden px-8">
          <div className="flex space-x-8 animate-[slideRight_50s_linear_infinite] w-max">
            {/* Duplicate the array multiple times to ensure continuous looping */}
            {[...secondRowEnablerData, ...secondRowEnablerData, ...secondRowEnablerData].map((enabler, index) => (
              <Card
                key={`${enabler.id}-${index}`}
                className="w-[260px] h-[130px] rounded-[16px] border-none overflow-hidden flex-shrink-0"
                style={{
                  backgroundImage: `url(${enabler.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <CardContent className="flex items-center justify-center h-full p-0 bg-[#00000080]">
                  <h3 className="font-extrabold text-white text-lg text-center tracking-[-1px] leading-7">
                    {enabler.name}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Content section */}
        <div className="absolute bottom-[70px] left-0 right-0 px-[70px]">
          <div className="flex flex-col md:flex-row items-start gap-[20px]">
            <div className="flex flex-col w-full md:w-[320px] items-start">
              <h2 className="self-stretch font-medium text-white text-[26px] tracking-[-1.6px] leading-[56px]">
                Explore
              </h2>

              <div className="flex flex-col items-start self-stretch w-full -mt-3">
                <h1 className="self-stretch font-extrabold text-[60px] tracking-[-4px] leading-[56px]">
                  <span className="text-white tracking-[-3px]">Enablers</span>
                </h1>
              </div>
            </div>

            <div className="flex flex-col items-start justify-center gap-[16px] mt-4 md:mt-0">
              <p className="w-full md:w-[550px] opacity-60 font-normal text-white text-lg tracking-[-1.2px] leading-7">
                Discover a vast ecosystem of over 100 enablers offering top-notch
                facilities to support your startup's journey.
              </p>

              <Link href="/ProviderSearch">
                <Button
                  variant="outline"
                  className="px-[20px] py-2 rounded-[10px] border border-solid border-white bg-transparent hover:bg-white/10"
                >
                  <span className="font-semibold text-white text-lg tracking-[-1.2px] leading-7">
                    Explore All
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 