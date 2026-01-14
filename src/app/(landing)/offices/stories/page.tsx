"use client";

import { useState } from "react";
import Header from "@/components/workspace/about/Header";
import StoriesHeroSection from "@/components/workspace/stories/HeroSection";
import Testimonials from "@/components/workspace/stories/Testimonials";
import StoriesSection from "@/components/workspace/stories/StoriesSection";
import WorkspaceFAQSection from "@/components/workspace/stories/FAQSection";
import { NewsletterSignup } from "@/components/sections/newsletter-signup";
import ShareExperience from "@/components/workspace/stories/ShareExperience";



export type Mode = "startup" | "enabler";

export default function StoriesPage() {
  const [mode, setMode] = useState<Mode>("startup"); // default: Users

  return (
    <div className="font-sans">
      <Header mode={mode} setMode={setMode} />
      <StoriesHeroSection mode={mode} />
 <Testimonials mode={mode} />
 <StoriesSection mode={mode} />
 <WorkspaceFAQSection mode={mode} />
 <ShareExperience mode={mode} />
 <NewsletterSignup />
      {/* other sections for stories page can also read `mode` if needed */}
    </div>
  );
}
