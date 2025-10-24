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
import { useState } from 'react';
import { extractDateForInput } from '@/utils/dateUtils';

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

  // Validate start date
  const handleStartDateChange = (date) => {
    if (projectStartDate) {
      const projectStart = new Date(projectStartDate);
      const selectedDate = new Date(date);
      
      if (selectedDate < projectStart) {
        setStartDateError(`Start date cannot be earlier than project start date (${extractDateForInput(projectStartDate)})`);
      } else {
        setStartDateError('');
      }
    }
    onChange({ ...deliverable, startDate: date });
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
              />
              {startDateError && (
                <p className="text-xs text-red-600 mt-0.5">{startDateError}</p>
              )}
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
              className="h-9"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !!startDateError} className="h-9">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'create' ? 'Create Deliverable' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
