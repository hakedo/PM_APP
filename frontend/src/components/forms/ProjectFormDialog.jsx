import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { ProjectFormFields } from './ProjectFormFields';

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onChange,
  onSubmit,
  loading = false,
  title = "New Project",
  description = "Create a new project"
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ProjectFormFields project={project} onChange={onChange} />
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
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
