import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const FacilitiesComponent = () => {
  const cards = [
    {
      id: 1,
      description: "Universities and research institutes offering bio-labs, prototype labs, and R&D centers for learning and innovation.",
      title: "Academic & Research Institutions",
      variant: "filled", 
      span: 1, // 1 column wide (33%)
    },
    {
      id: 2,
      description: "Prototyping machines, 3D printers, and software lab resources that help startups bring ideas to life.",
      title: "Incubators & Innovation Hubs",
      variant: "outlined",
      span: 2, // 2 columns wide (66%)
    },
    {
      id: 3,
      description: "Industries and small-scale units sharing manufacturing, prototyping, and testing facilities for research and production.",
      title: "Automate bookings and approvals",
      variant: "outlined",
      span: 2, // 2 columns wide (66%)
    },
    {
      id: 4,
      description: "Independent labs and private R&D setups with specialized equipment, testing tools, and creative studios.",
      title: "Private & Specialized Facilities",
      variant: "filled",
      span: 1, // 1 column wide (33%)
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-16 font-sans">
      {/* Header Section */}
      <div className="flex flex-col items-center mb-16">
        <span className="text-gray-800 text-sm mb-2 border border-gray-600 rounded-full px-3 py-1">Who</span>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-12">
          List Facilities with <span className="text-green-500">Cumma?</span>
        </h2>

        <div className="flex flex-col md:flex-row justify-between items-start w-full gap-8">
          <h3 className="text-2xl md:text-3xl font-medium text-gray-800 max-w-2xl leading-tight font-semibold">
            Unify all your facilities under <span className="text-green-500">one</span> <br className="hidden md:block" />
            <span className="text-green-500">intelligent, data-driven</span> management <br /> platform.
          </h3>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xl font-bold text-gray-700">
               {/* <div className="text-green-500">
                 <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                 </svg>
               </div>
               <span>cumma facilities</span> */}
               <img src='/facility/facilitylogo.svg' alt='facilities logo' />
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {/* Changed to lg:grid-cols-3 so it stacks nicely on smaller laptops, and fully stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr">
        {cards.map((card) => (
          <div
            key={card.id}
            // REMOVED INLINE STYLES FOR WIDTH
            className={`
              relative p-8 rounded-3xl flex flex-col justify-between min-h-[220px] transition-all duration-300
              ${card.span === 2 ? 'lg:col-span-2' : 'lg:col-span-1'}
              ${card.variant === 'filled' 
               ? 'border border-green-300 bg-gradient-to-br from-white via-green-50 to-green-100' // Light green background
                : 'bg-white border border-green-300'
              }
            `}
          >
            <div className="flex justify-between items-start gap-4">
              <p className="text-gray-700 text-lg leading-relaxed max-w-[90%]">
                {card.description}
              </p>
              
              <div className="bg-green-500 rounded-full p-2 text-white flex-shrink-0 hover:bg-green-600 transition-colors cursor-pointer">
                <ArrowUpRight size={24} strokeWidth={2.5} />
              </div>
            </div>

            <h3 className="text-xl font-bold text-black mt-8">
              {card.title}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FacilitiesComponent;