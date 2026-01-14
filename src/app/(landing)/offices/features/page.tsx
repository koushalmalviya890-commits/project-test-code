"use client"
import { useState } from "react";
import Header from "@/components/workspace/about/Header";
import HeroSection from "@/components/workspace/features/HeroSection";
import { NewsletterSignup } from "@/components/sections/newsletter-signup";
import WorkspaceFinder from "@/components/workspace/features/WorkspaceFinder";
import BookingPage from "@/components/workspace/features/BookingPage"
import ExploreServices from "@/components/workspace/user/ExploreServices";
import FeaturesSection from "@/components/workspace/features/FeaturesSection";
import FAQSection from "@/components/workspace/enabler/FAQSection";
import CompanyMarquee from "@/components/workspace/features/CompanyMarquee";


export type Mode = "startup" | "enabler";
export default function Home() {
 
  const [mode, setMode] = useState<Mode>("startup");
  return (
    <div className="font-sans">
      <Header />
      <HeroSection mode={mode} setMode={setMode}/>
      <WorkspaceFinder mode={mode} />
      <BookingPage mode={mode} />
        <ExploreServices />
        <FeaturesSection mode={mode} />
        <CompanyMarquee mode={mode}/>
      <FAQSection />
      <NewsletterSignup />
    </div>
  );
}
