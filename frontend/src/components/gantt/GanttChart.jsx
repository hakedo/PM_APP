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
  const [viewMode, setViewMode] = useState('auto'); // 'day', 'week', 'month', 'auto'
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

  // Toggle expand/collapse for a deliverable
  const toggleDeliverableExpand = (deliverableId) => {
    setExpandedItems(prev => ({
      ...prev,
      [`deliverable-${deliverableId}`]: !prev[`deliverable-${deliverableId}`]
    }));
  };

  // Expand all items
  const expandAll = () => {
    const expanded = {};
    milestones.forEach(milestone => {
      expanded[milestone._id] = true;
      if (milestone.deliverables) {
        milestone.deliverables.forEach(deliverable => {
          expanded[`deliverable-${deliverable._id}`] = true;
        });
      }
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
            <button
              onClick={() => setViewMode('auto')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150 ${
                viewMode === 'auto' 
                  ? 'bg-white text-gray-800 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              Auto
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
      <div ref={scrollContainerRef} className={`overflow-x-auto overflow-y-auto ${isFullscreen ? 'h-[calc(100vh-140px)]' : 'max-h-[600px]'}`}>
        {/* Date Header */}
        <div className="sticky top-0 z-10 bg-white">
          {/* Primary Header Row (Months/Years) */}
          <div className="flex">
            <div className="w-[280px] flex-shrink-0 border-r border-b border-gray-300 bg-gradient-to-b from-gray-50 to-white sticky left-0 z-30">
              <div className="h-10 flex items-center px-4 font-semibold text-sm text-gray-700">
                Name
              </div>
            </div>
            <div className="relative bg-gradient-to-b from-gray-50 to-white border-b border-gray-300" style={{ minWidth: `${totalWidth}px` }}>
              <div className="relative h-10">
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
            <div className="w-[280px] flex-shrink-0 border-r border-b border-gray-200 bg-white sticky left-0 z-30">
              {/* Empty space to align with name column */}
            </div>
            <div className="relative bg-white border-b border-gray-200" style={{ minWidth: `${totalWidth}px` }}>
              <div className="relative h-9">
                {headers.secondary ? (
                  // Month view: Show month names as secondary header
                  headers.secondary.map((header, index) => (
                    <div
                      key={index}
                      className="absolute flex items-center justify-center text-xs font-semibold text-gray-700 border-r border-gray-200/60 bg-gray-50/30"
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
                          label.isWeekend ? 'bg-gray-100/60 text-gray-500' : 'bg-white text-gray-700'
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
          {/* Today indicator line */}
          {todayPosition >= 0 && (
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-red-400/80 z-10 pointer-events-none"
              style={{ left: `${280 + todayPosition}px` }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-1 bg-red-400/90 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md whitespace-nowrap">
                Today
              </div>
            </div>
          )}

          {/* Vertical grid lines for rows */}
          <div className="absolute left-[280px] top-0 bottom-0 pointer-events-none" style={{ width: `${totalWidth}px` }}>
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
            <div key={milestone._id}>
              {/* Milestone row with expand/collapse */}
              <div className="flex items-center border-b border-gray-100/60 hover:bg-gray-50/40 transition-colors duration-150">
                <div className="w-[280px] flex-shrink-0 px-4 py-2.5 border-r border-gray-100/60 flex items-center gap-2 sticky left-0 bg-white z-20">
                  <button
                    onClick={() => toggleExpand(milestone._id)}
                    className="p-0.5 hover:bg-gray-200/60 rounded transition-all duration-150"
                    disabled={!milestone.deliverables || milestone.deliverables.length === 0}
                  >
                    {milestone.deliverables && milestone.deliverables.length > 0 ? (
                      expandedItems[milestone._id] ? (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                      )
                    ) : (
                      <div className="w-3.5 h-3.5" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {milestone.name || 'Untitled Milestone'}
                    </div>
                    <div className="text-[11px] text-gray-500 font-normal">
                      Milestone
                      {milestone.deliverables && milestone.deliverables.length > 0 && (
                        <span className="ml-1">
                          · {milestone.deliverables.length} deliverable{milestone.deliverables.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <GanttRow
                  item={milestone}
                  type="milestone"
                  minDate={minDate}
                  totalDays={totalDays}
                  cellWidth={cellWidth}
                  interval={interval}
                  totalWidth={totalWidth}
                  level={0}
                  onBarClick={onItemClick}
                />
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
                        {/* Deliverable row with expand/collapse */}
                        <div className="flex items-center border-b border-gray-100/40 hover:bg-gray-50/30 transition-colors duration-150 bg-gray-50/20">
                          <div className="w-[280px] flex-shrink-0 px-4 py-2.5 border-r border-gray-100/60 flex items-center gap-2 sticky left-0 bg-gray-50/20 z-20" style={{ paddingLeft: '42px' }}>
                            <button
                              onClick={() => toggleDeliverableExpand(deliverable._id)}
                              className="p-0.5 hover:bg-gray-200/60 rounded transition-all duration-150"
                              disabled={!deliverable.tasks || deliverable.tasks.length === 0}
                            >
                              {deliverable.tasks && deliverable.tasks.length > 0 ? (
                                expandedItems[`deliverable-${deliverable._id}`] ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                                )
                              ) : (
                                <div className="w-3.5 h-3.5" />
                              )}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-800 truncate">
                                {deliverable.title || 'Untitled Deliverable'}
                              </div>
                              <div className="text-[11px] text-gray-500 font-normal">
                                Deliverable
                                {deliverable.tasks && deliverable.tasks.length > 0 && (
                                  <span className="ml-1">
                                    · {deliverable.tasks.length} task{deliverable.tasks.length !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

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
                        </div>

                        {/* Tasks (expanded) */}
                        <AnimatePresence>
                          {expandedItems[`deliverable-${deliverable._id}`] && deliverable.tasks && deliverable.tasks.length > 0 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {deliverable.tasks.map((task) => (
                                <div key={task._id} className="flex items-center border-b border-gray-100/40 hover:bg-gray-50/30 transition-colors duration-150 bg-gray-50/10">
                                  <div className="w-[280px] flex-shrink-0 px-4 py-2.5 border-r border-gray-100/60 flex items-center gap-2 sticky left-0 bg-gray-50/10 z-20" style={{ paddingLeft: '70px' }}>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium text-gray-800 truncate">
                                        {task.title || 'Untitled Task'}
                                      </div>
                                      <div className="text-[11px] text-gray-500 font-normal">
                                        Task
                                      </div>
                                    </div>
                                  </div>

                                  <GanttRow
                                    item={task}
                                    type="task"
                                    minDate={minDate}
                                    totalDays={totalDays}
                                    cellWidth={cellWidth}
                                    interval={interval}
                                    totalWidth={totalWidth}
                                    level={2}
                                    onBarClick={onItemClick}
                                  />
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
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
