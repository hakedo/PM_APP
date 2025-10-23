import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Button, Input, Label, DatePicker } from '../ui';
import { Loader2 } from 'lucide-react';

export function TaskFormDialog({ 
  open, 
  onOpenChange, 
  task, 
  onChange, 
  onSubmit, 
  loading = false,
  mode = 'create' 
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <DatePicker
                value={task.dueDate}
                onChange={(date) => onChange({ ...task, dueDate: date })}
                placeholder="Select due date"
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
