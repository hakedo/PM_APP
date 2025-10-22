/**
 * Utility functions for Gantt chart calculations and rendering
 */

/**
 * Calculate the total date range for the Gantt chart
 * @param {Array} milestones - Array of milestones with calculated dates
 * @param {string} viewMode - View mode: 'day', 'week', 'month', or 'auto'
 * @returns {Object} { minDate, maxDate, totalDays }
 */
export const calculateDateRange = (milestones, viewMode = 'auto') => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!milestones || milestones.length === 0) {
    // Default range: show 2 months before today and 3 months after
    const minDate = new Date(today);
    minDate.setMonth(minDate.getMonth() - 2);
    minDate.setDate(1); // Start of month
    
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 4);
    maxDate.setDate(0); // End of month
    
    const totalDays = Math.ceil((maxDate - minDate) / (24 * 60 * 60 * 1000));
    return { minDate, maxDate, totalDays };
  }

  let minDate = null;
  let maxDate = null;

  // Find earliest start and latest end across all items
  milestones.forEach(milestone => {
    const mStart = milestone.calculatedStartDate ? new Date(milestone.calculatedStartDate) : null;
    const mEnd = milestone.calculatedEndDate ? new Date(milestone.calculatedEndDate) : null;

    if (mStart && (!minDate || mStart < minDate)) minDate = mStart;
    if (mEnd && (!maxDate || mEnd > maxDate)) maxDate = mEnd;

    // Check deliverables
    if (milestone.deliverables) {
      milestone.deliverables.forEach(deliverable => {
        const dStart = deliverable.calculatedStartDate ? new Date(deliverable.calculatedStartDate) : null;
        const dEnd = deliverable.calculatedEndDate ? new Date(deliverable.calculatedEndDate) : null;

        if (dStart && (!minDate || dStart < minDate)) minDate = dStart;
        if (dEnd && (!maxDate || dEnd > maxDate)) maxDate = dEnd;

        // Check tasks
        if (deliverable.tasks) {
          deliverable.tasks.forEach(task => {
            const tStart = task.calculatedStartDate ? new Date(task.calculatedStartDate) : null;
            const tEnd = task.calculatedEndDate ? new Date(task.calculatedEndDate) : null;

            if (tStart && (!minDate || tStart < minDate)) minDate = tStart;
            if (tEnd && (!maxDate || tEnd > maxDate)) maxDate = tEnd;
          });
        }
      });
    }
  });

  // Calculate appropriate padding based on view mode
  let paddingDays;
  const rawTotalDays = minDate && maxDate ? Math.ceil((maxDate - minDate) / (24 * 60 * 60 * 1000)) : 30;
  
  if (viewMode === 'day') {
    paddingDays = 7; // 1 week padding on each side
  } else if (viewMode === 'week') {
    paddingDays = 14; // 2 weeks padding
  } else if (viewMode === 'month') {
    paddingDays = 30; // 1 month padding
  } else {
    // Auto mode - adjust based on total duration
    if (rawTotalDays <= 30) {
      paddingDays = 7;
    } else if (rawTotalDays <= 90) {
      paddingDays = 14;
    } else {
      paddingDays = 30;
    }
  }

  // Ensure minimum range around today if no dates found
  if (!minDate) {
    minDate = new Date(today);
    minDate.setMonth(minDate.getMonth() - 1);
  }
  
  if (!maxDate) {
    maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 2);
  }

  // Add padding
  const adjustedMinDate = new Date(minDate.getTime() - paddingDays * 24 * 60 * 60 * 1000);
  const adjustedMaxDate = new Date(maxDate.getTime() + paddingDays * 24 * 60 * 60 * 1000);
  
  // Snap to appropriate boundary based on view mode
  if (viewMode === 'month' || (viewMode === 'auto' && rawTotalDays > 90)) {
    // Snap to start of month for month view
    minDate = new Date(adjustedMinDate.getFullYear(), adjustedMinDate.getMonth(), 1);
    // Snap to end of month for month view
    maxDate = new Date(adjustedMaxDate.getFullYear(), adjustedMaxDate.getMonth() + 1, 0);
  } else if (viewMode === 'week' || (viewMode === 'auto' && rawTotalDays > 30)) {
    // Snap to start of week (Sunday) for week view
    const day = adjustedMinDate.getDay();
    minDate = new Date(adjustedMinDate.getTime() - day * 24 * 60 * 60 * 1000);
    // Snap to end of week (Saturday)
    const endDay = adjustedMaxDate.getDay();
    maxDate = new Date(adjustedMaxDate.getTime() + (6 - endDay) * 24 * 60 * 60 * 1000);
  } else {
    minDate = adjustedMinDate;
    maxDate = adjustedMaxDate;
  }

  const totalDays = Math.ceil((maxDate - minDate) / (24 * 60 * 60 * 1000));

  // Performance optimization: Limit maximum range based on view mode
  let maxAllowedDays;
  if (viewMode === 'day') {
    maxAllowedDays = 90; // Max 3 months in day view
  } else if (viewMode === 'week') {
    maxAllowedDays = 180; // Max 6 months in week view
  } else if (viewMode === 'month') {
    maxAllowedDays = 730; // Max 2 years in month view
  } else {
    // Auto mode
    maxAllowedDays = 365; // Max 1 year
  }

  if (totalDays > maxAllowedDays) {
    // If range is too large, center it around today
    const halfRange = Math.floor(maxAllowedDays / 2);
    minDate = new Date(today.getTime() - halfRange * 24 * 60 * 60 * 1000);
    maxDate = new Date(today.getTime() + halfRange * 24 * 60 * 60 * 1000);
    
    // Snap to boundaries
    if (viewMode === 'month' || (viewMode === 'auto' && maxAllowedDays > 180)) {
      minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
    } else if (viewMode === 'week' || (viewMode === 'auto' && maxAllowedDays > 90)) {
      const day = minDate.getDay();
      minDate = new Date(minDate.getTime() - day * 24 * 60 * 60 * 1000);
      const endDay = maxDate.getDay();
      maxDate = new Date(maxDate.getTime() + (6 - endDay) * 24 * 60 * 60 * 1000);
    }
    
    return { 
      minDate, 
      maxDate, 
      totalDays: Math.ceil((maxDate - minDate) / (24 * 60 * 60 * 1000))
    };
  }

  return { minDate, maxDate, totalDays };
};

/**
 * Calculate the position and width of a bar in the Gantt chart (pixel-based)
 * @param {Date|string} startDate - Start date of the item
 * @param {Date|string} endDate - End date of the item
 * @param {Date} minDate - Minimum date in the chart
 * @param {number} cellWidth - Width of each cell in pixels
 * @param {number} interval - Interval in days (1, 7, or 30)
 * @returns {Object} { left, width } in pixels
 */
export const calculateBarPosition = (startDate, endDate, minDate, cellWidth, interval) => {
  if (!startDate || !endDate) {
    return { left: 0, width: 0 };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startOffset = Math.max(0, (start - minDate) / (24 * 60 * 60 * 1000));
  const duration = Math.max(1, (end - start) / (24 * 60 * 60 * 1000));

  // Calculate pixel positions based on cell width and interval
  const pixelsPerDay = cellWidth / interval;
  const left = startOffset * pixelsPerDay;
  const width = duration * pixelsPerDay;

  return {
    left: Math.max(0, left),
    width: Math.max(cellWidth * 0.1, width) // Minimum 10% of cell width
  };
};

/**
 * Generate date labels for the Gantt chart header with fixed widths
 * @param {Date} minDate - Start date
 * @param {Date} maxDate - End date
 * @param {number} totalDays - Total days
 * @param {string} viewMode - View mode: 'day', 'week', 'month', or 'auto'
 * @returns {Object} { labels: Array, cellWidth: number, totalWidth: number, interval: number, headers: Array }
 */
export const generateDateLabels = (minDate, maxDate, totalDays, viewMode = 'auto') => {
  const labels = [];
  
  // Determine cell width (in pixels) based on view mode
  let cellWidth;
  let interval;
  
  if (viewMode === 'day') {
    cellWidth = 60; // 60px per day - wider for better readability
    interval = 1;
  } else if (viewMode === 'week') {
    cellWidth = 100; // 100px per week
    interval = 7;
  } else if (viewMode === 'month') {
    cellWidth = 120; // 120px per month
    interval = 30;
  } else {
    // Auto mode - choose based on total days
    if (totalDays <= 30) {
      cellWidth = 60;
      interval = 1;
    } else if (totalDays <= 90) {
      cellWidth = 100;
      interval = 7;
    } else {
      cellWidth = 120;
      interval = 30;
    }
  }

  // Start at minDate (which is already snapped to appropriate boundary)
  let currentDate = new Date(minDate);
  let index = 0;
  
  while (currentDate <= maxDate) {
    const dayOffset = (currentDate - minDate) / (24 * 60 * 60 * 1000);

    labels.push({
      date: new Date(currentDate),
      dayOffset,
      index,
      label: formatDateLabel(currentDate, interval, viewMode),
      isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
      month: currentDate.getMonth(),
      year: currentDate.getFullYear(),
      day: currentDate.getDate()
    });

    // Move to next interval
    if (interval === 1) {
      // Daily: add one day
      currentDate.setDate(currentDate.getDate() + 1);
    } else if (interval === 7) {
      // Weekly: add 7 days
      currentDate.setDate(currentDate.getDate() + 7);
    } else {
      // Monthly: move to first day of next month
      currentDate.setMonth(currentDate.getMonth() + 1);
      currentDate.setDate(1);
    }
    
    index++;
  }

  const totalWidth = cellWidth * labels.length;

  // Generate headers based on view mode
  const headers = generateHeaders(labels, cellWidth, interval, viewMode);

  return { labels, cellWidth, totalWidth, interval, headers };
};

/**
 * Generate headers for the timeline (months/years)
 * @param {Array} labels - Array of date labels
 * @param {number} cellWidth - Width of each cell
 * @param {number} interval - Interval in days
 * @param {string} viewMode - View mode
 * @returns {Array} Array of header objects with position and width
 */
const generateHeaders = (labels, cellWidth, interval, viewMode) => {
  const headers = [];
  
  if (interval === 1) {
    // Day view: Group by month
    let currentMonth = null;
    let currentYear = null;
    let startIndex = 0;
    
    labels.forEach((label, index) => {
      const monthYear = `${label.year}-${label.month}`;
      
      if (currentMonth !== monthYear) {
        if (currentMonth !== null) {
          // Close previous month header
          headers.push({
            label: new Date(currentYear, labels[startIndex].month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            startIndex,
            endIndex: index - 1,
            left: startIndex * cellWidth,
            width: (index - startIndex) * cellWidth
          });
        }
        currentMonth = monthYear;
        currentYear = label.year;
        startIndex = index;
      }
    });
    
    // Close last month header
    if (currentMonth !== null) {
      headers.push({
        label: new Date(currentYear, labels[startIndex].month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        startIndex,
        endIndex: labels.length - 1,
        left: startIndex * cellWidth,
        width: (labels.length - startIndex) * cellWidth
      });
    }
  } else if (interval === 7) {
    // Week view: Group by month
    let currentMonth = null;
    let currentYear = null;
    let startIndex = 0;
    
    labels.forEach((label, index) => {
      const monthYear = `${label.year}-${label.month}`;
      
      if (currentMonth !== monthYear) {
        if (currentMonth !== null) {
          // Close previous month header
          headers.push({
            label: new Date(currentYear, labels[startIndex].month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            startIndex,
            endIndex: index - 1,
            left: startIndex * cellWidth,
            width: (index - startIndex) * cellWidth
          });
        }
        currentMonth = monthYear;
        currentYear = label.year;
        startIndex = index;
      }
    });
    
    // Close last month header
    if (currentMonth !== null) {
      headers.push({
        label: new Date(currentYear, labels[startIndex].month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        startIndex,
        endIndex: labels.length - 1,
        left: startIndex * cellWidth,
        width: (labels.length - startIndex) * cellWidth
      });
    }
  } else {
    // Month view: Group by year
    let currentYear = null;
    let startIndex = 0;
    
    labels.forEach((label, index) => {
      if (currentYear !== label.year) {
        if (currentYear !== null) {
          // Close previous year header
          headers.push({
            label: currentYear.toString(),
            startIndex,
            endIndex: index - 1,
            left: startIndex * cellWidth,
            width: (index - startIndex) * cellWidth
          });
        }
        currentYear = label.year;
        startIndex = index;
      }
    });
    
    // Close last year header
    if (currentYear !== null) {
      headers.push({
        label: currentYear.toString(),
        startIndex,
        endIndex: labels.length - 1,
        left: startIndex * cellWidth,
        width: (labels.length - startIndex) * cellWidth
      });
    }
    
    // Generate secondary headers (months within years) for month view
    const secondaryHeaders = [];
    let currentSecondaryYear = null;
    let monthStartIndex = 0;
    
    labels.forEach((label, index) => {
      const monthYear = `${label.year}-${label.month}`;
      
      if (currentSecondaryYear !== monthYear) {
        if (currentSecondaryYear !== null) {
          secondaryHeaders.push({
            label: new Date(labels[monthStartIndex].year, labels[monthStartIndex].month, 1).toLocaleDateString('en-US', { month: 'short' }),
            startIndex: monthStartIndex,
            endIndex: index - 1,
            left: monthStartIndex * cellWidth,
            width: (index - monthStartIndex) * cellWidth
          });
        }
        currentSecondaryYear = monthYear;
        monthStartIndex = index;
      }
    });
    
    // Close last secondary header
    if (currentSecondaryYear !== null) {
      secondaryHeaders.push({
        label: new Date(labels[monthStartIndex].year, labels[monthStartIndex].month, 1).toLocaleDateString('en-US', { month: 'short' }),
        startIndex: monthStartIndex,
        endIndex: labels.length - 1,
        left: monthStartIndex * cellWidth,
        width: (labels.length - monthStartIndex) * cellWidth
      });
    }
    
    return { primary: headers, secondary: secondaryHeaders };
  }
  
  return { primary: headers, secondary: null };
};

/**
 * Format date label based on interval and view mode
 * @param {Date} date - Date to format
 * @param {number} interval - Interval in days
 * @param {string} viewMode - View mode: 'day', 'week', 'month', or 'auto'
 * @returns {string} Formatted date string
 */
const formatDateLabel = (date, interval, viewMode = 'auto') => {
  if (viewMode === 'day' || (viewMode === 'auto' && interval === 1)) {
    // Day view: Just show the day number
    return date.getDate().toString();
  } else if (viewMode === 'week' || (viewMode === 'auto' && interval === 7)) {
    // Week view: Show date range (e.g., "1-7")
    const startDay = date.getDate();
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 6);
    
    // Check if week spans across months
    if (date.getMonth() === endDate.getMonth()) {
      return `${startDay}-${endDate.getDate()}`;
    } else {
      // If crossing month boundary, just show start day
      return `${startDay}-${endDate.getDate()}`;
    }
  } else {
    // Month view: Show month abbreviation
    return date.toLocaleDateString('en-US', { month: 'short' });
  }
};

/**
 * Get color class for different item types - Notion-inspired muted palette
 * @param {string} type - Type of item (milestone, deliverable, task)
 * @param {boolean} completed - Whether the item is completed
 * @returns {string} CSS color classes
 */
export const getBarColor = (type, completed = false) => {
  if (completed) {
    return 'bg-emerald-500/90';
  }

  switch (type) {
    case 'milestone':
      return 'bg-blue-500/90';
    case 'deliverable':
      return 'bg-purple-500/90';
    case 'task':
      return 'bg-amber-500/90';
    default:
      return 'bg-gray-400/90';
  }
};

/**
 * Get hover color class for different item types - Notion-inspired hover states
 * @param {string} type - Type of item (milestone, deliverable, task)
 * @returns {string} CSS color classes for hover state
 */
export const getBarHoverColor = (type) => {
  switch (type) {
    case 'milestone':
      return 'hover:bg-blue-600/95 hover:scale-[1.02]';
    case 'deliverable':
      return 'hover:bg-purple-600/95 hover:scale-[1.02]';
    case 'task':
      return 'hover:bg-amber-600/95 hover:scale-[1.02]';
    default:
      return 'hover:bg-gray-500/95 hover:scale-[1.02]';
  }
};

/**
 * Calculate today's position in the chart (pixel-based)
 * @param {Date} minDate - Start date
 * @param {number} cellWidth - Width of each cell in pixels
 * @param {number} interval - Interval in days (1, 7, or 30)
 * @returns {number} Position in pixels
 */
export const calculateTodayPosition = (minDate, cellWidth, interval) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dayOffset = (today - minDate) / (24 * 60 * 60 * 1000);
  const pixelsPerDay = cellWidth / interval;
  const position = dayOffset * pixelsPerDay;
  
  return Math.max(0, position);
};
