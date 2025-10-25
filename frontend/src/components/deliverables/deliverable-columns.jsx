import { ChevronRight, ChevronDown, Package, MoreVertical, Edit2, Trash2, Plus, Clock, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, DateRangePicker } from '../ui';
import { cn } from '@/lib/utils';
import { formatDateDisplay } from '@/utils/dateUtils';
import { useState } from 'react';

const statusConfig = {
  'not-started': { 
    label: 'Not Started', 
    variant: 'secondary', 
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    hoverBg: 'hover:bg-gray-50',
    icon: Clock,
    iconColor: 'text-gray-500'
  },
  'in-progress': { 
    label: 'In Progress', 
    variant: 'default', 
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    hoverBg: 'hover:bg-blue-50',
    icon: Play,
    iconColor: 'text-blue-500'
  },
  'completed': { 
    label: 'Completed', 
    variant: 'default', 
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    hoverBg: 'hover:bg-green-50',
    icon: CheckCircle2,
    iconColor: 'text-green-500'
  },
  'blocked': { 
    label: 'Blocked', 
    variant: 'destructive', 
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    hoverBg: 'hover:bg-red-50',
    icon: AlertCircle,
    iconColor: 'text-red-500'
  }
};

export const createDeliverableColumns = ({
  onEdit,
  onDelete,
  onAddTask,
  onUpdateField,
  projectStartDate,
  tasksByDeliverable
}) => [
  {
    id: 'expander',
    header: () => null,
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => row.toggleExpanded()}
          className="hover:bg-blue-100 rounded transition-all hover:shadow-sm"
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="w-4 h-4 text-slate-700 group-hover:text-blue-600 transition-colors" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-blue-600 transition-colors" />
          )}
        </Button>
      );
    },
    size: 40,
    meta: {
      headerClassName: 'w-10 border-r border-gray-300',
      cellClassName: 'w-10 border-r border-gray-300'
    }
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const EditableNameCell = () => {
        const [isEditing, setIsEditing] = useState(false);
        const [name, setName] = useState(row.original.name);
        
        const handleSave = () => {
          if (name.trim() && name !== row.original.name) {
            onUpdateField(row.original._id, { name: name.trim() });
          } else {
            setName(row.original.name);
          }
          setIsEditing(false);
        };
        
        const handleKeyDown = (e) => {
          if (e.key === 'Enter') {
            handleSave();
          } else if (e.key === 'Escape') {
            setName(row.original.name);
            setIsEditing(false);
          }
        };

        return isEditing ? (
          <div className="flex items-center gap-2 -ml-1">
            <Package className="w-4 h-4 text-slate-600 flex-shrink-0" />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="h-7 font-semibold text-gray-900 border-blue-300 focus:border-blue-500"
              autoFocus
              autoComplete="off"
            />
          </div>
        ) : (
          <div 
            className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 -ml-1 pl-1 pr-2 py-1 rounded transition-all group/name"
            onClick={() => setIsEditing(true)}
          >
            <Package className="w-4 h-4 text-slate-600 group-hover/name:text-blue-600 transition-colors flex-shrink-0" />
            <span className="font-semibold text-gray-900 group-hover/name:text-blue-700 transition-colors">{row.original.name}</span>
            <Edit2 className="w-3 h-3 text-blue-400 opacity-0 group-hover/name:opacity-100 transition-opacity ml-1" />
          </div>
        );
      };
      
      return <EditableNameCell />;
    },
    size: 300,
    meta: {
      headerClassName: 'border-r border-gray-300',
      cellClassName: 'min-w-0 border-r border-gray-300'
    }
  },
  {
    id: 'timeline',
    header: 'Timeline',
    cell: ({ row }) => {
      const deliverable = row.original;
      return (
        <DateRangePicker
          startDate={deliverable.startDate}
          endDate={deliverable.endDate}
          onStartDateChange={(date) => onUpdateField(deliverable._id, { startDate: date })}
          onEndDateChange={(date) => onUpdateField(deliverable._id, { endDate: date })}
          placeholder="Set date"
          className="h-8 text-xs border-0 shadow-none hover:bg-blue-50 rounded transition-all hover:shadow-sm"
          projectStartDate={projectStartDate}
        />
      );
    },
    size: 280,
    meta: {
      headerClassName: 'text-center border-r border-gray-300',
      cellClassName: 'px-2 border-r border-gray-300'
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const deliverable = row.original;
      const config = statusConfig[deliverable.status];
      const StatusIcon = config.icon;
      
      return (
        <Select
          value={deliverable.status}
          onValueChange={(value) => onUpdateField(deliverable._id, { status: value })}
        >
          <SelectTrigger className="h-8 border-0 shadow-none hover:bg-blue-50 rounded w-full [&>svg]:hidden justify-center px-0 transition-all hover:shadow-sm group/status">
            <Badge 
              variant={config.variant} 
              className={cn(
                "text-xs pointer-events-none font-semibold flex items-center gap-1.5 px-2.5 py-1 transition-all group-hover/status:shadow-sm group-hover/status:scale-105",
                config.color,
                config.bgColor
              )}
            >
              <StatusIcon className={cn("w-3 h-3", config.iconColor)} />
              {config.label}
            </Badge>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(statusConfig).map(([value, cfg]) => {
              const Icon = cfg.icon;
              return (
                <SelectItem 
                  key={value} 
                  value={value}
                  className={cn("cursor-pointer transition-colors", cfg.hoverBg)}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn("w-4 h-4", cfg.iconColor)} />
                    <span className={cn("font-medium", cfg.color)}>
                      {cfg.label}
                    </span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      );
    },
    size: 140,
    meta: {
      headerClassName: 'text-center border-r border-gray-300',
      cellClassName: 'px-2 border-r border-gray-300'
    }
  },
  {
    id: 'assignee',
    accessorKey: 'assignee',
    header: 'Assignee',
    cell: ({ row }) => {
      const deliverable = row.original;
      return (
        <Input
          value={deliverable.assignee || ''}
          onChange={(e) => onUpdateField(deliverable._id, { assignee: e.target.value })}
          placeholder="Unassigned"
          className="h-8 border-0 shadow-none hover:bg-blue-50 focus:bg-white focus:border focus:border-blue-300 text-sm rounded text-center w-full transition-all hover:shadow-sm"
        />
      );
    },
    size: 140,
    meta: {
      headerClassName: 'text-center border-r border-gray-300',
      cellClassName: 'px-2 border-r border-gray-300'
    }
  },
  {
    id: 'tasks',
    header: 'Tasks',
    cell: ({ row }) => {
      const tasks = tasksByDeliverable[row.original._id] || [];
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const totalTasks = tasks.length;
      
      return (
        <div className="flex justify-center">
          <span className={cn(
            "text-xs font-bold px-2 py-1 rounded-full",
            completedTasks === totalTasks && totalTasks > 0
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-700"
          )}>
            {completedTasks}/{totalTasks}
          </span>
        </div>
      );
    },
    size: 80,
    meta: {
      headerClassName: 'text-center border-r border-gray-300',
      cellClassName: 'text-center px-2 border-r border-gray-300'
    }
  },
  {
    id: 'actions',
    header: () => null,
    cell: ({ row }) => {
      const deliverable = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="hover:bg-blue-100 hover:shadow-md transition-all group/actions"
            >
              <MoreVertical className="w-4 h-4 text-slate-600 group-hover/actions:text-blue-600 transition-colors" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAddTask(deliverable._id)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(deliverable)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Deliverable
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
      );
    },
    size: 50,
    meta: {
      headerClassName: 'w-12',
      cellClassName: 'text-center'
    }
  }
];
