/**
 * Utility functions for milestone date calculations
 */

/**
 * Add days to a date
 * @param {Date} date - Starting date
 * @param {Number} days - Number of days to add
 * @returns {Date} New date
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Calculate the difference in days between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Number} Number of days
 */
export const getDaysDifference = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Calculate milestone start date based on previous milestone or project start
 * @param {Date} previousEndDate - End date of previous milestone (or project start date)
 * @param {Number} daysAfterPrevious - Gap days after previous milestone
 * @returns {Date} Calculated start date
 */
export const calculateMilestoneStartDate = (previousEndDate, daysAfterPrevious = 0) => {
  return addDays(previousEndDate, daysAfterPrevious);
};

/**
 * Calculate milestone end date based on start date and duration
 * @param {Date} startDate - Milestone start date
 * @param {Number} durationDays - Duration in days
 * @returns {Date} Calculated end date
 */
export const calculateMilestoneEndDate = (startDate, durationDays) => {
  return addDays(startDate, durationDays);
};

/**
 * Recalculate dates for all milestones in a project
 * @param {Array} milestones - Array of milestone objects (sorted by order)
 * @param {Date} projectStartDate - Project start date
 * @returns {Array} Array of milestones with updated calculated dates
 */
export const recalculateMilestoneDates = (milestones, projectStartDate) => {
  let previousEndDate = projectStartDate;
  
  return milestones.map((milestone, index) => {
    let startDate;
    let endDate;

    // Calculate start date
    if (milestone.dateMode === 'manual' && milestone.startDate) {
      startDate = new Date(milestone.startDate);
    } else {
      // Auto mode: start after previous milestone
      const gap = milestone.daysAfterPrevious || 0;
      startDate = calculateMilestoneStartDate(previousEndDate, gap);
    }

    // Calculate end date
    if (milestone.endDateMode === 'manual' && milestone.endDate) {
      endDate = new Date(milestone.endDate);
    } else {
      // Duration mode: calculate based on duration
      const duration = milestone.durationDays || 1;
      endDate = calculateMilestoneEndDate(startDate, duration);
    }

    // Update previous end date for next iteration
    previousEndDate = endDate;

    return {
      ...milestone,
      calculatedStartDate: startDate,
      calculatedEndDate: endDate
    };
  });
};

/**
 * Validate milestone dates
 * @param {Object} milestone - Milestone object
 * @param {Date} previousEndDate - End date of previous milestone
 * @param {Date} projectEndDate - Project end date (optional)
 * @returns {Object} Validation result { isValid: boolean, errors: string[] }
 */
export const validateMilestoneDates = (milestone, previousEndDate, projectEndDate = null) => {
  const errors = [];

  const startDate = milestone.dateMode === 'manual' 
    ? new Date(milestone.startDate) 
    : calculateMilestoneStartDate(previousEndDate, milestone.daysAfterPrevious || 0);

  const endDate = milestone.endDateMode === 'manual'
    ? new Date(milestone.endDate)
    : calculateMilestoneEndDate(startDate, milestone.durationDays || 1);

  // Validate start date is not before previous milestone end
  if (previousEndDate && startDate < previousEndDate) {
    errors.push('Milestone cannot start before previous milestone ends');
  }

  // Validate end date is after start date
  if (endDate < startDate) {
    errors.push('Milestone end date must be after start date');
  }

  // Validate against project end date if provided
  if (projectEndDate && endDate > projectEndDate) {
    errors.push('Milestone end date exceeds project end date');
  }

  // Validate manual dates are provided when required
  if (milestone.dateMode === 'manual' && !milestone.startDate) {
    errors.push('Start date is required when date mode is manual');
  }

  if (milestone.endDateMode === 'manual' && !milestone.endDate) {
    errors.push('End date is required when end date mode is manual');
  }

  // Validate duration
  if (milestone.endDateMode === 'duration' && (!milestone.durationDays || milestone.durationDays < 1)) {
    errors.push('Duration must be at least 1 day');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  addDays,
  getDaysDifference,
  calculateMilestoneStartDate,
  calculateMilestoneEndDate,
  recalculateMilestoneDates,
  validateMilestoneDates
};
