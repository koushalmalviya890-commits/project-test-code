'use client';

import React from 'react';
import { StarRatingProps } from '@/types/feedback';

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  onRatingChange, 
  size = 'md',
  readonly = false 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const handleStarClick = (starIndex: number) => {
    if (!readonly) {
      onRatingChange(starIndex);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleStarClick(star)}
          disabled={readonly}
          className={`
            ${sizeClasses[size]} 
            transition-all duration-200 transform
            ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}
            ${star <= rating 
              ? 'text-yellow-400 drop-shadow-lg' 
              : 'text-gray-300 hover:text-yellow-200'
            }
          `}
          aria-label={`Rate ${star} stars`}
        >
          <svg
            className="w-full h-full"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      
      {/* Rating text */}
      <span className="ml-3 text-sm text-gray-600 font-medium">
        {rating > 0 ? `${rating}/5` : 'No rating'}
      </span>
    </div>
  );
};

export default StarRating;
