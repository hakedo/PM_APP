# Quick Test Guide: Smart Dependency Reassignment

## Setup Test Scenario

To test the smart dependency reassignment feature, create this milestone structure:

```
M1 (Start) → M2 (Middle) → M3 (End)
```

### Step 1: Create Milestones
1. Navigate to a project
2. Create three milestones:
   - **M1**: Name: "Project Kickoff", Duration: 5 days
   - **M2**: Name: "Design Phase", Duration: 10 days, Dependencies: [M1]
   - **M3**: Name: "Development", Duration: 15 days, Dependencies: [M2]

## Test Case 1: Automatic Reassignment (Simple Chain)

**Scenario**: Delete M2 which has one incoming and one outgoing dependency

1. Click **Delete** on "Design Phase" (M2)
2. Confirm the initial deletion dialog
3. **Expected Result**: 
   - Dependency dialog appears
   - Shows: "Project Kickoff depends on this milestone"
   - Blue box with: "Recommended Action: Reassign all dependents to Development"
   - Button: "Delete Milestone"
4. Click **Delete Milestone**
5. **Expected Result**:
   - Dialog closes
   - M2 is deleted
   - M1 now depends on M3 (Project Kickoff → Development)
   - Network graph updates to show M1 → M3

## Test Case 2: Multiple Dependencies (User Choice)

**Setup**: Create this structure:
```
M1 → M2 → M3
       ↘ M4
```

1. Create M4: Name: "Testing", Duration: 5 days
2. Edit M2 to depend on both M3 and M4
3. Click **Delete** on M2
4. Confirm initial deletion
5. **Expected Result**:
   - Dependency dialog appears
   - Shows: "This milestone has multiple dependencies. Please choose..."
   - Radio buttons:
     - ○ Development
     - ○ Testing
     - ○ No dependency
6. Select "Development"
7. Click **Delete Milestone**
8. **Expected Result**:
   - M2 deleted
   - M1 now depends on M3

## Test Case 3: End Node (Remove Dependency)

**Setup**: Create two milestones:
```
M1 → M2 (no further dependencies)
```

1. Try to delete M2
2. Confirm initial deletion
3. **Expected Result**:
   - Dependency dialog appears
   - Shows: "M1 depends on this milestone"
   - Blue box: "Remove this dependency (M1 will have no dependencies)"
4. Click **Delete Milestone**
5. **Expected Result**:
   - M2 deleted
   - M1 has no dependencies (independent milestone)

## Verification Checklist

After each deletion:
- [ ] Deleted milestone is removed from sidebar
- [ ] Network graph updates correctly
- [ ] Timeline grid reflects new structure
- [ ] No console errors in browser
- [ ] CPM calculations update (check start/end dates)
- [ ] Dependent milestones show correct new dependencies
- [ ] No duplicate dependencies in any milestone

## Edge Cases to Test

1. **Cancel at any point**:
   - Click Cancel in dependency dialog → Nothing changes
   
2. **No selection with multiple options**:
   - Don't select any radio button → "Delete Milestone" button should be disabled
   
3. **Deliverables and tasks**:
   - Add deliverables/tasks to M2 → Delete M2 → All should cascade delete

4. **Multiple dependents**:
   ```
   M1 → M2 → M3
   M4 ↗
   ```
   - Delete M2 → Both M1 and M4 should get reassigned to M3

## Expected API Responses

### Conflict Response (Single Dependency):
```json
{
  "error": "Dependency conflict",
  "message": "Other milestones depend on this milestone.",
  "canAutoReassign": true,
  "suggestion": {
    "type": "automatic",
    "description": "Reassign all dependents to 'Development'",
    "newDependency": "milestone-id-m3"
  },
  "dependents": [
    { "id": "m1-id", "name": "Project Kickoff", "currentDependencies": ["m2-id"] }
  ],
  "milestoneDependencies": ["m3-id"]
}
```

### Conflict Response (Multiple Dependencies):
```json
{
  "error": "Dependency conflict",
  "message": "Other milestones depend on this milestone.",
  "canAutoReassign": false,
  "requiresUserChoice": true,
  "description": "This milestone has multiple dependencies. Please choose which one to reassign dependents to.",
  "options": [
    { "id": "m3-id", "name": "Development", "description": "..." },
    { "id": "m4-id", "name": "Testing", "description": "..." }
  ],
  "dependents": [
    { "id": "m1-id", "name": "Project Kickoff", "currentDependencies": ["m2-id"] }
  ],
  "milestoneDependencies": ["m3-id", "m4-id"]
}
```

## Common Issues & Solutions

**Issue**: Dialog doesn't appear when deleting
- **Check**: Backend is running on port 5050
- **Check**: Frontend is running on port 5174
- **Check**: No CORS errors in browser console

**Issue**: "Delete Milestone" button always disabled
- **Fix**: Select a radio option or check if auto-selected

**Issue**: Network graph doesn't update
- **Check**: fetchMilestones() is called after successful deletion
- **Check**: Component re-renders with updated milestone data

**Issue**: 400 error instead of 409
- **Check**: Backend route changes deployed (nodemon restart)
- **Check**: Request body is being sent with DELETE request
