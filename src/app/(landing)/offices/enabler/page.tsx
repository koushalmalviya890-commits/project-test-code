"use client"
import { useState } from "react";
import Header from "@/components/workspace/about/Header";
import HeroSection from "@/components/workspace/enabler/HeroSection";
import { NewsletterSignup } from "@/components/sections/newsletter-signup";
import ExploreServices from "@/components/workspace/user/ExploreServices";
import CompanyMarquee from "@/components/workspace/user/CompanyMarquee";
import CummaBenefits from "@/components/workspace/user/CummaBenefits";
import WhoBookCumma from "@/components/workspace/user/WhoBookCumma";
import HowItWorks from "@/components/workspace/user/HowItWorks";
import WorkspaceFAQSection from "@/components/workspace/user/FAQSection";
import WorkspaceListingBenefits from "@/components/workspace/enabler/WorkspaceListingBenefits";
import CummaCardSection from "@/components/workspace/enabler/CummaCardSection";
import OnboardingSteps from "@/components/workspace/enabler/OnbardingSteps";
import CummaCTA from "@/components/workspace/enabler/CummaCTA";
import FAQSection from "@/components/workspace/enabler/FAQSection";



export default function Home() {
 

  return (
    <div className="font-sans">
      <Header />
      <HeroSection />
     <WorkspaceListingBenefits />
     <CummaCardSection />
     <OnboardingSteps />
     <CummaCTA />
      <FAQSection />
      <NewsletterSignup />
    </div>
  );
}
