import React from "react";

type CardInfo = {
  title: string;
  desc: string;
  bg: string;
  text: string;
  icon: string;
  position: {
    top: string;
    left: string;
    rotate: string;
  };
  zIndex: number;
};

const cards: CardInfo[] = [
  {
    title: "Institutions & Universities",
    desc: "List innovation labs, research centers, meeting rooms, auditoriums, and training halls to connect with startups, students, and communities.",
    bg: "bg-green-500",
    text: "text-white",
    icon: "/workspace/institute.svg",
    position: { top: "0px", left: "-50px", rotate: "-2deg" },
    zIndex: 30
  },
  {
    title: "Incubation & Acceleration Centers.",
    desc: "Showcase incubation spaces, startup pods, and meeting zones. Enable startups to book and collaborate seamlessly.",
    bg: "bg-gray-200",
    text: "text-gray-800",
    icon: "/workspace/incubation.svg",
    position: { top: "40px", left: "280px", rotate: "1deg" },
    zIndex: 50
  },
  {
    title: "Corporate Office Space",
    desc: "List boardrooms, meeting rooms, and business lounges to connect with teams and professionals seeking a premium work environment.",
    bg: "bg-green-500",
    text: "text-white",
    icon: "/workspace/corporat.svg",
    position: { top: "0px", left: "600px", rotate: "2deg" },
    zIndex: 30
  },
  {
    title: "Private Co-working Spaces",
    desc: "Open your shared offices, hot desks, and conference rooms to a verified user base; get visibility and bookings directly.",
    bg: "bg-gray-200",
    text: "text-gray-800",
    icon: "/workspace/cooworking.svg",
    position: { top: "320px", left: "20px", rotate: "2deg" },
    zIndex: 10
  },
  {
    title: "Independent Workspace Owners",
    desc: "Get real-time updates on fundraising programs, founder meetups, and partner perks personalized by your stage and goals.",
    bg: "bg-green-500",
    text: "text-white",
    icon: "/workspace/independent.svg",
    position: { top: "340px", left: "320px", rotate: "-1deg" },
    zIndex: 40
  },
  {
    title: "Commercial Space",
    desc: "Showcase event halls, studios, and rentable areas to make the most of every unused space and boost your revenue.",
    bg: "bg-gray-200",
    text: "text-gray-800",
    icon: "/workspace/commercial.svg",
    position: { top: "320px", left: "650px", rotate: "-2deg" },
    zIndex: 10
  }
];

const CummaCardSection: React.FC = () => {
  return (
    <section className="flex flex-col items-center py-2 px-4 bg-white overflow-hidden">
      <p className="text-gray-500 text-sm mb-2 text-center tracking-wider">Who</p>
      <h2 className="font-bold text-4xl md:text-5xl mb-3 text-center">
        List with <span className="text-green-500">Cumma?</span>
      </h2>
      <p className="text-gray-400 mb-0 md:mb-20 text-center max-w-2xl leading-relaxed">
        Trusted by enablers to showcase and monetize spaces for work and growth.
      </p>
      
      {/* Desktop View - Overlapping Cards */}
      <div className="hidden lg:block relative w-full max-w-[950px] mx-auto hover:focus" style={{ height: '650px' }}>
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`absolute w-[340px] ${card.bg} ${card.text} px-8 py-10 rounded-3xl shadow-xl transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl cursor-pointer group`}
            style={{
              top: card.position.top,
              left: card.position.left,
              transform: `rotate(${card.position.rotate})`,
              zIndex: card.zIndex
            }}
          >
            <div className="text-4xl mb-4"><img src={card.icon} alt="" /></div>
            <h3 className="font-bold text-xl mb-3 leading-tight">{card.title}</h3>
            <p className={`text-sm leading-relaxed ${card.bg === 'bg-green-500' ? 'opacity-95' : 'opacity-75'}`}>
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Mobile/Tablet View - Grid Layout */}
     <div className="lg:hidden w-full max-w-md mx-auto h-[400px] overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="h-[450px] snap-center flex items-center justify-center px-4"
          >
            <div
              className={`${card.bg} ${card.text} w-full px-8 py-10 rounded-3xl shadow-xl`}
            >
              <div className="text-4xl mb-4"><img src={card.icon} alt="" /></div>
              <h3 className="font-bold text-xl mb-3 leading-tight">{card.title}</h3>
              <p className={`text-sm leading-relaxed ${card.bg === 'bg-green-500' ? 'opacity-95' : 'opacity-75'}`}>
                {card.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </section>
  );
};

export default CummaCardSection;