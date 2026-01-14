import React from 'react'
import { cn } from "@/lib/utils";

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
  xl: 'h-16 w-16 border-4',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div 
      className={cn(
        'animate-spin rounded-full border-t-transparent border-gray-200',
        sizeClasses[size],
        className
      )}
      style={{ 
        borderTopColor: 'transparent',
        borderRightColor: 'rgba(0, 0, 0, 0.3)',
        borderBottomColor: 'rgba(0, 0, 0, 0.3)',
        borderLeftColor: 'rgba(0, 0, 0, 0.3)'
      }}
    />
  );
} 