import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, FileText, Loader2, FolderKanban, Edit2, Save, X, ChevronDown, ChevronUp, Users, UserPlus, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { useProject } from '../../hooks';
import { clientService, assignmentService } from '../../services';

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { project, loading, updateProject } = useProject(id);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Client assignment state
  const [assignedClients, setAssignedClients] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  // Fetch assigned clients
  useEffect(() => {
    if (id) {
      fetchAssignedClients();
    }
  }, [id]);

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
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowClientSearch(!showClientSearch);
                    }}
                    className="gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Assign Client
                  </Button>
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
      </motion.div>
    </div>
  );
}

export default ProjectDetails;