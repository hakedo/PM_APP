import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, FileText, Loader2, FolderKanban, Edit2, Save, X, ChevronDown, ChevronUp, Users, UserPlus, Search, Package, Plus, Check, Trash2, Circle, CheckCircle2, Clock, User, UserCheck, MoreVertical, BarChart3 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { GanttChart } from '../../components/gantt';
import { useProject, useTeam } from '../../hooks';
import { clientService, assignmentService, milestoneService, projectService } from '../../services';
import { formatDateDisplay, extractDateForInput } from '../../utils/dateUtils';

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { project, loading, updateProject, refetch } = useProject(id);
  const { teamMembers } = useTeam();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isDeliverablesCollapsed, setIsDeliverablesCollapsed] = useState(false);
  const [showGanttChart, setShowGanttChart] = useState(false);

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
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState(null);
  const [editedMilestone, setEditedMilestone] = useState(null);
  const [newMilestone, setNewMilestone] = useState({ 
    name: '',
    abbreviation: '',
    description: '',
    teamMember: ''
  });
  const [addingDeliverableToMilestone, setAddingDeliverableToMilestone] = useState(null);
  const [newDeliverable, setNewDeliverable] = useState({ 
    title: '', 
    description: '', 
    startDate: '',
    endDateMode: 'date', // 'date' or 'duration'
    endDate: '',
    durationDays: 1,
    durationType: 'business' // 'business' or 'calendar'
  });
  const [editingDeliverableId, setEditingDeliverableId] = useState(null);
  const [editedDeliverable, setEditedDeliverable] = useState(null);
  const [addingTaskToDeliverable, setAddingTaskToDeliverable] = useState(null);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    startDateMode: 'relative',
    startDateOffset: 0,
    startDateOffsetType: 'business',
    endDateMode: 'relative',
    endDateOffset: 1,
    endDateOffsetType: 'business'
  });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState(null);

  // Helper function to add business days to a date
  // Handles both Date objects and UTC date strings from database
  const addBusinessDays = (startDate, days) => {
    // If it's a string (from database), parse it as UTC and create a local date
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
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        addedDays++;
      }
    }
    
    return currentDate;
  };

  // Helper function to add calendar days to a date
  // Handles both Date objects and UTC date strings from database
  const addCalendarDays = (startDate, days) => {
    // If it's a string (from database), parse it as UTC and create a local date
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

  // Fetch assigned clients
  useEffect(() => {
    if (id) {
      fetchAssignedClients();
    }
  }, [id]);

  // Update milestones when project changes
  useEffect(() => {
    if (project?.milestones) {
      setMilestones(project.milestones);
      console.log('Project milestones updated:', project.milestones.map(m => ({
        name: m.name,
        calculatedStartDate: m.calculatedStartDate,
        calculatedEndDate: m.calculatedEndDate,
        deliverables: m.deliverables?.length || 0
      })));
    }
  }, [project]);

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
      startDate: project.startDate ? extractDateForInput(project.startDate) : '',
      endDate: project.endDate ? extractDateForInput(project.endDate) : '',
      supervisor: project.supervisor || '',
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
        supervisor: editedProject.supervisor || null,
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
    if (window.confirm(`Are you sure you want to delete "${project.title}"?\n\nThis will permanently delete the project and all its milestones, deliverables, and tasks. This action cannot be undone.`)) {
      try {
        await projectService.delete(id);
        navigate('/projects');
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  // Milestone handlers
  const handleAddMilestone = async () => {
    if (!newMilestone.name.trim()) return;
    
    console.log('Sending milestone data:', newMilestone);
    
    try {
      await milestoneService.createMilestone(id, newMilestone);
      await refetch();
      setNewMilestone({ 
        name: '',
        abbreviation: '',
        description: '',
        teamMember: ''
      });
      setIsAddingMilestone(false);
    } catch (error) {
      console.error('Failed to add milestone:', error);
      console.error('Error data:', error.data);
      // Extract error message from APIError
      const errorMessage = error.data?.message || error.message || 'Failed to add milestone';
      alert(errorMessage);
    }
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

  const handleEditMilestone = (milestone) => {
    setEditingMilestoneId(milestone._id);
    setEditedMilestone({
      name: milestone.name,
      abbreviation: milestone.abbreviation || '',
      description: milestone.description || '',
      teamMember: milestone.teamMember || ''
    });
    // Expand the milestone being edited
    setExpandedMilestones(prev => ({
      ...prev,
      [milestone._id]: true
    }));
  };

  const handleSaveEditedMilestone = async () => {
    if (!editedMilestone.name.trim()) return;
    
    try {
      await milestoneService.updateMilestone(id, editingMilestoneId, editedMilestone);
      await refetch();
      setEditingMilestoneId(null);
      setEditedMilestone(null);
    } catch (error) {
      console.error('Failed to update milestone:', error);
      // Extract error message from APIError
      const errorMessage = error.data?.message || error.message || 'Failed to update milestone';
      alert(errorMessage);
    }
  };

  const handleCancelEditMilestone = () => {
    setEditingMilestoneId(null);
    setEditedMilestone(null);
  };

  const toggleMilestone = (milestoneId) => {
    setExpandedMilestones(prev => ({
      ...prev,
      [milestoneId]: !prev[milestoneId]
    }));
  };

  // Deliverable handlers
  const handleAddDeliverable = async (milestoneId) => {
    if (!newDeliverable.title.trim() || !newDeliverable.startDate) return;
    
    try {
      const dataToSend = {
        title: newDeliverable.title,
        description: newDeliverable.description,
        startDate: newDeliverable.startDate
      };

      // Calculate end date based on mode
      if (newDeliverable.endDateMode === 'date') {
        if (!newDeliverable.endDate) {
          alert('Please provide an end date');
          return;
        }
        dataToSend.endDate = newDeliverable.endDate;
      } else {
        // Duration mode - calculate end date
        const startDate = new Date(newDeliverable.startDate);
        const endDate = newDeliverable.durationType === 'business'
          ? addBusinessDays(startDate, newDeliverable.durationDays || 1)
          : addCalendarDays(startDate, newDeliverable.durationDays || 1);
        dataToSend.endDate = endDate.toISOString().split('T')[0];
      }

      console.log('Sending deliverable data:', dataToSend);
      await milestoneService.createDeliverable(id, milestoneId, dataToSend);
      await refetch();
      setNewDeliverable({ 
        title: '', 
        description: '', 
        startDate: '',
        endDateMode: 'date',
        endDate: '',
        durationDays: 1,
        durationType: 'business'
      });
      setAddingDeliverableToMilestone(null);
    } catch (error) {
      console.error('Failed to add deliverable:', error);
      alert(error.response?.data?.message || 'Failed to add deliverable');
    }
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

  const handleEditDeliverable = (milestoneId, deliverable) => {
    setEditingDeliverableId(deliverable._id);
    setEditedDeliverable({
      milestoneId: milestoneId,
      title: deliverable.title,
      description: deliverable.description || '',
      startDate: deliverable.startDate ? new Date(deliverable.startDate).toISOString().split('T')[0] : '',
      endDateMode: 'date',
      endDate: deliverable.endDate ? new Date(deliverable.endDate).toISOString().split('T')[0] : '',
      durationDays: 1,
      durationType: 'business'
    });
  };

  const handleSaveEditedDeliverable = async () => {
    if (!editedDeliverable.title.trim() || !editedDeliverable.startDate) return;
    
    try {
      const { milestoneId, endDateMode, durationDays, durationType, ...baseData } = editedDeliverable;
      
      const deliverableData = {
        title: baseData.title,
        description: baseData.description,
        startDate: baseData.startDate
      };

      // Calculate end date based on mode
      if (endDateMode === 'date') {
        if (!baseData.endDate) {
          alert('Please provide an end date');
          return;
        }
        deliverableData.endDate = baseData.endDate;
      } else {
        // Duration mode - calculate end date
        const startDate = new Date(baseData.startDate);
        const endDate = durationType === 'business'
          ? addBusinessDays(startDate, durationDays || 1)
          : addCalendarDays(startDate, durationDays || 1);
        deliverableData.endDate = endDate.toISOString().split('T')[0];
      }

      await milestoneService.updateDeliverable(id, milestoneId, editingDeliverableId, deliverableData);
      await refetch();
      setEditingDeliverableId(null);
      setEditedDeliverable(null);
    } catch (error) {
      console.error('Failed to update deliverable:', error);
      alert(error.response?.data?.message || 'Failed to update deliverable');
    }
  };

  const handleCancelEditDeliverable = () => {
    setEditingDeliverableId(null);
    setEditedDeliverable(null);
  };

  const handleEditTask = (milestoneId, deliverableId, task) => {
    setEditingTaskId(task._id);
    setEditedTask({
      milestoneId: milestoneId,
      deliverableId: deliverableId,
      title: task.title,
      description: task.description || '',
      startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
      endDate: task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : ''
    });
  };

  const handleSaveEditedTask = async () => {
    if (!editedTask.title.trim()) return;
    
    try {
      const { milestoneId, deliverableId, ...taskData } = editedTask;
      await milestoneService.updateTask(id, milestoneId, deliverableId, editingTaskId, taskData);
      await refetch();
      setEditingTaskId(null);
      setEditedTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
      alert(error.response?.data?.message || 'Failed to update task');
    }
  };

  const handleCancelEditTask = () => {
    setEditingTaskId(null);
    setEditedTask(null);
  };

  // Task handlers
  const handleAddTask = async (milestoneId, deliverableId) => {
    if (!newTask.title.trim()) return;
    
    try {
      await milestoneService.createTask(id, milestoneId, deliverableId, newTask);
      await refetch();
      setNewTask({ title: '', description: '', startDate: '', endDate: '' });
      setAddingTaskToDeliverable(null);
    } catch (error) {
      console.error('Failed to add task:', error);
      alert('Failed to add task');
    }
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

  // Use formatDateDisplay from dateUtils for consistency
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${month}/${day}/${year}`;
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
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto"
      >
        {/* Back Button */}
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

        {/* Project Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="border-gray-200">
            <CardHeader className="pb-6 cursor-pointer" onClick={() => !isEditing && setIsCollapsed(!isCollapsed)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FolderKanban className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <Input
                        value={editedProject.title}
                        onChange={(e) => setEditedProject({ ...editedProject, title: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="text-3xl font-bold border-gray-300 shadow-none px-3 focus-visible:ring-1 focus-visible:ring-gray-400"
                        placeholder="Project title"
                      />
                    ) : (
                      <CardTitle className="text-3xl">{project.title}</CardTitle>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCollapsed(!isCollapsed);
                      }}
                      className="gap-1"
                    >
                      {isCollapsed ? (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Expand
                        </>
                      ) : (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Collapse
                        </>
                      )}
                    </Button>
                  )}
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={saving}
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
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
                            Saving...
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit();
                        }}
                        className="gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject();
                        }}
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <CardContent className="space-y-6">
              {/* Description, Start Date, End Date - All in one row */}
              <div className="flex gap-8">
                {/* Description - Takes most of the space */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Description</h3>
                  </div>
                  {isEditing ? (
                    <Textarea
                      value={editedProject.description}
                      onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                      className="pl-7 min-h-[100px] resize-none border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-400"
                      placeholder="Add a description..."
                    />
                  ) : (
                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap pl-7">
                      {project.description || 'No description'}
                    </p>
                  )}
                </div>

                {/* Start Date - Minimal width */}
                <div className="space-y-2 w-48 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Start Date</h3>
                  </div>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedProject.startDate}
                      onChange={(e) => setEditedProject({ ...editedProject, startDate: e.target.value })}
                      className="pl-7 border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-400"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium pl-7">
                      {formatDate(project.startDate)}
                    </p>
                  )}
                </div>

                {/* End Date - Minimal width */}
                <div className="space-y-2 w-48 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">End Date</h3>
                  </div>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedProject.endDate}
                      onChange={(e) => setEditedProject({ ...editedProject, endDate: e.target.value })}
                      className="pl-7 border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-400"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium pl-7">
                      {project.endDate ? formatDate(project.endDate) : 'Not set'}
                    </p>
                  )}
                </div>

                {/* Supervisor - Minimal width */}
                <div className="space-y-2 w-64 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Supervisor</h3>
                  </div>
                  {isEditing ? (
                    <select
                      value={editedProject.supervisor}
                      onChange={(e) => setEditedProject({ ...editedProject, supervisor: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-gray-400 pl-7"
                    >
                      <option value="">Not assigned</option>
                      {teamMembers.filter(m => m.status === 'active').map((member) => (
                        <option key={member._id} value={member._id}>
                          {member.fullName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 font-medium pl-7">
                      {project.supervisor ? teamMembers.find(m => m._id === project.supervisor)?.fullName || 'Not found' : 'Not assigned'}
                    </p>
                  )}
                </div>
              </div>

              {/* Assigned Clients Section */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Assigned Clients
                    <span className="text-sm font-normal text-gray-500">
                      ({assignedClients.length})
                    </span>
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCreatingClient(true);
                      }}
                      className="gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      New Client
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowClientSearch(!showClientSearch);
                      }}
                      className="gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Assign Existing
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
                          onClick={(e) => e.stopPropagation()}
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
                            <div className="p-4 text-center text-gray-500">
                              No clients found
                            </div>
                          ) : (
                            filteredClients.map(client => (
                              <button
                                key={client._id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssignClient(client);
                                }}
                                className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                              >
                                <div className="font-medium text-gray-900">{client.fullName}</div>
                                {client.company && (
                                  <div className="text-sm text-gray-500">{client.company}</div>
                                )}
                                <div className="text-sm text-gray-400">{client.email}</div>
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
                  <div className="text-center py-6 text-gray-500">
                    <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
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
                        className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors group"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 text-sm">{client.fullName}</span>
                          {client.company && (
                            <span className="text-xs text-gray-500">{client.company}</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveClient(client.assignmentId, client.fullName);
                          }}
                          className="text-gray-400 hover:text-red-600 transition-colors ml-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Gantt Chart Timeline View */}
        {milestones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-6"
          >
            <Card className="border-gray-200">
              <CardHeader 
                className="pb-6 cursor-pointer" 
                onClick={() => setShowGanttChart(!showGanttChart)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-4 text-3xl font-bold text-gray-900">
                    <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-7 h-7 text-white" />
                    </div>
                    <span>Project Timeline</span>
                  </CardTitle>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowGanttChart(!showGanttChart);
                    }}
                    className="gap-1.5 h-8 text-xs"
                  >
                    {showGanttChart ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        Expand
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>

              <AnimatePresence>
                {showGanttChart && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <CardContent className="pt-0 p-0">
                      <GanttChart 
                        milestones={milestones}
                        onItemClick={(item, type) => {
                          console.log('Clicked item:', type, item);
                        }}
                      />
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}

        {/* Milestones Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-6"
        >
          <Card className="border-gray-200">
            <CardHeader 
              className="pb-6 cursor-pointer" 
              onClick={() => setIsDeliverablesCollapsed(!isDeliverablesCollapsed)}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-4 text-3xl font-bold text-gray-900">
                  <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center">
                    <Package className="w-7 h-7 text-white" />
                  </div>
                  <span>Milestones</span>
                </CardTitle>

                <div className="flex gap-2">
                  {!isDeliverablesCollapsed && milestones.length > 0 && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAddingMilestone(true);
                      }}
                      className="gap-1.5 h-8 text-xs font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      New
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDeliverablesCollapsed(!isDeliverablesCollapsed);
                    }}
                    className="gap-1.5 h-8 text-xs"
                  >
                    {isDeliverablesCollapsed ? (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        Expand
                      </>
                    ) : (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        Collapse
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <AnimatePresence>
              {!isDeliverablesCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <CardContent className="pt-0 space-y-3">
                    {milestones.length === 0 && !isAddingMilestone && (
                      <div className="text-center py-16 text-gray-500">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 mb-1">No milestones yet</p>
                        <p className="text-xs text-gray-400 mb-6">Get started by creating your first milestone</p>
                        <Button
                          onClick={() => setIsAddingMilestone(true)}
                          className="gap-2 h-9 text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Create Milestone
                        </Button>
                      </div>
                    )}

                    {/* Add Milestone Form */}
                    {isAddingMilestone && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow"
                      >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <h4 className="text-sm font-medium text-gray-900">New Milestone</h4>
                        </div>
                        
                        {/* Form Content - Simple Single Column Layout */}
                        <div className="p-4">
                          <div className="max-w-xl space-y-3">
                            {/* Name and Abbreviation Row */}
                            <div className="flex gap-3">
                              <div className="flex-1 space-y-1.5">
                                <Label htmlFor="milestone-name" className="text-xs font-medium text-gray-600">
                                  Name *
                                </Label>
                                <Input
                                  id="milestone-name"
                                  placeholder="Enter milestone name"
                                  value={newMilestone.name}
                                  onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                                  className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div className="w-24 space-y-1.5">
                                <Label htmlFor="milestone-abbr" className="text-xs font-medium text-gray-600">
                                  Abbr.
                                </Label>
                                <Input
                                  id="milestone-abbr"
                                  placeholder="ABC"
                                  maxLength={5}
                                  value={newMilestone.abbreviation}
                                  onChange={(e) => setNewMilestone({ ...newMilestone, abbreviation: e.target.value.toUpperCase() })}
                                  className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase text-center font-mono"
                                />
                              </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                              <Label htmlFor="milestone-description" className="text-xs font-medium text-gray-600">
                                Description <span className="text-gray-400 font-normal">(optional)</span>
                              </Label>
                              <Textarea
                                id="milestone-description"
                                placeholder="Add a description..."
                                value={newMilestone.description}
                                onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                                className="min-h-[60px] resize-none border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                            </div>

                            {/* Info Note */}
                            <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2">
                              <p className="font-medium mb-0.5">📅 Dates calculated automatically</p>
                              <p className="text-blue-600">Milestone dates will be calculated from its deliverables. Add at least one deliverable with dates.</p>
                            </div>
                          </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex gap-2 justify-end rounded-b-lg">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsAddingMilestone(false);
                              setNewMilestone({ 
                                name: '',
                                abbreviation: '',
                                description: '',
                                teamMember: ''
                              });
                            }}
                            className="h-8 text-xs"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleAddMilestone}
                            disabled={!newMilestone.name.trim()}
                            className="h-8 text-xs gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Milestone
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Milestones List */}
                    {milestones.map((milestone, mIndex) => {
                      console.log('Milestone data:', { 
                        name: milestone.name, 
                        abbreviation: milestone.abbreviation,
                        hasAbbr: !!milestone.abbreviation 
                      });
                      return (
                      <motion.div
                        key={milestone._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                      >
                        {/* Milestone Header - Edit or View Mode */}
                        {editingMilestoneId === milestone._id ? (
                          // Edit Mode
                          <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Edit Milestone</h4>
                            <div className="space-y-3 bg-white p-3 rounded-lg">
                              {/* Name and Abbreviation */}
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <Label htmlFor="edit-name" className="text-xs">Name</Label>
                                  <Input
                                    id="edit-name"
                                    value={editedMilestone.name}
                                    onChange={(e) => setEditedMilestone({ ...editedMilestone, name: e.target.value })}
                                    className="h-8 text-sm"
                                  />
                                </div>
                                <div className="w-20">
                                  <Label htmlFor="edit-abbr" className="text-xs">Abbr.</Label>
                                  <Input
                                    id="edit-abbr"
                                    value={editedMilestone.abbreviation}
                                    onChange={(e) => setEditedMilestone({ ...editedMilestone, abbreviation: e.target.value.toUpperCase() })}
                                    maxLength={5}
                                    className="h-8 text-sm text-center uppercase"
                                  />
                                </div>
                              </div>

                              {/* Description */}
                              <div>
                                <Label htmlFor="edit-desc" className="text-xs">Description</Label>
                                <Textarea
                                  id="edit-desc"
                                  value={editedMilestone.description}
                                  onChange={(e) => setEditedMilestone({ ...editedMilestone, description: e.target.value })}
                                  className="min-h-[50px] text-sm"
                                />
                              </div>

                              {/* Team Member */}
                              <div>
                                <Label htmlFor="edit-team" className="text-xs">Team Member</Label>
                                <Input
                                  id="edit-team"
                                  value={editedMilestone.teamMember}
                                  onChange={(e) => setEditedMilestone({ ...editedMilestone, teamMember: e.target.value })}
                                  className="h-8 text-sm"
                                />
                              </div>

                              {/* Info Note */}
                              <div className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded px-2 py-1.5">
                                <span className="font-medium">Note:</span> Milestone dates will be calculated from its deliverables.
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  onClick={handleSaveEditedMilestone}
                                  disabled={!editedMilestone.name.trim()}
                                  className="flex-1"
                                >
                                  <Save className="w-3 h-3 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEditMilestone}
                                  className="flex-1"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                        <div 
                          className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => toggleMilestone(milestone._id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                  {milestone.abbreviation || milestone.name.substring(0, 5).toUpperCase()}
                                </span>
                                <h3 className="font-semibold text-lg">{milestone.name}</h3>
                              </div>
                              {milestone.description && (
                                <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                              )}
                              {/* Date Info */}
                              {(milestone.calculatedStartDate || milestone.calculatedEndDate) && (
                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                                    {milestone.calculatedStartDate && (
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>Start: {formatDate(milestone.calculatedStartDate)}</span>
                                      </div>
                                    )}
                                    {milestone.calculatedEndDate && (
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>End: {formatDate(milestone.calculatedEndDate)}</span>
                                      </div>
                                    )}
                                    {milestone.calculatedStartDate && milestone.calculatedEndDate && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>
                                          {Math.ceil((new Date(milestone.calculatedEndDate) - new Date(milestone.calculatedStartDate)) / (1000 * 60 * 60 * 24))} days
                                        </span>
                                      </div>
                                    )}
                                    {milestone.calculatedStartDate && (() => {
                                      // Get today's date at midnight local time
                                      const today = new Date();
                                      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                                      
                                      // Parse start date and convert to local midnight
                                      const startDate = new Date(milestone.calculatedStartDate);
                                      const startMidnight = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
                                      
                                      const daysUntilStart = Math.round((startMidnight - todayMidnight) / (1000 * 60 * 60 * 24));
                                      
                                      if (daysUntilStart > 0) {
                                        return (
                                          <div className="flex items-center gap-1 text-amber-600">
                                            <span>Starts in {daysUntilStart} {daysUntilStart === 1 ? 'day' : 'days'}</span>
                                          </div>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-8 w-8 p-0 hover:bg-gray-200"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent 
                                  align="end" 
                                  side="bottom"
                                  sideOffset={5}
                                  className="w-32"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditMilestone(milestone);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMilestone(milestone._id);
                                    }}
                                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              {expandedMilestones[milestone._id] ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                        )}

                        {/* Milestone Content */}
                        <AnimatePresence>
                          {expandedMilestones[milestone._id] && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.2 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div className="p-4 space-y-3">
                                {/* Deliverables */}
                                {milestone.deliverables?.map((deliverable, dIndex) => (
                                  <div key={deliverable._id} className="ml-4 border-l-2 border-gray-200 pl-4">
                                    {editingDeliverableId === deliverable._id ? (
                                      // Edit Mode
                                      <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500">
                                        <h5 className="text-sm font-medium text-gray-900 mb-2">Edit Deliverable</h5>
                                        <div className="space-y-2">
                                          <Input
                                            placeholder="Title"
                                            value={editedDeliverable.title}
                                            onChange={(e) => setEditedDeliverable({ ...editedDeliverable, title: e.target.value })}
                                            className="text-sm"
                                          />
                                          <Textarea
                                            placeholder="Description (optional)"
                                            value={editedDeliverable.description}
                                            onChange={(e) => setEditedDeliverable({ ...editedDeliverable, description: e.target.value })}
                                            className="min-h-[50px] text-sm"
                                          />
                                          
                                          {/* Start Date */}
                                          <div className="space-y-1">
                                            <Label className="text-xs font-medium text-gray-700">
                                              Start Date <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                              type="date"
                                              value={editedDeliverable.startDate}
                                              onChange={(e) => setEditedDeliverable({ ...editedDeliverable, startDate: e.target.value })}
                                              className="h-8 text-xs"
                                              required
                                            />
                                          </div>

                                          {/* End Date Configuration */}
                                          <div className="space-y-2 p-2 bg-white rounded border border-gray-200">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Label className="text-xs font-semibold text-gray-700">End Date</Label>
                                              <select
                                                value={editedDeliverable.endDateMode}
                                                onChange={(e) => setEditedDeliverable({ ...editedDeliverable, endDateMode: e.target.value })}
                                                className="text-xs px-2 py-1 border border-gray-200 rounded"
                                              >
                                                <option value="date">Specific Date</option>
                                                <option value="duration">Duration</option>
                                              </select>
                                            </div>
                                            
                                            {editedDeliverable.endDateMode === 'date' ? (
                                              <div>
                                                <Input
                                                  type="date"
                                                  value={editedDeliverable.endDate}
                                                  onChange={(e) => setEditedDeliverable({ ...editedDeliverable, endDate: e.target.value })}
                                                  min={editedDeliverable.startDate || undefined}
                                                  className="h-8 text-xs"
                                                />
                                              </div>
                                            ) : (
                                              <div className="space-y-2">
                                                <div className="flex gap-2">
                                                  <div className="flex-1">
                                                    <Label className="text-xs">Duration (days)</Label>
                                                    <Input
                                                      type="number"
                                                      min="1"
                                                      value={editedDeliverable.durationDays}
                                                      onChange={(e) => setEditedDeliverable({ ...editedDeliverable, durationDays: parseInt(e.target.value) || 1 })}
                                                      className="h-8 text-xs"
                                                    />
                                                  </div>
                                                  <div className="flex-1">
                                                    <Label className="text-xs">Type</Label>
                                                    <select
                                                      value={editedDeliverable.durationType}
                                                      onChange={(e) => setEditedDeliverable({ ...editedDeliverable, durationType: e.target.value })}
                                                      className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md"
                                                    >
                                                      <option value="business">Business Days</option>
                                                      <option value="calendar">Calendar Days</option>
                                                    </select>
                                                  </div>
                                                </div>
                                                
                                                {/* Calculated End Date */}
                                                {editedDeliverable.startDate && (() => {
                                                  const startDate = new Date(editedDeliverable.startDate);
                                                  const endDate = editedDeliverable.durationType === 'business'
                                                    ? addBusinessDays(startDate, editedDeliverable.durationDays || 1)
                                                    : addCalendarDays(startDate, editedDeliverable.durationDays || 1);
                                                  
                                                  return (
                                                    <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1.5">
                                                      <span className="font-medium">Will end: </span>
                                                      {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                  );
                                                })()}
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex gap-2">
                                            <Button
                                              size="sm"
                                              onClick={handleSaveEditedDeliverable}
                                              disabled={
                                                !editedDeliverable.title.trim() || 
                                                !editedDeliverable.startDate ||
                                                (editedDeliverable.endDateMode === 'date' && !editedDeliverable.endDate)
                                              }
                                              className="flex-1"
                                            >
                                              <Save className="w-3 h-3 mr-1" />
                                              Save
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={handleCancelEditDeliverable}
                                              className="flex-1"
                                            >
                                              <X className="w-3 h-3 mr-1" />
                                              Cancel
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      // View Mode
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-start gap-2 flex-1">
                                          <button
                                            onClick={() => handleToggleDeliverable(milestone._id, deliverable._id, deliverable.completed)}
                                            className="mt-0.5"
                                          >
                                            {deliverable.completed ? (
                                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            ) : (
                                              <Circle className="w-5 h-5 text-gray-400" />
                                            )}
                                          </button>
                                          <div className="flex-1">
                                            <h4 className={`font-medium ${deliverable.completed ? 'line-through text-gray-500' : ''}`}>
                                              Deliverable {dIndex + 1}: {deliverable.title}
                                            </h4>
                                            {deliverable.description && (
                                              <p className="text-sm text-gray-600 mt-1">{deliverable.description}</p>
                                            )}
                                            {(deliverable.calculatedStartDate || deliverable.calculatedEndDate || deliverable.startDate || deliverable.endDate) && (
                                              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                                                {(deliverable.calculatedStartDate || deliverable.startDate) && (
                                                  <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>Start: {formatDate(deliverable.calculatedStartDate || deliverable.startDate)}</span>
                                                  </div>
                                                )}
                                                {(deliverable.calculatedEndDate || deliverable.endDate) && (
                                                  <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>End: {formatDate(deliverable.calculatedEndDate || deliverable.endDate)}</span>
                                                  </div>
                                                )}
                                                {(deliverable.calculatedStartDate || deliverable.startDate) && (deliverable.calculatedEndDate || deliverable.endDate) && (
                                                  <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>
                                                      {Math.ceil((new Date(deliverable.calculatedEndDate || deliverable.endDate) - new Date(deliverable.calculatedStartDate || deliverable.startDate)) / (1000 * 60 * 60 * 24))} days
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <DropdownMenu modal={false}>
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={(e) => e.stopPropagation()}
                                              className="h-8 w-8 p-0 hover:bg-gray-200 -mt-1"
                                            >
                                              <MoreVertical className="w-4 h-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent 
                                            align="end" 
                                            side="bottom"
                                            sideOffset={5}
                                            className="w-32"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <DropdownMenuItem
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditDeliverable(milestone._id, deliverable);
                                              }}
                                              className="cursor-pointer"
                                            >
                                              <Edit2 className="w-4 h-4 mr-2" />
                                              Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteDeliverable(milestone._id, deliverable._id);
                                              }}
                                              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                            >
                                              <Trash2 className="w-4 h-4 mr-2" />
                                              Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>

                                      {/* Tasks */}
                                      {deliverable.tasks?.length > 0 && (
                                        <div className="ml-7 space-y-2 mt-3">
                                          {deliverable.tasks.map((task, tIndex) => (
                                            <div key={task._id}>
                                              {editingTaskId === task._id ? (
                                                // Edit Task Form
                                                <div className="p-3 border-2 border-blue-300 rounded-lg bg-blue-50">
                                                  <div className="space-y-2">
                                                    <div>
                                                      <Label className="text-xs text-gray-700">Title</Label>
                                                      <Input
                                                        value={editedTask.title}
                                                        onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                                                        className="text-sm"
                                                      />
                                                    </div>
                                                    
                                                    {/* Start Date Configuration */}
                                                    <div className="space-y-2 p-2 bg-white rounded border border-gray-200">
                                                      <Label className="text-xs font-semibold text-gray-700">Start Date</Label>
                                                      
                                                      {/* Related Date Display */}
                                                      {deliverable.calculatedStartDate && (
                                                        <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded px-2 py-1.5">
                                                          <span className="font-medium">Deliverable starts: </span>
                                                          {formatDateDisplay(deliverable.calculatedStartDate)}
                                                        </div>
                                                      )}
                                                      
                                                      <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                          <Label className="text-xs">Days After Deliverable Start</Label>
                                                          <Input
                                                            type="number"
                                                            min="0"
                                                            value={editedTask.startDateOffset || 0}
                                                            onChange={(e) => setEditedTask({ ...editedTask, startDateOffset: parseInt(e.target.value) || 0 })}
                                                            className="h-8 text-xs"
                                                          />
                                                        </div>
                                                        <div>
                                                          <Label className="text-xs">Type</Label>
                                                          <select
                                                            value={editedTask.startDateOffsetType || 'business'}
                                                            onChange={(e) => setEditedTask({ ...editedTask, startDateOffsetType: e.target.value })}
                                                            className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md"
                                                          >
                                                            <option value="business">Business Days</option>
                                                            <option value="calendar">Calendar Days</option>
                                                          </select>
                                                        </div>
                                                      </div>
                                                      
                                                      {/* Calculated Start Date */}
                                                      {deliverable.calculatedStartDate && (() => {
                                                        const startDate = editedTask.startDateOffsetType === 'business'
                                                          ? addBusinessDays(deliverable.calculatedStartDate, editedTask.startDateOffset || 0)
                                                          : addCalendarDays(deliverable.calculatedStartDate, editedTask.startDateOffset || 0);
                                                        
                                                        return (
                                                          <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1.5">
                                                            <span className="font-medium">Will start: </span>
                                                            {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                          </div>
                                                        );
                                                      })()}
                                                    </div>

                                                    {/* End Date Configuration */}
                                                    <div className="space-y-2 p-2 bg-white rounded border border-gray-200">
                                                      <Label className="text-xs font-semibold text-gray-700">End Date</Label>
                                                      
                                                      <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                          <Label className="text-xs">Days After Deliverable Start</Label>
                                                          <Input
                                                            type="number"
                                                            min="0"
                                                            value={editedTask.endDateOffset || 0}
                                                            onChange={(e) => setEditedTask({ ...editedTask, endDateOffset: parseInt(e.target.value) || 0 })}
                                                            className="h-8 text-xs"
                                                          />
                                                        </div>
                                                        <div>
                                                          <Label className="text-xs">Type</Label>
                                                          <select
                                                            value={editedTask.endDateOffsetType || 'business'}
                                                            onChange={(e) => setEditedTask({ ...editedTask, endDateOffsetType: e.target.value })}
                                                            className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md"
                                                          >
                                                            <option value="business">Business Days</option>
                                                            <option value="calendar">Calendar Days</option>
                                                          </select>
                                                        </div>
                                                      </div>
                                                      
                                                      {/* Calculated End Date */}
                                                      {deliverable.calculatedStartDate && (() => {
                                                        const endDate = editedTask.endDateOffsetType === 'business'
                                                          ? addBusinessDays(deliverable.calculatedStartDate, editedTask.endDateOffset || 0)
                                                          : addCalendarDays(deliverable.calculatedStartDate, editedTask.endDateOffset || 0);
                                                        
                                                        return (
                                                          <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1.5">
                                                            <span className="font-medium">Will end: </span>
                                                            {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                          </div>
                                                        );
                                                      })()}
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-2" style={{ display: 'none' }}>
                                                      <div>
                                                        <Label className="text-xs text-gray-600">Start Date (optional)</Label>
                                                        <Input
                                                          type="date"
                                                          value={editedTask.startDate}
                                                          onChange={(e) => setEditedTask({ ...editedTask, startDate: e.target.value })}
                                                          min={deliverable.startDate || undefined}
                                                          max={deliverable.endDate || undefined}
                                                          className="text-sm"
                                                        />
                                                      </div>
                                                      <div>
                                                        <Label className="text-xs text-gray-600">End Date (optional)</Label>
                                                        <Input
                                                          type="date"
                                                          value={editedTask.endDate}
                                                          onChange={(e) => setEditedTask({ ...editedTask, endDate: e.target.value })}
                                                          min={editedTask.startDate || deliverable.startDate || undefined}
                                                          max={deliverable.endDate || undefined}
                                                          className="text-sm"
                                                        />
                                                      </div>
                                                    </div>
                                                    <div className="flex gap-2 pt-2">
                                                      <Button
                                                        size="sm"
                                                        onClick={handleSaveEditedTask}
                                                        disabled={!editedTask.title.trim()}
                                                      >
                                                        Save
                                                      </Button>
                                                      <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={handleCancelEditTask}
                                                      >
                                                        Cancel
                                                      </Button>
                                                    </div>
                                                  </div>
                                                </div>
                                              ) : (
                                                // Display Task
                                                <div className="flex items-start gap-2 text-sm">
                                                  <button
                                                    onClick={() => handleToggleTask(milestone._id, deliverable._id, task._id, task.completed)}
                                                    className="mt-0.5"
                                                  >
                                                    {task.completed ? (
                                                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                      <Circle className="w-4 h-4 text-gray-400" />
                                                    )}
                                                  </button>
                                                  <div className="flex-1">
                                                    <span className={task.completed ? 'line-through text-gray-500' : ''}>
                                                      Task {tIndex + 1}: {task.title}
                                                    </span>
                                                    {task.description && (
                                                      <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                                                    )}
                                                    {(task.calculatedStartDate || task.calculatedEndDate || task.startDate || task.endDate) && (
                                                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                        {(task.calculatedStartDate || task.startDate) && (
                                                          <div className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>{formatDate(task.calculatedStartDate || task.startDate)}</span>
                                                          </div>
                                                        )}
                                                        {(task.calculatedEndDate || task.endDate) && (
                                                          <div className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{formatDate(task.calculatedEndDate || task.endDate)}</span>
                                                          </div>
                                                        )}
                                                        {(task.calculatedStartDate || task.startDate) && (task.calculatedEndDate || task.endDate) && (
                                                          <span className="text-gray-400">
                                                            ({Math.ceil((new Date(task.calculatedEndDate || task.endDate) - new Date(task.calculatedStartDate || task.startDate)) / (1000 * 60 * 60 * 24))} days)
                                                          </span>
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>
                                                  <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                      <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-6 w-6 p-0 hover:bg-gray-100"
                                                      >
                                                        <MoreVertical className="w-4 h-4" />
                                                      </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent 
                                                      align="end" 
                                                      side="bottom"
                                                      sideOffset={5}
                                                      className="w-32"
                                                      onClick={(e) => e.stopPropagation()}
                                                    >
                                                      <DropdownMenuItem
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          handleEditTask(milestone._id, deliverable._id, task);
                                                        }}
                                                        className="cursor-pointer"
                                                      >
                                                        <Edit2 className="w-4 h-4 mr-2" />
                                                        Edit
                                                      </DropdownMenuItem>
                                                      <DropdownMenuItem
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          handleDeleteTask(milestone._id, deliverable._id, task._id);
                                                        }}
                                                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                                      >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
                                                      </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                  </DropdownMenu>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {/* Add Task Form */}
                                      {addingTaskToDeliverable === deliverable._id ? (
                                        <div className="ml-7 mt-3 space-y-2">
                                          <Input
                                            placeholder="Task title"
                                            value={newTask.title}
                                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter' && newTask.title.trim()) {
                                                handleAddTask(milestone._id, deliverable._id);
                                              }
                                            }}
                                            className="text-sm"
                                          />
                                          
                                          {/* Start Date Configuration */}
                                          <div className="space-y-2 p-2 bg-white rounded border border-gray-200">
                                            <Label className="text-xs font-semibold text-gray-700">Start Date</Label>
                                            
                                            {/* Related Date Display */}
                                            {deliverable.calculatedStartDate && (
                                              <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded px-2 py-1.5">
                                                <span className="font-medium">Deliverable starts: </span>
                                                {formatDateDisplay(deliverable.calculatedStartDate)}
                                              </div>
                                            )}
                                            
                                            <div className="grid grid-cols-2 gap-2">
                                              <div>
                                                <Label className="text-xs">Days After Deliverable Start</Label>
                                                <Input
                                                  type="number"
                                                  min="0"
                                                  value={newTask.startDateOffset}
                                                  onChange={(e) => setNewTask({ ...newTask, startDateOffset: parseInt(e.target.value) || 0 })}
                                                  className="h-8 text-xs"
                                                />
                                              </div>
                                              <div>
                                                <Label className="text-xs">Type</Label>
                                                <select
                                                  value={newTask.startDateOffsetType}
                                                  onChange={(e) => setNewTask({ ...newTask, startDateOffsetType: e.target.value })}
                                                  className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md"
                                                >
                                                  <option value="business">Business Days</option>
                                                  <option value="calendar">Calendar Days</option>
                                                </select>
                                              </div>
                                            </div>
                                            
                                            {/* Calculated Start Date */}
                                            {deliverable.calculatedStartDate && (() => {
                                              const startDate = newTask.startDateOffsetType === 'business'
                                                ? addBusinessDays(deliverable.calculatedStartDate, newTask.startDateOffset || 0)
                                                : addCalendarDays(deliverable.calculatedStartDate, newTask.startDateOffset || 0);
                                              
                                              return (
                                                <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1.5">
                                                  <span className="font-medium">Will start: </span>
                                                  {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                              );
                                            })()}
                                          </div>

                                          {/* End Date Configuration */}
                                          <div className="space-y-2 p-2 bg-white rounded border border-gray-200">
                                            <Label className="text-xs font-semibold text-gray-700">End Date</Label>
                                            
                                            <div className="grid grid-cols-2 gap-2">
                                              <div>
                                                <Label className="text-xs">Days After Deliverable Start</Label>
                                                <Input
                                                  type="number"
                                                  min="0"
                                                  value={newTask.endDateOffset}
                                                  onChange={(e) => setNewTask({ ...newTask, endDateOffset: parseInt(e.target.value) || 0 })}
                                                  className="h-8 text-xs"
                                                />
                                              </div>
                                              <div>
                                                <Label className="text-xs">Type</Label>
                                                <select
                                                  value={newTask.endDateOffsetType}
                                                  onChange={(e) => setNewTask({ ...newTask, endDateOffsetType: e.target.value })}
                                                  className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md"
                                                >
                                                  <option value="business">Business Days</option>
                                                  <option value="calendar">Calendar Days</option>
                                                </select>
                                              </div>
                                            </div>
                                            
                                            {/* Calculated End Date */}
                                            {deliverable.calculatedStartDate && (() => {
                                              const endDate = newTask.endDateOffsetType === 'business'
                                                ? addBusinessDays(deliverable.calculatedStartDate, newTask.endDateOffset || 0)
                                                : addCalendarDays(deliverable.calculatedStartDate, newTask.endDateOffset || 0);
                                              
                                              return (
                                                <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1.5">
                                                  <span className="font-medium">Will end: </span>
                                                  {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                              );
                                            })()}
                                          </div>
                                          
                                          <div className="grid grid-cols-2 gap-2" style={{ display: 'none' }}>
                                            <div>
                                              <Label className="text-xs text-gray-600">Start Date (optional)</Label>
                                              <Input
                                                type="date"
                                                value={newTask.startDate}
                                                onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                                                min={deliverable.startDate || undefined}
                                                max={deliverable.endDate || undefined}
                                                className="text-sm"
                                              />
                                            </div>
                                            <div>
                                              <Label className="text-xs text-gray-600">End Date (optional)</Label>
                                              <Input
                                                type="date"
                                                value={newTask.endDate}
                                                onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                                                min={newTask.startDate || deliverable.startDate || undefined}
                                                max={deliverable.endDate || undefined}
                                                className="text-sm"
                                              />
                                            </div>
                                          </div>
                                          <div className="flex gap-2">
                                            <Button
                                              size="sm"
                                              onClick={() => handleAddTask(milestone._id, deliverable._id)}
                                              disabled={!newTask.title.trim()}
                                            >
                                              Add
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => {
                                                setAddingTaskToDeliverable(null);
                                                setNewTask({ 
                                                  title: '', 
                                                  description: '', 
                                                  startDateMode: 'manual',
                                                  startDate: '', 
                                                  startDateOffset: 0,
                                                  startDateOffsetType: 'business',
                                                  endDateMode: 'manual',
                                                  endDate: '',
                                                  endDateOffset: 0,
                                                  endDateOffsetType: 'business'
                                                });
                                              }}
                                            >
                                              Cancel
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => setAddingTaskToDeliverable(deliverable._id)}
                                          className="ml-7 mt-2 text-xs"
                                        >
                                          <Plus className="w-3 h-3 mr-1" />
                                          Add Task
                                        </Button>
                                      )}
                                    </div>
                                    )}
                                  </div>
                                ))}

                                {/* Add Deliverable Form */}
                                {addingDeliverableToMilestone === milestone._id ? (
                                  <div className="ml-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                                    <h5 className="font-medium text-sm mb-2">New Deliverable</h5>
                                    <div className="space-y-2">
                                      <Input
                                        placeholder="Deliverable title"
                                        value={newDeliverable.title}
                                        onChange={(e) => setNewDeliverable({ ...newDeliverable, title: e.target.value })}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && newDeliverable.title.trim()) {
                                            handleAddDeliverable(milestone._id);
                                          }
                                        }}
                                      />
                                      <Textarea
                                        placeholder="Description (optional)"
                                        value={newDeliverable.description}
                                        onChange={(e) => setNewDeliverable({ ...newDeliverable, description: e.target.value })}
                                        className="min-h-[50px] resize-none text-sm"
                                      />
                                      
                                      {/* Start Date */}
                                      <div className="space-y-1">
                                        <Label htmlFor="deliverable-start" className="text-xs font-medium text-gray-700">
                                          Start Date <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                          id="deliverable-start"
                                          type="date"
                                          value={newDeliverable.startDate}
                                          onChange={(e) => setNewDeliverable({ ...newDeliverable, startDate: e.target.value })}
                                          className="h-8 text-xs"
                                          required
                                        />
                                      </div>

                                      {/* End Date Configuration */}
                                      <div className="space-y-2 p-2 bg-white rounded border border-gray-200">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Label className="text-xs font-semibold text-gray-700">End Date</Label>
                                          <select
                                            value={newDeliverable.endDateMode}
                                            onChange={(e) => setNewDeliverable({ ...newDeliverable, endDateMode: e.target.value })}
                                            className="text-xs px-2 py-1 border border-gray-200 rounded"
                                          >
                                            <option value="date">Specific Date</option>
                                            <option value="duration">Duration</option>
                                          </select>
                                        </div>
                                        
                                        {newDeliverable.endDateMode === 'date' ? (
                                          <div>
                                            <Input
                                              type="date"
                                              value={newDeliverable.endDate}
                                              onChange={(e) => setNewDeliverable({ ...newDeliverable, endDate: e.target.value })}
                                              min={newDeliverable.startDate || undefined}
                                              className="h-8 text-xs"
                                            />
                                          </div>
                                        ) : (
                                          <div className="space-y-2">
                                            <div className="flex gap-2">
                                              <div className="flex-1">
                                                <Label className="text-xs">Duration (days)</Label>
                                                <Input
                                                  type="number"
                                                  min="1"
                                                  value={newDeliverable.durationDays}
                                                  onChange={(e) => setNewDeliverable({ ...newDeliverable, durationDays: parseInt(e.target.value) || 1 })}
                                                  className="h-8 text-xs"
                                                />
                                              </div>
                                              <div className="flex-1">
                                                <Label className="text-xs">Type</Label>
                                                <select
                                                  value={newDeliverable.durationType}
                                                  onChange={(e) => setNewDeliverable({ ...newDeliverable, durationType: e.target.value })}
                                                  className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md"
                                                >
                                                  <option value="business">Business Days</option>
                                                  <option value="calendar">Calendar Days</option>
                                                </select>
                                              </div>
                                            </div>
                                            
                                            {/* Calculated End Date */}
                                            {newDeliverable.startDate && (() => {
                                              const startDate = new Date(newDeliverable.startDate);
                                              const endDate = newDeliverable.durationType === 'business'
                                                ? addBusinessDays(startDate, newDeliverable.durationDays || 1)
                                                : addCalendarDays(startDate, newDeliverable.durationDays || 1);
                                              
                                              return (
                                                <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1.5">
                                                  <span className="font-medium">Will end: </span>
                                                  {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                              );
                                            })()}
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() => handleAddDeliverable(milestone._id)}
                                          disabled={
                                            !newDeliverable.title.trim() || 
                                            !newDeliverable.startDate ||
                                            (newDeliverable.endDateMode === 'date' && !newDeliverable.endDate)
                                          }
                                        >
                                          Add
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setAddingDeliverableToMilestone(null);
                                            setNewDeliverable({ 
                                              title: '', 
                                              description: '', 
                                              startDate: '',
                                              endDateMode: 'date',
                                              endDate: '',
                                              durationDays: 1,
                                              durationType: 'business'
                                            });
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setAddingDeliverableToMilestone(milestone._id)}
                                    className="ml-4 gap-2"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Add Deliverable
                                  </Button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                    })}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </motion.div>

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
    </div>
  );
}

export default ProjectDetails;