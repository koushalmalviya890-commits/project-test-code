import React, { useState } from 'react';
import { Check } from 'lucide-react';

const CummaCTA: React.FC = () => {
  const [email, setEmail] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    console.log('Email submitted:', email);
    // Add your submission logic here
  };

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
      {/* Top Mesh Background */}
      <div className="absolute top-0 left-0 w-full h-1/2 opacity-60">
        <img 
          src="/workspace/meshup.svg" 
          alt="" 
          className="w-full h-full object-cover"
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            // Fallback gradient if image doesn't load
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.parentElement) {
              e.currentTarget.parentElement.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            }
          }}
        />
      </div>

      {/* Bottom Mesh Background */}
      <div className="absolute bottom-0 right-0 w-full h-1/2 opacity-60">
        <img 
          src="/workspace/mesh.svg" 
          alt="" 
          className="w-full h-full object-cover"
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            // Fallback gradient if image doesn't load
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.parentElement) {
              e.currentTarget.parentElement.style.background = 'linear-gradient(225deg, #10b981 0%, #059669 100%)';
            }
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <p className="text-green-600 font-medium mb-4 text-sm sm:text-base">
              Start growing today!
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              List your hub on{' '}
              <span className="text-green-600">Cumma</span>
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0">
              Experience the ease of smart bookings and unlock the full potential of your space
            </p>
          </div>

          {/* Right Content - Form */}
          <div className="flex-1 w-full max-w-2xl">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="flex-1 px-6 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                />
                <button
                  onClick={handleSubmit}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors duration-200 whitespace-nowrap text-base"
                >
                  Get Instant Access
                </button>
              </div>

              {/* Features */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm sm:text-base">
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <span className="font-medium">Free for you</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <span className="font-medium">No limits required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CummaCTA;