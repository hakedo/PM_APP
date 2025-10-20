import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Edit2 } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * MilestoneNetworkGraph Component
 * Displays milestones as a network graph with nodes and dependency arrows
 * with deliverable pie rings around nodes
 */
function MilestoneNetworkGraph({ milestones = [], onMilestoneClick, projectStartDate, deliverables = {} }) {
  const svgRef = useRef(null);
  const [positions, setPositions] = useState({});
  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 });
  const [allNodes, setAllNodes] = useState([]);

  // Create the default "Project Start" node
  const PROJECT_START_ID = 'project-start-node';
  const projectStartNode = {
    _id: PROJECT_START_ID,
    name: 'Project Start',
    status: 'completed',
    duration: 0,
    dependencies: [],
    isProjectStart: true,
    startDate: projectStartDate,
    isCritical: true // Always part of the critical path
  };

  useEffect(() => {
    console.log('MilestoneNetworkGraph received milestones:', milestones);
    milestones.forEach(m => {
      console.log(`Milestone ${m.name}:`, {
        id: m._id,
        dependencies: m.dependencies,
        isCritical: m.isCritical
      });
    });
    
    // Combine project start node with milestones
    // Milestones without dependencies should depend on project start
    const processedMilestones = milestones.map(milestone => {
      if (!milestone.dependencies || milestone.dependencies.length === 0) {
        return {
          ...milestone,
          dependencies: [PROJECT_START_ID]
        };
      }
      return milestone;
    });

    const nodesWithStart = [projectStartNode, ...processedMilestones];
    setAllNodes(nodesWithStart);

    // Calculate node positions using a layered layout with dynamic dimensions
    const result = calculateLayout(nodesWithStart);
    console.log('Calculated layout:', result);
    setPositions(result.positions);
    setDimensions(result.dimensions);
  }, [milestones, projectStartDate]);

  // Calculate layered layout for nodes (horizontal layout: left to right)
  function calculateLayout(nodes) {
    if (nodes.length === 0) return { positions: {}, dimensions: { width: 1000, height: 400 } };

    // Create adjacency map for dependencies
    const adjacencyMap = new Map();
    nodes.forEach(node => {
      adjacencyMap.set(node._id, node.dependencies || []);
    });

    // Assign layers using topological sort
    const layers = assignLayers(nodes, adjacencyMap);
    
    // Calculate layout constants
    const padding = 100;
    const nodeRadius = 50;
    const horizontalSpacing = 250; // Spacing between layers (left to right)
    const verticalSpacing = 150;   // Spacing between nodes in same layer (top to bottom)
    const minHeight = 400;         // Minimum canvas height

    // Calculate layer counts for centering nodes within each layer
    const layerCounts = new Map();
    layers.forEach(layer => {
      layerCounts.set(layer, (layerCounts.get(layer) || 0) + 1);
    });

    // Find maximum layer and maximum nodes in any layer
    const maxLayer = Math.max(...Array.from(layers.values()));
    const maxNodesInLayer = Math.max(...Array.from(layerCounts.values()));

    // Calculate dynamic dimensions
    const calculatedWidth = padding * 2 + maxLayer * horizontalSpacing + nodeRadius * 2;
    const calculatedHeight = Math.max(
      minHeight,
      padding * 2 + maxNodesInLayer * verticalSpacing + nodeRadius * 2
    );

    const dynamicDimensions = {
      width: calculatedWidth,
      height: calculatedHeight
    };

    // Calculate positions
    const layout = {};
    const layerIndices = new Map();
    nodes.forEach((node, idx) => {
      const layer = layers.get(node._id);
      const indexInLayer = layerIndices.get(layer) || 0;
      layerIndices.set(layer, indexInLayer + 1);

      const layerCount = layerCounts.get(layer);
      const totalHeight = layerCount * verticalSpacing;
      const startY = (dynamicDimensions.height - totalHeight) / 2;

      // Horizontal layout: X position based on layer, Y position based on index within layer
      layout[node._id] = {
        x: padding + layer * horizontalSpacing,
        y: startY + indexInLayer * verticalSpacing + verticalSpacing / 2,
        layer
      };
    });

    return {
      positions: layout,
      dimensions: dynamicDimensions
    };
  }

  // Assign layers to nodes based on dependencies
  function assignLayers(nodes, adjacencyMap) {
    const layers = new Map();
    const visited = new Set();

    function getLayer(nodeId, depth = 0) {
      if (visited.has(nodeId)) {
        return layers.get(nodeId) || 0;
      }

      visited.add(nodeId);
      const deps = adjacencyMap.get(nodeId) || [];

      if (deps.length === 0) {
        layers.set(nodeId, 0);
        return 0;
      }

      let maxDepth = 0;
      deps.forEach(depId => {
        const depLayer = getLayer(depId, depth + 1);
        maxDepth = Math.max(maxDepth, depLayer + 1);
      });

      layers.set(nodeId, maxDepth);
      return maxDepth;
    }

    nodes.forEach(node => {
      getLayer(node._id);
    });

    return layers;
  }

  // Draw arrow between two points with smart routing
  function drawArrow(from, to, isCritical, allNodePositions) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    
    // Define radii
    const nodeRadius = 50;
    const pieRingRadius = 75; // Outer radius including deliverable ring (slightly larger buffer)
    
    // Calculate start and end points (edge of the rings/nodes)
    const fromX = from.x + Math.cos(angle) * pieRingRadius;
    const fromY = from.y + Math.sin(angle) * pieRingRadius;
    
    // Arrow head dimensions - scale with line thickness
    const arrowLength = isCritical ? 14 : 12;
    const arrowWidth = isCritical ? 7 : 6;
    
    // End point of line (before arrow head) - stop line before arrow to prevent overlap
    const lineEndX = to.x - Math.cos(angle) * (pieRingRadius + arrowLength);
    const lineEndY = to.y - Math.sin(angle) * (pieRingRadius + arrowLength);
    
    // Arrow head tip position (at edge of node)
    const arrowTipX = to.x - Math.cos(angle) * pieRingRadius;
    const arrowTipY = to.y - Math.sin(angle) * pieRingRadius;
    
    // Calculate arrow head points
    const arrowAngle1 = angle - Math.PI + Math.PI / 7;
    const arrowAngle2 = angle - Math.PI - Math.PI / 7;
    
    const arrowX1 = arrowTipX + Math.cos(arrowAngle1) * arrowLength;
    const arrowY1 = arrowTipY + Math.sin(arrowAngle1) * arrowLength;
    const arrowX2 = arrowTipX + Math.cos(arrowAngle2) * arrowLength;
    const arrowY2 = arrowTipY + Math.sin(arrowAngle2) * arrowLength;

    // Check if arrow path intersects with any other nodes (basic collision detection)
    const needsRouting = checkPathCollision(
      { x: fromX, y: fromY },
      { x: lineEndX, y: lineEndY },
      from.id,
      to.id,
      allNodePositions
    );

    // Colors with better contrast for critical path
    const strokeColor = isCritical ? '#dc2626' : '#9ca3af';
    const strokeWidth = isCritical ? 2.5 : 2;
    
    if (needsRouting) {
      // Use a curved path to avoid node collision
      const midX = (fromX + lineEndX) / 2;
      const midY = (fromY + lineEndY) / 2;
      // Offset perpendicular to the line
      const perpAngle = angle + Math.PI / 2;
      const offset = 60;
      const controlX = midX + Math.cos(perpAngle) * offset;
      const controlY = midY + Math.sin(perpAngle) * offset;
      
      return (
        <g key={`arrow-${from.id}-to-${to.id}`}>
          {/* Curved line */}
          <path
            d={`M ${fromX} ${fromY} Q ${controlX} ${controlY} ${lineEndX} ${lineEndY}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Arrow head */}
          <path
            d={`M ${arrowTipX} ${arrowTipY} L ${arrowX1} ${arrowY1} L ${arrowX2} ${arrowY2} Z`}
            fill={strokeColor}
            stroke="none"
          />
        </g>
      );
    }
    
    // Straight line when no collision
    return (
      <g key={`arrow-${from.id}-to-${to.id}`}>
        {/* Line */}
        <line
          x1={fromX}
          y1={fromY}
          x2={lineEndX}
          y2={lineEndY}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Arrow head */}
        <path
          d={`M ${arrowTipX} ${arrowTipY} L ${arrowX1} ${arrowY1} L ${arrowX2} ${arrowY2} Z`}
          fill={strokeColor}
          stroke="none"
        />
      </g>
    );
  }

  // Check if a line path collides with any nodes
  function checkPathCollision(from, to, fromId, toId, allPositions) {
    const collisionRadius = 80; // Slightly larger than pie ring radius
    
    // Check each node position
    for (const [nodeId, pos] of Object.entries(allPositions)) {
      // Skip the source and target nodes
      if (nodeId === fromId || nodeId === toId) continue;
      
      // Calculate distance from node to line segment
      const distance = distanceToLineSegment(
        { x: pos.x, y: pos.y },
        from,
        to
      );
      
      if (distance < collisionRadius) {
        return true; // Collision detected
      }
    }
    
    return false;
  }

  // Calculate distance from a point to a line segment
  function distanceToLineSegment(point, lineStart, lineEnd) {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const lengthSquared = dx * dx + dy * dy;
    
    if (lengthSquared === 0) {
      // Line start and end are the same point
      const distX = point.x - lineStart.x;
      const distY = point.y - lineStart.y;
      return Math.sqrt(distX * distX + distY * distY);
    }
    
    // Calculate projection parameter t
    let t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));
    
    // Calculate closest point on line segment
    const closestX = lineStart.x + t * dx;
    const closestY = lineStart.y + t * dy;
    
    // Calculate distance from point to closest point
    const distX = point.x - closestX;
    const distY = point.y - closestY;
    return Math.sqrt(distX * distX + distY * distY);
  }

  // Create deliverable pie ring segments
  function createDeliverablePieRing(milestoneId, centerX, centerY) {
    const milestoneDeliverables = deliverables[milestoneId] || [];
    
    if (milestoneDeliverables.length === 0) {
      return null;
    }

    const innerRadius = 55;
    const outerRadius = 70;
    const gapAngle = 2; // Gap between segments in degrees
    
    // Status colors matching deliverable status
    const statusColors = {
      'completed': '#10b981',
      'in-progress': '#3b82f6',
      'blocked': '#f97316',
      'not-started': '#d1d5db'
    };

    // Calculate angle for each segment
    const segmentAngle = (360 / milestoneDeliverables.length) - gapAngle;
    
    return milestoneDeliverables.map((deliverable, index) => {
      const startAngle = (index * (segmentAngle + gapAngle)) - 90; // Start from top
      const endAngle = startAngle + segmentAngle;
      
      // Convert to radians
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      
      // Calculate arc path
      const x1 = centerX + innerRadius * Math.cos(startRad);
      const y1 = centerY + innerRadius * Math.sin(startRad);
      const x2 = centerX + outerRadius * Math.cos(startRad);
      const y2 = centerY + outerRadius * Math.sin(startRad);
      const x3 = centerX + outerRadius * Math.cos(endRad);
      const y3 = centerY + outerRadius * Math.sin(endRad);
      const x4 = centerX + innerRadius * Math.cos(endRad);
      const y4 = centerY + innerRadius * Math.sin(endRad);
      
      const largeArcFlag = segmentAngle > 180 ? 1 : 0;
      
      const pathData = [
        `M ${x1} ${y1}`,
        `L ${x2} ${y2}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}`,
        `L ${x4} ${y4}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`,
        'Z'
      ].join(' ');
      
      const color = statusColors[deliverable.status] || statusColors['not-started'];
      
      return (
        <g key={`deliverable-${deliverable._id}`}>
          <path
            d={pathData}
            fill={color}
            stroke="#fff"
            strokeWidth="1"
            className="hover:opacity-80 transition-opacity cursor-pointer"
          >
            <title>{deliverable.name} - {deliverable.status}</title>
          </path>
        </g>
      );
    });
  }

  if (milestones.length === 0 && !projectStartDate) {
    return (
      <div className="text-center py-12 text-gray-500">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No milestones yet. Create your first milestone to get started.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-auto bg-white rounded-lg border border-gray-200 p-6">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="mx-auto"
        style={{ backgroundColor: '#fafafa' }}
      >
        {/* Draw dependency arrows first (so they appear behind nodes) */}
        {allNodes.map(milestone => {
          if (!milestone.dependencies || milestone.dependencies.length === 0) return null;
          
          const toPos = positions[milestone._id];
          if (!toPos) return null;

          return milestone.dependencies.map((depId, idx) => {
            // Handle both string IDs and populated objects
            const actualDepId = typeof depId === 'object' ? (depId._id || depId.id) : depId;
            
            const fromPos = positions[actualDepId];
            if (!fromPos) return null;

            // Check if both nodes are on critical path
            const depMilestone = allNodes.find(m => m._id === actualDepId);
            const isCriticalPath = milestone.isCritical && depMilestone?.isCritical;

            return drawArrow(
              { x: fromPos.x, y: fromPos.y, id: actualDepId },
              { x: toPos.x, y: toPos.y, id: milestone._id },
              isCriticalPath,
              positions
            );
          });
        })}

        {/* Draw nodes */}
        {allNodes.map(milestone => {
          const pos = positions[milestone._id];
          if (!pos) return null;

          const isProjectStart = milestone.isProjectStart;
          const statusColors = {
            'completed': '#10b981',
            'in-progress': '#3b82f6',
            'blocked': '#f97316',
            'not-started': '#9ca3af'
          };

          // Project start node gets a special appearance
          const fillColor = isProjectStart 
            ? '#8b5cf6' // Purple for project start
            : milestone.isCritical ? '#ef4444' : statusColors[milestone.status] || '#9ca3af';
          
          const strokeColor = isProjectStart 
            ? '#6d28d9' // Darker purple
            : milestone.isCritical ? '#991b1b' : '#fff';
          
          return (
            <g key={milestone._id}>
              {/* Deliverable pie ring - drawn first so it appears behind the node */}
              {!isProjectStart && createDeliverablePieRing(milestone._id, pos.x, pos.y)}
              
              {/* Node circle - make project start slightly larger */}
              <motion.circle
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={!isProjectStart ? { 
                  scale: 1.08,
                  transition: { duration: 0.2, ease: "easeOut" }
                } : {}}
                transition={{ duration: 0.3, ease: "easeOut" }}
                cx={pos.x}
                cy={pos.y}
                r={isProjectStart ? 55 : 50}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={isProjectStart ? 3 : milestone.isCritical ? 3 : 2.5}
                className={isProjectStart ? "cursor-default" : "cursor-pointer"}
                style={{ 
                  filter: milestone.isCritical ? 'drop-shadow(0 2px 4px rgba(220, 38, 38, 0.3))' : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
                  transformOrigin: 'center',
                  transformBox: 'fill-box'
                }}
                onClick={() => !isProjectStart && onMilestoneClick && onMilestoneClick(milestone)}
              />
              
              {/* Critical path indicator */}
              {milestone.isCritical && (
                <g>
                  <circle
                    cx={pos.x - 30}
                    cy={pos.y - 30}
                    r={12}
                    fill="#dc2626"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                  <text
                    x={pos.x - 30}
                    y={pos.y - 26}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    !
                  </text>
                </g>
              )}

              {/* Node label */}
              <foreignObject
                x={pos.x - 45}
                y={pos.y - 20}
                width={90}
                height={40}
                className="pointer-events-none"
              >
                <div className="flex items-center justify-center h-full">
                  <p className="text-white text-xs font-semibold text-center leading-tight drop-shadow-md px-1">
                    {milestone.name.length > 20 
                      ? milestone.name.substring(0, 20) + '...' 
                      : milestone.name}
                  </p>
                </div>
              </foreignObject>

              {/* Duration/Slack info below node */}
              <text
                x={pos.x}
                y={pos.y + 70}
                textAnchor="middle"
                fill="#4b5563"
                fontSize="12"
                fontWeight="500"
              >
                {isProjectStart && milestone.startDate 
                  ? new Date(milestone.startDate).toLocaleDateString()
                  : milestone.duration 
                    ? `${milestone.duration}d` 
                    : 'Fixed'}
                {!isProjectStart && milestone.slack > 0 && ` (${milestone.slack}d slack)`}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-6 p-5 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-sm font-semibold text-gray-800 mb-4">Legend</div>
        
        {/* Milestone Status */}
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-600 mb-2">Milestone Status</div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-600 rounded-full border-2 border-purple-800"></div>
              <span>Project Start</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-red-800"></div>
              <span>Critical Path</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 rounded-full border-2 border-white"></div>
              <span>Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white"></div>
              <span>Not Started</span>
            </div>
          </div>
        </div>

        {/* Deliverable Rings */}
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-600 mb-2">Deliverable Ring Status</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <svg width="24" height="24">
                <circle cx="12" cy="12" r="8" fill="none" stroke="#10b981" strokeWidth="4" />
              </svg>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="24" height="24">
                <circle cx="12" cy="12" r="8" fill="none" stroke="#3b82f6" strokeWidth="4" />
              </svg>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="24" height="24">
                <circle cx="12" cy="12" r="8" fill="none" stroke="#f97316" strokeWidth="4" />
              </svg>
              <span>Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="24" height="24">
                <circle cx="12" cy="12" r="8" fill="none" stroke="#d1d5db" strokeWidth="4" />
              </svg>
              <span>Not Started</span>
            </div>
          </div>
        </div>

        {/* Dependencies */}
        <div className="pt-3 border-t border-gray-200">
          <div className="text-xs font-medium text-gray-600 mb-2">Dependencies</div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <svg width="35" height="16">
                <line x1="2" y1="8" x2="24" y2="8" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 30 8 L 25 5.5 L 25 10.5 Z" fill="#dc2626" />
              </svg>
              <span>Critical path</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="35" height="16">
                <line x1="2" y1="8" x2="24" y2="8" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
                <path d="M 30 8 L 25 5.5 L 25 10.5 Z" fill="#9ca3af" />
              </svg>
              <span>Standard dependency</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        💡 Click on any milestone node to edit it
      </div>
    </div>
  );
}

MilestoneNetworkGraph.propTypes = {
  milestones: PropTypes.array,
  onMilestoneClick: PropTypes.func,
  projectStartDate: PropTypes.string,
  deliverables: PropTypes.object
};

MilestoneNetworkGraph.defaultProps = {
  milestones: [],
  onMilestoneClick: null,
  projectStartDate: null,
  deliverables: {}
};

export default MilestoneNetworkGraph;
