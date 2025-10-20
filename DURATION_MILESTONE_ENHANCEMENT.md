# Duration-Based Milestone Enhancement

## Overview
Enhanced the milestone creation system to properly support duration-based milestones with flexible start date options.

## Changes Made

### Frontend (`MilestoneForm.jsx`)

#### New Form Fields
- **`startDateType`**: Radio selection between 'dependency' or 'custom'
- **`startDateOffset`**: Number of days to wait after dependency completion (default: 0)

#### Updated UI
When creating a **Duration-based milestone**, users can now specify:

1. **After dependency completion** (default)
   - Start immediately after dependencies finish (0 days)
   - Or add a delay (e.g., 3 days after completion)

2. **Custom start date**
   - Set a specific calendar date
   - Useful for milestones that must start on a particular day regardless of dependencies

#### Validation
- Duration must be > 0
- Duration-based milestones require at least one dependency
- Custom start date requires a date to be selected

### Backend (`Milestone.js` Model)

#### New Schema Fields
```javascript
customStartDate: {
  type: Date,
  required: false
}

startDateOffset: {
  type: Number,
  required: false,
  min: [0, 'Start date offset cannot be negative'],
  default: 0
}
```

### CPM Calculator (`cpm.js`)

#### Updated Forward Pass Logic
The calculation now handles three scenarios:

1. **Fixed-date milestones**: Use `startDate` and `endDate`
2. **Duration-based with custom start**: Use `customStartDate` + `duration`
3. **Duration-based after dependencies**: Use dependency's `earliestFinish` + `startDateOffset` + `duration`

```javascript
if (current.customStartDate) {
  current.earliestStart = new Date(current.customStartDate);
} else if (maxFinish) {
  const offset = current.startDateOffset || 0;
  current.earliestStart = addDays(maxFinish, offset);
}
```

## Usage Examples

### Example 1: Immediate Start After Dependencies
```
Planning (PLN) → 10 days
  ↓ (0 days offset)
Design (DSN) → 15 days
```
Design starts immediately when Planning completes.

### Example 2: Delayed Start
```
Contract Signing (SGN) → fixed date
  ↓ (5 days offset)
Procurement (PRC) → 7 days
```
Procurement starts 5 days after contract is signed (e.g., shipping time).

### Example 3: Custom Start Date
```
Initial Research (RSH) → 5 days
  ↓
Development (DEV) → 20 days, starts on Jan 15, 2025
```
Development is linked to Research but must start on a specific date (e.g., when team becomes available).

## Benefits

1. **More Realistic Scheduling**: Accounts for delays between milestone completions
2. **Flexibility**: Mix automatic and manual scheduling as needed
3. **Better Planning**: Model real-world constraints (shipping, availability, etc.)
4. **Cleaner UI**: All options visible without clutter

## Migration Notes

- Existing milestones are unaffected
- New fields default to 0 (immediate start) for backward compatibility
- CPM calculation automatically handles both old and new milestone types
