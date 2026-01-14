"use client"
import { useState } from "react";
import Header from "@/components/workspace/about/Header";
import HeroSection from "@/components/workspace/about/HeroSection";
import BenefitsSection from "@/components/workspace/about/BenefitsSection";
// import Testimonials from "@/components/workspace/about/Testimonials";
import CTASection from "@/components/workspace/about/CTASection";
import FAQSection from "@/components/workspace/about/FAQSection";
import { NewsletterSignup } from "@/components/sections/newsletter-signup";


export type Mode = "startup" | "enabler";
// export type Mode = "user" | "enabler";
export default function Home() {
  const [mode, setMode] = useState<Mode>("startup");

  return (
    <div className="font-sans">
      <Header />
      <HeroSection />
      <BenefitsSection mode={mode} setMode={setMode} />
      {/* <Testimonials mode={mode} /> */}
      <CTASection mode={mode} />
        <FAQSection mode={mode} />
              <NewsletterSignup />
    </div>
  );
}
