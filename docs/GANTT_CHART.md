# Gantt Chart Implementation

## Overview
A fully-featured Gantt chart visualization has been implemented for the Project Management Application to provide a visual timeline of milestones, deliverables, and tasks within projects.

## Location
The Gantt chart appears as a collapsible "Project Timeline" card **above** the Milestones section in the Project Details page, providing immediate visual context before diving into the detailed milestone list.

## Features

### View Modes
- **Day View**: Shows individual days with weekday labels (e.g., "Mon, Jan 15")
- **Week View**: Shows weekly intervals with date labels (e.g., "Jan 15")
- **Month View**: Shows monthly intervals with month and year labels (e.g., "Jan 2025")
- **Auto View**: Automatically selects the best view based on project duration:
  - ≤30 days: Day view
  - 31-90 days: Week view
  - >90 days: Month view

### Visual Timeline
- **Hierarchical Display**: Shows milestones, deliverables, and tasks in a nested structure
- **Date-Based Layout**: Automatically positions items based on their calculated start and end dates
- **Color Coding**: 
  - Blue: Milestones
  - Purple: Deliverables
  - Amber: Tasks
  - Green: Completed items
- **Interactive Bars**: Hover to see details, click for interactions
- **Today Indicator**: A red vertical line shows the current date

### User Interface
- **View Mode Selector**: Toggle buttons for Day/Week/Month/Auto views in the header
- **Expand/Collapse**: 
  - Toggle individual milestones to show/hide their deliverables
  - Toggle deliverables to show/hide their tasks
  - "Expand All" / "Collapse All" buttons for bulk actions
- **Fullscreen Mode**: Button to maximize the chart for better visibility
- **Responsive Layout**: Adapts to different screen sizes
- **Smooth Animations**: Framer Motion powered transitions

### Layout & Scrolling
- **Fixed Label Width**: Item labels maintain a consistent 250px width regardless of content
- **Minimum Timeline Width**: Timeline area has a minimum width of 800px to ensure bars are visible
- **Horizontal Scrolling**: Automatically enabled when content exceeds container width
- **Vertical Scrolling**: Enabled for projects with many milestones (max height: 600px, fullscreen: full viewport)
- **Consistent Sizing**: Adding more milestones doesn't shrink existing items - horizontal scroll appears instead
- **Sticky Header**: Date labels remain visible while scrolling vertically

### Smart Date Handling
- **Auto-scaling**: Automatically adjusts timeline based on project duration
- **Dynamic Labels**: Shows daily, weekly, or monthly labels based on timeline length
- **View-Responsive Layout**: Timeline width adjusts when switching between view modes for optimal screen utilization
- **Smart Boundaries**: Timeline snaps to logical boundaries:
  - Month view: Starts at first of month, ends at last day of month
  - Week view: Starts on Sunday, ends on Saturday
  - Day view: Uses actual dates with minimal padding
- **Adaptive Padding**: 
  - Day view: 2 days padding
  - Week view: 1 week (7 days) padding
  - Month view: 2 weeks (15 days) padding
- **Grid Lines**: Visual guides for date alignment
- **Intelligent Spacing**: More space allocated in Month view, tighter in Day view

## Components

### 1. GanttChart.jsx
**Location**: `/frontend/src/components/gantt/GanttChart.jsx`

Main component that orchestrates the entire Gantt chart visualization.

**Props**:
- `milestones`: Array of milestone objects with deliverables and tasks
- `onItemClick`: Callback function when an item is clicked

**Key Features**:
- View mode selector (Day/Week/Month/Auto)
- Date range calculation
- Header with date labels
- Expand/collapse state management
- Fullscreen toggle
- Legend display
- Today indicator line

### 2. GanttRow.jsx
**Location**: `/frontend/src/components/gantt/GanttRow.jsx`

Component responsible for rendering the bar portion of each item.

**Props**:
- `item`: The milestone, deliverable, or task object
- `type`: One of 'milestone', 'deliverable', or 'task'
- `minDate`: Start date of the entire timeline
- `totalDays`: Total days in the timeline
- `level`: Hierarchy level (0 for milestone, 1 for deliverable, 2 for task)
- `onBarClick`: Click handler

**Rendering**:
- Calculates bar position and width as percentages
- Applies color based on type and completion status
- Shows abbreviated text on bar if space allows
- Animated entrance with scale effect

### 3. ganttUtils.js
**Location**: `/frontend/src/utils/ganttUtils.js`

Utility functions for calculations and styling.

**Functions**:

#### `calculateDateRange(milestones, viewMode)`
Analyzes all items to find the earliest start and latest end dates, adding view-appropriate padding and snapping to logical boundaries.

**Parameters**:
- `milestones`: Array of milestone objects
- `viewMode`: One of 'day', 'week', 'month', or 'auto'

**Boundary Snapping**:
- Month view: Aligns to calendar months (1st to last day)
- Week view: Aligns to full weeks (Sunday to Saturday)
- Day view: Uses actual dates with minimal padding

**Returns**: `{ minDate, maxDate, totalDays }`

#### `calculateBarPosition(startDate, endDate, minDate, totalDays)`
Converts dates to percentage-based positioning.

**Returns**: `{ left, width }` as percentages

#### `generateDateLabels(minDate, maxDate, totalDays, viewMode)`
Creates an array of date labels with positions for the header based on the selected view mode.

**Parameters**:
- `minDate`: Start date of the timeline
- `maxDate`: End date of the timeline
- `totalDays`: Total days in the range
- `viewMode`: One of 'day', 'week', 'month', or 'auto'

**Returns**: Array of `{ date, position, label }`

#### `formatDateLabel(date, interval, viewMode)`
Formats date labels based on the view mode:
- Day view: "Mon, Jan 15"
- Week view: "Jan 15"
- Month view: "Jan 2025"

#### `getBarColor(type, completed)`
Returns Tailwind CSS classes for bar colors based on type and status.

#### `getBarHoverColor(type)`
Returns hover state color classes.

#### `calculateTodayPosition(minDate, totalDays)`
Returns the percentage position of today's date in the timeline.

## Integration

### ProjectDetails.jsx
The Gantt chart is integrated into the Project Details page as a collapsible card section.

**Location**: Appears **before** the Milestones card (positioned above it)

**State Management**:
```javascript
const [showGanttChart, setShowGanttChart] = useState(false);
```

**Conditional Rendering**:
- Only shows if there are milestones in the project
- Can be expanded/collapsed via header click or button
- Passes milestone data with nested deliverables and tasks

**Click Handler**:
Currently logs clicked items to console, can be extended for:
- Editing items
- Showing detail panels
- Filtering/highlighting related items

## Data Requirements

### Expected Data Structure
```javascript
{
  milestones: [
    {
      _id: "milestone-id",
      name: "Milestone Name",
      abbreviation: "MS1",
      calculatedStartDate: "2025-01-01T00:00:00.000Z",
      calculatedEndDate: "2025-01-15T00:00:00.000Z",
      deliverables: [
        {
          _id: "deliverable-id",
          title: "Deliverable Title",
          calculatedStartDate: "2025-01-02T00:00:00.000Z",
          calculatedEndDate: "2025-01-10T00:00:00.000Z",
          completed: false,
          tasks: [
            {
              _id: "task-id",
              title: "Task Title",
              calculatedStartDate: "2025-01-02T00:00:00.000Z",
              calculatedEndDate: "2025-01-05T00:00:00.000Z",
              completed: true
            }
          ]
        }
      ]
    }
  ]
}
```

**Required Fields**:
- `calculatedStartDate`: ISO date string
- `calculatedEndDate`: ISO date string
- `_id`: Unique identifier

**Optional Fields**:
- `name` / `title`: Display name
- `abbreviation`: Short code for milestone (shown on bar)
- `completed`: Boolean for completion status
- `deliverables`: Array of nested deliverables
- `tasks`: Array of nested tasks

## Styling

### Color Scheme
The chart uses a consistent color palette:
- **Milestones**: `bg-blue-600` (default), `hover:bg-blue-700`
- **Deliverables**: `bg-purple-500` (default), `hover:bg-purple-600`
- **Tasks**: `bg-amber-500` (default), `hover:bg-amber-600`
- **Completed**: `bg-green-500` (overrides type color)
- **Today Line**: `bg-red-500`

### Layout
- **Timeline Header**: Fixed at top with sticky positioning
- **Row Height**: 48px (12 in Tailwind units)
- **Bar Height**: 32px (8 in Tailwind units), vertically centered
- **Label Width**: 25% of container, minimum 250px
- **Indentation**: 
  - Milestones: 12px base
  - Deliverables: 36px (12px + 24px)
  - Tasks: 60px (12px + 48px)

### Responsive Behavior
- Horizontal scroll for long timelines
- Max height with vertical scroll (600px default, full screen in fullscreen mode)
- Min-width for label column ensures text readability

## Usage Example

```jsx
import { GanttChart } from '../../components/gantt';

function MyComponent() {
  const [milestones, setMilestones] = useState([]);
  
  const handleItemClick = (item, type) => {
    console.log(`Clicked ${type}:`, item);
    // Handle click - open dialog, navigate, etc.
  };
  
  return (
    <GanttChart 
      milestones={milestones}
      onItemClick={handleItemClick}
    />
  );
}
```

## View Modes Explained

### Day View
Best for short-term projects (1-30 days). Shows each individual day with weekday labels for easy weekly planning.

**Timeline adjustments**:
- 2 days padding before and after project dates
- Minimal extra space for focused view
- Labels show every single day

**Use when**:
- Project is less than a month
- Need to see daily progress
- Planning week-by-week activities

**Label format**: "Mon, Jan 15", "Tue, Jan 16", etc.

### Week View
Ideal for medium-term projects (1-3 months). Shows weekly markers for balanced detail and overview.

**Timeline adjustments**:
- 1 week (7 days) padding before and after
- Snaps to full weeks (Sunday to Saturday)
- Labels show start of each week
- More breathing room than Day view

**Use when**:
- Project spans 1-3 months
- Weekly milestones are important
- Need balance between detail and overview

**Label format**: "Jan 15", "Jan 22", etc.

### Month View
Perfect for long-term projects (3+ months). Shows monthly markers for high-level timeline visualization.

**Timeline adjustments**:
- 2 weeks (15 days) padding before and after
- Snaps to full calendar months
- Labels show first of each month
- Maximum spacing for cleaner overview

**Use when**:
- Project spans multiple months
- Need high-level overview
- Monthly milestones are sufficient

**Label format**: "Jan 2025", "Feb 2025", etc.

### Auto View (Default)
Automatically selects the best view based on project duration. Provides optimal viewing experience without manual adjustment.

**Logic**:
- ≤30 days → Day view
- 31-90 days → Week view
- >90 days → Month view
```

## Future Enhancements

### Potential Features
1. **Drag-and-Drop**: Allow rescheduling by dragging bars
2. **Dependencies**: Show arrows connecting dependent items
3. **Progress Bars**: Show completion percentage within bars
4. **Zoom Controls**: In/out for different time granularities
5. **Filtering**: By team member, status, type, etc.
6. **Export**: PDF or image export functionality
7. **Critical Path**: Highlight critical path items
8. **Resource Allocation**: Show team member assignments
9. **Baseline Comparison**: Compare planned vs actual timelines
10. **Mini-map**: Overview navigator for long timelines

### Performance Optimizations
- Virtual scrolling for projects with 100+ items
- Memoization of calculations
- Lazy loading of nested items
- Canvas rendering for very large datasets

## Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Horizontal scroll enabled

## Dependencies
- **React**: ^19.1.1
- **Framer Motion**: ^12.23.24 (animations)
- **Lucide React**: ^0.546.0 (icons)
- **Tailwind CSS**: ^4.1.14 (styling)

## Testing

### Manual Testing Checklist
- [ ] Chart displays with valid milestone data
- [ ] Empty state shows when no milestones
- [ ] Timeline appears above Milestones section
- [ ] Day view button works and shows correct labels
- [ ] Week view button works and shows correct labels
- [ ] Month view button works and shows correct labels
- [ ] Auto view button works and auto-selects appropriate view
- [ ] View mode buttons highlight active state
- [ ] Expand/collapse works for milestones
- [ ] Expand/collapse works for deliverables
- [ ] Expand All button works
- [ ] Collapse All button works
- [ ] Fullscreen toggle works
- [ ] Today line appears in correct position
- [ ] Bar colors match item types
- [ ] Completed items show green
- [ ] Hover states work
- [ ] Bar tooltips show dates
- [ ] Click handlers fire
- [ ] Date labels are readable in all view modes
- [ ] Grid lines align properly
- [ ] Responsive on mobile
- [ ] Animations are smooth

## Troubleshooting

### Chart doesn't display
- Verify milestones array is not empty
- Check that `calculatedStartDate` and `calculatedEndDate` exist
- Ensure dates are valid ISO strings

### Bars appear in wrong position
- Verify date consistency across hierarchy
- Check that child dates fall within parent dates
- Ensure timezone handling is consistent

### Performance issues
- Check total number of items (milestones + deliverables + tasks)
- Consider implementing virtual scrolling for 100+ items
- Verify no infinite re-renders with React DevTools

### Styling issues
- Ensure Tailwind CSS is properly configured
- Check for CSS conflicts with global styles
- Verify Framer Motion is installed and working

## License
Part of the PM_APP project - Internal use only
