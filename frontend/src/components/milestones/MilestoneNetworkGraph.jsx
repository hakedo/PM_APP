import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Edit2 } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * MilestoneNetworkGraph Component
 * Displays milestones as a network graph with nodes and dependency arrows
 */
function MilestoneNetworkGraph({ milestones = [], onMilestoneClick }) {
  const svgRef = useRef(null);
  const [positions, setPositions] = useState({});
  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 });

  useEffect(() => {
    console.log('MilestoneNetworkGraph received milestones:', milestones);
    milestones.forEach(m => {
      console.log(`Milestone ${m.name}:`, {
        id: m._id,
        dependencies: m.dependencies,
        isCritical: m.isCritical
      });
    });
    
    if (milestones.length === 0) return;

    // Calculate node positions using a layered layout
    const layout = calculateLayout(milestones);
    console.log('Calculated layout:', layout);
    setPositions(layout);
  }, [milestones]);

  // Calculate layered layout for nodes
  function calculateLayout(nodes) {
    if (nodes.length === 0) return {};

    // Create adjacency map for dependencies
    const adjacencyMap = new Map();
    nodes.forEach(node => {
      adjacencyMap.set(node._id, node.dependencies || []);
    });

    // Assign layers using topological sort
    const layers = assignLayers(nodes, adjacencyMap);
    
    // Calculate positions
    const layout = {};
    const padding = 100;
    const nodeRadius = 50;
    const horizontalSpacing = 200;
    const verticalSpacing = 150;

    // Calculate layer widths for centering
    const layerCounts = new Map();
    layers.forEach(layer => {
      layerCounts.set(layer, (layerCounts.get(layer) || 0) + 1);
    });

    const layerIndices = new Map();
    nodes.forEach((node, idx) => {
      const layer = layers.get(node._id);
      const indexInLayer = layerIndices.get(layer) || 0;
      layerIndices.set(layer, indexInLayer + 1);

      const layerCount = layerCounts.get(layer);
      const totalWidth = layerCount * horizontalSpacing;
      const startX = (dimensions.width - totalWidth) / 2;

      layout[node._id] = {
        x: startX + indexInLayer * horizontalSpacing + horizontalSpacing / 2,
        y: padding + layer * verticalSpacing,
        layer
      };
    });

    return layout;
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

  // Draw arrow between two points
  function drawArrow(from, to, isCritical) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    
    // Shorten line to account for node radius
    const nodeRadius = 50;
    const fromX = from.x + Math.cos(angle) * nodeRadius;
    const fromY = from.y + Math.sin(angle) * nodeRadius;
    const toX = to.x - Math.cos(angle) * nodeRadius;
    const toY = to.y - Math.sin(angle) * nodeRadius;

    // Arrow head
    const arrowLength = 12;
    const arrowWidth = 8;
    const arrowAngle1 = angle - Math.PI + Math.PI / 6;
    const arrowAngle2 = angle - Math.PI - Math.PI / 6;
    
    const arrowX1 = toX + Math.cos(arrowAngle1) * arrowLength;
    const arrowY1 = toY + Math.sin(arrowAngle1) * arrowLength;
    const arrowX2 = toX + Math.cos(arrowAngle2) * arrowLength;
    const arrowY2 = toY + Math.sin(arrowAngle2) * arrowLength;

    console.log('Drawing arrow:', { fromX, fromY, toX, toY, fromId: from.id, toId: to.id, isCritical });
    
    return (
      <g key={`arrow-${from.id}-to-${to.id}`}>
        {/* Line */}
        <line
          x1={fromX}
          y1={fromY}
          x2={toX}
          y2={toY}
          stroke={isCritical ? '#ef4444' : '#6b7280'}
          strokeWidth={isCritical ? 3 : 2}
        />
        {/* Arrow head */}
        <polygon
          points={`${toX},${toY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
          fill={isCritical ? '#ef4444' : '#6b7280'}
        />
      </g>
    );
  }

  if (milestones.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No milestones yet. Create your first milestone to get started.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-auto bg-gray-50 rounded-lg border border-gray-200 p-4">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="mx-auto"
      >
        {/* Draw dependency arrows first (so they appear behind nodes) */}
        {milestones.map(milestone => {
          if (!milestone.dependencies || milestone.dependencies.length === 0) return null;
          
          const toPos = positions[milestone._id];
          if (!toPos) {
            console.log('No position found for milestone:', milestone.name, milestone._id);
            return null;
          }

          return milestone.dependencies.map((depId, idx) => {
            // Handle both string IDs and populated objects
            const actualDepId = typeof depId === 'object' ? (depId._id || depId.id) : depId;
            console.log(`Arrow from ${actualDepId} to ${milestone._id}`, { 
              dependency: depId, 
              actualDepId,
              positions: Object.keys(positions) 
            });
            
            const fromPos = positions[actualDepId];
            if (!fromPos) {
              console.log('No position found for dependency:', actualDepId, depId);
              return null;
            }

            const depMilestone = milestones.find(m => m._id === actualDepId);
            const isCriticalPath = milestone.isCritical && depMilestone?.isCritical;

            return drawArrow(
              { x: fromPos.x, y: fromPos.y, id: actualDepId },
              { x: toPos.x, y: toPos.y, id: milestone._id },
              isCriticalPath
            );
          });
        })}

        {/* Draw nodes */}
        {milestones.map(milestone => {
          const pos = positions[milestone._id];
          if (!pos) return null;

          const statusColors = {
            'completed': '#10b981',
            'in-progress': '#3b82f6',
            'blocked': '#f97316',
            'not-started': '#9ca3af'
          };

          const fillColor = milestone.isCritical ? '#ef4444' : statusColors[milestone.status] || '#9ca3af';
          
          return (
            <g key={milestone._id}>
              {/* Node circle */}
              <motion.circle
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                cx={pos.x}
                cy={pos.y}
                r={50}
                fill={fillColor}
                stroke={milestone.isCritical ? '#991b1b' : '#fff'}
                strokeWidth={milestone.isCritical ? 4 : 3}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onMilestoneClick && onMilestoneClick(milestone)}
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
                {milestone.duration ? `${milestone.duration}d` : 'Fixed'}
                {milestone.slack > 0 && ` (${milestone.slack}d slack)`}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
        <div className="text-sm font-semibold text-gray-700 mb-3">Legend</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
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
        <div className="mt-3 pt-3 border-t border-gray-300 flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <svg width="30" height="10">
              <line x1="0" y1="5" x2="25" y2="5" stroke="#ef4444" strokeWidth="3" />
              <polygon points="25,5 20,2 20,8" fill="#ef4444" />
            </svg>
            <span>Critical dependency</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="30" height="10">
              <line x1="0" y1="5" x2="25" y2="5" stroke="#6b7280" strokeWidth="2" />
              <polygon points="25,5 20,2 20,8" fill="#6b7280" />
            </svg>
            <span>Dependency</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-600 text-center">
        Click on any milestone node to edit it
      </div>
    </div>
  );
}

MilestoneNetworkGraph.propTypes = {
  milestones: PropTypes.array,
  onMilestoneClick: PropTypes.func
};

MilestoneNetworkGraph.defaultProps = {
  milestones: [],
  onMilestoneClick: null
};

export default MilestoneNetworkGraph;
