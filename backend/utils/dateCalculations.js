/**
 * Utility functions for deliverable and task date calculations
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
 * Calculate deliverable start date based on milestone start date
 * @param {Date} milestoneStartDate - Start date of parent milestone
 * @param {Number} offsetDays - Number of days offset from milestone start
 * @param {String} offsetType - 'business' or 'calendar' (defaults to 'business')
 * @returns {Date} Calculated start date
 */
export const calculateDeliverableStartDate = (milestoneStartDate, offsetDays = 0, offsetType = 'business') => {
  if (offsetType === 'business') {
    return addBusinessDays(milestoneStartDate, offsetDays);
  } else {
    return addDays(milestoneStartDate, offsetDays);
  }
};

/**
 * Calculate deliverable end date based on milestone start date
 * @param {Date} milestoneStartDate - Start date of parent milestone
 * @param {Number} offsetDays - Number of days offset from milestone start
 * @param {String} offsetType - 'business' or 'calendar' (defaults to 'business')
 * @returns {Date} Calculated end date
 */
export const calculateDeliverableEndDate = (milestoneStartDate, offsetDays = 0, offsetType = 'business') => {
  if (offsetType === 'business') {
    return addBusinessDays(milestoneStartDate, offsetDays);
  } else {
    return addDays(milestoneStartDate, offsetDays);
  }
};

/**
 * Calculate task start date based on deliverable start date
 * @param {Date} deliverableStartDate - Start date of parent deliverable
 * @param {Number} offsetDays - Number of days offset from deliverable start
 * @param {String} offsetType - 'business' or 'calendar' (defaults to 'business')
 * @returns {Date} Calculated start date
 */
export const calculateTaskStartDate = (deliverableStartDate, offsetDays = 0, offsetType = 'business') => {
  if (offsetType === 'business') {
    return addBusinessDays(deliverableStartDate, offsetDays);
  } else {
    return addDays(deliverableStartDate, offsetDays);
  }
};

/**
 * Calculate task end date based on deliverable start date
 * @param {Date} deliverableStartDate - Start date of parent deliverable
 * @param {Number} offsetDays - Number of days offset from deliverable start
 * @param {String} offsetType - 'business' or 'calendar' (defaults to 'business')
 * @returns {Date} Calculated end date
 */
export const calculateTaskEndDate = (deliverableStartDate, offsetDays = 0, offsetType = 'business') => {
  if (offsetType === 'business') {
    return addBusinessDays(deliverableStartDate, offsetDays);
  } else {
    return addDays(deliverableStartDate, offsetDays);
  }
};

/**
 * Recalculate dates for deliverable based on milestone dates
 * @param {Object} deliverable - Deliverable object
 * @param {Date} milestoneStartDate - Parent milestone start date
 * @returns {Object} Deliverable with calculated dates
 */
export const recalculateDeliverableDates = (deliverable, milestoneStartDate) => {
  let startDate;
  let endDate;

  // Calculate start date
  if (deliverable.startDateMode === 'relative' && milestoneStartDate) {
    const offset = deliverable.startDateOffset || 0;
    const offsetType = deliverable.startDateOffsetType || 'business';
    startDate = calculateDeliverableStartDate(milestoneStartDate, offset, offsetType);
  } else if (deliverable.startDate) {
    startDate = new Date(deliverable.startDate);
  }

  // Calculate end date
  if (deliverable.endDateMode === 'relative' && milestoneStartDate) {
    const offset = deliverable.endDateOffset || 0;
    const offsetType = deliverable.endDateOffsetType || 'business';
    endDate = calculateDeliverableEndDate(milestoneStartDate, offset, offsetType);
  } else if (deliverable.endDate) {
    endDate = new Date(deliverable.endDate);
  }

  return {
    ...deliverable,
    calculatedStartDate: startDate || null,
    calculatedEndDate: endDate || null
  };
};

/**
 * Recalculate dates for task based on deliverable dates
 * @param {Object} task - Task object
 * @param {Date} deliverableStartDate - Parent deliverable start date (or calculated start date)
 * @returns {Object} Task with calculated dates
 */
export const recalculateTaskDates = (task, deliverableStartDate) => {
  let startDate;
  let endDate;

  // Calculate start date
  if (task.startDateMode === 'relative' && deliverableStartDate) {
    const offset = task.startDateOffset || 0;
    const offsetType = task.startDateOffsetType || 'business';
    startDate = calculateTaskStartDate(deliverableStartDate, offset, offsetType);
  } else if (task.startDate) {
    startDate = new Date(task.startDate);
  }

  // Calculate end date
  if (task.endDateMode === 'relative' && deliverableStartDate) {
    const offset = task.endDateOffset || 0;
    const offsetType = task.endDateOffsetType || 'business';
    endDate = calculateTaskEndDate(deliverableStartDate, offset, offsetType);
  } else if (task.endDate) {
    endDate = new Date(task.endDate);
  }

  return {
    ...task,
    calculatedStartDate: startDate || null,
    calculatedEndDate: endDate || null
  };
};

/**
 * Recalculate dates for milestone task based on milestone dates
 * @param {Object} milestoneTask - Milestone task object
 * @param {Date} milestoneStartDate - Parent milestone start date
 * @returns {Object} Milestone task with calculated dates
 */
export const recalculateMilestoneTaskDates = (milestoneTask, milestoneStartDate) => {
  let startDate;
  let endDate;

  // Calculate start date
  if (milestoneTask.startDateMode === 'relative' && milestoneStartDate) {
    const offset = milestoneTask.startDateOffset || 0;
    const offsetType = milestoneTask.startDateOffsetType || 'business';
    startDate = calculateTaskStartDate(milestoneStartDate, offset, offsetType);
  } else if (milestoneTask.startDate) {
    startDate = new Date(milestoneTask.startDate);
  }

  // Calculate end date
  if (milestoneTask.endDateMode === 'relative' && milestoneStartDate) {
    const offset = milestoneTask.endDateOffset || 0;
    const offsetType = milestoneTask.endDateOffsetType || 'business';
    endDate = calculateTaskEndDate(milestoneStartDate, offset, offsetType);
  } else if (milestoneTask.endDate) {
    endDate = new Date(milestoneTask.endDate);
  }

  return {
    ...milestoneTask,
    calculatedStartDate: startDate || null,
    calculatedEndDate: endDate || null
  };
};
