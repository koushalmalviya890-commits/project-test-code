import React from 'react';

interface SuccessIconProps {
  className?: string;
}

const SuccessIcon: React.FC<SuccessIconProps> = ({ className = "" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
      aria-hidden="true"
    >
      <path 
        fillRule="evenodd" 
        d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.177 15.115l-4.243-4.243 1.415-1.414 2.828 2.828 5.657-5.657 1.415 1.414-7.072 7.072z" 
        clipRule="evenodd" 
      />
    </svg>
  );
};

export default SuccessIcon; 