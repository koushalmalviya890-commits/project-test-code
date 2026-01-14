import CareerPage from '@/components/career/Career'
import CummaValuesSection from '@/components/career/CummaValueSection'
import HeroSection from '@/components/career/HeroSection'
import LifeAtCummaSection from '@/components/career/LifeAtCumma'
import { NewsletterSignup } from '@/components/career/NewsletterSignup'
import Openpositions from '@/components/career/Openpositions'
import React from 'react'

const Careerpage = () => {
  return (
    <div className='py-[120px] md:py-[120px]'>
        <HeroSection />
        <CummaValuesSection />
        <LifeAtCummaSection />
        <Openpositions />
        <CareerPage />
        <NewsletterSignup />
    </div>
  )
}

export default Careerpage