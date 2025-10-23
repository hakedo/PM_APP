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
  DatePicker
} from '../ui';
import { Loader2 } from 'lucide-react';

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
  mode = 'create' 
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'New Deliverable' : 'Edit Deliverable'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new deliverable for this project'
              : 'Update deliverable information'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={deliverable.name}
                onChange={(e) => onChange({ ...deliverable, name: e.target.value })}
                required
                placeholder="Enter deliverable name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <DatePicker
                  value={deliverable.startDate}
                  onChange={(date) => onChange({ ...deliverable, startDate: date })}
                  placeholder="Select start date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <DatePicker
                  value={deliverable.endDate}
                  onChange={(date) => onChange({ ...deliverable, endDate: date })}
                  placeholder="Select end date"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={deliverable.status}
                  onValueChange={(value) => onChange({ ...deliverable, status: value })}
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Input
                  id="assignee"
                  name="assignee"
                  value={deliverable.assignee}
                  onChange={(e) => onChange({ ...deliverable, assignee: e.target.value })}
                  placeholder="Unassigned"
                />
              </div>
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
              {mode === 'create' ? 'Create Deliverable' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
