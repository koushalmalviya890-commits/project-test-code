'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';

interface FeedbackSuccessProps {
  onClose: () => void;
}

const FeedbackSuccess: React.FC<FeedbackSuccessProps> = ({ onClose }) => {
  return (
    <div className="text-center py-8">
      <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        Thank You!
      </h3>
      
      <p className="text-gray-600 mb-8 leading-relaxed">
        Your feedback has been submitted successfully.<br />
        We appreciate you taking the time to share your experience!
      </p>
      
      <button
        onClick={onClose}
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-200"
      >
        Continue
      </button>
    </div>
  );
};

export default FeedbackSuccess;
