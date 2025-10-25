import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Calendar, Maximize2, Minimize2, Plus, FolderOpen } from 'lucide-react';
import PropTypes from 'prop-types';
import GanttRow from './GanttRow';
import { 
  calculateDateRange, 
  generateDateLabels, 
  calculateTodayPosition,
  parseLocalDate 
} from '../../utils/ganttUtils';

/**
 * DeliverableGanttChart Component
 * Gantt chart for deliverable groups, deliverables, and tasks
 * Groups don't have dates - they're just organizational containers
 */
function DeliverableGanttChart({ 
  groups = [], 
  deliverables = [], 
  tasksByDeliverable = {},
  onItemClick, 
  onAddGroup,
  onAddDeliverable, 
  onAddTask 
}) {
  const [expandedGroups, setExpandedGroups] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState('day');
  const scrollContainerRef = useRef(null);

  // Transform data for Gantt chart
  const ganttData = useMemo(() => {
    return groups.map(group => {
      // Get deliverables for this group
      const groupDeliverables = deliverables
        .filter(d => d.group === group._id)
        .map(deliverable => {
          // Get tasks for this deliverable
          const tasks = (tasksByDeliverable[deliverable._id] || []).map(task => ({
            _id: task._id,
            title: task.name,
            calculatedDueDate: task.dueDate,
            completed: task.status === 'completed'
          }));

          return {
            _id: deliverable._id,
            title: deliverable.name,
            calculatedStartDate: deliverable.startDate,
            calculatedEndDate: deliverable.endDate,
            completed: deliverable.status === 'completed',
            tasks
          };
        });

      return {
        _id: group._id,
        name: group.name,
        deliverables: groupDeliverables,
        // Calculate group dates from deliverables
        calculatedStartDate: groupDeliverables.length > 0
          ? groupDeliverables.reduce((min, d) => 
              !min || new Date(d.calculatedStartDate) < new Date(min) 
                ? d.calculatedStartDate 
                : min, null)
          : null,
        calculatedEndDate: groupDeliverables.length > 0
          ? groupDeliverables.reduce((max, d) => 
              !max || new Date(d.calculatedEndDate) > new Date(max) 
                ? d.calculatedEndDate 
                : max, null)
          : null
      };
    }).filter(group => group.deliverables.length > 0); // Only show groups with deliverables
  }, [groups, deliverables, tasksByDeliverable]);

  // Calculate date range for the entire chart
  const { minDate, maxDate, totalDays } = useMemo(
    () => calculateDateRange(ganttData, viewMode),
    [ganttData, viewMode]
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
      return -1;
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
      const targetScrollLeft = todayPosition - (viewportWidth / 3) + 280;
      container.scrollLeft = Math.max(0, targetScrollLeft);
    }
  }, [todayPosition, viewMode]);

  // Toggle expand/collapse for a group
  const toggleExpand = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Expand all items
  const expandAll = () => {
    const expanded = {};
    ganttData.forEach(group => {
      expanded[group._id] = true;
    });
    setExpandedGroups(expanded);
  };

  // Collapse all items
  const collapseAll = () => {
    setExpandedGroups({});
  };

  if (!ganttData || ganttData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <Calendar className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">No deliverables to display</p>
        <p className="text-sm">Add deliverables with dates to see them on the timeline</p>
      </div>
    );
  }

  return (
    <div className={`gantt-chart-container ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative'}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/60 bg-white">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-gray-800">Timeline</h3>
          <span className="text-xs text-gray-500 font-normal">
            {ganttData.length} group{ganttData.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Add Group Button */}
          {onAddGroup && (
            <>
              <button
                onClick={onAddGroup}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all duration-150 flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Group
              </button>
              <div className="w-px h-4 bg-gray-200/60"></div>
            </>
          )}

          {/* View Mode Selector */}
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

      {/* Legend */}
      <div className="flex items-center gap-5 px-6 py-2.5 bg-gray-50/50 border-b border-gray-200/40 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-purple-500/90 rounded-sm"></div>
          <span className="text-gray-600 font-medium">Deliverable</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-blue-400 rounded-full border-2 border-white"></div>
          <span className="text-gray-600 font-medium">Task</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-emerald-500/90 rounded-full"></div>
          <span className="text-gray-600 font-medium">Completed</span>
        </div>
      </div>

      {/* Gantt Chart */}
      <div ref={scrollContainerRef} className={`overflow-auto ${isFullscreen ? 'h-[calc(100vh-140px)]' : 'max-h-[600px]'}`}>
        <div style={{ minWidth: `${280 + totalWidth}px` }}>
          {/* Date Header */}
          <div className="sticky top-0 z-10 bg-white">
            {/* Primary Header Row */}
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
          
            {/* Secondary Header Row */}
            <div className="flex">
              <div className="w-[280px] flex-shrink-0 border-r border-b border-gray-300 bg-white sticky left-0 z-30"></div>
              <div className="flex-1 bg-white border-b border-gray-300" style={{ minWidth: `${totalWidth}px` }}>
                <div className="relative h-8">
                  {headers.secondary ? (
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
            {/* Today indicator */}
            {todayPosition >= 0 && todayColumnIndex < 0 && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-400/80 z-10 pointer-events-none"
                style={{ left: `${280 + todayPosition}px` }}
              />
            )}

            {/* Vertical grid lines */}
            <div className="absolute left-[280px] top-0 bottom-0 pointer-events-none" style={{ width: `${totalWidth}px` }}>
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

            {/* Group rows */}
            {ganttData.map((group) => (
              <div key={group._id} className="relative">
                {/* Expanded group background that spans all rows */}
                {expandedGroups[group._id] && group.calculatedStartDate && group.calculatedEndDate && (
                  <div 
                    className="absolute top-0 bottom-0 pointer-events-none"
                    style={{ 
                      left: `${280 + (() => {
                        const start = parseLocalDate(group.calculatedStartDate);
                        const startOffset = Math.max(0, (start - minDate) / (24 * 60 * 60 * 1000));
                        const pixelsPerDay = cellWidth / interval;
                        return startOffset * pixelsPerDay;
                      })()}px`,
                      width: `${(() => {
                        const start = parseLocalDate(group.calculatedStartDate);
                        const end = parseLocalDate(group.calculatedEndDate);
                        const duration = Math.max(1, (end - start) / (24 * 60 * 60 * 1000)) + 1;
                        const pixelsPerDay = cellWidth / interval;
                        return duration * pixelsPerDay;
                      })()}px`
                    }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400/60 rounded-l-sm"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-400/60 rounded-r-sm"></div>
                    <div className="absolute inset-0 bg-blue-50/15"></div>
                  </div>
                )}

                {/* Group header row */}
                <div className="flex items-center border-b border-gray-200 relative group">
                  {/* Left column - Name */}
                  <div className="w-[280px] flex-shrink-0 px-3 py-1.5 border-r border-gray-300 flex items-center gap-2 sticky left-0 bg-white z-20">
                    <button
                      onClick={() => toggleExpand(group._id)}
                      className="p-0.5 hover:bg-gray-200 rounded transition-all duration-150"
                      disabled={!group.deliverables || group.deliverables.length === 0}
                    >
                      {group.deliverables && group.deliverables.length > 0 ? (
                        expandedGroups[group._id] ? (
                          <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                        )
                      ) : (
                        <div className="w-3.5 h-3.5" />
                      )}
                    </button>
                  
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {group.name}
                        </div>
                        <div className="text-[10px] text-gray-600 font-medium">
                          GROUP
                          {group.deliverables && group.deliverables.length > 0 && (
                            <span className="ml-1">
                              · {group.deliverables.length} deliverable{group.deliverables.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      {onAddDeliverable && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddDeliverable(group);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all duration-150"
                          title="Add deliverable"
                        >
                          <Plus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right column - Timeline area */}
                  <div 
                    className="relative flex-1" 
                    style={{ width: `${totalWidth}px`, minWidth: `${totalWidth}px` }}
                  >
                    {/* Collapsed pill visualization */}
                    {!expandedGroups[group._id] && group.calculatedStartDate && group.calculatedEndDate && (
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 h-8 rounded-full bg-blue-400/70 shadow-md flex items-center px-4 cursor-pointer hover:bg-blue-500/80 transition-colors duration-150"
                        style={{ 
                          left: `${(() => {
                            const start = parseLocalDate(group.calculatedStartDate);
                            const startOffset = Math.max(0, (start - minDate) / (24 * 60 * 60 * 1000));
                            const pixelsPerDay = cellWidth / interval;
                            return startOffset * pixelsPerDay + 4;
                          })()}px`,
                          width: `${(() => {
                            const start = parseLocalDate(group.calculatedStartDate);
                            const end = parseLocalDate(group.calculatedEndDate);
                            const duration = Math.max(1, (end - start) / (24 * 60 * 60 * 1000)) + 1;
                            const pixelsPerDay = cellWidth / interval;
                            return duration * pixelsPerDay - 8;
                          })()}px`
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(group._id);
                        }}
                        title={`Click to expand ${group.name}`}
                      >
                        <FolderOpen className="w-3.5 h-3.5 mr-2 text-white flex-shrink-0" />
                        <span className="text-xs font-semibold text-white truncate drop-shadow-sm">
                          {group.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deliverables (expanded) */}
                <AnimatePresence>
                  {expandedGroups[group._id] && group.deliverables && group.deliverables.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {group.deliverables.map((deliverable) => (
                        <div key={deliverable._id}>
                          {/* Deliverable row */}
                          <div className="flex items-center border-b border-gray-200 group">
                            <div className="w-[280px] flex-shrink-0 px-3 py-1.5 border-r border-gray-300 flex items-center gap-2 sticky left-0 bg-white z-20" style={{ paddingLeft: '32px' }}>
                              <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {deliverable.title}
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
                                {onAddTask && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onAddTask(group, deliverable);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all duration-150"
                                    title="Add task"
                                  >
                                    <Plus className="w-3.5 h-3.5 text-gray-600" />
                                  </button>
                                )}
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
                                onBarClick={(item, type) => onItemClick && onItemClick(item, type, group)}
                              />
                            
                              {/* Task circles on top of deliverable bar */}
                              {deliverable.tasks && deliverable.tasks.map((task) => {
                                if (!task.calculatedDueDate) return null;
                              
                                const taskDue = parseLocalDate(task.calculatedDueDate);
                                const dueOffset = Math.max(0, (taskDue - minDate) / (24 * 60 * 60 * 1000));
                                const pixelsPerDay = cellWidth / interval;
                                const position = dueOffset * pixelsPerDay;
                                const centeredPosition = position + (pixelsPerDay / 2);
                              
                                return (
                                  <div
                                    key={task._id}
                                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer group z-10"
                                    style={{ left: `${centeredPosition}px` }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onItemClick && onItemClick(task, 'task', group, deliverable);
                                    }}
                                    title={`${task.title} - Due: ${new Date(task.calculatedDueDate).toLocaleDateString()}`}
                                  >
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

DeliverableGanttChart.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ),
  deliverables: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      startDate: PropTypes.string,
      endDate: PropTypes.string,
      group: PropTypes.string
    })
  ),
  tasksByDeliverable: PropTypes.object,
  onItemClick: PropTypes.func,
  onAddGroup: PropTypes.func,
  onAddDeliverable: PropTypes.func,
  onAddTask: PropTypes.func
};

export default DeliverableGanttChart;
