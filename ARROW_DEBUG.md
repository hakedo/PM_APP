# Debugging Arrow Display Issue

## Problem
Arrow not showing from "Planning" to "Design" even though Design depends on Planning.

## Added Debugging

### 1. MilestoneNetworkGraph Component Logging

**When milestones are received:**
```javascript
console.log('MilestoneNetworkGraph received milestones:', milestones);
milestones.forEach(m => {
  console.log(`Milestone ${m.name}:`, {
    id: m._id,
    dependencies: m.dependencies,
    isCritical: m.isCritical
  });
});
```

**When layout is calculated:**
```javascript
console.log('Calculated layout:', layout);
```

**When drawing arrows:**
```javascript
console.log(`Arrow from ${actualDepId} to ${milestone._id}`, { 
  dependency: depId, 
  actualDepId,
  positions: Object.keys(positions) 
});
```

**When arrow coordinates are calculated:**
```javascript
console.log('Drawing arrow:', { fromX, fromY, toX, toY, fromId: from.id, toId: to.id, isCritical });
```

## What to Check in Console

1. **Milestone IDs**: Are they strings or ObjectIds?
2. **Dependency Format**: Is `dependencies` array containing strings or objects?
3. **Position Keys**: Do the keys in `positions` object match the dependency IDs?
4. **Arrow Drawing**: Is `drawArrow` being called with correct coordinates?

## Expected Console Output

```
MilestoneNetworkGraph received milestones: [...]

Milestone Planning: {
  id: "671234abcd...",
  dependencies: [],
  isCritical: true
}

Milestone Design: {
  id: "671234efgh...",
  dependencies: ["671234abcd..."],  // Should match Planning's ID
  isCritical: true
}

Calculated layout: {
  "671234abcd...": { x: 200, y: 100, layer: 0 },
  "671234efgh...": { x: 200, y: 250, layer: 1 }
}

Arrow from 671234abcd... to 671234efgh... {
  dependency: "671234abcd...",
  actualDepId: "671234abcd...",
  positions: ["671234abcd...", "671234efgh..."]
}

Drawing arrow: {
  fromX: 200,
  fromY: 150,
  toX: 200,
  toY: 200,
  fromId: "671234abcd...",
  toId: "671234efgh...",
  isCritical: true
}
```

## Common Issues & Solutions

### Issue 1: ID Mismatch
**Symptom**: `No position found for dependency`
**Cause**: Dependency ID doesn't match milestone ID
**Solution**: Ensure both use same ID format (string vs ObjectId)

### Issue 2: Dependencies as Objects
**Symptom**: `actualDepId` shows `[object Object]`
**Cause**: API populated dependencies with full objects
**Solution**: Backend should return IDs only, or frontend should extract `_id`

### Issue 3: Wrong Layer Assignment
**Symptom**: Nodes overlap or arrows go backwards
**Cause**: Topological sort failed or circular dependency
**Solution**: Check dependency chain is acyclic

### Issue 4: Position Not Calculated
**Symptom**: `fromPos` or `toPos` is null
**Cause**: Layout calculation skipped that milestone
**Solution**: Ensure all milestones are included in layout calculation

## Fix Applied

Enhanced dependency ID extraction:
```javascript
const actualDepId = typeof depId === 'object' ? (depId._id || depId.id) : depId;
```

This handles both:
- String IDs: `"671234abcd..."`
- Object refs: `{ _id: "671234abcd...", name: "Planning" }`
- Objects with `id`: `{ id: "671234abcd...", name: "Planning" }`

## Next Steps

1. Open browser console (F12)
2. Navigate to project deliverables section
3. Look for the debug logs
4. Share the console output to identify the exact issue
5. Once identified, remove debug logs and apply permanent fix

## Temporary Files Modified

- `frontend/src/components/milestoneNetworkGraph.jsx` - Added extensive logging

Once the issue is identified, these debug logs should be removed for production.
