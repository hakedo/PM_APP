import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, FileText, Loader2, FolderKanban, Edit2, Save, X, ChevronRight, Users, UserPlus, Search, Plus, Trash2, TrendingUp, BarChart3, Network, Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { useProject } from '../../hooks';
import { clientService, assignmentService, milestoneService, deliverableService, taskService, projectService } from '../../services';
import TimelineGrid from '../../components/milestones/TimelineGrid';
import MilestoneNetworkGraph from '../../components/milestones/MilestoneNetworkGraph';
import MilestoneForm from '../../components/milestones/MilestoneForm';
import DeliverableForm from '../../components/milestones/DeliverableForm';
import TaskForm from '../../components/milestones/TaskForm';

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { project, loading, updateProject } = useProject(id);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false); // Toggle for project details section
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Milestone state
  const [milestones, setMilestones] = useState([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [isMilestoneFormOpen, setIsMilestoneFormOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [viewMode, setViewMode] = useState('network'); // 'network' or 'timeline'
  const [selectedMilestone, setSelectedMilestone] = useState(null); // Currently selected/expanded milestone

  // Deliverable state
  const [deliverables, setDeliverables] = useState({}); // Map of milestoneId -> deliverables array
  const [isDeliverableFormOpen, setIsDeliverableFormOpen] = useState(false);
  const [editingDeliverable, setEditingDeliverable] = useState(null);
  const [currentMilestone, setCurrentMilestone] = useState(null); // For creating/editing deliverables
  const [selectedDeliverable, setSelectedDeliverable] = useState(null); // Currently selected/expanded deliverable

  // Task state
  const [tasks, setTasks] = useState({}); // Map of deliverableId -> tasks array
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [currentDeliverable, setCurrentDeliverable] = useState(null); // For creating/editing tasks

  // Dependency reassignment dialog state
  const [showDependencyDialog, setShowDependencyDialog] = useState(false);
  const [dependencyConflict, setDependencyConflict] = useState(null);
  const [selectedReassignment, setSelectedReassignment] = useState(null);
  const [milestoneToDelete, setMilestoneToDelete] = useState(null);

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

  // Fetch assigned clients and milestones
  useEffect(() => {
    if (id) {
      fetchAssignedClients();
      fetchMilestones();
    }
  }, [id]);

  const fetchMilestones = async () => {
    try {
      setLoadingMilestones(true);
      console.log('Fetching milestones for project:', id);
      const data = await milestoneService.getProjectMilestones(id);
      console.log('Fetched milestones:', data);
      setMilestones(data);
      console.log('Milestones state updated, count:', data?.length || 0);
      
      // Fetch deliverables for all milestones for network graph
      if (data && data.length > 0) {
        fetchAllDeliverables(data);
      }
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoadingMilestones(false);
    }
  };

  // Fetch deliverables for all milestones at once
  const fetchAllDeliverables = async (milestoneList) => {
    try {
      const promises = milestoneList.map(milestone => 
        deliverableService.getDeliverables(id, milestone._id)
          .then(data => ({ milestoneId: milestone._id, data }))
          .catch(error => {
            console.error(`Failed to fetch deliverables for milestone ${milestone._id}:`, error);
            return { milestoneId: milestone._id, data: [] };
          })
      );
      
      const results = await Promise.all(promises);
      const deliverablesMap = {};
      results.forEach(({ milestoneId, data }) => {
        deliverablesMap[milestoneId] = data;
      });
      
      setDeliverables(deliverablesMap);
    } catch (error) {
      console.error('Failed to fetch deliverables:', error);
    }
  };

  // Fetch all clients when search is opened
  useEffect(() => {
    if (showClientSearch && allClients.length === 0) {
      fetchAllClients();
    }
  }, [showClientSearch]);

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

  // Format phone number to (XXX) XXX-XXXX
  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/\D/g, '');
    const limitedNumber = phoneNumber.slice(0, 10);
    if (limitedNumber.length < 4) return limitedNumber;
    else if (limitedNumber.length < 7) return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3)}`;
    else return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3, 6)}-${limitedNumber.slice(6)}`;
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
      
      // Assign the newly created client to the project
      await assignmentService.assignClientToProject({
        clientId: createdClient._id,
        projectId: id
      });
      
      // Refresh data
      await fetchAssignedClients();
      await fetchAllClients();
      
      // Reset form and close dialog
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
  const handleCreateMilestone = () => {
    setEditingMilestone(null);
    setIsMilestoneFormOpen(true);
  };

  const handleEditMilestone = (milestone) => {
    setEditingMilestone(milestone);
    setIsMilestoneFormOpen(true);
  };

  const selectMilestone = (milestone) => {
    if (selectedMilestone?._id === milestone._id) {
      setSelectedMilestone(null); // Deselect if clicking the same one
    } else {
      setSelectedMilestone(milestone);
      setSelectedDeliverable(null); // Reset deliverable selection
      // Fetch deliverables when selecting
      fetchDeliverables(milestone._id);
    }
  };

  // Deliverable handlers
  const fetchDeliverables = async (milestoneId) => {
    try {
      console.log('🔍 Fetching deliverables for milestone:', milestoneId, 'project:', id);
      const data = await deliverableService.getDeliverables(id, milestoneId);
      console.log('✅ Fetched deliverables:', data);
      setDeliverables(prev => ({ ...prev, [milestoneId]: data }));
    } catch (error) {
      console.error('❌ Failed to fetch deliverables:', error);
    }
  };

  const handleCreateDeliverable = (milestone) => {
    setCurrentMilestone(milestone);
    setEditingDeliverable(null);
    setIsDeliverableFormOpen(true);
  };

  const handleEditDeliverable = (milestone, deliverable) => {
    setCurrentMilestone(milestone);
    setEditingDeliverable(deliverable);
    setIsDeliverableFormOpen(true);
  };

  const handleSaveDeliverable = async (deliverableData) => {
    try {
      if (editingDeliverable) {
        await deliverableService.updateDeliverable(
          id, 
          currentMilestone._id, 
          editingDeliverable._id, 
          deliverableData
        );
      } else {
        await deliverableService.createDeliverable(
          id, 
          currentMilestone._id, 
          deliverableData
        );
      }
      
      await fetchDeliverables(currentMilestone._id);
      setIsDeliverableFormOpen(false);
      setEditingDeliverable(null);
      setCurrentMilestone(null);
    } catch (error) {
      console.error('Failed to save deliverable:', error);
      throw error;
    }
  };

  const handleDeleteDeliverable = async (milestoneId, deliverableId, deliverableName) => {
    if (window.confirm(`Delete deliverable "${deliverableName}"? This action cannot be undone.`)) {
      try {
        await deliverableService.deleteDeliverable(id, milestoneId, deliverableId);
        await fetchDeliverables(milestoneId);
      } catch (error) {
        console.error('Failed to delete deliverable:', error);
        alert(`Failed to delete deliverable: ${error.message || 'Unknown error'}`);
      }
    }
  };

  // Task handlers
  const selectDeliverable = (deliverable) => {
    if (selectedDeliverable?._id === deliverable._id) {
      setSelectedDeliverable(null); // Deselect if clicking the same one
    } else {
      setSelectedDeliverable(deliverable);
      // Fetch tasks when selecting
      fetchTasks(selectedMilestone._id, deliverable._id);
    }
  };

  const fetchTasks = async (milestoneId, deliverableId) => {
    try {
      console.log('🔍 Fetching tasks for deliverable:', deliverableId);
      const data = await taskService.getTasks(id, milestoneId, deliverableId);
      console.log('✅ Fetched tasks:', data);
      setTasks(prev => ({ ...prev, [deliverableId]: data }));
    } catch (error) {
      console.error('❌ Failed to fetch tasks:', error);
    }
  };

  const handleCreateTask = (milestone, deliverable) => {
    setCurrentMilestone(milestone);
    setCurrentDeliverable(deliverable);
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (milestone, deliverable, task) => {
    setCurrentMilestone(milestone);
    setCurrentDeliverable(deliverable);
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await taskService.updateTask(
          id,
          currentMilestone._id,
          currentDeliverable._id,
          editingTask._id,
          taskData
        );
      } else {
        await taskService.createTask(
          id,
          currentMilestone._id,
          currentDeliverable._id,
          taskData
        );
      }

      await fetchTasks(currentMilestone._id, currentDeliverable._id);
      setIsTaskFormOpen(false);
      setEditingTask(null);
      setCurrentDeliverable(null);
    } catch (error) {
      console.error('Failed to save task:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (milestoneId, deliverableId, taskId, taskName) => {
    if (window.confirm(`Delete task "${taskName}"? This action cannot be undone.`)) {
      try {
        await taskService.deleteTask(id, milestoneId, deliverableId, taskId);
        await fetchTasks(milestoneId, deliverableId);
      } catch (error) {
        console.error('Failed to delete task:', error);
        alert(`Failed to delete task: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleSaveMilestone = async (milestoneData) => {
    try {
      console.log('Saving milestone:', milestoneData);
      let result;
      if (editingMilestone) {
        console.log('Updating existing milestone:', editingMilestone._id);
        result = await milestoneService.updateMilestone(id, editingMilestone._id, milestoneData);
      } else {
        console.log('Creating new milestone for project:', id);
        result = await milestoneService.createMilestone(id, milestoneData);
      }
      console.log('Save result:', result);
      
      console.log('Fetching updated milestones...');
      await fetchMilestones();
      
      setIsMilestoneFormOpen(false);
      setEditingMilestone(null);
      console.log('Milestone save complete');
    } catch (error) {
      console.error('Failed to save milestone:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  };

  const handleDeleteMilestone = async (milestoneId, milestoneName) => {
    if (window.confirm(`Delete milestone "${milestoneName}"? This action cannot be undone.`)) {
      try {
        await milestoneService.deleteMilestone(id, milestoneId);
        await fetchMilestones();
      } catch (error) {
        console.error('Failed to delete milestone:', error);
        
        // Check if this is a dependency conflict
        // APIError has status and data properties directly (not error.response)
        if (error.status === 409 && error.data?.dependents) {
          setDependencyConflict(error.data);
          setMilestoneToDelete(milestoneId);
          setShowDependencyDialog(true);
          
          // Auto-select if there's only one option
          if (error.data.canAutoReassign && error.data.suggestion?.newDependency) {
            setSelectedReassignment(error.data.suggestion.newDependency);
          }
        } else {
          alert(`Failed to delete milestone: ${error.data?.message || error.message || 'Unknown error'}`);
        }
      }
    }
  };

  const handleConfirmDependencyReassignment = async () => {
    if (!milestoneToDelete) return;

    try {
      // Send delete request with reassignment information
      await milestoneService.deleteMilestone(id, milestoneToDelete, {
        reassignments: {
          newDependency: selectedReassignment
        }
      });
      
      // Close dialog and refresh
      setShowDependencyDialog(false);
      setDependencyConflict(null);
      setMilestoneToDelete(null);
      setSelectedReassignment(null);
      await fetchMilestones();
    } catch (error) {
      console.error('Failed to delete milestone with reassignment:', error);
      alert(`Failed to delete milestone: ${error.data?.message || error.message || 'Unknown error'}`);
    }
  };

  const handleCancelDependencyReassignment = () => {
    setShowDependencyDialog(false);
    setDependencyConflict(null);
    setMilestoneToDelete(null);
    setSelectedReassignment(null);
  };

  const filteredClients = allClients.filter(client => {
    const isAlreadyAssigned = assignedClients.some(ac => ac._id === client._id);
    if (isAlreadyAssigned) return false;

    const searchLower = searchQuery.toLowerCase();
    return (
      client.fullName?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.company?.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = () => {
    setEditedProject({
      title: project.title,
      description: project.description,
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
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
      await updateProject({
        title: editedProject.title,
        description: editedProject.description,
        startDate: editedProject.startDate,
        endDate: editedProject.endDate || null,
      });
      setIsEditing(false);
      setEditedProject(null);
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      setIsDeleting(true);
      await projectService.delete(id);
      setShowDeleteDialog(false);
      navigate('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Status Badge Component
  const StatusBadge = ({ status, small, selected }) => {
    const statusConfig = {
      'completed': { bg: 'bg-green-100', text: 'text-green-700', selectedBg: 'bg-green-500', selectedText: 'text-white', icon: CheckCircle2 },
      'in-progress': { bg: 'bg-blue-100', text: 'text-blue-700', selectedBg: 'bg-blue-500', selectedText: 'text-white', icon: Clock },
      'blocked': { bg: 'bg-red-100', text: 'text-red-700', selectedBg: 'bg-red-500', selectedText: 'text-white', icon: AlertCircle },
      'not-started': { bg: 'bg-gray-200', text: 'text-gray-700', selectedBg: 'bg-gray-600', selectedText: 'text-white', icon: Circle }
    };

    const config = statusConfig[status] || statusConfig['not-started'];
    const Icon = config.icon;
    
    if (selected) {
      return (
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${small ? 'text-xs' : 'text-sm'} font-medium ${config.selectedBg} ${config.selectedText} mt-1`}>
          <Icon className={small ? 'w-3 h-3' : 'w-4 h-4'} />
          <span>{status.replace('-', ' ')}</span>
        </div>
      );
    }

    return (
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${small ? 'text-xs' : 'text-sm'} font-medium ${config.bg} ${config.text}`}>
        <Icon className={small ? 'w-3 h-3' : 'w-4 h-4'} />
        <span>{status.replace('-', ' ')}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FolderKanban className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h3>
        <p className="text-gray-600 mb-6">The project you're looking for doesn't exist</p>
        <Button onClick={() => navigate('/projects')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/projects')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Projects
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              {isEditing ? (
                <Input
                  value={editedProject.title}
                  onChange={(e) => setEditedProject({ ...editedProject, title: e.target.value })}
                  className="text-2xl font-bold border-none shadow-none px-2 py-1 h-auto focus-visible:ring-1"
                  placeholder="Project title"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Project Meta Info with Expand Button */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              {project.startDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(project.startDate)}</span>
                  {project.endDate && (
                    <>
                      <span>→</span>
                      <span>{formatDate(project.endDate)}</span>
                    </>
                  )}
                </div>
              )}
              {assignedClients.length > 0 && (
                <>
                  <div className="h-4 w-px bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{assignedClients.length} {assignedClients.length === 1 ? 'Client' : 'Clients'}</span>
                  </div>
                </>
              )}
              {milestones.length > 0 && (
                <>
                  <div className="h-4 w-px bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>{milestones.length} {milestones.length === 1 ? 'Milestone' : 'Milestones'}</span>
                  </div>
                </>
              )}
            </div>
            
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProjectDetails(!showProjectDetails)}
                className="gap-2 text-gray-600"
              >
                {showProjectDetails ? (
                  <>
                    <ChevronRight className="w-4 h-4 rotate-90" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    Show Details
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Project Details & Clients */}
      <AnimatePresence>
        {(showProjectDetails || isEditing) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="grid grid-cols-12 gap-6">
                {/* Description */}
                <div className="col-span-8">
                  <Label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
                    Description
                  </Label>
                  {isEditing ? (
                    <Textarea
                      value={editedProject.description}
                      onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                      className="min-h-[100px] resize-none"
                      placeholder="Add a description..."
                    />
                  ) : (
                    <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
                      {project.description || 'No description'}
                    </p>
                  )}
                </div>

                {/* Dates */}
                <div className="col-span-4 space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
                      Start Date
                    </Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editedProject.startDate}
                        onChange={(e) => setEditedProject({ ...editedProject, startDate: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900 text-sm font-medium">
                        {formatDate(project.startDate)}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
                      End Date
                    </Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editedProject.endDate}
                        onChange={(e) => setEditedProject({ ...editedProject, endDate: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900 text-sm font-medium">
                        {project.endDate ? formatDate(project.endDate) : 'Not set'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Assigned Clients Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">
                    Assigned Clients ({assignedClients.length})
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsCreatingClient(true)}
                      className="gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      New Client
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowClientSearch(!showClientSearch)}
                      className="gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Assign Client
                    </Button>
                  </div>
                </div>

                {/* Client Search Box */}
                <AnimatePresence>
                  {showClientSearch && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4"
                    >
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search clients by name, email, or company..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      {/* Search Results */}
                      {searchQuery && (
                        <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                          {loadingClients ? (
                            <div className="p-4 text-center text-gray-500">
                              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            </div>
                          ) : filteredClients.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                              No clients found
                            </div>
                          ) : (
                            filteredClients.map(client => (
                              <button
                                key={client._id}
                                onClick={() => handleAssignClient(client)}
                                className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                              >
                                <div className="font-medium text-gray-900 text-sm">{client.fullName}</div>
                                {client.company && (
                                  <div className="text-xs text-gray-500">{client.company}</div>
                                )}
                                <div className="text-xs text-gray-400">{client.email}</div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Assigned Clients List */}
                {assignedClients.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No clients assigned yet</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {assignedClients.map(client => (
                      <motion.div
                        key={client._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 text-sm">{client.fullName}</span>
                          {client.company && (
                            <span className="text-xs text-gray-500">{client.company}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveClient(client.assignmentId, client.fullName)}
                          className="text-gray-400 hover:text-red-600 transition-colors ml-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Milestones List */}
          <div className="col-span-3">
            <div className="sticky top-6 space-y-4">
              {/* Add Milestone Button */}
              <Button
                onClick={handleCreateMilestone}
                className="w-full gap-2"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                New Milestone
              </Button>

              {/* View Mode Toggle */}
              {milestones && milestones.length > 0 && (
                <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('network')}
                    className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      viewMode === 'network'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Network
                  </button>
                  <button
                    onClick={() => setViewMode('timeline')}
                    className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      viewMode === 'timeline'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Timeline
                  </button>
                </div>
              )}

              {/* Milestones List */}
              <div className="space-y-2">
                {loadingMilestones ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 mx-auto animate-spin text-gray-400" />
                  </div>
                ) : milestones.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">
                    No milestones yet
                  </div>
                ) : (
                  milestones.map((milestone) => (
                    <button
                      key={milestone._id}
                      onClick={() => selectMilestone(milestone)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        selectedMilestone?._id === milestone._id
                          ? 'border-gray-900 bg-gray-900 text-white shadow-lg'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="font-medium text-sm line-clamp-2">
                          {milestone.name}
                        </div>
                        {milestone.isCritical && (
                          <TrendingUp className={`w-4 h-4 flex-shrink-0 ${
                            selectedMilestone?._id === milestone._id ? 'text-white' : 'text-red-500'
                          }`} />
                        )}
                      </div>
                      <div className={`text-xs ${
                        selectedMilestone?._id === milestone._id ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {milestone.duration ? `${milestone.duration}d` : 'No duration'}
                        {milestone.slack > 0 && (
                          <span className="ml-2">• {milestone.slack}d slack</span>
                        )}
                      </div>
                      <StatusBadge status={milestone.status} small selected={selectedMilestone?._id === milestone._id} />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-9 space-y-6">
            {/* CPM Visualization */}
            {milestones.length > 0 && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">
                    {viewMode === 'network' ? 'Network Diagram' : 'Timeline View'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {viewMode === 'network' ? (
                    <MilestoneNetworkGraph
                      milestones={milestones}
                      onMilestoneClick={selectMilestone}
                      projectStartDate={project?.startDate}
                      deliverables={deliverables}
                    />
                  ) : (
                    <TimelineGrid
                      milestones={milestones}
                      projectStartDate={project?.startDate}
                      projectEndDate={project?.endDate}
                      onMilestoneClick={selectMilestone}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Selected Milestone Details */}
            {selectedMilestone && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Combined Milestone & Deliverables Card */}
                <Card>
                  <CardContent className="p-6">
                    {/* Milestone Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {selectedMilestone.name}
                        </h2>
                        {selectedMilestone.description && (
                          <p className="text-gray-600 text-sm">{selectedMilestone.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditMilestone(selectedMilestone)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMilestone(selectedMilestone._id, selectedMilestone.name)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Milestone Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Duration</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {selectedMilestone.duration || 0} days
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Status</div>
                        <StatusBadge status={selectedMilestone.status} />
                      </div>
                      {selectedMilestone.isCritical && (
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Critical Path</div>
                          <div className="flex items-center gap-1 text-red-600 font-semibold">
                            <TrendingUp className="w-4 h-4" />
                            <span>Yes</span>
                          </div>
                        </div>
                      )}
                      {selectedMilestone.slack > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Slack</div>
                          <div className="text-lg font-semibold text-green-600">
                            {selectedMilestone.slack} days
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dependencies */}
                    {selectedMilestone.dependencies && selectedMilestone.dependencies.length > 0 && (
                      <div className="mb-6 pb-6 border-b border-gray-200">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Dependencies</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedMilestone.dependencies.map((dep, idx) => {
                            const depName = typeof dep === 'object' ? dep.name : 
                              milestones.find(m => m._id === dep)?.name || 'Unknown';
                            return (
                              <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                {depName}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Deliverables Section */}
                    <div className={selectedMilestone.dependencies && selectedMilestone.dependencies.length > 0 ? '' : 'pt-6 border-t border-gray-200'}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Deliverables</h3>
                        <Button
                          size="sm"
                          onClick={() => handleCreateDeliverable(selectedMilestone)}
                          className="gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Deliverable
                        </Button>
                      </div>
                    {deliverables[selectedMilestone._id] && deliverables[selectedMilestone._id].length > 0 ? (
                      <div className="space-y-2">
                        {deliverables[selectedMilestone._id].map((deliverable) => (
                          <button
                            key={deliverable._id}
                            onClick={() => selectDeliverable(deliverable)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                              selectedDeliverable?._id === deliverable._id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900">{deliverable.name}</h4>
                                  <StatusBadge status={deliverable.status} small />
                                </div>
                                {deliverable.description && (
                                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                    {deliverable.description}
                                  </p>
                                )}
                                {deliverable.startDate && deliverable.endDate && (
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                      {new Date(deliverable.startDate).toLocaleDateString()} → {new Date(deliverable.endDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditDeliverable(selectedMilestone, deliverable);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteDeliverable(selectedMilestone._id, deliverable._id, deliverable.name);
                                  }}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                                  selectedDeliverable?._id === deliverable._id ? 'rotate-90' : ''
                                }`} />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No deliverables yet</p>
                      </div>
                    )}
                    </div>
                  </CardContent>
                </Card>

                {/* Tasks Section - Only show when deliverable is selected */}
                {selectedDeliverable && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-semibold">Tasks</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">{selectedDeliverable.name}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleCreateTask(selectedMilestone, selectedDeliverable)}
                            className="gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add Task
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {tasks[selectedDeliverable._id] && tasks[selectedDeliverable._id].length > 0 ? (
                          <div className="space-y-2">
                            {tasks[selectedDeliverable._id].map((task) => (
                              <div
                                key={task._id}
                                className="p-4 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h5 className="font-medium text-gray-900">{task.name}</h5>
                                      <StatusBadge status={task.status} small />
                                      {task.priority === 'critical' && (
                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded font-medium">
                                          Critical
                                        </span>
                                      )}
                                      {task.priority === 'high' && (
                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded font-medium">
                                          High
                                        </span>
                                      )}
                                    </div>
                                    {task.description && (
                                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                      {task.assignedTo && (
                                        <div className="flex items-center gap-1">
                                          <Users className="w-3 h-3" />
                                          <span>{task.assignedTo}</span>
                                        </div>
                                      )}
                                      {task.estimatedHours > 0 && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          <span>{task.estimatedHours}h</span>
                                        </div>
                                      )}
                                      {task.dueDate && (
                                        <div className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditTask(selectedMilestone, selectedDeliverable, task)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteTask(selectedMilestone._id, selectedDeliverable._id, task._id, task.name)}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-400">
                            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No tasks yet</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Empty State when no milestone selected */}
            {!selectedMilestone && milestones.length > 0 && (
              <Card>
                <CardContent className="py-16 text-center text-gray-400">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">Select a milestone to view details</p>
                  <p className="text-sm">Click on a milestone from the sidebar to see deliverables and tasks</p>
                </CardContent>
              </Card>
            )}

            {/* Empty State when no milestones */}
            {!loadingMilestones && milestones.length === 0 && (
              <Card>
                <CardContent className="py-16 text-center text-gray-400">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">No milestones yet</p>
                  <p className="text-sm mb-6">Create your first milestone to start planning</p>
                  <Button onClick={handleCreateMilestone} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Milestone
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Create New Client Dialog */}
      <AnimatePresence>
        {isCreatingClient && (
          <Dialog open={isCreatingClient} onOpenChange={setIsCreatingClient}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onClose={handleCloseNewClientDialog}>
              <DialogHeader>
                <DialogTitle>Create New Client</DialogTitle>
                <DialogDescription>
                  Add a new client and automatically assign them to this project
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateClient}>
                <div className="grid gap-4 py-4">
                  {/* Company */}
                  <div className="grid gap-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      value={newClient.company}
                      onChange={handleNewClientInputChange}
                      placeholder="Company name (optional)"
                    />
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-5">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={newClient.firstName}
                        onChange={handleNewClientInputChange}
                        placeholder="First name"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="middleInitial">M.I.</Label>
                      <Input
                        id="middleInitial"
                        name="middleInitial"
                        value={newClient.middleInitial}
                        onChange={handleNewClientInputChange}
                        placeholder="M"
                        maxLength={1}
                      />
                    </div>
                    <div className="col-span-5">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={newClient.lastName}
                        onChange={handleNewClientInputChange}
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={newClient.email}
                        onChange={handleNewClientInputChange}
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={newClient.phone}
                        onChange={handleNewClientInputChange}
                        placeholder="(555) 123-4567"
                        required
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="grid gap-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={newClient.address}
                      onChange={handleNewClientInputChange}
                      placeholder="123 Main St"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unit/Suite</Label>
                    <Input
                      id="unit"
                      name="unit"
                      value={newClient.unit}
                      onChange={handleNewClientInputChange}
                      placeholder="Apt 4B, Suite 200, etc."
                    />
                  </div>

                  {/* City, State, ZIP */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={newClient.city}
                        onChange={handleNewClientInputChange}
                        placeholder="City"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={newClient.state}
                        onChange={handleNewClientInputChange}
                        placeholder="CA"
                        maxLength={2}
                        className="uppercase"
                        required
                      />
                    </div>
                    <div className="col-span-4">
                      <Label htmlFor="zip">ZIP Code *</Label>
                      <Input
                        id="zip"
                        name="zip"
                        value={newClient.zip}
                        onChange={handleNewClientInputChange}
                        placeholder="12345"
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseNewClientDialog}
                    disabled={creatingClient}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creatingClient}>
                    {creatingClient ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create & Assign
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Milestone Form Dialog */}
      <MilestoneForm
        milestone={editingMilestone}
        projectId={id}
        allMilestones={milestones}
        onSave={handleSaveMilestone}
        onCancel={() => {
          setIsMilestoneFormOpen(false);
          setEditingMilestone(null);
        }}
        isOpen={isMilestoneFormOpen}
      />

      {/* Dependency Reassignment Dialog */}
      <Dialog open={showDependencyDialog} onOpenChange={setShowDependencyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Dependency Conflict
            </DialogTitle>
            <DialogDescription>
              {dependencyConflict?.message}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Show dependents info */}
            {dependencyConflict?.dependents && dependencyConflict.dependents.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-sm text-amber-900 mb-2">
                  The following milestones depend on this one:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
                  {dependencyConflict.dependents.map(dep => (
                    <li key={dep.id}>{dep.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Automatic reassignment suggestion */}
            {dependencyConflict?.canAutoReassign && dependencyConflict?.suggestion?.type === 'automatic' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-sm text-blue-900 mb-2">
                  Recommended Action:
                </h4>
                <p className="text-sm text-blue-800">
                  {dependencyConflict.suggestion.description}
                </p>
              </div>
            )}

            {/* Remove dependency suggestion */}
            {dependencyConflict?.canAutoReassign && dependencyConflict?.suggestion?.type === 'remove' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-sm text-blue-900 mb-2">
                  Recommended Action:
                </h4>
                <p className="text-sm text-blue-800">
                  {dependencyConflict.suggestion.description}
                </p>
              </div>
            )}

            {/* Multiple options - user choice required */}
            {dependencyConflict?.requiresUserChoice && dependencyConflict?.options && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-900">
                  Choose a new dependency for the dependent milestones:
                </h4>
                <div className="space-y-2">
                  {dependencyConflict.options.map(option => (
                    <label
                      key={option.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedReassignment === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reassignment"
                        value={option.id}
                        checked={selectedReassignment === option.id}
                        onChange={(e) => setSelectedReassignment(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">
                          {option.name}
                        </div>
                        {option.description && (
                          <div className="text-sm text-gray-600 mt-1">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedReassignment === null || selectedReassignment === 'none'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reassignment"
                      value="none"
                      checked={selectedReassignment === null || selectedReassignment === 'none'}
                      onChange={() => setSelectedReassignment(null)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        No dependency
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Dependent milestones will have no dependencies
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelDependencyReassignment}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDependencyReassignment}
              disabled={dependencyConflict?.requiresUserChoice && !selectedReassignment && selectedReassignment !== null}
            >
              Delete Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Project
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{project?.title}</strong>? This action will permanently delete the project and all associated milestones, deliverables, tasks, and client assignments. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deliverable Form Dialog */}
      <DeliverableForm
        deliverable={editingDeliverable}
        milestone={currentMilestone}
        projectId={id}
        onSave={handleSaveDeliverable}
        onCancel={() => {
          setIsDeliverableFormOpen(false);
          setEditingDeliverable(null);
          setCurrentMilestone(null);
        }}
        isOpen={isDeliverableFormOpen}
      />

      {/* Task Form Dialog */}
      {isTaskFormOpen && currentDeliverable && (
        <TaskForm
          task={editingTask}
          deliverable={currentDeliverable}
          milestone={currentMilestone}
          projectId={id}
          onSave={handleSaveTask}
          onCancel={() => {
            setIsTaskFormOpen(false);
            setEditingTask(null);
            setCurrentDeliverable(null);
          }}
        />
      )}
    </div>
  );
}

export default ProjectDetails;