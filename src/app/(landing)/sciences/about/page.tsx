"use client"
import { useState } from "react";
import FacilitiesHero from "@/components/facilities/about/HeroSection";
import FacilitiesBenefitsSection from "@/components/facilities/about/FacilitiesBenefitsSection";
import FacilitiesStatsSection from "@/components/facilities/about/FacilitiesStatsSection";
//import Testimonials from "@/components/facilities/Testimonials";
import CTASection from "@/components/facilities/about/CTASection";
import FAQSection from "@/components/facilities/about/FAQSection";
import { NewsletterSignup } from "@/components/sections/newsletter-signup";
import Header from "@/components/facilities/about/Header";


export type Mode = "user" | "enabler";
export default function Home() {
  const [mode, setMode] = useState<Mode>("user");

  return (
    <div className="font-sans">
     <Header />
      <FacilitiesHero />
      <FacilitiesBenefitsSection mode={mode} setMode={setMode} />
      <FacilitiesStatsSection  mode={mode} />
        {/* <Testimonials mode={mode} /> */}
        <CTASection mode={mode} />
        <FAQSection mode={mode} />
            <NewsletterSignup />
   
    </div>
  );
}
