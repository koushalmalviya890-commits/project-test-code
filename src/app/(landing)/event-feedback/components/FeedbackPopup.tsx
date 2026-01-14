'use client';

import React, { useState } from 'react';
import { X, MessageSquare, Star } from 'lucide-react';
import StarRating from './starRating';
import FeedbackSuccess from './FeedbackSuccess';
import FeedbackService from '@/services/Events/services/event-api-services';
import { FeedbackData, FeedbackPayload } from '@/types/feedback';

interface FeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
  feedbackData: FeedbackData;
}

const FeedbackPopup: React.FC<FeedbackPopupProps> = ({
  isOpen,
  onClose,
  feedbackData
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comments, setComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload: FeedbackPayload = {
        eventId: feedbackData.eventId,
        serviceProviderId: feedbackData.serviceProviderId,
        name: feedbackData.username,
        email: feedbackData.email,
        rating,
        comments: comments.trim()
      };

      await FeedbackService.postEventFeedback(payload);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 py-20">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto max-h-[calc(100vh-160px)] overflow-y-auto">
        
        {/* Header - Compact */}
        <div className="relative bg-primary text-white px-5 py-4 rounded-t-2xl">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="text-center ">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold">Rate Your Experience</h2>
            <p className="text-purple-100 text-xs truncate">
              {feedbackData.eventTitle}
            </p>
          </div>
        </div>

        {/* Content - Compact */}
        <div className="p-5">
          {showSuccess ? (
            <FeedbackSuccess onClose={handleClose} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* User Info Display - Compact */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {feedbackData.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {feedbackData.username}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {feedbackData.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Star Rating - Compact */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How would you rate this event?
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <StarRating
                  rating={rating}
                  onRatingChange={setRating}
                  size="md"
                />
                {rating > 0 && (
                  <p className="mt-2 text-xs text-gray-600">
                    {getRatingText(rating)}
                  </p>
                )}
              </div>

              {/* Comments - Compact */}
              <div>
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="w-3 h-3 inline mr-1" />
                  Additional Comments (Optional)
                </label>
                <textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Share your thoughts about the event..."
                  maxLength={500}
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {comments.length}/500
                </div>
              </div>

              {/* Error Message - Compact */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                  <p className="text-red-700 text-xs">{error}</p>
                </div>
              )}

              {/* Action Buttons - Compact */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className="flex-1 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg- disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function for rating descriptions
const getRatingText = (rating: number): string => {
  const texts = {
    1: "Poor - We'll work to improve",
    2: "Fair - Room for improvement", 
    3: "Good - Met expectations",
    4: "Very Good - Exceeded expectations",
    5: "Excellent - Outstanding experience!"
  };
  return texts[rating as keyof typeof texts] || '';
};

export default FeedbackPopup;
