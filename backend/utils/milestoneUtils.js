/**
 * Utility functions for milestone date calculations
 */

/**
 * Add calendar days to a date
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
 * Add business days to a date (excluding weekends)
 * @param {Date} date - Starting date
 * @param {Number} days - Number of business days to add
 * @returns {Date} New date
 */
export const addBusinessDays = (date, days) => {
  let currentDate = new Date(date);
  let addedDays = 0;
  
  while (addedDays < days) {
    currentDate.setDate(currentDate.getDate() + 1);
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      addedDays++;
    }
  }
  
  return currentDate;
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
 * @param {String} gapType - 'business' or 'calendar' (defaults to 'business')
 * @returns {Date} Calculated start date
 */
export const calculateMilestoneStartDate = (previousEndDate, daysAfterPrevious = 0, gapType = 'business') => {
  if (gapType === 'business') {
    return addBusinessDays(previousEndDate, daysAfterPrevious);
  } else {
    return addDays(previousEndDate, daysAfterPrevious);
  }
};

/**
 * Calculate milestone end date based on start date and duration
 * @param {Date} startDate - Milestone start date
 * @param {Number} durationDays - Duration in days
 * @param {String} durationType - 'business' or 'calendar' (defaults to 'business')
 * @returns {Date} Calculated end date
 */
export const calculateMilestoneEndDate = (startDate, durationDays, durationType = 'business') => {
  if (durationType === 'business') {
    return addBusinessDays(startDate, durationDays);
  } else {
    return addDays(startDate, durationDays);
  }
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
      const gapType = milestone.gapType || 'business';
      startDate = calculateMilestoneStartDate(previousEndDate, gap, gapType);
    }

    // Calculate end date
    if (milestone.endDateMode === 'manual' && milestone.endDate) {
      endDate = new Date(milestone.endDate);
    } else {
      // Duration mode: calculate based on duration and type
      const duration = milestone.durationDays || 1;
      const durationType = milestone.durationType || 'business';
      endDate = calculateMilestoneEndDate(startDate, duration, durationType);
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
 * @param {Date} previousEndDate - End date of previous milestone (or project start date)
 * @param {Date} projectEndDate - Project end date (optional)
 * @param {Date} projectStartDate - Project start date (optional)
 * @returns {Object} Validation result { isValid: boolean, errors: string[] }
 */
export const validateMilestoneDates = (milestone, previousEndDate, projectEndDate = null, projectStartDate = null) => {
  const errors = [];

  const startDate = milestone.dateMode === 'manual' 
    ? new Date(milestone.startDate) 
    : calculateMilestoneStartDate(previousEndDate, milestone.daysAfterPrevious || 0, milestone.gapType || 'business');

  const endDate = milestone.endDateMode === 'manual'
    ? new Date(milestone.endDate)
    : calculateMilestoneEndDate(startDate, milestone.durationDays || 1, milestone.durationType || 'business');

  console.log('Validation - Start Date:', startDate);
  console.log('Validation - End Date:', endDate);
  console.log('Validation - Project Start Date:', projectStartDate);
  console.log('Validation - Previous End Date:', previousEndDate);
  console.log('Validation - Project End Date:', projectEndDate);

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

  // Only validate date logic if dates are present
  if (milestone.startDate || milestone.dateMode === 'auto') {
    // Normalize dates to compare only date parts (ignore time)
    const normalizeDate = (date) => {
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    };

    const normalizedStartDate = normalizeDate(startDate);
    
    // Validate against project start date
    if (projectStartDate) {
      const normalizedProjectStart = normalizeDate(projectStartDate);
      if (normalizedStartDate < normalizedProjectStart) {
        const projectStartStr = normalizedProjectStart.toLocaleDateString();
        errors.push(`Milestone start date cannot be before project start date (${projectStartStr})`);
      }
    }

    // Validate start date is not before previous milestone end
    // Only check if previousEndDate is different from projectStartDate (to avoid duplicate error)
    if (previousEndDate && projectStartDate) {
      const normalizedPrevEnd = normalizeDate(previousEndDate);
      const normalizedProjectStart = normalizeDate(projectStartDate);
      
      // Only validate against previous end if it's not the same as project start
      if (normalizedPrevEnd.getTime() !== normalizedProjectStart.getTime()) {
        if (normalizedStartDate < normalizedPrevEnd) {
          const prevEndStr = normalizedPrevEnd.toLocaleDateString();
          errors.push(`Milestone start date cannot be before previous milestone end date (${prevEndStr})`);
        }
      }
    }

    // Validate start date against project end date
    if (projectEndDate) {
      const normalizedProjectEnd = normalizeDate(projectEndDate);
      if (normalizedStartDate > normalizedProjectEnd) {
        const projectEndStr = normalizedProjectEnd.toLocaleDateString();
        errors.push(`Milestone start date cannot be after project end date (${projectEndStr})`);
      }
    }
  }

  // Only validate end date logic if dates are present
  if ((milestone.endDate || milestone.endDateMode === 'duration') && (milestone.startDate || milestone.dateMode === 'auto')) {
    // Normalize dates to compare
    const normalizeDate = (date) => {
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    };

    const normalizedStartDate = normalizeDate(startDate);
    const normalizedEndDate = normalizeDate(endDate);
    
    // Validate end date is after start date (use <=, end must be strictly after start)
    if (normalizedEndDate <= normalizedStartDate) {
      errors.push('Milestone end date must be after start date');
    }

    // Validate against project end date if provided
    if (projectEndDate) {
      const normalizedProjectEnd = normalizeDate(projectEndDate);
      if (normalizedEndDate > normalizedProjectEnd) {
        const projectEndStr = normalizedProjectEnd.toLocaleDateString();
        errors.push(`Milestone end date cannot exceed project end date (${projectEndStr})`);
      }
    }
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
