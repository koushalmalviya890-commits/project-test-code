const LifeAtCummaSection = () => {
  const reasons = [
    {
      number: "01",
      title: "Flat & Transparent",
      description:
        "We believe in open communication and a structure where every voice matters.",
    },
    {
      number: "02",
      title: "Work Your Way",
      description:
        "Choose what fits you best: Hybrid, or Onsite, Contract, Freelance",
    },
    {
      number: "03",
      title: "Ecosystem Access",
      description:
        "Get direct exposure to startup events, founders, and networks that accelerate your growth.",
    },
    {
      number: "04",
      title: "Culture of Creativity",
      description:
        "A workplace built on curiosity, collaboration, and the freedom to experiment.",
    },
  ];

  return (
    <div className="relative bg-white py-12 sm:py-16 md:py-24 overflow-hidden">
      {/* Background SVG */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/teams/twirl.svg"
          alt=""
          className="w-full h-full object-cover opacity-80"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Main Heading */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg
              width="20"
              height="21"
              viewBox="0 0 20 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 sm:w-5 sm:h-5"
            >
              <path
                d="M3 1.39087V5.39087M1 3.39087H5M4 15.3909V19.3909M2 17.3909H6M11 1.39087L13.2857 8.24801L19 10.3909L13.2857 12.5337L11 19.3909L8.71429 12.5337L3 10.3909L8.71429 8.24801L11 1.39087Z"
                stroke="#23BB4E"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
              LIFE AT <span className="text-green-500">CUMMA</span>
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium px-4">
            There must be a reason{" "}
            <span className="text-green-500">you are here.</span>
          </h2>
        </div>

        {/* Reasons Area*/}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 md:gap-[25px] lg:gap-[28px] mb-16 sm:mb-20">
          {reasons.map((reason, index) => (
            <div key={index} className="space-y-3 sm:space-y-4">
              <div
                className="text-5xl sm:text-6xl font-bold text-transparent"
                style={{
                  WebkitTextStroke: "2px #10b981",
                }}
              >
                {reason.number}
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
                {reason.title}
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>

        {/* Now Hiring Section */}
        <div className="text-center px-4">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-green-500 font-medium text-xl sm:text-2xl">
              Now Hiring
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-gray-900 mb-4 sm:mb-6">
            Open Positions Available
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Join us for exciting opportunities in a team that values growth and
            innovation
          </p>
        </div>
      </div>
    </div>
  );
};

export default LifeAtCummaSection;