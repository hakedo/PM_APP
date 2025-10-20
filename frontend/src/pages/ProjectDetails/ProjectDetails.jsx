import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, FileText, Loader2, FolderKanban, Edit2, Save, X, ChevronDown, ChevronUp, Users, UserPlus, Search, Package, Plus, Trash2, TrendingUp, BarChart3, Network } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { useProject } from '../../hooks';
import { clientService, assignmentService, milestoneService } from '../../services';
import TimelineGrid from '../../components/milestones/TimelineGrid';
import MilestoneNetworkGraph from '../../components/milestones/MilestoneNetworkGraph';
import MilestoneForm from '../../components/milestones/MilestoneForm';

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { project, loading, updateProject } = useProject(id);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isDeliverablesCollapsed, setIsDeliverablesCollapsed] = useState(false);

  // Milestone state
  const [milestones, setMilestones] = useState([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [isMilestoneFormOpen, setIsMilestoneFormOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [viewMode, setViewMode] = useState('network'); // 'network' or 'timeline'
  const [isMilestoneDetailsCollapsed, setIsMilestoneDetailsCollapsed] = useState(true);
  const [expandedMilestones, setExpandedMilestones] = useState(new Set()); // Track expanded milestone cards

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
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoadingMilestones(false);
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

  const toggleMilestoneCard = (milestoneId) => {
    setExpandedMilestones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(milestoneId)) {
        newSet.delete(milestoneId);
      } else {
        newSet.add(milestoneId);
      }
      return newSet;
    });
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
        alert(`Failed to delete milestone: ${error.message || 'Unknown error'}`);
      }
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
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

        {/* Deliverables Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6"
        >
          <Card className="border-gray-200">
            <CardHeader 
              className="pb-6 cursor-pointer" 
              onClick={() => setIsDeliverablesCollapsed(!isDeliverablesCollapsed)}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center">
                    <Package className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900">Deliverables</span>
                </CardTitle>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeliverablesCollapsed(!isDeliverablesCollapsed);
                  }}
                  className="gap-2"
                >
                  {isDeliverablesCollapsed ? (
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
                  <CardContent className="pt-0">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">Project Milestones</h3>
                        {milestones && milestones.length > 0 && milestones.some(m => m.isCritical) && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-medium">Critical Path Active</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {/* View Toggle */}
                        {milestones && milestones.length > 0 && (
                          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() => setViewMode('network')}
                              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                                viewMode === 'network'
                                  ? 'bg-white text-gray-900 shadow-sm'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              <Network className="w-4 h-4" />
                              Network
                            </button>
                            <button
                              onClick={() => setViewMode('timeline')}
                              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                                viewMode === 'timeline'
                                  ? 'bg-white text-gray-900 shadow-sm'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              <BarChart3 className="w-4 h-4" />
                              Timeline
                            </button>
                          </div>
                        )}
                        <Button onClick={handleCreateMilestone} className="gap-2">
                          <Plus className="w-4 h-4" />
                          Add Milestone
                        </Button>
                      </div>
                    </div>

                    {/* Milestone Visualization */}
                    {loadingMilestones ? (
                      <div className="text-center py-12">
                        <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-gray-400" />
                        <p className="text-sm text-gray-500">Loading milestones...</p>
                      </div>
                    ) : viewMode === 'network' ? (
                      <MilestoneNetworkGraph
                        milestones={milestones || []}
                        onMilestoneClick={handleEditMilestone}
                        projectStartDate={project?.startDate}
                      />
                    ) : (
                      <TimelineGrid
                        milestones={milestones || []}
                        projectStartDate={project?.startDate}
                        projectEndDate={project?.endDate}
                        onMilestoneClick={handleEditMilestone}
                      />
                    )}

                    {/* Milestone List (below timeline) */}
                    {milestones && milestones.length > 0 && (
                      <div className="mt-8 border-t pt-6">
                        <div 
                          className="flex items-center justify-between mb-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors"
                          onClick={() => setIsMilestoneDetailsCollapsed(!isMilestoneDetailsCollapsed)}
                        >
                          <h4 className="text-sm font-semibold text-gray-700">Milestone Details</h4>
                          {isMilestoneDetailsCollapsed ? (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <AnimatePresence>
                          {!isMilestoneDetailsCollapsed && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-3">
                                {milestones.map((milestone) => {
                                  const isExpanded = expandedMilestones.has(milestone._id);
                                  return (
                                    <div
                                      key={milestone._id}
                                      className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden"
                                    >
                                      {/* Card Header - Always Visible */}
                                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => toggleMilestoneCard(milestone._id)}
                                      >
                                        <div className="flex items-center gap-3 flex-1">
                                          {milestone.isCritical && (
                                            <TrendingUp className="w-5 h-5 text-red-500 flex-shrink-0" />
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900">{milestone.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                              {milestone.earliestStart && milestone.earliestFinish && (
                                                <>
                                                  {new Date(milestone.earliestStart).toLocaleDateString()} - 
                                                  {new Date(milestone.earliestFinish).toLocaleDateString()}
                                                </>
                                              )}
                                              {milestone.dependencies && milestone.dependencies.length > 0 && (
                                                <span className="ml-2">
                                                  • {milestone.dependencies.length} {milestone.dependencies.length === 1 ? 'dependency' : 'dependencies'}
                                                </span>
                                              )}
                                              {milestone.slack > 0 && (
                                                <span className="ml-2 text-green-600">
                                                  • {milestone.slack}d slack
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                                            milestone.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                            milestone.status === 'blocked' ? 'bg-orange-100 text-orange-700' :
                                            'bg-gray-200 text-gray-700'
                                          }`}>
                                            {milestone.status.replace('-', ' ')}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditMilestone(milestone);
                                            }}
                                          >
                                            <Edit2 className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteMilestone(milestone._id, milestone.name);
                                            }}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                          {isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-gray-400 ml-2" />
                                          ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400 ml-2" />
                                          )}
                                        </div>
                                      </div>

                                      {/* Card Body - Collapsible Content */}
                                      <AnimatePresence>
                                        {isExpanded && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden border-t border-gray-200"
                                          >
                                            <div className="p-4 bg-gray-50 space-y-3">
                                              {/* Description */}
                                              {milestone.description && (
                                                <div>
                                                  <div className="text-xs font-semibold text-gray-700 mb-1">Description</div>
                                                  <div className="text-sm text-gray-600">{milestone.description}</div>
                                                </div>
                                              )}

                                              {/* Duration */}
                                              {milestone.duration && (
                                                <div>
                                                  <div className="text-xs font-semibold text-gray-700 mb-1">Duration</div>
                                                  <div className="text-sm text-gray-600">{milestone.duration} days</div>
                                                </div>
                                              )}

                                              {/* Dependencies */}
                                              {milestone.dependencies && milestone.dependencies.length > 0 && (
                                                <div>
                                                  <div className="text-xs font-semibold text-gray-700 mb-1">Dependencies</div>
                                                  <div className="flex flex-wrap gap-2">
                                                    {milestone.dependencies.map((dep, idx) => {
                                                      const depName = typeof dep === 'object' ? dep.name : 
                                                        milestones.find(m => m._id === dep)?.name || 'Unknown';
                                                      return (
                                                        <span key={idx} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                                          {depName}
                                                        </span>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              )}

                                              {/* Critical Path Info */}
                                              {milestone.isCritical && (
                                                <div>
                                                  <div className="text-xs font-semibold text-gray-700 mb-1">Critical Path</div>
                                                  <div className="text-sm text-red-600 flex items-center gap-1">
                                                    <TrendingUp className="w-4 h-4" />
                                                    This milestone is on the critical path
                                                  </div>
                                                </div>
                                              )}

                                              {/* Placeholder for future content */}
                                              <div className="pt-2 border-t border-gray-300">
                                                <div className="text-xs text-gray-400 italic">
                                                  Additional details will appear here
                                                </div>
                                              </div>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
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
    </div>
  );
}

export default ProjectDetails;