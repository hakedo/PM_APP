import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2 } from 'lucide-react';

export function GroupFormDialog({
  open,
  onOpenChange,
  groupName,
  onGroupNameChange,
  onSubmit,
  loading = false,
  title = "New Group",
  description = "Create a new deliverable group"
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name *</Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => onGroupNameChange(e.target.value)}
                placeholder="Enter group name"
                required
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Group
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
