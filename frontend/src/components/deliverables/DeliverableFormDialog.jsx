import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  Button, 
  Input, 
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  InlineDatePicker
} from '../ui';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDateForInput } from '@/utils/dateUtils';

const statusOptions = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' }
];

export function DeliverableFormDialog({ 
  open, 
  onOpenChange, 
  deliverable, 
  onChange, 
  onSubmit, 
  loading = false,
  mode = 'create',
  projectStartDate,
  projectEndDate
}) {
  const [startDateError, setStartDateError] = useState('');

  // Clear error when dialog opens or closes
  useEffect(() => {
    if (!open) {
      setStartDateError('');
    }
  }, [open]);

  // Validate if a start date is valid (returns true if valid, false if invalid)
  const validateStartDate = (date) => {
    if (!date || !projectStartDate) return true; // No validation if no date or no project start
    
    // Parse project start date properly
    let projectStart;
    if (typeof projectStartDate === 'string') {
      // If it's YYYY-MM-DD format, parse correctly
      if (projectStartDate.length === 10 && projectStartDate.includes('-')) {
        const [year, month, day] = projectStartDate.split('-').map(Number);
        projectStart = new Date(year, month - 1, day);
      } else {
        projectStart = new Date(projectStartDate);
      }
    } else {
      projectStart = new Date(projectStartDate);
    }
    projectStart.setHours(0, 0, 0, 0);
    
    // Parse selected date
    let selectedDate;
    if (typeof date === 'string') {
      if (date.length === 10 && date.includes('-')) {
        const [year, month, day] = date.split('-').map(Number);
        selectedDate = new Date(year, month - 1, day);
      } else {
        selectedDate = new Date(date);
      }
    } else {
      selectedDate = new Date(date);
    }
    selectedDate.setHours(0, 0, 0, 0);
    
    console.log('Validating start date:', {
      date,
      projectStartDate,
      selectedDate: selectedDate.toISOString(),
      projectStart: projectStart.toISOString(),
      isValid: selectedDate >= projectStart
    });
    
    return selectedDate >= projectStart;
  };

  // Validate start date
  const handleStartDateChange = (date) => {
    // Only validate if there's actually a date and a project start date
    if (date && projectStartDate) {
      // Parse project start date properly
      let projectStart;
      if (typeof projectStartDate === 'string') {
        if (projectStartDate.length === 10 && projectStartDate.includes('-')) {
          const [year, month, day] = projectStartDate.split('-').map(Number);
          projectStart = new Date(year, month - 1, day);
        } else {
          projectStart = new Date(projectStartDate);
        }
      } else {
        projectStart = new Date(projectStartDate);
      }
      projectStart.setHours(0, 0, 0, 0);
      
      // Parse selected date
      let selectedDate;
      if (typeof date === 'string') {
        if (date.length === 10 && date.includes('-')) {
          const [year, month, day] = date.split('-').map(Number);
          selectedDate = new Date(year, month - 1, day);
        } else {
          selectedDate = new Date(date);
        }
      } else {
        selectedDate = new Date(date);
      }
      selectedDate.setHours(0, 0, 0, 0);
      
      console.log('Checking date error:', {
        date,
        projectStartDate,
        selectedDate: selectedDate.toISOString(),
        projectStart: projectStart.toISOString(),
        shouldError: selectedDate < projectStart
      });
      
      if (selectedDate < projectStart) {
        // Format project start date for display
        const displayDate = typeof projectStartDate === 'string' && projectStartDate.length === 10 
          ? projectStartDate 
          : formatDateForInput(projectStartDate);
        setStartDateError(`Start date cannot be earlier than project start date (${displayDate})`);
      } else {
        setStartDateError('');
      }
    } else {
      // Clear error if no date is selected
      setStartDateError('');
    }
    onChange({ ...deliverable, startDate: date });
  };

  // Handle both dates change (also validates and clears errors)
  const handleBothDatesChange = (start, end) => {
    // Validate start date and set/clear error
    if (start && projectStartDate) {
      // Parse project start date properly
      let projectStart;
      if (typeof projectStartDate === 'string') {
        if (projectStartDate.length === 10 && projectStartDate.includes('-')) {
          const [year, month, day] = projectStartDate.split('-').map(Number);
          projectStart = new Date(year, month - 1, day);
        } else {
          projectStart = new Date(projectStartDate);
        }
      } else {
        projectStart = new Date(projectStartDate);
      }
      projectStart.setHours(0, 0, 0, 0);
      
      // Parse selected date
      let selectedDate;
      if (typeof start === 'string') {
        if (start.length === 10 && start.includes('-')) {
          const [year, month, day] = start.split('-').map(Number);
          selectedDate = new Date(year, month - 1, day);
        } else {
          selectedDate = new Date(start);
        }
      } else {
        selectedDate = new Date(start);
      }
      selectedDate.setHours(0, 0, 0, 0);
      
      console.log('handleBothDatesChange validation:', {
        start,
        projectStartDate,
        selectedDate: selectedDate.toISOString(),
        projectStart: projectStart.toISOString(),
        shouldError: selectedDate < projectStart
      });
      
      if (selectedDate < projectStart) {
        // Format project start date for display
        const displayDate = typeof projectStartDate === 'string' && projectStartDate.length === 10 
          ? projectStartDate 
          : formatDateForInput(projectStartDate);
        setStartDateError(`Start date cannot be earlier than project start date (${displayDate})`);
      } else {
        setStartDateError('');
      }
    } else {
      setStartDateError('');
    }
    
    onChange({ ...deliverable, startDate: start, endDate: end });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (startDateError) {
      return;
    }
    onSubmit(e);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">
            {mode === 'create' ? 'New Deliverable' : 'Edit Deliverable'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {mode === 'create' 
              ? 'Create a new deliverable for this project'
              : 'Update deliverable information'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-medium">Name *</Label>
              <Input
                id="name"
                name="name"
                value={deliverable.name}
                onChange={(e) => onChange({ ...deliverable, name: e.target.value })}
                required
                placeholder="Enter deliverable name"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Timeline *</Label>
              <InlineDatePicker
                startDate={deliverable.startDate}
                endDate={deliverable.endDate}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={(date) => onChange({ ...deliverable, endDate: date })}
                onBothDatesChange={handleBothDatesChange}
                validateStartDate={validateStartDate}
                projectStartDate={projectStartDate}
              />
              <p className={`text-xs mt-0.5 min-h-[1.25rem] ${startDateError ? 'text-red-600' : 'text-transparent'}`}>
                {startDateError || 'No error'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="status" className="text-xs font-medium">Status</Label>
                <Select
                  value={deliverable.status}
                  onValueChange={(value) => onChange({ ...deliverable, status: value })}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="assignee" className="text-xs font-medium">Assignee</Label>
                <Input
                  id="assignee"
                  name="assignee"
                  value={deliverable.assignee}
                  onChange={(e) => onChange({ ...deliverable, assignee: e.target.value })}
                  placeholder="Unassigned"
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="h-9 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !!startDateError} 
              className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'create' ? 'Create Deliverable' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
