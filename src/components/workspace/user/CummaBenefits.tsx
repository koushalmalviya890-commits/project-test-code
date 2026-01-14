import React from 'react';
import { Search, Calendar, TrendingUp } from 'lucide-react';
import search from '../../../../public/workspace/search.svg';

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-green-100 border border-gray-200 rounded-2xl transition-all hover:shadow-lg hover:scale-105 duration-300 h-full">
      <div className='flex items-center justify-center pt-6 md:pt-8'>
      <div className="bg-white rounded-2xl w-[100px] h-[100px] md:w-[100px] md:h-[100px] flex items-center justify-center mb-6 md:mb-8 shadow-sm">
        <img src={`/workspace/${icon}`} alt="" />
    
      </div>
      </div>
      <div className="mt-4 bg-white p-8 rounded-2xl">
        <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3 md:mb-4">
          {title}
        </h3>
        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
          {description}
      </p>
        </div>
    </div>
  );
};

const CummaBenefits: React.FC = () => {
  const benefits = [
    {
      icon: 'search.svg',
      title: "Search Office Spaces",
      description: "Find coworking desks, private cabins, or meeting rooms tailored to your team's needs — all in one platform."
    },
    {
      icon: 'calendar.svg',
      title: "Book with Flexibility",
      description: "Reserve daily, monthly, or long-term spaces in just a few clicks — no rigid contracts, full freedom to scale."
    },
    {
      icon: 'trendup.svg',
      title: "Use & Grow",
      description: "Move in and start working with ready-to-use facilities, high-speed internet, and a community built for startups."
    }
  ];

  return (
    <section className="relative w-full h-full bg-white py-12 md:py-20 px-4 md:px-6 overflow-hidden mb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-gray-600 text-sm md:text-base mb-2 md:mb-3">
            Why Choose Us?
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
            Key <span className="text-green-600">Benefits</span> of Using Cumma
          </h2>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto px-4">
            Our platform tackles your biggest challenges. Discover why Cumma is essential for modern teams.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CummaBenefits;