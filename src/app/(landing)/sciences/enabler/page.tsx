import HeroSection from '@/components/facilities/enabler/HeroSection';
import FeaturesSection from '@/components/facilities/enabler/FeaturesSection';
import Header from '@/components/facilities/about/Header';
import HowItWorks from '@/components/facilities/enabler/HowItWorks';
import FAQSection from '@/components/facilities/enabler/FAQSection';
import { NewsletterSignup } from '@/components/sections/newsletter-signup';
import FacilitiesComponent from '@/components/facilities/enabler/FacilitiesComponent';
import CummaCTA from '@/components/facilities/enabler/CummaCTA';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
        <Header />
      <HeroSection />
      <FeaturesSection />
    
     <FacilitiesComponent />
      <HowItWorks />
      <CummaCTA />
     <FAQSection />
      <NewsletterSignup />
    </main>
  );
}