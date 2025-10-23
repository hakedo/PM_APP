import { motion } from 'framer-motion';
import { Calendar, FolderKanban, MoreVertical, Trash2, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { formatDateDisplay } from '../../utils/dateUtils';

export function ProjectCard({ 
  project, 
  onClick, 
  onDelete,
  teamMembers = [],
  showActions = true 
}) {
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(project._id, project.title);
  };

  // Get assigned team member names
  const assignedMembers = project.teamMembers?.length || 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="h-full hover:shadow-xl transition-all duration-300 border-gray-200">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <FolderKanban className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{project.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1">
                  {project.description || 'No description'}
                </CardDescription>
              </div>
            </div>
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDateDisplay(project.startDate)} - {formatDateDisplay(project.endDate)}
            </span>
          </div>
          {assignedMembers > 0 && (
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-gray-600" />
              <Badge variant="secondary" className="text-xs">
                {assignedMembers} Team {assignedMembers === 1 ? 'Member' : 'Members'}
              </Badge>
            </div>
          )}
          {project.milestones && project.milestones.length > 0 && (
            <div className="pt-2 border-t">
              <Badge variant="outline" className="text-xs">
                {project.milestones.length} Milestone{project.milestones.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
