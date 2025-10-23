import { Loader2, Save, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { MilestoneFormFields, DeliverableFormFields, TaskFormFields } from './';

function TimelineDialog({
  open,
  onOpenChange,
  type, // 'milestone', 'deliverable', 'task'
  mode, // 'add' or 'edit'
  data,
  onDataChange,
  onSave,
  onDelete,
  teamMembers,
  parentMilestone,
  parentDeliverable
}) {
  const getTitle = () => {
    if (mode === 'edit') {
      if (type === 'milestone') return 'Edit Milestone';
      if (type === 'deliverable') return 'Edit Deliverable';
      if (type === 'task') return 'Edit Task';
    } else {
      if (type === 'milestone') return 'Add Milestone';
      if (type === 'deliverable') return 'Add Deliverable';
      if (type === 'task') return 'Add Task';
    }
    return '';
  };

  const getDescription = () => {
    if (type === 'milestone') {
      return 'Milestones organize your project timeline and contain deliverables';
    }
    if (type === 'deliverable') {
      return `Add a deliverable to ${parentMilestone?.name || 'this milestone'}`;
    }
    if (type === 'task') {
      return `Add a task to ${parentDeliverable?.title || 'this deliverable'}`;
    }
    return '';
  };

  const handleSave = () => {
    onSave();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      onDelete();
    }
  };

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          {mode === 'add' && <DialogDescription>{getDescription()}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4 py-4">
          {type === 'milestone' && (
            <MilestoneFormFields
              milestone={data}
              onMilestoneChange={onDataChange}
              teamMembers={teamMembers}
            />
          )}

          {type === 'deliverable' && (
            <DeliverableFormFields
              deliverable={data}
              onDeliverableChange={onDataChange}
            />
          )}

          {type === 'task' && (
            <TaskFormFields
              task={data}
              onTaskChange={onDataChange}
            />
          )}
        </div>

        <DialogFooter className="gap-2">
          {mode === 'edit' && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="mr-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TimelineDialog;
