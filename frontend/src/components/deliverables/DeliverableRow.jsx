import { useState } from 'react';
import { ChevronRight, ChevronDown, MoreVertical, Plus, Edit2, Trash2, Check, Circle, Calendar } from 'lucide-react';
import { 
  Badge, 
  Button, 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  Checkbox,
  DatePicker,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '../ui';
import { cn } from '@/lib/utils';
import { formatDateDisplay } from '@/utils/dateUtils';

const statusConfig = {
  'not-started': { label: 'Not Started', variant: 'secondary', color: 'text-gray-600' },
  'in-progress': { label: 'In Progress', variant: 'default', color: 'text-blue-600' },
  'completed': { label: 'Completed', variant: 'default', color: 'text-green-600' },
  'blocked': { label: 'Blocked', variant: 'destructive', color: 'text-red-600' }
};

export function DeliverableRow({ 
  deliverable, 
  tasks = [],
  onEdit, 
  onDelete, 
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onUpdateField
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;

  const handleFieldUpdate = (field, value) => {
    if (onUpdateField) {
      onUpdateField(deliverable._id, { [field]: value });
    }
  };

  return (
    <div className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50 transition-colors">
      {/* Deliverable Row */}
      <div className="flex items-center gap-2 px-4 py-3 group">
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center w-6 h-6 hover:bg-gray-200 rounded transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Name */}
        <div className="flex-1 min-w-0 font-medium text-gray-900">
          {deliverable.name}
        </div>

        {/* Timeline */}
        <div className="w-48 text-sm flex items-center gap-1">
          <DatePicker
            value={deliverable.startDate}
            onChange={(date) => handleFieldUpdate('startDate', date)}
            placeholder="Start date"
            className="h-8 text-sm border-0 shadow-none hover:bg-gray-100 px-2"
          />
          <span className="text-gray-400">→</span>
          <DatePicker
            value={deliverable.endDate}
            onChange={(date) => handleFieldUpdate('endDate', date)}
            placeholder="End date"
            className="h-8 text-sm border-0 shadow-none hover:bg-gray-100 px-2"
          />
        </div>

        {/* Status */}
        <div className="w-32">
          <Select
            value={deliverable.status}
            onValueChange={(value) => handleFieldUpdate('status', value)}
          >
            <SelectTrigger className="h-7 border-0 shadow-none hover:bg-gray-100">
              <Badge 
                variant={statusConfig[deliverable.status].variant}
                className={cn("text-xs pointer-events-none", statusConfig[deliverable.status].color)}
              >
                {statusConfig[deliverable.status].label}
              </Badge>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assignee */}
        <div className="w-32">
          <Input
            value={deliverable.assignee || ''}
            onChange={(e) => handleFieldUpdate('assignee', e.target.value)}
            onBlur={(e) => handleFieldUpdate('assignee', e.target.value)}
            placeholder="Unassigned"
            className="h-7 border-0 shadow-none hover:bg-gray-100 focus:bg-white focus:border focus:border-gray-200 text-sm"
          />
        </div>

        {/* Tasks Count */}
        <div className="w-20 text-xs text-gray-500">
          {completedTasks}/{totalTasks}
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon-sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAddTask(deliverable._id)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(deliverable)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(deliverable._id)}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Expanded Tasks */}
      {isExpanded && (
        <div className="bg-gray-50/50 border-t border-gray-200">
          {tasks.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-500 mb-3">No tasks yet</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onAddTask(deliverable._id)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add First Task
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <div 
                  key={task._id}
                  className="flex items-center gap-2 px-4 py-2 pl-12 hover:bg-gray-100/50 transition-colors group"
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={task.status === 'completed'}
                    onCheckedChange={() => onToggleTask(deliverable._id, task._id, task.status)}
                    className="flex-shrink-0"
                  />

                  {/* Task Name */}
                  <div className={cn(
                    "flex-1 min-w-0 text-sm",
                    task.status === 'completed' ? "line-through text-gray-500" : "text-gray-900"
                  )}>
                    {task.name}
                  </div>

                  {/* Due Date */}
                  <div className="w-32 text-xs text-gray-600">
                    {formatDateDisplay(task.dueDate)}
                  </div>

                  {/* Status Icon */}
                  <div className="w-20 flex items-center justify-center">
                    {task.status === 'completed' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {/* Task Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon-sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditTask(deliverable._id, task)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDeleteTask(deliverable._id, task._id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
