import { useState } from 'react';
import { ChevronUp, ChevronDown, MoreVertical, Trash2, FolderOpen, Folder, Plus } from 'lucide-react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Input } from '../ui';
import { DeliverableDataTable } from './DeliverableDataTable';
import { cn } from '@/lib/utils';

export function GroupedDeliverableTable({
  group,
  deliverables = [],
  tasksByDeliverable = {},
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
  onRename,
  onAddDeliverable,
  onEditDeliverable,
  onDeleteDeliverable,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onUpdateField,
  projectStartDate
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleRename = () => {
    if (editName.trim() && editName !== group.name) {
      onRename(group._id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditName(group.name);
      setIsEditing(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border-2 border-blue-300 bg-white shadow-sm">
      {/* Group Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-25 px-6 py-4 flex items-center justify-between group/header border-b-2 border-blue-300 hover:from-blue-100 hover:to-blue-50 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-200 transition-colors flex-shrink-0"
          >
            {isCollapsed ? (
              <Folder className="w-5 h-5 text-blue-600" />
            ) : (
              <FolderOpen className="w-5 h-5 text-blue-600" />
            )}
          </button>

          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              className="flex-1 h-8 max-w-md font-semibold text-base border-blue-300 focus:border-blue-500"
              autoFocus
              autoComplete="off"
            />
          ) : (
            <h3
              className="text-base font-semibold text-blue-900 truncate cursor-pointer hover:text-blue-700 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {group.name}
            </h3>
          )}

          <span className="text-xs bg-blue-200 text-blue-700 px-2.5 py-1 rounded-full font-semibold flex-shrink-0">
            {deliverables.length} {deliverables.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Add Deliverable Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddDeliverable(group._id)}
            className="gap-1.5 text-blue-700 hover:bg-blue-200 hover:text-blue-900 opacity-0 group-hover/header:opacity-100 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </Button>

          {!isFirst && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onMoveUp}
              className="opacity-0 group-hover/header:opacity-100 transition-opacity hover:bg-blue-200"
              title="Move group up"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          )}
          {!isLast && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onMoveDown}
              className="opacity-0 group-hover/header:opacity-100 transition-opacity hover:bg-blue-200"
              title="Move group down"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="hover:bg-blue-200"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                Rename Group
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(group._id)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Group Content */}
      {!isCollapsed && (
        <div className="rounded-b-xl overflow-hidden">
          <DeliverableDataTable
            deliverables={deliverables}
            tasksByDeliverable={tasksByDeliverable}
            onAddDeliverable={() => onAddDeliverable(group._id)}
            onEditDeliverable={onEditDeliverable}
            onDeleteDeliverable={onDeleteDeliverable}
            onAddTask={onAddTask}
            onToggleTask={onToggleTask}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onUpdateField={onUpdateField}
            projectStartDate={projectStartDate}
          />
        </div>
      )}
    </div>
  );
}
