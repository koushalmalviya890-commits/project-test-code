import TeamHero from '@/components/teams/TeamHero'
import CummaTeam from '@/components/teams/CummaTeam'
import VisiontoReality from '@/components/teams/VisiontoReality'
import TeamVoicesCarousel from '@/components/teams/TeamVoicesCarousel'
import {NewsletterSignup} from '@/components/career/NewsletterSignup'

import React from 'react'

const Teamspage = () => {
  return (
    <div className='py-[120px] md:py-[120px]'>
        <TeamHero />
        <VisiontoReality />
        <CummaTeam />
        <TeamVoicesCarousel />
        <NewsletterSignup />
    </div>
  )
}

export default Teamspage