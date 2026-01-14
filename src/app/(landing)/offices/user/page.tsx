"use client"
import { useState } from "react";
import Header from "@/components/workspace/about/Header";
import HeroSection from "@/components/workspace/user/HeroSection";
// import BenefitsSection from "@/components/workspace/user/BenefitsSection";
//import Testimonials from "@/components/workspace/Testimonials";
// import CTASection from "@/components/workspace/user/CTASection";
// import FAQSection from "@/components/workspace/user/FAQSection";
import { NewsletterSignup } from "@/components/sections/newsletter-signup";
import ExploreServices from "@/components/workspace/user/ExploreServices";
import CompanyMarquee from "@/components/workspace/user/CompanyMarquee";
import CummaBenefits from "@/components/workspace/user/CummaBenefits";
import WhoBookCumma from "@/components/workspace/user/WhoBookCumma";
import HowItWorks from "@/components/workspace/user/HowItWorks";
import WorkspaceFAQSection from "@/components/workspace/user/FAQSection";


export type Mode = "startup" | "enabler";
// export type Mode = "user" | "enabler";
export default function Home() {
  const [mode, setMode] = useState<Mode>("startup");

  return (
    <div className="font-sans">
      <Header />
      <HeroSection />
      <CompanyMarquee />
      <CummaBenefits />
      <ExploreServices />
      <WhoBookCumma />
      <HowItWorks />
      <WorkspaceFAQSection />
             {/* <BenefitsSection mode={mode} setMode={setMode} /> */}
      {/* <Testimonials mode={mode} /> */}
      {/* <CTASection mode={mode} />
        */}
              <NewsletterSignup />
    </div>
  );
}
