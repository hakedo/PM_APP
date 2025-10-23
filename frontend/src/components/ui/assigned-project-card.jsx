import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, FolderKanban } from 'lucide-react';
import { formatDateDisplay } from '../../utils/dateUtils';

export function AssignedProjectCard({ project, onClick }) {
  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200"
      onClick={() => onClick(project._id)}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
            <FolderKanban className="w-5 h-5 text-white" />
          </div>
          <span className="line-clamp-1">{project.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {project.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>
            {formatDateDisplay(project.startDate)} - {formatDateDisplay(project.endDate)}
          </span>
        </div>
        {project.milestones && project.milestones.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {project.milestones.length} Milestone{project.milestones.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
