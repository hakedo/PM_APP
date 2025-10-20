/**
 * Critical Path Method (CPM) Calculator
 * Calculates the critical path, earliest/latest times, and slack for project milestones
 */

/**
 * Calculate the number of days between two dates
 */
function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date2 - date1) / oneDay));
}

/**
 * Add days to a date
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calculate Critical Path using Forward and Backward Pass
 * @param {Array} milestones - Array of milestone objects
 * @param {Date} projectStartDate - Project start date (optional)
 * @returns {Array} Updated milestones with CPM calculations
 */
export function calculateCriticalPath(milestones, projectStartDate = null) {
  if (!milestones || milestones.length === 0) {
    return [];
  }

  // Create a map for quick lookup
  const milestoneMap = new Map();
  milestones.forEach(m => {
    milestoneMap.set(m._id.toString(), {
      ...m,
      earliestStart: null,
      earliestFinish: null,
      latestStart: null,
      latestFinish: null,
      slack: 0,
      isCritical: false
    });
  });

  // Convert dependencies to string IDs for comparison
  milestoneMap.forEach(milestone => {
    milestone.dependencies = (milestone.dependencies || []).map(d => {
      if (typeof d === 'object') {
        // Handle populated Mongoose documents
        return (d._id || d.id || d).toString();
      }
      return d.toString();
    });
  });

  // FORWARD PASS: Calculate Earliest Start (ES) and Earliest Finish (EF)
  const sortedForward = topologicalSort(Array.from(milestoneMap.values()));
  
  sortedForward.forEach(milestone => {
    const current = milestoneMap.get(milestone._id.toString());
    
    if (current.dependencies.length === 0) {
      // Start milestone: use fixed start date or project start date
      if (current.startDate) {
        current.earliestStart = new Date(current.startDate);
      } else if (projectStartDate) {
        current.earliestStart = new Date(projectStartDate);
      } else {
        current.earliestStart = new Date(); // Default to today
      }
    } else {
      // Find the latest finish time of all dependencies
      let maxFinish = null;
      current.dependencies.forEach(depId => {
        const dep = milestoneMap.get(depId);
        if (dep && dep.earliestFinish) {
          if (!maxFinish || dep.earliestFinish > maxFinish) {
            maxFinish = dep.earliestFinish;
          }
        }
      });
      
      // Check for custom start date or offset
      if (current.customStartDate) {
        // Use custom start date if specified
        current.earliestStart = new Date(current.customStartDate);
      } else if (maxFinish) {
        // Apply offset to dependency completion
        const offset = current.startDateOffset || 0;
        current.earliestStart = addDays(maxFinish, offset);
      } else {
        current.earliestStart = new Date();
      }
    }

    // Calculate Earliest Finish
    if (current.endDate && current.startDate) {
      // Use fixed dates if available
      current.earliestFinish = new Date(current.endDate);
    } else {
      // Use duration
      const duration = current.duration || 0;
      current.earliestFinish = addDays(current.earliestStart, duration);
    }
  });

  // Find project end date (latest EF)
  let projectEndDate = null;
  milestoneMap.forEach(milestone => {
    if (!projectEndDate || milestone.earliestFinish > projectEndDate) {
      projectEndDate = milestone.earliestFinish;
    }
  });

  // BACKWARD PASS: Calculate Latest Start (LS) and Latest Finish (LF)
  const sortedBackward = [...sortedForward].reverse();
  
  sortedBackward.forEach(milestone => {
    const current = milestoneMap.get(milestone._id.toString());
    
    // Find all milestones that depend on this one
    const successors = Array.from(milestoneMap.values()).filter(m =>
      m.dependencies.includes(current._id.toString())
    );
    
    if (successors.length === 0) {
      // End milestone: LF = EF (project end)
      current.latestFinish = new Date(current.earliestFinish);
    } else {
      // Find the earliest LS of all successors
      let minStart = null;
      successors.forEach(succ => {
        if (succ.latestStart) {
          if (!minStart || succ.latestStart < minStart) {
            minStart = succ.latestStart;
          }
        }
      });
      current.latestFinish = minStart || new Date(current.earliestFinish);
    }

    // Calculate Latest Start
    if (current.endDate && current.startDate) {
      const duration = daysBetween(current.startDate, current.endDate);
      current.latestStart = addDays(current.latestFinish, -duration);
    } else {
      const duration = current.duration || 0;
      current.latestStart = addDays(current.latestFinish, -duration);
    }
  });

  // Calculate Slack and determine Critical Path
  milestoneMap.forEach(milestone => {
    // Slack = LS - ES (or LF - EF)
    milestone.slack = daysBetween(milestone.earliestStart, milestone.latestStart);
    
    // Critical path: milestones with zero or near-zero slack
    milestone.isCritical = milestone.slack <= 0.5; // Allow for rounding errors
  });

  return Array.from(milestoneMap.values());
}

/**
 * Topological sort using Kahn's algorithm
 * Returns milestones in dependency order (dependencies first)
 */
function topologicalSort(milestones) {
  const result = [];
  const visited = new Set();
  const temp = new Set();
  
  const milestoneMap = new Map();
  milestones.forEach(m => {
    milestoneMap.set(m._id.toString(), m);
  });

  function visit(milestone) {
    const id = milestone._id.toString();
    
    if (temp.has(id)) {
      // Circular dependency detected
      console.warn('Circular dependency detected in milestones');
      return;
    }
    
    if (visited.has(id)) {
      return;
    }
    
    temp.add(id);
    
    // Visit all dependencies first
    (milestone.dependencies || []).forEach(depId => {
      const dep = milestoneMap.get(depId);
      if (dep) {
        visit(dep);
      }
    });
    
    temp.delete(id);
    visited.add(id);
    result.push(milestone);
  }

  milestones.forEach(milestone => {
    if (!visited.has(milestone._id.toString())) {
      visit(milestone);
    }
  });

  return result;
}

/**
 * Get the critical path as an ordered array of milestone IDs
 */
export function getCriticalPathSequence(milestones) {
  const critical = milestones.filter(m => m.isCritical);
  
  // Sort by earliest start
  critical.sort((a, b) => {
    const dateA = a.earliestStart || new Date(0);
    const dateB = b.earliestStart || new Date(0);
    return dateA - dateB;
  });
  
  return critical.map(m => m._id.toString());
}

/**
 * Detect circular dependencies in milestones
 */
export function detectCircularDependencies(milestones) {
  const visited = new Set();
  const recursionStack = new Set();
  const milestoneMap = new Map();
  
  milestones.forEach(m => {
    milestoneMap.set(m._id.toString(), m);
  });

  function hasCycle(milestoneId) {
    visited.add(milestoneId);
    recursionStack.add(milestoneId);
    
    const milestone = milestoneMap.get(milestoneId);
    if (!milestone) return false;
    
    const deps = (milestone.dependencies || []).map(d => 
      typeof d === 'object' ? d.toString() : d
    );
    
    for (const depId of deps) {
      if (!visited.has(depId)) {
        if (hasCycle(depId)) {
          return true;
        }
      } else if (recursionStack.has(depId)) {
        return true; // Cycle detected
      }
    }
    
    recursionStack.delete(milestoneId);
    return false;
  }

  for (const milestone of milestones) {
    const id = milestone._id.toString();
    if (!visited.has(id)) {
      if (hasCycle(id)) {
        return true;
      }
    }
  }
  
  return false;
}

export default {
  calculateCriticalPath,
  getCriticalPathSequence,
  detectCircularDependencies
};
