import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { calculateBarPosition, getBarColor, getBarHoverColor } from '../../utils/ganttUtils';

/**
 * GanttRow Component
 * Renders the bar portion of a Gantt chart row
 */
function GanttRow({ 
  item, 
  type, 
  minDate, 
  totalDays,
  cellWidth,
  interval,
  totalWidth,
  level = 0,
  onBarClick 
}) {
  const { left, width } = calculateBarPosition(
    item.calculatedStartDate,
    item.calculatedEndDate,
    minDate,
    cellWidth,
    interval
  );

  const barColor = getBarColor(type, item.completed);
  const barHoverColor = getBarHoverColor(type);

  // Format dates for tooltip
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getItemTitle = () => {
    switch (type) {
      case 'milestone':
        return item.name || 'Untitled Milestone';
      case 'deliverable':
      case 'task':
        return item.title || 'Untitled';
      default:
        return 'Untitled';
    }
  };

  return (
    <div className="relative h-11 bg-transparent" style={{ width: `${totalWidth}px` }}>
      {width > 0 && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`absolute h-8 top-1.5 rounded-full ${barColor} ${barHoverColor} cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg`}
          style={{
            left: `${left}px`,
            width: `${width}px`,
            transformOrigin: 'left'
          }}
          onClick={() => onBarClick && onBarClick(item, type)}
          title={`${getItemTitle()}\n${formatDate(item.calculatedStartDate)} - ${formatDate(item.calculatedEndDate)}`}
        >
          {/* Bar label with better visibility */}
          {width > 60 && (
            <div className="absolute inset-0 flex items-center px-4 text-white text-xs font-semibold truncate drop-shadow-sm">
              {item.abbreviation || getItemTitle()}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

GanttRow.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string,
    title: PropTypes.string,
    abbreviation: PropTypes.string,
    calculatedStartDate: PropTypes.string,
    calculatedEndDate: PropTypes.string,
    completed: PropTypes.bool
  }).isRequired,
  type: PropTypes.oneOf(['milestone', 'deliverable', 'task']).isRequired,
  minDate: PropTypes.instanceOf(Date).isRequired,
  totalDays: PropTypes.number.isRequired,
  cellWidth: PropTypes.number.isRequired,
  interval: PropTypes.number.isRequired,
  totalWidth: PropTypes.number.isRequired,
  level: PropTypes.number,
  onBarClick: PropTypes.func
};

export default GanttRow;
