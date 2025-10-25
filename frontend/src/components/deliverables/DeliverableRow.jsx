import { useState } from 'react';
import { ChevronRight, ChevronDown, MoreVertical, Plus, Edit2, Trash2, Check, Circle, Package } from 'lucide-react';
import { 
  Badge, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, Checkbox, DateRangePicker, Select, SelectContent, 
  SelectItem, SelectTrigger, SelectValue, Input
} from '../ui';
import { cn } from '@/lib/utils';
import { formatDateDisplay } from '@/utils/dateUtils';

const statusConfig = {
  'not-started': { label: 'Not Started', variant: 'secondary', color: 'text-gray-600' },
  'in-progress': { label: 'In Progress', variant: 'default', color: 'text-blue-600' },
  'completed': { label: 'Completed', variant: 'default', color: 'text-green-600' },
  'blocked': { label: 'Blocked', variant: 'destructive', color: 'text-red-600' }
};

export function DeliverableRow({ deliverable, tasks = [], onEdit, onDelete, onAddTask, onToggleTask, onEditTask, onDeleteTask, onUpdateField, isLast, projectStartDate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;

  const handleFieldUpdate = (field, value) => {
    if (onUpdateField) {
      onUpdateField(deliverable._id, { [field]: value });
    }
  };

  return (
    <div className="rounded-lg bg-white border-2 border-purple-200 shadow-md hover:shadow-lg transition-all overflow-hidden">
      {/* Deliverable Row */}
      <div className="flex items-center px-4 py-3 group bg-gradient-to-r from-purple-50/50 to-transparent border-l-4 border-purple-500">
        <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center justify-center w-8 h-8 hover:bg-purple-100 rounded-lg transition-colors flex-shrink-0 mr-2 cursor-pointer">
          {isExpanded ? (<ChevronDown className="w-4 h-4 text-purple-700" />) : (<ChevronRight className="w-4 h-4 text-purple-700" />)}
        </button>
        <div className="flex-1 min-w-0 flex items-center gap-2 pr-4 mr-2 border-r border-purple-200">
          <Package className="w-4 h-4 text-purple-600 flex-shrink-0" />
          <span className="font-semibold text-gray-900">{deliverable.name}</span>
        </div>
        <div className="w-64 px-2 mr-2 border-r border-purple-200 flex items-center justify-center flex-shrink-0">
          <DateRangePicker
            startDate={deliverable.startDate}
            endDate={deliverable.endDate}
            onStartDateChange={(date) => handleFieldUpdate('startDate', date)}
            onEndDateChange={(date) => handleFieldUpdate('endDate', date)}
            placeholder="Set date"
            className="h-8 text-xs border-0 shadow-none hover:bg-purple-50 rounded"
            projectStartDate={projectStartDate}
          />
        </div>
        <div className="w-32 mr-2 border-r border-purple-200 flex items-center justify-center flex-shrink-0">
          <Select value={deliverable.status} onValueChange={(value) => handleFieldUpdate('status', value)}>
            <SelectTrigger className="h-8 border-0 shadow-none hover:bg-purple-50 rounded w-full">
              <Badge variant={statusConfig[deliverable.status].variant} className={cn("text-xs pointer-events-none font-semibold", statusConfig[deliverable.status].color)}>{statusConfig[deliverable.status].label}</Badge>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-32 mr-2 border-r border-purple-200 flex items-center justify-center flex-shrink-0">
          <Input value={deliverable.assignee || ''} onChange={(e) => handleFieldUpdate('assignee', e.target.value)} onBlur={(e) => handleFieldUpdate('assignee', e.target.value)} placeholder="Unassigned" className="h-8 border-0 shadow-none hover:bg-purple-50 focus:bg-white focus:border focus:border-purple-300 text-sm rounded text-center w-full" />
        </div>
        <div className="w-20 mr-2 border-r border-purple-200 flex items-center justify-center flex-shrink-0">
          <span className={cn("text-xs font-bold px-2 py-1 rounded-full", completedTasks === totalTasks && totalTasks > 0 ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700")}>
            {completedTasks}/{totalTasks}
          </span>
        </div>
        <div className="w-10 flex items-center justify-center flex-shrink-0">
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-100">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAddTask(deliverable._id)}><Plus className="w-4 h-4 mr-2" />Add Task</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(deliverable)}><Edit2 className="w-4 h-4 mr-2" />Edit Deliverable</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(deliverable._id)} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
      {isExpanded && (
        <div className="bg-amber-50/30 p-3 border-t-2 border-purple-200">
          {tasks.length === 0 ? (
            <div className="px-4 py-8 text-center bg-white rounded-lg border-2 border-dashed border-amber-300">
              <div className="max-w-xs mx-auto">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center"><Plus className="w-6 h-6 text-amber-600" /></div>
                <p className="text-sm text-gray-600 mb-3 font-medium">No tasks yet</p>
                <Button size="sm" variant="outline" onClick={() => onAddTask(deliverable._id)} className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"><Plus className="w-4 h-4" />Add First Task</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {tasks.map((task) => (
                <div key={task._id} className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:shadow-md transition-all group/task bg-white border-l-4 border-amber-400 shadow-sm">
                  <div className="flex items-center gap-2 flex-shrink-0 pr-4 border-r border-amber-200"><div className="w-8 flex items-center justify-center"><Checkbox checked={task.status === 'completed'} onCheckedChange={() => onToggleTask(deliverable._id, task._id, task.status)} className="flex-shrink-0 border-2 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500" /></div></div>
                  <div className={cn("flex-1 min-w-0 text-sm font-medium flex items-center gap-2 pr-4 border-r border-amber-200", task.status === 'completed' ? "line-through text-gray-500" : "text-gray-900")}>
                    <Circle className={cn("w-2 h-2 flex-shrink-0", task.status === 'completed' ? "fill-green-500 text-green-500" : "fill-amber-400 text-amber-400")} />{task.name}
                  </div>
                  <div className="w-32 text-xs text-gray-600 font-medium bg-gray-50 px-2 py-1 rounded mx-4 border-r border-amber-200">{formatDateShort(task.dueDate)}</div>
                  <div className="w-20 flex items-center px-4 border-r border-amber-200">{task.status === 'completed' ? (<div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full"><Check className="w-3.5 h-3.5" /><span className="text-xs font-semibold">Done</span></div>) : (<div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full"><Circle className="w-3.5 h-3.5" /><span className="text-xs font-semibold">Todo</span></div>)}</div>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" className="opacity-0 group-hover/task:opacity-100 transition-opacity hover:bg-amber-100"><MoreVertical className="w-3.5 h-3.5" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => onEditTask(deliverable._id, task)}><Edit2 className="w-4 h-4 mr-2" />Edit Task</DropdownMenuItem><DropdownMenuItem onClick={() => onDeleteTask(deliverable._id, task._id)} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => onAddTask(deliverable._id)} className="w-full justify-start gap-2 text-amber-700 hover:bg-amber-50 border-2 border-dashed border-amber-300 rounded-lg bg-white"><Plus className="w-4 h-4" />Add Another Task</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
