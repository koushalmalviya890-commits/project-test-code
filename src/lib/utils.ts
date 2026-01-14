import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency with the ₹ symbol
 * Shows the full amount without abbreviations
 */
export function formatCurrency(value: number): string {
  if (!value && value !== 0) return '₹0.00';
  
  // Format with thousand separators and two decimal places
  const formattedValue = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
  
  return `₹${formattedValue}`;
} 