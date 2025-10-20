# Network Graph Layout Algorithm Update

## New Algorithm: Longest Path Layering (Topological Sort-Based)

### Overview
Replaced the CPM time-based layout with a **proper graph layering algorithm** that uses the longest path from source nodes to assign horizontal layers. This ensures:

1. **All dependencies appear to the left of their dependents**
2. **Proper topological ordering** of nodes
3. **Minimized edge crossings** through barycenter heuristic
4. **Clear visual hierarchy** from left to right

### Algorithm Steps

#### Step 1: Longest Path Layer Assignment
```
For each node:
  - Find all source nodes (nodes with no dependencies)
  - Use DFS to calculate the longest path from any source
  - Assign layer = max(dependency layers) + 1
```

**Example:**
```
Start (layer 0)
├── A (layer 1) - depends on Start
├── D (layer 1) - depends on Start  
├── G (layer 1) - depends on Start
    ├── B (layer 2) - depends on A and D
    ├── E (layer 2) - depends on D
    ├── H (layer 2) - depends on G
        ├── C (layer 3) - depends on B
        ├── F (layer 3) - depends on E
        ├── I (layer 3) - depends on H
```

#### Step 2: Group Nodes by Layer
Nodes with the same layer number are placed in the same vertical column.

#### Step 3: Minimize Edge Crossings
Uses the **barycenter heuristic**:
- Forward pass: Sort nodes by average position of predecessors
- Backward pass: Sort nodes by average position of successors
- Multiple iterations for better optimization (12 passes)

#### Step 4: Calculate Positions
- **Horizontal**: Fixed spacing between layers (300px)
- **Vertical**: Adaptive spacing based on nodes per layer
  - Single node: centered
  - Multiple nodes: evenly distributed with 150-250px spacing

### Key Improvements

1. **Dependency Normalization**: Handles both object and string dependencies
2. **Circular Dependency Detection**: Warns if cycles are found
3. **Robust Fallbacks**: Works even without CPM data
4. **Visual Clarity**: Clear left-to-right flow matching dependency order

### Comparison

| Old (CPM Time-Based) | New (Longest Path) |
|---------------------|-------------------|
| Groups by earliest start time | Groups by dependency depth |
| Requires CPM calculation | Works with or without CPM |
| May have crossing dependencies | Minimizes crossings |
| Time-based columns | Hierarchy-based columns |

### Example Network Layout

Given the test network:
```
Path 1: A(10) → B(12) → C(9)
Path 2: D(5) → B(12), E(7) → F(6)
Path 3: G(3) → H(4) → I(6)
```

Expected layout:
```
Layer 0: Project Start
Layer 1: A, D, G (all depend only on Start)
Layer 2: B (depends on A, D), E (depends on D), H (depends on G)
Layer 3: C (depends on B), F (depends on E), I (depends on H)
```

### Debugging

Console logs show:
- 📦 **Nodes and their dependencies**
- 🎯 **Source nodes identified**
- 📍 **Layer assignments for each node**
- 📊 **Final layer groups with node names**

### Files Modified
- `/frontend/src/components/milestones/MilestoneNetworkGraph.jsx`
  - `calculateLayout()` - Updated to normalize dependencies
  - `assignLayersByLongestPath()` - New DFS-based layering algorithm
  - Added comprehensive logging for debugging

### Testing

To test the new layout:
1. Navigate to the test project: http://localhost:5174/projects/68f6c49e17b911aae288d4d3
2. View Network Diagram tab
3. Check browser console for debug output
4. Verify nodes are properly layered left-to-right
5. Confirm no overlapping nodes or arrows going backwards
