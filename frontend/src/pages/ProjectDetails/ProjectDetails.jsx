import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, FolderKanban } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { LoadingSpinner, EmptyState, CollapsibleInfoCard } from '../../components/ui';
import { ClientAssignmentSection, MilestonesSection, TimelineDialog, DeliverablesSection } from '../../components/project-details';
import { GanttChart } from '../../components/gantt';
import { useProject, useTeam } from '../../hooks';
import { clientService, assignmentService, milestoneService } from '../../services';
import { extractDateForInput } from '../../utils/dateUtils';
import { formatPhoneNumber } from '../../utils/formatters';

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { project, loading, updateProject, refetch } = useProject(id);
  const { teamMembers } = useTeam();
  
  // Project info state
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const [saving, setSaving] = useState(false);

  // Client assignment state
  const [assignedClients, setAssignedClients] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  
  // New client creation state
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);
  const [newClient, setNewClient] = useState({
    company: '',
    firstName: '',
    middleInitial: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    unit: '',
    city: '',
    state: '',
    zip: ''
  });

  // Milestone state
  const [milestones, setMilestones] = useState([]);
  const [expandedMilestones, setExpandedMilestones] = useState({});
  const [showGanttChart, setShowGanttChart] = useState(false);

  // Timeline dialog state
  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false);
  const [timelineDialogType, setTimelineDialogType] = useState(null);
  const [timelineDialogMode, setTimelineDialogMode] = useState('add');
  const [timelineDialogData, setTimelineDialogData] = useState(null);
  const [timelineDialogParent, setTimelineDialogParent] = useState(null);

  // Helper functions
  const addBusinessDays = (startDate, days) => {
    let currentDate;
    if (typeof startDate === 'string') {
      const d = new Date(startDate);
      currentDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    } else {
      currentDate = new Date(startDate);
    }
    
    let addedDays = 0;
    while (addedDays < days) {
      currentDate.setDate(currentDate.getDate() + 1);
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        addedDays++;
      }
    }
    return currentDate;
  };

  const addCalendarDays = (startDate, days) => {
    let date;
    if (typeof startDate === 'string') {
      const d = new Date(startDate);
      date = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    } else {
      date = new Date(startDate);
    }
    date.setDate(date.getDate() + days);
    return date;
  };

  // Effects
  useEffect(() => {
    if (id) {
      fetchAssignedClients();
    }
  }, [id]);

  useEffect(() => {
    if (project?.milestones) {
      setMilestones(project.milestones);
    }
  }, [project]);

  useEffect(() => {
    if (showClientSearch && allClients.length === 0) {
      fetchAllClients();
    }
  }, [showClientSearch]);

  // API calls
  const fetchAssignedClients = async () => {
    try {
      const clients = await assignmentService.getClientsForProject(id);
      setAssignedClients(clients);
    } catch (error) {
      console.error('Failed to fetch assigned clients:', error);
    }
  };

  const fetchAllClients = async () => {
    try {
      setLoadingClients(true);
      const clients = await clientService.getAll();
      setAllClients(clients);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  // Project handlers
  const handleEdit = () => {
    setEditedProject({
      title: project.title,
      description: project.description || '',
      startDate: extractDateForInput(project.startDate),
      endDate: extractDateForInput(project.endDate)
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProject(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProject(editedProject);
      setIsEditing(false);
      setEditedProject(null);
    } catch (error) {
      console.error('Failed to update project:', error);
      alert('Failed to update project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Client handlers
  const handleAssignClient = async (client) => {
    try {
      await assignmentService.assignClientToProject({
        clientId: client._id,
        projectId: id
      });
      await fetchAssignedClients();
      setSearchQuery('');
      setShowClientSearch(false);
    } catch (error) {
      console.error('Failed to assign client:', error);
      alert(`Failed to assign client: ${error.message || 'Unknown error'}`);
    }
  };

  const handleRemoveClient = async (assignmentId, clientName) => {
    if (window.confirm(`Remove ${clientName} from this project?`)) {
      try {
        await assignmentService.removeAssignment(assignmentId);
        await fetchAssignedClients();
      } catch (error) {
        console.error('Failed to remove client:', error);
        alert(`Failed to remove client: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleNewClientInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    if (name === 'state') {
      newValue = value.toUpperCase();
    } else if (name === 'phone') {
      newValue = formatPhoneNumber(value);
    }
    
    setNewClient(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (creatingClient) return;
    
    setCreatingClient(true);
    try {
      const createdClient = await clientService.create(newClient);
      await assignmentService.assignClientToProject({
        clientId: createdClient._id,
        projectId: id
      });
      
      await fetchAssignedClients();
      await fetchAllClients();
      
      setNewClient({
        company: '',
        firstName: '',
        middleInitial: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
        unit: '',
        city: '',
        state: '',
        zip: ''
      });
      setIsCreatingClient(false);
    } catch (error) {
      console.error('Failed to create client:', error);
      alert(`Failed to create client: ${error.message || 'Unknown error'}`);
    } finally {
      setCreatingClient(false);
    }
  };

  const handleCloseNewClientDialog = () => {
    setIsCreatingClient(false);
    setNewClient({
      company: '',
      firstName: '',
      middleInitial: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      unit: '',
      city: '',
      state: '',
      zip: ''
    });
  };

  // Milestone handlers
  const handleAddMilestone = () => {
    setTimelineDialogType('milestone');
    setTimelineDialogMode('add');
    setTimelineDialogData({
      name: '',
      abbreviation: '',
      description: '',
      teamMember: ''
    });
    setTimelineDialogParent(null);
    setTimelineDialogOpen(true);
  };

  const handleEditMilestone = (milestone) => {
    setTimelineDialogType('milestone');
    setTimelineDialogMode('edit');
    setTimelineDialogData(milestone);
    setTimelineDialogParent(null);
    setTimelineDialogOpen(true);
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (!window.confirm('Delete this milestone and all its deliverables?')) return;
    
    try {
      await milestoneService.deleteMilestone(id, milestoneId);
      await refetch();
    } catch (error) {
      console.error('Failed to delete milestone:', error);
      alert('Failed to delete milestone');
    }
  };

  // Deliverable handlers
  const handleAddDeliverable = (milestoneId) => {
    const milestone = milestones.find(m => m._id === milestoneId);
    setTimelineDialogType('deliverable');
    setTimelineDialogMode('add');
    setTimelineDialogData({
      title: '',
      description: '',
      startDate: '',
      endDateMode: 'date',
      endDate: '',
      durationDays: 1,
      durationType: 'business'
    });
    setTimelineDialogParent({ milestone });
    setTimelineDialogOpen(true);
  };

  const handleEditDeliverable = (milestoneId, deliverable) => {
    const milestone = milestones.find(m => m._id === milestoneId);
    setTimelineDialogType('deliverable');
    setTimelineDialogMode('edit');
    setTimelineDialogData({
      ...deliverable,
      startDate: deliverable.startDate ? new Date(deliverable.startDate).toISOString().split('T')[0] : '',
      endDate: deliverable.endDate ? new Date(deliverable.endDate).toISOString().split('T')[0] : '',
      endDateMode: 'date',
      durationDays: 1,
      durationType: 'business'
    });
    setTimelineDialogParent({ milestone });
    setTimelineDialogOpen(true);
  };

  const handleToggleDeliverable = async (milestoneId, deliverableId, currentState) => {
    try {
      await milestoneService.updateDeliverable(
        id,
        milestoneId,
        deliverableId,
        { completed: !currentState }
      );
      await refetch();
    } catch (error) {
      console.error('Failed to update deliverable:', error);
      alert('Failed to update deliverable');
    }
  };

  const handleDeleteDeliverable = async (milestoneId, deliverableId) => {
    if (!window.confirm('Delete this deliverable and all its tasks?')) return;
    
    try {
      await milestoneService.deleteDeliverable(id, milestoneId, deliverableId);
      await refetch();
    } catch (error) {
      console.error('Failed to delete deliverable:', error);
      alert('Failed to delete deliverable');
    }
  };

  // Task handlers
  const handleAddTask = (milestoneId, deliverableId) => {
    const milestone = milestones.find(m => m._id === milestoneId);
    const deliverable = milestone?.deliverables?.find(d => d._id === deliverableId);
    setTimelineDialogType('task');
    setTimelineDialogMode('add');
    setTimelineDialogData({
      title: '',
      description: '',
      dueDateMode: 'date',
      dueDate: '',
      dueDateOffset: 1,
      dueDateOffsetType: 'business'
    });
    setTimelineDialogParent({ milestone, deliverable });
    setTimelineDialogOpen(true);
  };

  const handleEditTask = (milestoneId, deliverableId, task) => {
    const milestone = milestones.find(m => m._id === milestoneId);
    const deliverable = milestone?.deliverables?.find(d => d._id === deliverableId);
    setTimelineDialogType('task');
    setTimelineDialogMode('edit');
    setTimelineDialogData({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      dueDateMode: task.dueDateMode || 'date',
      dueDateOffset: task.dueDateOffset || 1,
      dueDateOffsetType: task.dueDateOffsetType || 'business'
    });
    setTimelineDialogParent({ milestone, deliverable });
    setTimelineDialogOpen(true);
  };

  const handleToggleTask = async (milestoneId, deliverableId, taskId, currentState) => {
    try {
      await milestoneService.updateTask(
        id,
        milestoneId,
        deliverableId,
        taskId,
        { completed: !currentState }
      );
      await refetch();
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task');
    }
  };

  const handleDeleteTask = async (milestoneId, deliverableId, taskId) => {
    if (!window.confirm('Delete this task?')) return;
    
    try {
      await milestoneService.deleteTask(id, milestoneId, deliverableId, taskId);
      await refetch();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task');
    }
  };

  // Timeline dialog handlers
  const handleTimelineDialogSave = async () => {
    try {
      if (timelineDialogType === 'milestone') {
        if (timelineDialogMode === 'add') {
          await milestoneService.createMilestone(id, timelineDialogData);
        } else {
          await milestoneService.updateMilestone(id, timelineDialogData._id, {
            name: timelineDialogData.name,
            abbreviation: timelineDialogData.abbreviation,
            description: timelineDialogData.description,
            teamMember: timelineDialogData.teamMember
          });
        }
      } else if (timelineDialogType === 'deliverable') {
        const milestoneId = timelineDialogParent.milestone._id;
        
        const dataToSend = {
          title: timelineDialogData.title,
          description: timelineDialogData.description,
          startDate: timelineDialogData.startDate
        };

        if (timelineDialogData.endDateMode === 'date') {
          if (!timelineDialogData.endDate) {
            alert('Please provide an end date');
            return;
          }
          dataToSend.endDate = timelineDialogData.endDate;
        } else {
          const startDate = new Date(timelineDialogData.startDate);
          const endDate = timelineDialogData.durationType === 'business'
            ? addBusinessDays(startDate, timelineDialogData.durationDays || 1)
            : addCalendarDays(startDate, timelineDialogData.durationDays || 1);
          dataToSend.endDate = endDate.toISOString().split('T')[0];
        }

        if (timelineDialogMode === 'add') {
          await milestoneService.createDeliverable(id, milestoneId, dataToSend);
        } else {
          await milestoneService.updateDeliverable(id, milestoneId, timelineDialogData._id, dataToSend);
        }
      } else if (timelineDialogType === 'task') {
        const { milestone, deliverable } = timelineDialogParent;
        
        const dataToSend = {
          title: timelineDialogData.title,
          description: timelineDialogData.description,
          dueDateMode: timelineDialogData.dueDateMode,
          dueDate: timelineDialogData.dueDateMode === 'date' ? timelineDialogData.dueDate : undefined,
          dueDateOffset: timelineDialogData.dueDateMode !== 'date' ? timelineDialogData.dueDateOffset : undefined,
          dueDateOffsetType: timelineDialogData.dueDateMode !== 'date' ? timelineDialogData.dueDateOffsetType : undefined
        };

        if (timelineDialogMode === 'add') {
          await milestoneService.createTask(id, milestone._id, deliverable._id, dataToSend);
        } else {
          await milestoneService.updateTask(id, milestone._id, deliverable._id, timelineDialogData._id, dataToSend);
        }
      }

      await refetch();
      setTimelineDialogOpen(false);
      setTimelineDialogType(null);
      setTimelineDialogMode('add');
      setTimelineDialogData(null);
      setTimelineDialogParent(null);
    } catch (error) {
      console.error('Failed to save:', error);
      alert(error.response?.data?.message || 'Failed to save');
    }
  };

  const handleTimelineDialogDelete = async () => {
    if (timelineDialogType === 'milestone') {
      await handleDeleteMilestone(timelineDialogData._id);
    } else if (timelineDialogType === 'deliverable') {
      await handleDeleteDeliverable(timelineDialogParent.milestone._id, timelineDialogData._id);
    } else if (timelineDialogType === 'task') {
      await handleDeleteTask(
        timelineDialogParent.milestone._id,
        timelineDialogParent.deliverable._id,
        timelineDialogData._id
      );
    }
    setTimelineDialogOpen(false);
    setTimelineDialogType(null);
    setTimelineDialogMode('add');
    setTimelineDialogData(null);
    setTimelineDialogParent(null);
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Not found state
  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <EmptyState
          icon={FolderKanban}
          title="Project not found"
          description="The project you're looking for doesn't exist"
          actionLabel={
            <>
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </>
          }
          onAction={() => navigate('/projects')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto"
      >
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/projects')}
            className="gap-2 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Button>
        </motion.div>

        {/* Project Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <CollapsibleInfoCard
            title={project.title}
            subtitle={project.description}
            icon={FolderKanban}
            isEditing={isEditing}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
            defaultCollapsed={false}
          >
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={editedProject.title}
                    onChange={(e) => setEditedProject({ ...editedProject, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    value={editedProject.description}
                    onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={editedProject.startDate}
                      onChange={(e) => setEditedProject({ ...editedProject, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={editedProject.endDate}
                      onChange={(e) => setEditedProject({ ...editedProject, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Start Date
                  </h3>
                  <p className="text-gray-900 font-medium">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    End Date
                  </h3>
                  <p className="text-gray-900 font-medium">
                    {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
              </div>
            )}
          </CollapsibleInfoCard>
        </motion.div>

        {/* Client Assignment Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6"
        >
          <ClientAssignmentSection
            assignedClients={assignedClients}
            allClients={allClients}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showClientSearch={showClientSearch}
            setShowClientSearch={setShowClientSearch}
            loadingClients={loadingClients}
            onAssignClient={handleAssignClient}
            onRemoveClient={handleRemoveClient}
            isCreatingClient={isCreatingClient}
            setIsCreatingClient={setIsCreatingClient}
            newClient={newClient}
            onNewClientInputChange={handleNewClientInputChange}
            onCreateClient={handleCreateClient}
            creatingClient={creatingClient}
            onCloseNewClientDialog={handleCloseNewClientDialog}
          />
        </motion.div>

        {/* Milestones Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-6"
        >
          <MilestonesSection
            milestones={milestones}
            expandedMilestones={expandedMilestones}
            setExpandedMilestones={setExpandedMilestones}
            teamMembers={teamMembers}
            onAddMilestone={handleAddMilestone}
            onEditMilestone={handleEditMilestone}
            onDeleteMilestone={handleDeleteMilestone}
            onAddDeliverable={handleAddDeliverable}
            onToggleDeliverable={handleToggleDeliverable}
            onEditDeliverable={handleEditDeliverable}
            onDeleteDeliverable={handleDeleteDeliverable}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onToggleTask={handleToggleTask}
          />
        </motion.div>

        {/* Deliverables Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-6"
        >
          <DeliverablesSection
            projectId={id}
            projectStartDate={project.startDate}
            projectEndDate={project.endDate}
          />
        </motion.div>

        {/* Gantt Chart Toggle */}
        {milestones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="mt-6"
          >
            <Button
              variant="outline"
              onClick={() => setShowGanttChart(!showGanttChart)}
              className="w-full gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              {showGanttChart ? 'Hide' : 'Show'} Gantt Chart
            </Button>
          </motion.div>
        )}

        {/* Gantt Chart */}
        {showGanttChart && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <GanttChart milestones={milestones} projectStartDate={project.startDate} />
          </motion.div>
        )}

        {/* Timeline Dialog */}
        <TimelineDialog
          open={timelineDialogOpen}
          onOpenChange={setTimelineDialogOpen}
          type={timelineDialogType}
          mode={timelineDialogMode}
          data={timelineDialogData}
          onDataChange={setTimelineDialogData}
          onSave={handleTimelineDialogSave}
          onDelete={handleTimelineDialogDelete}
          teamMembers={teamMembers}
          parentMilestone={timelineDialogParent?.milestone}
          parentDeliverable={timelineDialogParent?.deliverable}
        />
      </motion.div>
    </div>
  );
}

export default ProjectDetails;
