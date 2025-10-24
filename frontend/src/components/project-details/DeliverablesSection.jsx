import { useState, useEffect } from 'react';
import { Package, Plus, FolderPlus, Table, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../ui';
import { DeliverableGroup, DeliverableFormDialog, TaskFormDialog } from '../deliverables';
import DeliverableGanttChart from '../gantt/DeliverableGanttChart';
import { deliverableService, deliverableGroupService } from '@/services';
import { extractDateForInput } from '@/utils/dateUtils';

const emptyDeliverable = {
  name: '',
  startDate: '',
  endDate: '',
  status: 'not-started',
  assignee: 'Unassigned'
};

const emptyTask = {
  name: '',
  dueDate: '',
  status: 'pending'
};

export function DeliverablesSection({ projectId, projectStartDate, projectEndDate }) {
  const [groups, setGroups] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [tasksByDeliverable, setTasksByDeliverable] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'timeline'
  
  // Deliverable dialog state
  const [deliverableDialogOpen, setDeliverableDialogOpen] = useState(false);
  const [deliverableMode, setDeliverableMode] = useState('create');
  const [currentDeliverable, setCurrentDeliverable] = useState(emptyDeliverable);
  const [editingDeliverableId, setEditingDeliverableId] = useState(null);
  const [submittingDeliverable, setSubmittingDeliverable] = useState(false);
  
  // Task dialog state
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskMode, setTaskMode] = useState('create');
  const [currentTask, setCurrentTask] = useState(emptyTask);
  const [currentDeliverableId, setCurrentDeliverableId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [submittingTask, setSubmittingTask] = useState(false);

  // Load groups and deliverables
  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch groups
      const groupsData = await deliverableGroupService.getByProject(projectId);
      setGroups(groupsData || []);
      
      // Fetch deliverables
      const deliverablesData = await deliverableService.getByProject(projectId);
      
      // Handle case where API returns undefined or null
      if (!deliverablesData || !Array.isArray(deliverablesData)) {
        console.warn('No deliverables data received or invalid format');
        setDeliverables([]);
        setTasksByDeliverable({});
        return;
      }
      
      setDeliverables(deliverablesData);
      
      // Load tasks for each deliverable
      const tasksData = {};
      await Promise.all(
        deliverablesData.map(async (deliverable) => {
          const tasks = await deliverableService.getTasks(deliverable._id);
          tasksData[deliverable._id] = tasks || [];
        })
      );
      setTasksByDeliverable(tasksData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setGroups([]);
      setDeliverables([]);
      setTasksByDeliverable({});
    } finally {
      setLoading(false);
    }
  };

  // Group handlers
  const handleAddGroup = async () => {
    const name = prompt('Enter group name:');
    if (!name || !name.trim()) return;
    
    try {
      await deliverableGroupService.create({
        project: projectId,
        name: name.trim()
      });
      await fetchData();
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    }
  };

  const handleRenameGroup = async (groupId, newName) => {
    try {
      await deliverableGroupService.update(groupId, { name: newName });
      await fetchData();
    } catch (error) {
      console.error('Error renaming group:', error);
      alert('Failed to rename group. Please try again.');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    const deliverablesInGroup = deliverables.filter(d => d.group === groupId);
    
    if (deliverablesInGroup.length > 0) {
      alert('Cannot delete a group that contains deliverables. Please move or delete them first.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this group?')) {
      return;
    }
    
    try {
      await deliverableGroupService.delete(groupId);
      await fetchData();
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Failed to delete group. Please try again.');
    }
  };

  const handleMoveGroup = async (groupId, direction) => {
    const currentIndex = groups.findIndex(g => g._id === groupId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= groups.length) return;
    
    const reorderedGroups = [...groups];
    [reorderedGroups[currentIndex], reorderedGroups[newIndex]] = 
      [reorderedGroups[newIndex], reorderedGroups[currentIndex]];
    
    try {
      await deliverableGroupService.reorder(
        reorderedGroups.map((g, index) => ({ id: g._id, order: index }))
      );
      await fetchData();
    } catch (error) {
      console.error('Error reordering groups:', error);
      alert('Failed to reorder groups. Please try again.');
    }
  };

  // Deliverable handlers
  const handleAddDeliverable = (groupId) => {
    setCurrentDeliverable({
      ...emptyDeliverable,
      group: groupId,
      startDate: extractDateForInput(projectStartDate) || '',
      endDate: extractDateForInput(projectEndDate) || ''
    });
    setDeliverableMode('create');
    setDeliverableDialogOpen(true);
  };

  const handleEditDeliverable = (deliverable) => {
    setCurrentDeliverable({
      name: deliverable.name,
      group: deliverable.group,
      startDate: extractDateForInput(deliverable.startDate),
      endDate: extractDateForInput(deliverable.endDate),
      status: deliverable.status,
      assignee: deliverable.assignee
    });
    setEditingDeliverableId(deliverable._id);
    setDeliverableMode('edit');
    setDeliverableDialogOpen(true);
  };

  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();
    setSubmittingDeliverable(true);
    
    try {
      if (deliverableMode === 'create') {
        await deliverableService.create({
          ...currentDeliverable,
          project: projectId
        });
      } else {
        await deliverableService.update(editingDeliverableId, currentDeliverable);
      }
      
      await fetchData();
      setDeliverableDialogOpen(false);
      setCurrentDeliverable(emptyDeliverable);
      setEditingDeliverableId(null);
    } catch (error) {
      console.error('Error saving deliverable:', error);
      alert('Failed to save deliverable. Please try again.');
    } finally {
      setSubmittingDeliverable(false);
    }
  };

  const handleDeleteDeliverable = async (id) => {
    if (!window.confirm('Are you sure you want to delete this deliverable? This will also delete all associated tasks.')) {
      return;
    }
    
    try {
      await deliverableService.delete(id);
      await fetchData();
    } catch (error) {
      console.error('Error deleting deliverable:', error);
      alert('Failed to delete deliverable. Please try again.');
    }
  };

  // Task handlers
  const handleAddTask = (deliverableId) => {
    const deliverable = deliverables.find(d => d._id === deliverableId);
    setCurrentTask({
      ...emptyTask,
      dueDate: extractDateForInput(deliverable?.endDate) || ''
    });
    setCurrentDeliverableId(deliverableId);
    setTaskMode('create');
    setTaskDialogOpen(true);
  };

  const handleEditTask = (deliverableId, task) => {
    setCurrentTask({
      name: task.name,
      dueDate: extractDateForInput(task.dueDate),
      status: task.status
    });
    setCurrentDeliverableId(deliverableId);
    setEditingTaskId(task._id);
    setTaskMode('edit');
    setTaskDialogOpen(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    setSubmittingTask(true);
    
    try {
      if (taskMode === 'create') {
        await deliverableService.createTask(currentDeliverableId, currentTask);
      } else {
        await deliverableService.updateTask(currentDeliverableId, editingTaskId, currentTask);
      }
      
      await fetchData();
      setTaskDialogOpen(false);
      setCurrentTask(emptyTask);
      setCurrentDeliverableId(null);
      setEditingTaskId(null);
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleToggleTask = async (deliverableId, taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      await deliverableService.updateTask(deliverableId, taskId, { status: newStatus });
      await fetchData();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDeleteTask = async (deliverableId, taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      await deliverableService.deleteTask(deliverableId, taskId);
      await fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleUpdateField = async (deliverableId, updates) => {
    try {
      await deliverableService.update(deliverableId, updates);
      await fetchData();
    } catch (error) {
      console.error('Error updating deliverable field:', error);
      alert('Failed to update field. Please try again.');
    }
  };

  if (loading) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Package className="w-6 h-6" />
            Deliverables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-500">Loading deliverables...</div>
        </CardContent>
      </Card>
    );
  }

  // Group deliverables by group
  const getDeliverablesByGroup = (groupId) => {
    if (!groupId || !deliverables || deliverables.length === 0) {
      return [];
    }
    return deliverables
      .filter(d => d.group === groupId || (!d.group && groupId === groups[0]?._id))
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  };

  // Gantt click handlers
  const handleGanttItemClick = (item, type, group, deliverable) => {
    if (type === 'deliverable') {
      handleEditDeliverable(item._id);
    } else if (type === 'task') {
      handleEditTask(deliverable._id, item._id);
    }
  };

  const handleGanttAddDeliverable = (group) => {
    handleAddDeliverable(group._id);
  };

  const handleGanttAddTask = (group, deliverable) => {
    handleAddTask(deliverable._id);
  };

  return (
    <>
      <Card className="border-gray-200">
        {/* Header with Tabs */}
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6" />
              <span className="text-xl font-semibold">Deliverables ({deliverables.length})</span>
            </div>
            <Button onClick={handleAddGroup} variant="outline" size="sm" className="gap-2">
              <FolderPlus className="w-4 h-4" />
              Add Group
            </Button>
          </div>

          {/* View Mode Tabs */}
          <div className="flex gap-1 border-b border-gray-200 -mb-4">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                viewMode === 'table'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Table className="w-4 h-4" />
              Table View
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                viewMode === 'timeline'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Timeline View
            </button>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-0">
          {viewMode === 'table' ? (
            // Table View
            groups && groups.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {groups
                  .filter(group => group && group._id)
                  .map((group, index) => (
                    <DeliverableGroup
                      key={group._id}
                      group={group}
                      deliverables={getDeliverablesByGroup(group._id)}
                      tasksByDeliverable={tasksByDeliverable}
                      isFirst={index === 0}
                      isLast={index === groups.length - 1}
                      onMoveUp={() => handleMoveGroup(group._id, 'up')}
                      onMoveDown={() => handleMoveGroup(group._id, 'down')}
                      onDelete={handleDeleteGroup}
                      onRename={handleRenameGroup}
                      onAddDeliverable={handleAddDeliverable}
                      onEditDeliverable={handleEditDeliverable}
                      onDeleteDeliverable={handleDeleteDeliverable}
                      onAddTask={handleAddTask}
                      onToggleTask={handleToggleTask}
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                      onUpdateField={handleUpdateField}
                    />
                  ))}
              </div>
            ) : (
              <div className="py-12">
                <div className="text-center space-y-4">
                  <div>
                    <FolderPlus className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No groups yet</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Create a group to start organizing your deliverables
                    </p>
                  </div>
                  <Button onClick={handleAddGroup} size="lg" className="gap-2">
                    <FolderPlus className="w-4 h-4" />
                    Create Your First Group
                  </Button>
                </div>
              </div>
            )
          ) : (
            // Timeline View (Gantt Chart)
            <div className="p-4">
              <DeliverableGanttChart
                groups={groups}
                deliverables={deliverables}
                tasksByDeliverable={tasksByDeliverable}
                onItemClick={handleGanttItemClick}
                onAddGroup={handleAddGroup}
                onAddDeliverable={handleGanttAddDeliverable}
                onAddTask={handleGanttAddTask}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <DeliverableFormDialog
        open={deliverableDialogOpen}
        onOpenChange={setDeliverableDialogOpen}
        deliverable={currentDeliverable}
        onChange={setCurrentDeliverable}
        onSubmit={handleSubmitDeliverable}
        loading={submittingDeliverable}
        mode={deliverableMode}
      />

      <TaskFormDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={currentTask}
        onChange={setCurrentTask}
        onSubmit={handleSubmitTask}
        loading={submittingTask}
        mode={taskMode}
      />
    </>
  );
}
