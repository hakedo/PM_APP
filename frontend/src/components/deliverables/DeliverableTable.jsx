import { Plus } from 'lucide-react';
import { Button, Card } from '../ui';
import { DeliverableRow } from './DeliverableRow';

export function DeliverableTable({ 
  deliverables = [], 
  tasksByDeliverable = {},
  onAddDeliverable,
  onEditDeliverable,
  onDeleteDeliverable,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onUpdateField
}) {
  return (
    <Card className="overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
          <div className="w-6" /> {/* Space for expand button */}
          <div className="flex-1">Name</div>
          <div className="w-48">Timeline</div>
          <div className="w-32">Status</div>
          <div className="w-32">Assignee</div>
          <div className="w-20 text-center">Tasks</div>
          <div className="w-10" /> {/* Space for actions */}
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {deliverables.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-gray-500 mb-4">No deliverables yet</p>
            <Button onClick={onAddDeliverable} className="gap-2">
              <Plus className="w-4 h-4" />
              Add First Deliverable
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

      {/* Add Button at Bottom */}
      {deliverables.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
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
      )}
    </Card>
  );
}
