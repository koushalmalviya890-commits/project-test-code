// utils/dateHelpers.ts - PROPERLY CORRECTED VERSION USING TIMEZONE

// Define types for better type safety
type DateLike = string | number | Date | null | undefined;
type FormatType = 'full' | 'short' | 'dateOnly' | 'timeOnly';

// 🕒 FIXED: Convert IST to UTC (for sending to API)
export const convertISTtoUTC = (istDate: DateLike): Date | null => {
  if (!istDate) return null;
  
  let dateObj: Date;
  if (istDate instanceof Date) {
    dateObj = istDate;
  } else if (typeof istDate === 'string' || typeof istDate === 'number') {
    dateObj = new Date(istDate);
  } else {
    return null;
  }
  
  if (isNaN(dateObj.getTime())) return null;
  
  // 🕒 FIXED: Use proper timezone conversion
  // Create a date string in IST format, then parse as UTC
  const istString = dateObj.toISOString().slice(0, -1); // Remove 'Z'
  const utcDate = new Date(istString + '+05:30'); // Treat as IST, get UTC equivalent
  return new Date(utcDate.getTime() - (5.5 * 60 * 60 * 1000));
};

// 🕒 FIXED: Convert UTC to IST (for displaying from API) 
export const convertUTCtoIST = (utcDate: DateLike): Date | null => {
  if (!utcDate) return null;
  
  let dateObj: Date;
  if (utcDate instanceof Date) {
    dateObj = utcDate;
  } else if (typeof utcDate === 'string' || typeof utcDate === 'number') {
    dateObj = new Date(utcDate);
  } else {
    return null;
  }
  
  if (isNaN(dateObj.getTime())) return null;
  
  // 🕒 FIXED: Use JavaScript's built-in timezone handling
  // Parse the IST time from the UTC date using Asia/Kolkata timezone
  const istString = dateObj.toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' });
  return new Date(istString);
};

// Format date for API submission (IST to UTC ISO string)
export const safeToISOStringUTC = (date: DateLike): string => {
  if (!date) return '';
  
  let dateObj: Date;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string' || typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    return '';
  }
  
  if (isNaN(dateObj.getTime())) return '';
  
  // For API submission, assume the date is already in the correct format
  return dateObj.toISOString();
};

// 🕒 FIXED: Format date for datetime-local input (IST display)
export const formatDateTimeLocalIST = (date: DateLike): string => {
    if (!date) return '';
  
  let dateObj: Date;
  if (date instanceof Date) {          // ✅ Check the parameter 'date'
    dateObj = date;
  } else if (typeof date === 'string' || typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    return '';
  }
  
  if (isNaN(dateObj.getTime())) return '';
  
  if (isNaN(dateObj.getTime())) return '';
  
  // 🕒 FIXED: Use proper timezone conversion for datetime-local input
  const istString = dateObj.toLocaleString('sv-SE', { 
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return istString.replace(' ', 'T');
};

// Safe date conversion helper
export const ensureDateObjectIST = (value: DateLike): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  
  return null;
};

// 🕒 FIXED: Format UTC date from API to IST display (PROPER METHOD)
export const formatDateIST = (utcDate: DateLike, format: FormatType = 'full'): string => {
  if (!utcDate) return 'Not set';
  
  const date = new Date(utcDate);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  // Format options with proper TypeScript typing
  const formatOptions: Record<FormatType, Intl.DateTimeFormatOptions> = {
    full: {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'  // 🕒 FIXED: Use proper timezone
    },
    short: {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'  // 🕒 FIXED: Use proper timezone
    },
    dateOnly: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'  // 🕒 FIXED: Use proper timezone
    },
    timeOnly: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'  // 🕒 FIXED: Use proper timezone
    }
  };
  
  // 🕒 FIXED: Use the UTC date with timezone formatting
  return date.toLocaleString('en-IN', formatOptions[format]);
};

// 🕒 FIXED: Format date range (start - end)
// 🕒 UPDATED: Format date range with both date and time (start - end)
export const formatDateRangeIST = (startDate: DateLike, endDate: DateLike): string => {
  if (!startDate || !endDate) return 'Date not set';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Invalid date range';
  
  // Check if events are on the same day
  const startDateOnly = start.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const endDateOnly = end.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const isSameDay = startDateOnly === endDateOnly;
  
  if (isSameDay) {
    // Same day: "Friday, 4 October 2025 • 10:30 AM - 2:00 PM"
    const dateStr = start.toLocaleString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
    
    const startTime = start.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
    
    const endTime = end.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit', 
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
    
    return `${dateStr} • ${startTime} - ${endTime}`;
  } else {
    // Different days: "Fri, 4 Oct 2025, 10:30 AM - Sat, 5 Oct 2025, 2:00 PM"
    const startDateTime = start.toLocaleString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
    
    const endDateTime = end.toLocaleString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit', 
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
    
    return `${startDateTime} - ${endDateTime}`;
  }
};


// 🕒 FIXED: Get relative time (e.g., "in 2 days", "2 hours ago")
export const getRelativeTimeIST = (utcDate: DateLike): string => {
  if (!utcDate) return 'Unknown';
  
  const date = new Date(utcDate);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  // Get current time
  const now = new Date();
  
  // 🕒 FIXED: Calculate difference using UTC times, then consider IST offset
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  if (Math.abs(diffMins) < 60) {
    return diffMins > 0 ? `in ${diffMins} minutes` : `${Math.abs(diffMins)} minutes ago`;
  } else if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `in ${diffHours} hours` : `${Math.abs(diffHours)} hours ago`;
  } else {
    return diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)} days ago`;
  }
};

// Additional TypeScript-specific helpers

// Type guard to check if a value is a valid date
export const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

// 🕒 FIXED: Convert any date-like value to IST Date object
export const toISTDate = (date: DateLike): Date | null => {
  if (!date) return null;
  
  const dateObj = ensureDateObjectIST(date);
  if (!dateObj) return null;
  
  // 🕒 FIXED: Use proper timezone conversion
  const istString = dateObj.toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' });
  return new Date(istString);
};

// 🕒 FIXED: Format for display in tables/cards (compact format)
export const formatCompactIST = (date: DateLike): string => {
  if (!date) return '--';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Invalid';
  
  // 🕒 FIXED: Use proper timezone formatting
  return dateObj.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
};

// 🕒 FIXED: Get current IST time
export const getCurrentIST = (): Date => {
  const now = new Date();
  // 🕒 FIXED: Use timezone-aware method
  const istString = now.toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' });
  return new Date(istString);
};

// 🕒 FIXED: Check if date is in the past (IST)
export const isPastDateIST = (date: DateLike): boolean => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return false;
  
  const now = new Date();
  return dateObj.getTime() < now.getTime();
};

// 🕒 FIXED: Check if date is today (IST)
export const isTodayIST = (date: DateLike): boolean => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return false;
  
  const now = new Date();
  
  // 🕒 FIXED: Compare dates in IST timezone
  const dateIST = dateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const todayIST = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  
  return dateIST === todayIST;
};
