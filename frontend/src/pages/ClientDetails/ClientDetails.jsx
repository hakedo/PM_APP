import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Phone, MapPin, Building2, Loader2, Users, Edit2, Save, X, ChevronDown, ChevronUp, Briefcase } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useClient } from '../../hooks';
import { assignmentService } from '../../services';

// Format phone number to (XXX) XXX-XXXX
const formatPhoneNumber = (value) => {
  if (!value) return value;
  const phoneNumber = value.replace(/\D/g, '');
  const limitedNumber = phoneNumber.slice(0, 10);
  if (limitedNumber.length < 4) return limitedNumber;
  else if (limitedNumber.length < 7) return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3)}`;
  else return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3, 6)}-${limitedNumber.slice(6)}`;
};

function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { client, loading, updateClient } = useClient(id);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Assigned projects state
  const [assignedProjects, setAssignedProjects] = useState([]);

  // Fetch assigned projects
  useEffect(() => {
    if (id) {
      fetchAssignedProjects();
    }
  }, [id]);

  const fetchAssignedProjects = async () => {
    try {
      const projects = await assignmentService.getProjectsForClient(id);
      setAssignedProjects(projects);
    } catch (error) {
      console.error('Failed to fetch assigned projects:', error);
    }
  };

  const handleEdit = () => {
    setEditedClient({
      company: client.company || '',
      firstName: client.firstName,
      middleInitial: client.middleInitial || '',
      lastName: client.lastName,
      phone: client.phone,
      email: client.email,
      address: client.address,
      unit: client.unit || '',
      city: client.city,
      state: client.state,
      zip: client.zip
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedClient(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateClient({
        company: editedClient.company,
        firstName: editedClient.firstName,
        middleInitial: editedClient.middleInitial,
        lastName: editedClient.lastName,
        phone: editedClient.phone,
        email: editedClient.email,
        address: editedClient.address,
        unit: editedClient.unit,
        city: editedClient.city,
        state: editedClient.state,
        zip: editedClient.zip
      });
      setIsEditing(false);
      setEditedClient(null);
    } catch (error) {
      console.error('Failed to update client:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    if (name === 'state') {
      newValue = value.toUpperCase();
    } else if (name === 'phone') {
      newValue = formatPhoneNumber(value);
    }
    
    setEditedClient(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Client not found</h3>
        <p className="text-gray-600 mb-6">The client you're looking for doesn't exist</p>
        <Button onClick={() => navigate('/clients')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clients
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
            onClick={() => navigate('/clients')}
            className="gap-2 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Clients
          </Button>
        </motion.div>

        {/* Client Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="border-gray-200">
            <CardHeader className="pb-6 cursor-pointer" onClick={() => !isEditing && setIsCollapsed(!isCollapsed)}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{client.fullName}</h1>
                    {client.company && (
                      <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {client.company}
                      </p>
                    )}
                  </div>
                </CardTitle>

                <div className="flex items-center gap-3">
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCollapsed(!isCollapsed);
                      }}
                      className="gap-2"
                    >
                      {isCollapsed ? (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Collapse
                        </>
                      ) : (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Expand
                        </>
                      )}
                    </Button>
                  )}

                  {isEditing ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel();
                        }}
                        disabled={saving}
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSave();
                        }}
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
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Name Section */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-gray-500" />
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Name</h3>
                        </div>
                        {isEditing ? (
                          <div className="space-y-2 pl-7">
                            <Input
                              name="firstName"
                              value={editedClient.firstName}
                              onChange={handleInputChange}
                              placeholder="First Name"
                              className="border-gray-300"
                            />
                            <Input
                              name="middleInitial"
                              value={editedClient.middleInitial}
                              onChange={handleInputChange}
                              placeholder="M.I."
                              maxLength={1}
                              className="border-gray-300"
                            />
                            <Input
                              name="lastName"
                              value={editedClient.lastName}
                              onChange={handleInputChange}
                              placeholder="Last Name"
                              className="border-gray-300"
                            />
                          </div>
                        ) : (
                          <p className="text-gray-900 font-medium pl-7">{client.fullName}</p>
                        )}
                      </div>

                      {/* Company */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-gray-500" />
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Company</h3>
                        </div>
                        {isEditing ? (
                          <Input
                            name="company"
                            value={editedClient.company}
                            onChange={handleInputChange}
                            placeholder="Company name"
                            className="pl-7 border-gray-300"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium pl-7">{client.company || 'Not set'}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-gray-500" />
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Email</h3>
                        </div>
                        {isEditing ? (
                          <Input
                            name="email"
                            type="email"
                            value={editedClient.email}
                            onChange={handleInputChange}
                            placeholder="email@example.com"
                            className="pl-7 border-gray-300"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium pl-7">{client.email}</p>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-5 h-5 text-gray-500" />
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Phone</h3>
                        </div>
                        {isEditing ? (
                          <Input
                            name="phone"
                            type="tel"
                            value={editedClient.phone}
                            onChange={handleInputChange}
                            placeholder="(555) 123-4567"
                            className="pl-7 border-gray-300"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium pl-7">{formatPhoneNumber(client.phone)}</p>
                        )}
                      </div>

                      {/* Address */}
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-gray-500" />
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Address</h3>
                        </div>
                        {isEditing ? (
                          <div className="space-y-2 pl-7">
                            <Input
                              name="address"
                              value={editedClient.address}
                              onChange={handleInputChange}
                              placeholder="Street address"
                              className="border-gray-300"
                            />
                            <Input
                              name="unit"
                              value={editedClient.unit}
                              onChange={handleInputChange}
                              placeholder="Unit/STE"
                              className="border-gray-300"
                            />
                            <div className="grid grid-cols-12 gap-2">
                              <Input
                                name="city"
                                value={editedClient.city}
                                onChange={handleInputChange}
                                placeholder="City"
                                className="col-span-6 border-gray-300"
                              />
                              <Input
                                name="state"
                                value={editedClient.state}
                                onChange={handleInputChange}
                                placeholder="ST"
                                maxLength={2}
                                className="col-span-2 uppercase border-gray-300"
                              />
                              <Input
                                name="zip"
                                value={editedClient.zip}
                                onChange={handleInputChange}
                                placeholder="ZIP"
                                className="col-span-4 border-gray-300"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="pl-7">
                            <p className="text-gray-900 font-medium">
                              {client.address}{client.unit && ` ${client.unit}`}
                            </p>
                            <p className="text-gray-900 font-medium">
                              {client.city}, {client.state} {client.zip}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Assigned Projects Section */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Briefcase className="w-5 h-5" />
                          Assigned Projects
                          <span className="text-sm font-normal text-gray-500">
                            ({assignedProjects.length})
                          </span>
                        </h3>
                      </div>

                      {assignedProjects.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          <Briefcase className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">Not assigned to any projects yet</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {assignedProjects.map(project => (
                            <div
                              key={project._id}
                              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
                              onClick={() => navigate(`/projects/${project._id}`)}
                            >
                              <h4 className="font-semibold text-gray-900 mb-1">{project.title}</h4>
                              {project.description && (
                                <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
                              )}
                            </div>
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

export default ClientDetails;
