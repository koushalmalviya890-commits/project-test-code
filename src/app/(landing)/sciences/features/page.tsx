"use client";
import HeroSection from "@/components/facilities/features/HeroSection";
import Header from "@/components/facilities/about/Header";
import React, { useState } from "react";
import IncubationDevices from "@/components/facilities/features/IncubationDevices";
import EnablerFeatures from "@/components/facilities/features/EnablerFeatures";
import CompanyMarquee from "@/components/facilities/features/CompanyMarquee";
import FAQSection from "@/components/facilities/about/FAQSection";
import Bookingarea from "@/components/facilities/features/Bookingarea";
import ExploreServices from "@/components/facilities/user/ExploreServices";

export default function Home() {
  const [role, setRole] = useState<"enabler" | "user">("enabler");

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <HeroSection mode={role} />
      <IncubationDevices role={role} onRoleChange={setRole} />
      {role === "enabler" ? <EnablerFeatures /> : <Bookingarea />}
      <ExploreServices />
      <CompanyMarquee mode={role} />
      <FAQSection mode={role} />
    </main>
  );
}
