/**
 * Utility functions for handling dates consistently throughout the application
 * to avoid timezone issues
 */

/**
 * Formats a date to YYYY-MM-DD string in local timezone
 * @param {Date} date - The date to format
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Gets today's date in YYYY-MM-DD format in local timezone
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export const getTodayString = () => {
  return formatDateForInput(new Date());
};

/**
 * Formats a date string (from database) to display format
 * Handles UTC dates from database properly
 * @param {string} dateString - ISO date string from database
 * @returns {string} Formatted date string
 */
export const formatDateDisplay = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Use UTC methods to avoid timezone shift
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
};

/**
 * Formats a date string to short format MM/DD/YYYY
 * @param {string} dateString - ISO date string from database
 * @returns {string} Formatted date string in MM/DD/YYYY format
 */
export const formatDateShort = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${month}/${day}/${year}`;
};

/**
 * Parses a date input value (YYYY-MM-DD) and returns it formatted for database storage
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} ISO string for database storage
 */
export const parseDateInputForStorage = (dateString) => {
  if (!dateString) return '';
  // Create date at midnight in local timezone, then convert to ISO
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toISOString();
};

/**
 * Extracts YYYY-MM-DD from a database date string
 * Handles UTC dates properly
 * @param {string} dateString - ISO date string from database
 * @returns {string} Date in YYYY-MM-DD format for input fields
 */
export const extractDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Use UTC methods to get the date components stored in database
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
