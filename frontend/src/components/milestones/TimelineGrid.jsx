import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Clock, Link as LinkIcon } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * TimelineGrid Component
 * Displays milestones in a week-based timeline grid with critical path visualization
 */
function TimelineGrid({ milestones = [], projectStartDate, projectEndDate, onMilestoneClick }) {
  const [hoveredCell, setHoveredCell] = useState(null);

  // Generate week columns based on project dates
  const weekColumns = useMemo(() => {
    if (!projectStartDate) return [];

    const start = new Date(projectStartDate);
    const end = projectEndDate ? new Date(projectEndDate) : new Date();
    
    // Add buffer weeks
    const bufferWeeks = 4;
    start.setDate(start.getDate() - (bufferWeeks * 7));
    end.setDate(end.getDate() + (bufferWeeks * 7));

    const weeks = [];
    const current = new Date(start);
    
    // Start from Monday
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    current.setDate(diff);

    while (current <= end) {
      const weekStart = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      weeks.push({
        weekStart,
        weekEnd,
        weekNumber: getWeekNumber(weekStart),
        year: weekStart.getFullYear()
      });
      
      current.setDate(current.getDate() + 7);
    }

    return weeks;
  }, [projectStartDate, projectEndDate]);

  // Get week number
  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  // Check if a milestone overlaps with a week
  function milestoneOverlapsWeek(milestone, week) {
    if (!milestone.earliestStart || !milestone.earliestFinish) return false;
    
    const mStart = new Date(milestone.earliestStart);
    const mEnd = new Date(milestone.earliestFinish);
    const wStart = new Date(week.weekStart);
    const wEnd = new Date(week.weekEnd);

    return mStart <= wEnd && mEnd >= wStart;
  }

  // Get milestone position within week (0-1)
  function getMilestonePosition(milestone, week) {
    if (!milestone.earliestStart || !milestone.earliestFinish) return { start: 0, width: 1 };
    
    const mStart = new Date(milestone.earliestStart);
    const mEnd = new Date(milestone.earliestFinish);
    const wStart = new Date(week.weekStart);
    const wEnd = new Date(week.weekEnd);
    
    const weekDuration = 7 * 24 * 60 * 60 * 1000;
    
    // Calculate start position (0-1 within week)
    let start = 0;
    if (mStart > wStart) {
      start = (mStart - wStart) / weekDuration;
    }
    
    // Calculate width (0-1 within week)
    let end = 1;
    if (mEnd < wEnd) {
      end = (mEnd - wStart) / weekDuration;
    }
    
    const width = end - start;
    
    return { start: Math.max(0, start), width: Math.min(1, width) };
  }

  // Format date range
  function formatWeekRange(week) {
    const start = week.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = week.weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${start} - ${end}`;
  }

  if (weekColumns.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Set a project start date to view the timeline</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Timeline Header */}
        <div className="flex border-b-2 border-gray-300 bg-gray-50 sticky top-0 z-10">
          <div className="w-64 flex-shrink-0 p-3 font-semibold text-gray-700 border-r-2 border-gray-300">
            Milestone
          </div>
          <div className="flex-1 flex">
            {weekColumns.map((week, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 border-r border-gray-200 px-2 py-3 text-center"
                style={{ minWidth: '100px' }}
              >
                <div className="text-xs font-semibold text-gray-700">
                  W{week.weekNumber}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatWeekRange(week)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Rows */}
        <div className="divide-y divide-gray-200">
          {milestones.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No milestones yet. Create your first milestone to get started.</p>
            </div>
          ) : (
            milestones.map((milestone) => (
              <div key={milestone._id} className="flex hover:bg-gray-50 transition-colors">
                {/* Milestone Name Column */}
                <div 
                  className="w-64 flex-shrink-0 p-3 border-r border-gray-200 cursor-pointer"
                  onClick={() => onMilestoneClick && onMilestoneClick(milestone)}
                >
                  <div className="flex items-start gap-2">
                    {milestone.isCritical && (
                      <TrendingUp className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    {milestone.dependencies && milestone.dependencies.length > 0 && (
                      <LinkIcon className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {milestone.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {milestone.duration ? `${milestone.duration}d` : 'Fixed dates'}
                        {milestone.slack !== undefined && milestone.slack > 0 && (
                          <span className="ml-1 text-green-600">
                            ({milestone.slack}d slack)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {milestone.status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Cells */}
                <div className="flex-1 flex relative">
                  {weekColumns.map((week, weekIdx) => {
                    const overlaps = milestoneOverlapsWeek(milestone, week);
                    const position = overlaps ? getMilestonePosition(milestone, week) : null;
                    const cellKey = `${milestone._id}-${weekIdx}`;

                    return (
                      <div
                        key={weekIdx}
                        className="flex-shrink-0 border-r border-gray-200 relative"
                        style={{ minWidth: '100px' }}
                        onMouseEnter={() => setHoveredCell(cellKey)}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {overlaps && position && (
                          <motion.div
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`absolute top-2 bottom-2 rounded ${
                              milestone.isCritical
                                ? 'bg-red-500'
                                : milestone.status === 'completed'
                                ? 'bg-green-500'
                                : milestone.status === 'in-progress'
                                ? 'bg-blue-500'
                                : milestone.status === 'blocked'
                                ? 'bg-orange-500'
                                : 'bg-gray-400'
                            } ${hoveredCell === cellKey ? 'opacity-90' : 'opacity-70'}`}
                            style={{
                              left: `${position.start * 100}%`,
                              width: `${position.width * 100}%`,
                            }}
                          >
                            {hoveredCell === cellKey && (
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20">
                                {new Date(milestone.earliestStart).toLocaleDateString()} - 
                                {new Date(milestone.earliestFinish).toLocaleDateString()}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm font-semibold text-gray-700 mb-3">Legend</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Critical Path</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span>Not Started</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-300 flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <span>Critical milestone</span>
            </div>
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-blue-500" />
              <span>Has dependencies</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

TimelineGrid.propTypes = {
  milestones: PropTypes.array,
  projectStartDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  projectEndDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  onMilestoneClick: PropTypes.func
};

TimelineGrid.defaultProps = {
  milestones: [],
  projectStartDate: null,
  projectEndDate: null,
  onMilestoneClick: null
};

export default TimelineGrid;
