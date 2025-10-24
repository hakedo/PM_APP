import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FolderKanban } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { LoadingSpinner, EmptyState, CollapsibleInfoCard } from '../../components/ui';
import { ClientAssignmentSection, DeliverablesSection } from '../../components/project-details';
import { FinancesSection } from '../../components/finances';
import { useProject, useTeam } from '../../hooks';
import { clientService, assignmentService } from '../../services';
import { formatDateForInput } from '../../utils/dateUtils';
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

  // Helper functions
  const addBusinessDays = (startDate, days) => {
    let currentDate;
    if (typeof startDate === 'string') {
      currentDate = new Date(startDate);
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
      date = new Date(startDate);
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
      startDate: formatDateForInput(project.startDate),
      endDate: formatDateForInput(project.endDate)
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

        {/* Deliverables Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-6"
        >
          <DeliverablesSection
            projectId={id}
            projectStartDate={project.startDate}
            projectEndDate={project.endDate}
          />
        </motion.div>

        {/* Finances Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-6"
        >
          <FinancesSection projectId={id} />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default ProjectDetails;
