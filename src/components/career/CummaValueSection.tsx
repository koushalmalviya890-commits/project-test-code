const CummaValuesSection = () => {
  const values = [
    {
      icon: "/teams/impact.svg",
      title: "Impact That Matters",
      description: "Shape how startups thrive across India.",
    },
    {
      icon: "/teams/ml.svg",
      title: "Learn & Grow Fast",
      description: "Ownership, freedom, and tons of opportunities to level up.",
    },
    {
      icon: "/teams/collaborate.svg",
      title: "Collaborative Culture",
      description: "Great attitudes blended with proficiency.",
    },
    {
      icon: "/teams/createdesk.svg",
      title: "Freedom to Create",
      description: "No unnecessary barriers—we let you do your best work.",
    },
  ];

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-center mb-8 sm:mb-12 md:mb-16 lg:mb-24 leading-tight">
          <span className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <span className="flex items-center">
              What makes
              <img 
                src='/teams/cumma.png' 
                alt="cumma" 
                className='h-[60px] w-[140px] sm:h-[80px] sm:w-[190px] md:h-[100px] md:w-[235px] lg:h-[120px] lg:w-[280px] mx-1 sm:mx-2 -mb-1 sm:-mb-2' 
              />
              a great place
            </span>
          </span>
          <span className="block mt-1">to work?</span>
        </h2>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center">
          {/* Left Side - Values Cards */}
          <div className="space-y-3 sm:space-y-4">
            {values.map((value, index) => (
              <div
                key={index}
                className="flex items-start gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 md:p-5 bg-white border border-gray-200 rounded-2xl sm:rounded-3xl hover:shadow-lg transition-shadow duration-300"
              >
                {/* Icon Circle */}
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-green-500 rounded-full flex items-center justify-center">
                  <img 
                    src={value.icon} 
                    alt={value.title} 
                    className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 object-cover" 
                  />
                </div>

                {/* Content */}
                <div className="flex-1 pt-0.5 sm:pt-1">
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 mb-1 sm:mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side - Illustration */}
          <div className="relative flex items-center justify-center mt-8 lg:mt-0">
            <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl">
              <div className="rounded-2xl sm:rounded-3xl flex items-center justify-center">
                <img 
                  src="/teams/rightman.png" 
                  alt="Creative workspace illustration" 
                  className="w-full h-auto" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CummaValuesSection;