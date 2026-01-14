'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';
import FeedbackPopup from '@/app/(landing)/event-feedback/components/FeedbackPopup';
import { decodeUrlParams } from '@/utils/urlUtils'
import { FeedbackData } from '@/types/feedback';

interface FeedbackPageProps {
  params: Promise<{ eventId: string }>;
}

const FeedbackPage: React.FC<FeedbackPageProps> = ({ params }) => {
  const { eventId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const encodedData = searchParams.get('data');
    
    if (!encodedData) {
      setError('Invalid feedback link');
      setIsLoading(false);
      return;
    }

    const decodedData = decodeUrlParams(encodedData);
    
    if (!decodedData) {
      setError('Invalid or corrupted feedback link');
      setIsLoading(false);
      return;
    }

    // Verify eventId matches
    if (decodedData.eventId !== eventId) {
      setError('Event ID mismatch');
      setIsLoading(false);
      return;
    }

    setFeedbackData(decodedData);
    setIsLoading(false);
  }, [searchParams, eventId]);

  const handleClose = () => {
    router.push('/landing');
  };

  const handleError = () => {
    router.push('/landing');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback form...</p>
        </div>
      </div>
    );
  }

  if (error || !feedbackData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Invalid Feedback Link
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'The feedback link appears to be invalid or has expired.'}
          </p>
          <button
            onClick={handleError}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-lg mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Event Feedback
            </h1>
            <p className="text-gray-600">
              Share your experience and help us improve future events
            </p>
          </div>
          
          {/* Auto-open feedback popup */}
          <FeedbackPopup
            isOpen={true}
            onClose={handleClose}
            feedbackData={feedbackData}
          />
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
