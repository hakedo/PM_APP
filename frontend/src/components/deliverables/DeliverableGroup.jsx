import { useState } from 'react';
import { ChevronUp, ChevronDown, MoreVertical, Trash2, Plus } from 'lucide-react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Input } from '../ui';
import { DeliverableRow } from './DeliverableRow';
import { cn } from '@/lib/utils';

export function DeliverableGroup({
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
  onUpdateField
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
    <div className="overflow-hidden">
      {/* Group Header */}
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between group/header border-b border-gray-200">
        <div 
          className="flex items-center gap-2 flex-1 cursor-pointer"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <button
            className="hover:bg-gray-200 p-1 rounded transition-colors"
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            )}
          </button>
          
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              className="h-7 w-64"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h3 
              className="font-semibold text-gray-900 hover:text-gray-600"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              {group.name}
            </h3>
          )}
          
          <span className="text-sm text-gray-500">
            ({deliverables.length})
          </span>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddDeliverable(group._id)}
            className="h-7 w-7 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>

          <div className="inline-flex" role="group">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveUp}
              disabled={isFirst}
              className="h-7 w-7 p-0 rounded-r-none"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveDown}
              disabled={isLast}
              className="h-7 w-7 p-0 rounded-l-none border-l border-gray-200"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-7 w-7 p-0"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                Rename
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
        <div className="bg-white">
          {/* Table Header */}
          <div className="bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <div className="w-6" /> {/* Space for expand button */}
              <div className="flex-1">Name</div>
              <div className="w-48">Timeline</div>
              <div className="w-32">Status</div>
              <div className="w-32">Assignee</div>
              <div className="w-20 text-center">Tasks</div>
              <div className="w-10" /> {/* Space for actions */}
            </div>
          </div>

          {/* Deliverables */}
          <div className="divide-y divide-gray-200">
            {deliverables.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500 mb-3">No deliverables in this group yet</p>
                <Button 
                  onClick={() => onAddDeliverable(group._id)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Deliverable
                </Button>
              </div>
            ) : (
              deliverables.map((deliverable) => (
                <DeliverableRow
                  key={deliverable._id}
                  deliverable={deliverable}
                  tasks={tasksByDeliverable[deliverable._id] || []}
                  onEdit={onEditDeliverable}
                  onDelete={onDeleteDeliverable}
                  onAddTask={onAddTask}
                  onToggleTask={onToggleTask}
                  onEditTask={onEditTask}
                  onDeleteTask={onDeleteTask}
                  onUpdateField={onUpdateField}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
