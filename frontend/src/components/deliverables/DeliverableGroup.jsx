import { useState } from 'react';
import { ChevronUp, ChevronDown, MoreVertical, Trash2, Plus, FolderOpen, Folder } from 'lucide-react';
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
    <div className="overflow-hidden rounded-xl border-2 border-blue-200 bg-white shadow-lg">
      {/* Group Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-25 px-6 py-4 flex items-center justify-between group/header border-b-2 border-blue-200 hover:from-blue-100 hover:to-blue-50 transition-colors">
        <div 
          className="flex items-center gap-3 flex-1 cursor-pointer"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <Folder className="w-5 h-5 text-blue-600 flex-shrink-0" />
          ) : (
            <FolderOpen className="w-5 h-5 text-blue-600 flex-shrink-0" />
          )}
          
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              className="h-8 w-64 font-semibold"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h3 
              className="font-bold text-base text-gray-900 hover:text-blue-700 transition-colors"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              {group.name}
            </h3>
          )}
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              {deliverables.length} {deliverables.length === 1 ? 'item' : 'items'}
            </span>
            <button
              className="hover:bg-blue-200 p-1.5 rounded-full transition-colors"
            >
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4 text-blue-700" />
              ) : (
                <ChevronUp className="w-4 h-4 text-blue-700" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddDeliverable(group._id)}
            className="h-8 px-3 bg-blue-600 text-white hover:bg-blue-700 hover:text-white gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Item</span>
          </Button>

          <div className="inline-flex border border-gray-300 rounded-md" role="group">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveUp}
              disabled={isFirst}
              className="h-8 w-8 p-0 rounded-r-none border-r border-gray-300 hover:bg-blue-100"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveDown}
              disabled={isLast}
              className="h-8 w-8 p-0 rounded-l-none hover:bg-blue-100"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 hover:bg-blue-100"
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
        <div className="bg-gray-50/50 p-4">
          {/* Table Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-3 overflow-hidden">
            <div className="flex items-center px-4 py-2.5 text-xs font-bold text-gray-700 uppercase tracking-wider bg-gradient-to-r from-gray-100 to-gray-50 border-l-4 border-transparent">
              <div className="w-8 mr-2 flex-shrink-0" /> {/* Space for expand button */}
              <div className="flex-1 min-w-0 pr-4 mr-2 border-r border-gray-300">Deliverable Name</div>
              <div className="w-64 px-2 mr-2 border-r border-gray-300 text-center flex-shrink-0">Timeline</div>
              <div className="w-32 mr-2 border-r border-gray-300 text-center flex-shrink-0">Status</div>
              <div className="w-32 mr-2 border-r border-gray-300 text-center flex-shrink-0">Assignee</div>
              <div className="w-20 mr-2 border-r border-gray-300 text-center flex-shrink-0">Tasks</div>
              <div className="w-10 flex-shrink-0" /> {/* Space for actions */}
            </div>
          </div>

          {/* Deliverables */}
          <div className="space-y-6">
            {deliverables.length === 0 ? (
              <div className="px-4 py-12 text-center bg-white rounded-lg border-2 border-dashed border-blue-200">
                <div className="max-w-sm mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-4 font-medium">No deliverables in this group yet</p>
                  <Button 
                    onClick={() => onAddDeliverable(group._id)}
                    variant="outline"
                    size="default"
                    className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Deliverable
                  </Button>
                </div>
              </div>
            ) : (
              deliverables.map((deliverable, index) => (
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
                  isLast={index === deliverables.length - 1}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
