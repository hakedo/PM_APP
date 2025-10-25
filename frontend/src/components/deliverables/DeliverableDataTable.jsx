import { Plus, Circle, Check, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Card, Button, Checkbox, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Input } from '../ui';
import { DataTable } from '../ui/data-table';
import { createDeliverableColumns } from './deliverable-columns';
import { cn } from '@/lib/utils';
import { formatDateDisplay } from '@/utils/dateUtils';
import { useState } from 'react';

const formatDateShort = (dateString) => {
  if (!dateString) return 'No date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function DeliverableDataTable({
  deliverables = [],
  tasksByDeliverable = {},
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
  const columns = createDeliverableColumns({
    onEdit: onEditDeliverable,
    onDelete: onDeleteDeliverable,
    onAddTask,
    onUpdateField,
    projectStartDate,
    tasksByDeliverable
  });

  const renderSubComponent = ({ row }) => {
    const deliverable = row.original;
    const tasks = tasksByDeliverable[deliverable._id] || [];

    return (
      <div className="bg-blue-50/40 px-6 py-4 border-t border-b border-gray-300">
        {tasks.length === 0 ? (
          <div className="px-4 py-6 text-center bg-white rounded-lg border-2 border-dashed border-blue-300 ml-12">
            <div className="max-w-xs mx-auto">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600 mb-2 font-medium">No tasks yet</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddTask(deliverable._id)}
                className="gap-2 border-blue-400 text-blue-700 hover:bg-blue-50 text-xs h-8"
              >
                <Plus className="w-3.5 h-3.5" />
                Add First Task
              </Button>
            </div>
          </div>
        ) : (
          <div className="ml-12">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-700">{tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddTask(deliverable._id)}
                className="h-7 gap-1.5 text-blue-700 hover:bg-blue-100 hover:shadow-sm transition-all text-xs px-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Task
              </Button>
            </div>
            <div className="space-y-2.5">
            {tasks.map((task) => {
              const TaskRow = () => {
                const [isEditingName, setIsEditingName] = useState(false);
                const [taskName, setTaskName] = useState(task.name);

                const handleSaveName = () => {
                  if (taskName.trim() && taskName !== task.name) {
                    onEditTask(deliverable._id, { ...task, name: taskName.trim() });
                  } else {
                    setTaskName(task.name);
                  }
                  setIsEditingName(false);
                };

                const handleKeyDown = (e) => {
                  if (e.key === 'Enter') {
                    handleSaveName();
                  } else if (e.key === 'Escape') {
                    setTaskName(task.name);
                    setIsEditingName(false);
                  }
                };

                return (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:shadow-sm transition-all group/task bg-white border-l-4 border-blue-400 border border-blue-200 shadow-sm">
                    {/* Checkbox */}
                    <div className="flex items-center flex-shrink-0">
                      <Checkbox
                        checked={task.status === 'completed'}
                        onCheckedChange={() => onToggleTask(deliverable._id, task._id, task.status)}
                        className="border-2 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                    </div>

                    {/* Task Name */}
                    <div className="flex-1 min-w-0">
                      {isEditingName ? (
                        <div className="flex items-center gap-2">
                          <Circle className="w-2 h-2 flex-shrink-0 fill-blue-400 text-blue-400" />
                          <Input
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            onBlur={handleSaveName}
                            onKeyDown={handleKeyDown}
                            className="h-7 text-sm border-blue-300 focus:border-blue-500"
                            autoFocus
                            autoComplete="off"
                          />
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "text-sm font-medium flex items-center gap-2 cursor-pointer hover:bg-blue-50 -ml-1 pl-1 pr-2 py-0.5 rounded transition-colors group/taskname",
                            task.status === 'completed' ? "line-through text-gray-500" : "text-gray-900"
                          )}
                          onClick={() => setIsEditingName(true)}
                        >
                          <Circle
                            className={cn(
                              "w-2 h-2 flex-shrink-0",
                              task.status === 'completed'
                                ? "fill-green-500 text-green-500"
                                : "fill-blue-400 text-blue-400"
                            )}
                          />
                          {task.name}
                          <Edit2 className="w-3 h-3 text-blue-400 opacity-0 group-hover/taskname:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </div>

                    {/* Due Date */}
                    <div className="text-xs text-gray-600 font-medium bg-gray-100 px-3 py-1.5 rounded border border-gray-200">
                      {formatDateShort(task.dueDate)}
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center">
                      {task.status === 'completed' ? (
                        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <Check className="w-3.5 h-3.5" />
                          <span className="text-xs font-semibold">Done</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          <Circle className="w-3.5 h-3.5" />
                          <span className="text-xs font-semibold">Todo</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-0 group-hover/task:opacity-100 transition-opacity hover:bg-blue-100 hover:shadow-sm"
                        >
                          <MoreVertical className="w-3.5 h-3.5 text-blue-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditTask(deliverable._id, task)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Task
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
                );
              };
              
              return <TaskRow key={task._id} />;
            })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white">
      {deliverables.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-sm text-gray-500 mb-4">No deliverables yet</p>
          <Button onClick={onAddDeliverable} className="gap-2">
            <Plus className="w-4 h-4" />
            Add First Deliverable
          </Button>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={deliverables}
            getRowCanExpand={() => true}
            renderSubComponent={renderSubComponent}
            className="[&_table]:rounded-none"
          />

          {/* Add Button at Bottom */}
          <div className="border-t border-gray-300 bg-gray-50/50 px-4 py-3 rounded-b-xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddDeliverable}
              className="gap-2 text-gray-600 hover:text-gray-900"
            >
              <Plus className="w-4 h-4" />
              Add Deliverable
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
