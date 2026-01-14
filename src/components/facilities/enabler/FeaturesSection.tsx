import React from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-3xl shadow-[0_28px_30px_rgb(0,0,0,0.04)] border border-gray-200 flex flex-col items-center text-center transition-transform hover:scale-[1.02] z-10 relative">
    <div className="mb-4 p-3 bg-white rounded-full">
      {/* Icon Styling: Green outline style */}
      <div className="text-green-500 [&>svg]:w-8 [&>svg]:h-8 [&>svg]:stroke-[1.5]">
        <img src={icon} alt="Feature Icon" className="w-full h-full object-contain" />
      </div>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">
      {description}
    </p>
  </div>
);

const FeaturesSection = () => {
  const features = [
    {
      icon: "/facility/earn.svg",
      title: "Earn More",
      description: "Monetize underutilized equipment and generate additional revenue"
    },
    {
      icon: "/facility/reach.svg",
      title: "Reach More Users",
      description: "Attract startups, companies, and researchers looking for facilities"
    },
    {
      icon: "/facility/tv.svg",
      title: "Smart Management",
      description: "Track bookings, utilization, and payments with ease."
    },
    {
      icon: "/facility/boost.svg",
      title: "Boost Visibility",
      description: "Position your institution and incubator as a trusted innovation enabler"
    },
    {
      icon: "/facility/innovate.svg",
      title: "Support Innovation",
      description: "Empower startups, researchers, and students to bring ideas to life"
    },
    {
      icon: "/facility/flexible.svg",
      title: "Flexible Control",
      description: "Set your own availability, pricing, and usage rules with complete transparency."
    }
  ];

  return (
    <section className="relative w-full pb-20 md:pb-0 mb-30 px-4 md:px-8 md:mb-10 overflow-hidden h-[980px] md:h-[760px]">
      <div className="text-center mb-16 relative z-10">
        <div className="inline-block px-4 py-1 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-600 mb-4">
          Why Choose Us?
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
          Key <span className="text-green-500">Benefits</span> of Using Cumma
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Our platform tackles your biggest challenges. Discover why Cumma is essential for modern teams.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {features.map((feature, index) => (
          <FeatureCard 
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>

      <div className="hidden md:block absolute -bottom-10 -right-10 md:-bottom-[5px] md:-left-10 w-[300px] h-[300px] md:w-[500px] md:h-[380px] pointer-events-none z-10 opacity-90 scale-x-[-1]">
        <img src='/facility/robotic.svg' alt='Robotic Arm Illustration' className="w-full h-full object-contain rounded-tl-[100px]" />
      </div>
    </section>
  );
};

export default FeaturesSection;