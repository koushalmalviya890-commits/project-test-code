import HeroSection from '@/components/facilities/user/HeroSection';
import FeaturesSection from '@/components/facilities/user/FeaturesSection';
import BookFacility from '@/components/facilities/user/BookFacility';
import Header from '@/components/facilities/about/Header';
import ExploreServices from '@/components/facilities/user/ExploreServices';
// import WorkspaceFAQSection from '@/components/workspace/user/FAQSection';
import HowItWorks from '@/components/facilities/user/HowItWorks';
import FAQSection from '@/components/facilities/user/FAQSection';
import { NewsletterSignup } from '@/components/sections/newsletter-signup';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
        <Header />
      <HeroSection />
      <FeaturesSection />
      <BookFacility />
      <ExploreServices />
      <HowItWorks />
     <FAQSection />
      <NewsletterSignup />
    </main>
  );
}