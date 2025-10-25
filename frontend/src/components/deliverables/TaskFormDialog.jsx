import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Button, Input, Label, DatePicker } from '../ui';
import { Loader2 } from 'lucide-react';

export function TaskFormDialog({ 
  open, 
  onOpenChange, 
  task, 
  onChange, 
  onSubmit, 
  loading = false,
  mode = 'create',
  deliverable
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'New Task' : 'Edit Task'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new task to this deliverable'
              : 'Update task information'
            }
            {deliverable && (
              <span className="block mt-2 text-blue-600 font-medium">
                Deliverable: {deliverable.name} ({formatDate(deliverable.startDate)} - {formatDate(deliverable.endDate)})
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskName">Task Name *</Label>
              <Input
                id="taskName"
                name="name"
                value={task.name}
                onChange={(e) => onChange({ ...task, name: e.target.value })}
                required
                placeholder="Enter task name"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">
                Due Date *
                {deliverable && (
                  <span className="text-xs text-gray-500 font-normal ml-2">
                    (Must be between {formatDate(deliverable.startDate)} and {formatDate(deliverable.endDate)})
                  </span>
                )}
              </Label>
              <DatePicker
                value={task.dueDate}
                onChange={(date) => onChange({ ...task, dueDate: date })}
                placeholder="Select due date"
                minDate={deliverable?.startDate}
                maxDate={deliverable?.endDate}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'create' ? 'Add Task' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
