/**
 * Utility functions for handling dates consistently throughout the application
 */

/**
 * Formats a date to YYYY-MM-DD string
 * @param {Date|string} date - The date to format
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  if (typeof date === 'string') {
    // If it's a YYYY-MM-DD string, return as-is
    if (!date.includes('T') && date.includes('-')) {
      return date.split(' ')[0]; // Handle "YYYY-MM-DD" or "YYYY-MM-DD HH:MM:SS"
    }
    
    // If it's an ISO timestamp, extract the date portion directly from the string
    if (date.includes('T')) {
      // Extract YYYY-MM-DD from ISO string before any timezone conversion
      return date.split('T')[0];
    }
  }
  
  // For Date objects, format as local date
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Gets today's date in YYYY-MM-DD format
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export const getTodayString = () => {
  return formatDateForInput(new Date());
};

/**
 * Formats a date string to display format
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatDateDisplay = (dateString) => {
  if (!dateString) return '';
  
  let date;
  if (typeof dateString === 'string') {
    if (dateString.includes('T')) {
      // ISO timestamp - extract date portion from string directly
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      // YYYY-MM-DD format - parse as local date
      const [year, month, day] = dateString.split('-').map(Number);
      date = new Date(year, month - 1, day);
    }
  } else {
    date = new Date(dateString);
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Calculate the number of business days between two dates
 * @param {Date|string} startDate - The start date
 * @param {Date|string} endDate - The end date
 * @returns {number} Number of business days between the dates
 */
export const getBusinessDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let count = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
};

/**
 * Add days to a date (calendar days)
 * @param {Date|string} startDate - The start date
 * @param {number} days - Number of calendar days to add
 * @returns {string} End date in YYYY-MM-DD format
 */
export const addCalendarDays = (startDate, days) => {
  const date = new Date(startDate);
  date.setDate(date.getDate() + parseInt(days));
  return formatDateForInput(date);
};

/**
 * Add business days to a date (excluding weekends)
 * @param {Date|string} startDate - The start date
 * @param {number} days - Number of business days to add
 * @returns {string} End date in YYYY-MM-DD format
 */
export const addBusinessDays = (startDate, days) => {
  const date = new Date(startDate);
  let daysAdded = 0;
  const targetDays = parseInt(days);
  
  while (daysAdded < targetDays) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    // Skip weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++;
    }
  }
  
  return formatDateForInput(date);
};
