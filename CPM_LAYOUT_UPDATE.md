# CPM Network Graph Layout Update

## Overview
Updated the Milestone Network Graph to use **CPM (Critical Path Method) time-based positioning** instead of dependency-depth positioning. Nodes that start at the same time are now displayed at the same horizontal level (column).

## What Changed

### Before (Dependency-Based Layout)
- Nodes were positioned based on their **dependency depth** (shortest path from start)
- Nodes in the same "generation" of dependencies appeared in the same column
- **Issue**: Nodes that execute at the same time could appear in different columns

### After (CPM Time-Based Layout)
- Nodes are positioned based on their **earliest start time** from CPM calculation
- Nodes with the same `earliestStart` time appear in the same column
- **Result**: Properly shows which tasks can be executed in parallel

## Example from Your Images

### Network Structure:
```
Start → A (duration: 2) → C (duration: 4) → D (duration: 2) → Finish
Start → B (duration: 3) → E (duration: 1) → F (duration: 3) → Finish
```

### Timeline Calculation:
- **Start**: Time 0
- **A starts**: Time 0, finishes at Time 2
- **B starts**: Time 0, finishes at Time 3
- **C starts**: Time 2, finishes at Time 6
- **D starts**: Time 6, finishes at Time 8
- **E starts**: Time 3, finishes at Time 4
- **F starts**: Time 4, finishes at Time 7

### Visual Layout (Columns by Start Time):
```
Column 0: Start
Column 1: A, B (both start at time 0)
Column 2: C (starts at time 2)
Column 3: E (starts at time 3)
Column 4: D, F (D starts at 6, but shown relatively)
Column 5: Finish
```

## How It Works

### 1. Time-Based Grouping (`assignLayersByCPMTime`)
```javascript
// Group nodes by earliestStart time
nodes with earliestStart = 0 → Column 0
nodes with earliestStart = T1 → Column 1
nodes with earliestStart = T2 → Column 2
...
```

### 2. Vertical Alignment
Nodes in the same column are distributed vertically with spacing to minimize arrow crossings.

### 3. Critical Path Highlighting
- Critical path nodes (isCritical = true) are shown with red borders
- Critical path arrows are shown in red
- Non-critical paths shown in gray

## Benefits

1. **Accurate Time Representation**: Visual layout matches actual execution timeline
2. **Parallel Tasks Visible**: Tasks that can run simultaneously appear side-by-side
3. **Resource Planning**: Easier to see resource conflicts when multiple tasks start at same time
4. **Critical Path Clarity**: Red highlighting shows which delays will impact project completion

## Files Modified

- `/frontend/src/components/milestones/MilestoneNetworkGraph.jsx`
  - Replaced `assignLayersByShortestPath()` with `assignLayersByCPMTime()`
  - Updated `calculateLayout()` to use CPM time-based grouping
  - Nodes now use `earliestStart` property from backend CPM calculation

## Testing

View the network graph in any project with milestones to see the updated layout. Milestones with the same earliest start time will now appear in the same vertical column.

### Example Project to Test:
1. Create milestones with parallel paths
2. Set different durations
3. View the Network Diagram
4. Verify nodes with same start time are aligned vertically

## Technical Notes

- The backend CPM calculation (`backend/utils/cpm.js`) already provides `earliestStart` times
- The frontend now respects these times for visual layout
- Fallback logic handles nodes without CPM data (uses dependency-based positioning)
- Project Start node is always at time 0 (leftmost column)
