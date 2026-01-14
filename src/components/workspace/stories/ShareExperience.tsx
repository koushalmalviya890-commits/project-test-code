import React from 'react';

type Mode = "startup" | "enabler";

interface ShareExperienceProps {
  mode?: Mode;
}

const ShareExperience: React.FC<ShareExperienceProps> = ({ 
  mode = 'startup'
}) => {
  // Map mode to illustration paths
  const getIllustrationPath = () => {
    return mode === 'startup' 
      ? '/workspace/laptopgirl.svg' 
      : '/workspace/hatgirl.svg';
  };

  return (
    <>
      {/* Mobile Layout */}
      <div className="block lg:hidden w-full max-w-sm mx-auto">
        <div className="relative flex flex-col items-center text-center py-12 px-4">
          <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-2xl">
            <div className="relative px-6 py-8 flex flex-col items-center text-center">
              {/* Content */}
              <h2 className="text-white text-xl font-semibold mb-3">
                Share your Experience
              </h2>
              <p className="text-white text-sm opacity-90 mb-6 leading-relaxed">
                If you are having a great experience using Cumma we would like to know about it and feature it here!
              </p>

              {/* Illustration - Between text and button */}
              <div className="w-48 h-48 mb-6">
                <img
                  src={getIllustrationPath()}
                  alt="Share experience illustration"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Button */}
              <button 
                onClick={() => window.location.href = 'mailto:support@cumma.in'}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-transparent border-2 border-white rounded-full text-white font-medium hover:bg-white hover:text-green-600 transition-all duration-300"
              >
                <span>Share Your Story</span>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M7 7h10v10" />
                  <path d="M7 17L17 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block w-full max-w-6xl mx-auto py-16">
        <div className="relative gap-8">
          <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-3xl shadow-xl">
            <div className={`relative flex items-center text-center min-h-[280px] ${mode === 'startup' ? 'justify-start pl-12 pr-64' : 'justify-end pr-12 pl-64'}`}>
              {/* Content */}
              <div className="relative py-10 flex flex-col justify-center max-w-xl">
                <h2 className="text-white text-3xl font-semibold mb-4">
                  Share your Experience
                </h2>
                <p className="text-white text-base opacity-90 mb-8 leading-relaxed">
                  If you are having a great experience using Cumma we would like to know about it and feature it here!
                </p>

                {/* Button */}
                <div>
                  <button 
                    onClick={() => window.location.href = 'mailto:support@cumma.in'}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-transparent border-2 border-white rounded-full text-white font-medium hover:bg-white hover:text-green-600 transition-all duration-300"
                  >
                    <span>Share Your Story</span>
                    <svg 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M7 7h10v10" />
                      <path d="M7 17L17 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Illustration - Positioned outside/overlapping the green box */}
          <div className={`absolute top-1/2 -translate-y-[224px] w-[480px] h-[400px] ${mode === 'startup' ? 'right-0 -translate-x-8' : 'left-0 -translate-x-14'}`}>
            <img
              src={getIllustrationPath()}
              alt="Share experience illustration"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ShareExperience;