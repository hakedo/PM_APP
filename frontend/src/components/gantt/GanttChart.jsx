import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Calendar, Maximize2, Minimize2 } from 'lucide-react';
import PropTypes from 'prop-types';
import GanttRow from './GanttRow';
import { 
  calculateDateRange, 
  generateDateLabels, 
  calculateTodayPosition 
} from '../../utils/ganttUtils';

/**
 * GanttChart Component
 * Main component for rendering a Gantt chart visualization
 */
function GanttChart({ milestones, onItemClick }) {
  const [expandedItems, setExpandedItems] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState('day'); // 'day', 'week', 'month'
  const scrollContainerRef = useRef(null);

  // Calculate date range for the entire chart (recalculates when viewMode changes)
  const { minDate, maxDate, totalDays } = useMemo(
    () => calculateDateRange(milestones, viewMode),
    [milestones, viewMode]
  );

  // Generate date labels for the header
  const dateLabelsData = useMemo(
    () => generateDateLabels(minDate, maxDate, totalDays, viewMode),
    [minDate, maxDate, totalDays, viewMode]
  );

  const { labels: dateLabels, cellWidth, totalWidth, interval, headers } = dateLabelsData;

  // Calculate today's position
  const todayPosition = useMemo(
    () => calculateTodayPosition(minDate, cellWidth, interval),
    [minDate, cellWidth, interval]
  );

  // Calculate today's column index for day view
  const todayColumnIndex = useMemo(() => {
    if (viewMode !== 'day' && !(viewMode === 'auto' && interval === 1)) {
      return -1; // Not in day view
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOffset = Math.floor((today - minDate) / (24 * 60 * 60 * 1000));
    return dayOffset >= 0 ? dayOffset : -1;
  }, [minDate, viewMode, interval]);

  // Scroll to position today's line at 1/3 of viewport width on load
  useEffect(() => {
    if (scrollContainerRef.current && todayPosition >= 0) {
      const container = scrollContainerRef.current;
      const viewportWidth = container.clientWidth;
      
      // Calculate scroll position: today's position minus 1/3 of viewport
      // This places today's line at 1/3 from the left edge
      const targetScrollLeft = todayPosition - (viewportWidth / 3) + 280; // Add 280px for name column
      
      // Scroll to the calculated position
      container.scrollLeft = Math.max(0, targetScrollLeft);
    }
  }, [todayPosition, viewMode]); // Re-scroll when view mode changes

  // Toggle expand/collapse for a milestone
  const toggleExpand = (milestoneId) => {
    setExpandedItems(prev => ({
      ...prev,
      [milestoneId]: !prev[milestoneId]
    }));
  };

  // Expand all items
  const expandAll = () => {
    const expanded = {};
    milestones.forEach(milestone => {
      expanded[milestone._id] = true;
    });
    setExpandedItems(expanded);
  };

  // Collapse all items
  const collapseAll = () => {
    setExpandedItems({});
  };

  if (!milestones || milestones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <Calendar className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">No milestones to display</p>
        <p className="text-sm">Add milestones to see them on the Gantt chart</p>
      </div>
    );
  }

  return (
    <div className={`gantt-chart-container ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative'}`}>
      {/* Header Controls - Notion Style */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/60 bg-white">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-gray-800">Timeline</h3>
          <span className="text-xs text-gray-500 font-normal">
            {milestones.length} milestone{milestones.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Selector - Notion Style */}
          <div className="flex items-center gap-0.5 bg-gray-50 border border-gray-200/60 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('day')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150 ${
                viewMode === 'day' 
                  ? 'bg-white text-gray-800 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150 ${
                viewMode === 'week' 
                  ? 'bg-white text-gray-800 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150 ${
                viewMode === 'month' 
                  ? 'bg-white text-gray-800 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              Month
            </button>
          </div>

          <div className="w-px h-4 bg-gray-200/60"></div>

          <button
            onClick={expandAll}
            className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100/80 rounded-md transition-all duration-150"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100/80 rounded-md transition-all duration-150"
          >
            Collapse All
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100/80 rounded-md transition-all duration-150"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Legend - Notion Style */}
      <div className="flex items-center gap-5 px-6 py-2.5 bg-gray-50/50 border-b border-gray-200/40 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-blue-500/90 rounded-sm"></div>
          <span className="text-gray-600 font-medium">Milestone</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-purple-500/90 rounded-sm"></div>
          <span className="text-gray-600 font-medium">Deliverable</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-amber-500/90 rounded-sm"></div>
          <span className="text-gray-600 font-medium">Task</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-emerald-500/90 rounded-sm"></div>
          <span className="text-gray-600 font-medium">Completed</span>
        </div>
      </div>

      {/* Gantt Chart */}
      <div ref={scrollContainerRef} className={`overflow-auto ${isFullscreen ? 'h-[calc(100vh-140px)]' : 'max-h-[600px]'}`}>
        <div style={{ minWidth: `${280 + totalWidth}px` }}>
          {/* Date Header */}
          <div className="sticky top-0 z-10 bg-white">
            {/* Primary Header Row (Months/Years) */}
            <div className="flex">
              <div className="w-[280px] flex-shrink-0 border-r border-b border-gray-300 bg-white sticky left-0 z-30">
                <div className="h-9 flex items-center px-3 font-semibold text-sm text-gray-700">
                  Name
                </div>
              </div>
            <div className="flex-1 bg-white border-b border-gray-300" style={{ minWidth: `${totalWidth}px` }}>
              <div className="relative h-9">
                {headers.primary && headers.primary.map((header, index) => (
                  <div
                    key={index}
                    className="absolute flex items-center justify-center text-sm font-bold text-gray-800 border-r border-gray-300 bg-transparent"
                    style={{ 
                      left: `${header.left}px`,
                      width: `${header.width}px`,
                      height: '100%'
                    }}
                  >
                    {header.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Secondary Header Row (Days/Weeks/Months) */}
          <div className="flex">
            <div className="w-[280px] flex-shrink-0 border-r border-b border-gray-300 bg-white sticky left-0 z-30">
              {/* Empty space to align with name column */}
            </div>
            <div className="flex-1 bg-white border-b border-gray-300" style={{ minWidth: `${totalWidth}px` }}>
              <div className="relative h-8">
                {headers.secondary ? (
                  // Month view: Show month names as secondary header
                  headers.secondary.map((header, index) => (
                    <div
                      key={index}
                      className="absolute flex items-center justify-center text-xs font-semibold text-gray-700 border-r border-gray-300"
                      style={{ 
                        left: `${header.left}px`,
                        width: `${header.width}px`,
                        height: '100%'
                      }}
                    >
                      {header.label}
                    </div>
                  ))
                ) : (
                  // Day/Week view: Show individual day/week cells with flex
                  <div className="flex h-full">
                    {dateLabels.map((label, index) => (
                      <div
                        key={index}
                        className={`flex-shrink-0 flex items-center justify-center text-xs font-medium border-r border-gray-200/50 ${
                          index === todayColumnIndex
                            ? 'bg-red-100 text-red-700 font-semibold'
                            : label.isWeekend 
                            ? 'bg-gray-100/60 text-gray-500' 
                            : 'bg-white text-gray-700'
                        }`}
                        style={{ width: `${cellWidth}px` }}
                      >
                        {label.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chart Rows */}
        <div className="relative">
          {/* Today indicator - line for week/month view, column for day view */}
          {todayPosition >= 0 && todayColumnIndex < 0 && (
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-red-400/80 z-10 pointer-events-none"
              style={{ left: `${280 + todayPosition}px` }}
            />
          )}

          {/* Vertical grid lines and today's column background for rows */}
          <div className="absolute left-[280px] top-0 bottom-0 pointer-events-none" style={{ width: `${totalWidth}px` }}>
            {/* Today's column background (behind everything) - only in day view */}
            {todayColumnIndex >= 0 && (
              <div
                className="absolute top-0 bottom-0 bg-red-100/60"
                style={{ 
                  left: `${todayColumnIndex * cellWidth}px`,
                  width: `${cellWidth}px`
                }}
              />
            )}
            {dateLabels.map((label, index) => (
              <div
                key={index}
                className={`absolute top-0 bottom-0 w-px ${
                  label.isWeekend ? 'bg-gray-200/70' : 'bg-gray-200/50'
                }`}
                style={{ left: `${index * cellWidth}px` }}
              />
            ))}
            {/* Month boundary lines (stronger) */}
            {headers.primary && headers.primary.map((header, index) => (
              index > 0 && (
                <div
                  key={`month-${index}`}
                  className="absolute top-0 bottom-0 w-px bg-gray-300/80"
                  style={{ left: `${header.left}px` }}
                />
              )
            ))}
          </div>

          {/* Milestone rows */}
          {milestones.map((milestone) => (
            <div key={milestone._id} className="relative">
              {/* Milestone container - pill when collapsed, brackets when expanded */}
              {milestone.calculatedStartDate && milestone.calculatedEndDate && (
                <div 
                  className="absolute left-[280px] top-0 bottom-0 pointer-events-none z-0"
                  style={{ 
                    marginLeft: `${(() => {
                      const start = new Date(milestone.calculatedStartDate);
                      const startOffset = Math.max(0, (start - minDate) / (24 * 60 * 60 * 1000));
                      const pixelsPerDay = cellWidth / interval;
                      return startOffset * pixelsPerDay;
                    })()}px`,
                    width: `${(() => {
                      const start = new Date(milestone.calculatedStartDate);
                      const end = new Date(milestone.calculatedEndDate);
                      const duration = Math.max(1, (end - start) / (24 * 60 * 60 * 1000));
                      const pixelsPerDay = cellWidth / interval;
                      return duration * pixelsPerDay;
                    })()}px`
                  }}
                >
                  {expandedItems[milestone._id] ? (
                    // Expanded: Show brackets
                    <>
                      {/* Left bracket */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/80 rounded-l-sm"></div>
                      <div className="absolute left-0 top-0 h-3 w-3 border-t-3 border-l-3 border-blue-500/80 rounded-tl-md"></div>
                      <div className="absolute left-0 bottom-0 h-3 w-3 border-b-3 border-l-3 border-blue-500/80 rounded-bl-md"></div>
                      
                      {/* Right bracket */}
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500/80 rounded-r-sm"></div>
                      <div className="absolute right-0 top-0 h-3 w-3 border-t-3 border-r-3 border-blue-500/80 rounded-tr-md"></div>
                      <div className="absolute right-0 bottom-0 h-3 w-3 border-b-3 border-r-3 border-blue-500/80 rounded-br-md"></div>
                      
                      {/* Subtle background tint */}
                      <div className="absolute inset-0 bg-blue-50/20 pointer-events-none"></div>
                      
                      {/* Milestone label at the top */}
                      <div className="absolute -top-5 left-2 text-[10px] font-bold text-blue-600 uppercase tracking-wide truncate max-w-full pr-4">
                        {milestone.name || 'Untitled'}
                      </div>
                    </>
                  ) : (
                    // Collapsed: Show pill
                    <div className="absolute top-2 h-8 rounded-full bg-blue-500/90 shadow-md flex items-center px-4 left-0 right-0">
                      <span className="text-xs font-semibold text-white truncate drop-shadow-sm">
                        {milestone.name || 'Untitled Milestone'}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Milestone row with expand/collapse */}
              <div className="flex items-center border-b border-gray-200 relative z-10">
                <div className="w-[280px] flex-shrink-0 px-3 py-1.5 border-r border-gray-300 flex items-center gap-2 sticky left-0 bg-white z-20">
                  <button
                    onClick={() => toggleExpand(milestone._id)}
                    className="p-0.5 hover:bg-gray-200 rounded transition-all duration-150"
                    disabled={!milestone.deliverables || milestone.deliverables.length === 0}
                  >
                    {milestone.deliverables && milestone.deliverables.length > 0 ? (
                      expandedItems[milestone._id] ? (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                      )
                    ) : (
                      <div className="w-3.5 h-3.5" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {milestone.name || 'Untitled Milestone'}
                    </div>
                    <div className="text-[10px] text-gray-600 font-medium">
                      MILESTONE
                      {milestone.deliverables && milestone.deliverables.length > 0 && (
                        <span className="ml-1">
                          · {milestone.deliverables.length} deliverable{milestone.deliverables.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Empty timeline area for milestone header */}
                <div className="relative" style={{ width: `${totalWidth}px`, minWidth: `${totalWidth}px` }}>
                  {/* Container is in the background of entire milestone group */}
                </div>
              </div>

              {/* Deliverables (expanded) */}
              <AnimatePresence>
                {expandedItems[milestone._id] && milestone.deliverables && milestone.deliverables.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {milestone.deliverables.map((deliverable) => (
                      <div key={deliverable._id}>
                        {/* Deliverable row */}
                        <div className="flex items-center border-b border-gray-200">
                          <div className="w-[280px] flex-shrink-0 px-3 py-1.5 border-r border-gray-300 flex items-center gap-2 sticky left-0 bg-white z-20" style={{ paddingLeft: '32px' }}>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {deliverable.title || 'Untitled Deliverable'}
                              </div>
                              <div className="text-[10px] text-purple-600 font-medium">
                                DELIVERABLE
                                {deliverable.tasks && deliverable.tasks.length > 0 && (
                                  <span className="ml-1">
                                    · {deliverable.tasks.length} task{deliverable.tasks.length !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Deliverable bar with task circles */}
                          <div className="relative" style={{ width: `${totalWidth}px`, minWidth: `${totalWidth}px` }}>
                            <GanttRow
                              item={deliverable}
                              type="deliverable"
                              minDate={minDate}
                              totalDays={totalDays}
                              cellWidth={cellWidth}
                              interval={interval}
                              totalWidth={totalWidth}
                              level={1}
                              onBarClick={onItemClick}
                            />
                            
                            {/* Task circles on top of deliverable bar */}
                            {deliverable.tasks && deliverable.tasks.map((task) => {
                              if (!task.calculatedEndDate) return null;
                              
                              const taskEnd = new Date(task.calculatedEndDate);
                              const endOffset = Math.max(0, (taskEnd - minDate) / (24 * 60 * 60 * 1000));
                              const pixelsPerDay = cellWidth / interval;
                              const position = endOffset * pixelsPerDay;
                              
                              return (
                                <div
                                  key={task._id}
                                  className="absolute top-1/2 -translate-y-1/2 cursor-pointer group z-10"
                                  style={{ left: `${position}px` }}
                                  onClick={() => onItemClick && onItemClick(task, 'task')}
                                  title={`${task.title || 'Untitled Task'} - ${new Date(task.calculatedEndDate).toLocaleDateString()}`}
                                >
                                  {/* Circle - filled if completed, hollow if not */}
                                  {task.completed ? (
                                    <div className="w-5 h-5 rounded-full bg-emerald-500 border-3 border-white shadow-lg group-hover:scale-125 transition-transform duration-150"></div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-white border-3 border-blue-400 shadow-lg group-hover:scale-125 transition-transform duration-150"></div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}

GanttChart.propTypes = {
  milestones: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      calculatedStartDate: PropTypes.string,
      calculatedEndDate: PropTypes.string,
      deliverables: PropTypes.arrayOf(
        PropTypes.shape({
          _id: PropTypes.string.isRequired,
          title: PropTypes.string,
          calculatedStartDate: PropTypes.string,
          calculatedEndDate: PropTypes.string,
          tasks: PropTypes.array
        })
      )
    })
  ),
  onItemClick: PropTypes.func
};

GanttChart.defaultProps = {
  milestones: [],
  onItemClick: null
};

export default GanttChart;
