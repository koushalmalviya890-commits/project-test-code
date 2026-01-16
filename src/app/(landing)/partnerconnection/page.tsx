"use client"; // Required for interactivity in Next.js App Router

import { useState, useRef } from 'react';

import LegacySection from '../../../components/partnerconnect/LegacySection';
import FacilityDashboard from '../../../components/partnerconnect/FacilityDashboard';
// import Navbar from "../../../components/partnerconnect/Components/Navbar/Navbar";
import Hero from "../../../components/partnerconnect/components/Section1/Hero";
import Platform from "../../../components/partnerconnect/components/Section2/Platform";
import Ecosystem from "../../../components/partnerconnect/components/Section3/Ecosystem";
import Partnership from "../../../components/partnerconnect/components/Section4/Partnership";
import CTA from "../../../components/partnerconnect/components/Section7/CTA";
import Footer from "../../../components/partnerconnect/components/Footer/Footer";
import RoleForm from "../../../components/partnerconnect/components/Roleform/RoleForm";
export default function Home() {
const [activeRole, setActiveRole] = useState('facility');
  const formRef = useRef<HTMLDivElement>(null);
  const partnershipRef = useRef<HTMLDivElement>(null);

const scrollToPartnership = () => {
    partnershipRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToForm = (role: string) => {
    setActiveRole(role);
    // Smooth scroll to the form section
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  return (
    <main >
      <Hero onJoinEarly={scrollToPartnership} />
      <Platform />
      <Ecosystem />
      <div ref={partnershipRef}>
      <Partnership onSelectRole={scrollToForm} />
      </div>
      <FacilityDashboard />
<div ref={formRef} id="form-section">
        <RoleForm activeRole={activeRole} setActiveRole={setActiveRole} />
      </div>     
<CTA onSelectRole={scrollToForm} />
      <Footer onSelectRole={scrollToForm} />
    </main>
  );
}