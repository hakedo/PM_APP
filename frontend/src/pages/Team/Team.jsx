import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Loader2, Mail, Phone, Briefcase, Building2, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { useTeam } from '../../hooks';
import { teamRoleService } from '../../services';

// Format phone number to (XXX) XXX-XXXX
const formatPhoneNumber = (value) => {
  if (!value) return value;
  
  // Remove all non-digit characters
  const phoneNumber = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  const limitedNumber = phoneNumber.slice(0, 10);
  
  // Format based on length
  if (limitedNumber.length < 4) {
    return limitedNumber;
  } else if (limitedNumber.length < 7) {
    return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3)}`;
  } else {
    return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3, 6)}-${limitedNumber.slice(6)}`;
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

function Team() {
  const navigate = useNavigate();
  const { teamMembers, loading, createTeamMember, updateTeamMember, deleteTeamMember } = useTeam();
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMember, setNewMember] = useState({
    firstName: '',
    middleInitial: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    status: 'active'
  });

  // Role management state
  const [isManagingRoles, setIsManagingRoles] = useState(false);
  const [teamRoles, setTeamRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    isActive: true
  });

  const fetchTeamRoles = async () => {
    try {
      setLoadingRoles(true);
      console.log('Fetching team roles...');
      const data = await teamRoleService.getAll();
      console.log('Team roles received:', data);
      console.log('Team roles type:', typeof data);
      console.log('Is array?:', Array.isArray(data));
      setTeamRoles(data || []);
    } catch (error) {
      console.error('Failed to fetch team roles:', error);
      console.error('Error details:', error.response?.data || error.message);
      setTeamRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  };

  // Fetch team roles when managing roles dialog opens
  useEffect(() => {
    if (isManagingRoles) {
      fetchTeamRoles();
    }
  }, [isManagingRoles]);

  // Fetch team roles when add/edit member dialog opens
  useEffect(() => {
    if (isAddingMember || isEditingMember) {
      fetchTeamRoles();
    }
  }, [isAddingMember, isEditingMember]);

  const handleAddMember = () => {
    setIsAddingMember(true);
  };

  const handleCloseModal = () => {
    setIsAddingMember(false);
    setIsEditingMember(false);
    setEditingMember(null);
    setNewMember({
      firstName: '',
      middleInitial: '',
      lastName: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      status: 'active'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    if (name === 'phone') {
      newValue = formatPhoneNumber(value);
    } else if (name === 'middleInitial') {
      newValue = value.toUpperCase().slice(0, 1);
    }
    
    setNewMember(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (isEditingMember) {
        await updateTeamMember(editingMember._id, newMember);
        setIsEditingMember(false);
        setEditingMember(null);
      } else {
        await createTeamMember(newMember);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save team member:', error);
      alert(`Failed to save team member: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setNewMember({
      firstName: member.firstName,
      middleInitial: member.middleInitial || '',
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      role: member.role,
      department: member.department || '',
      status: member.status
    });
    setIsEditingMember(true);
  };

  const handleDeleteMember = async (memberId, memberName) => {
    if (window.confirm(`Are you sure you want to delete ${memberName}?`)) {
      try {
        await deleteTeamMember(memberId);
      } catch (error) {
        console.error('Failed to delete team member:', error);
        alert(`Failed to delete team member: ${error.message || 'Unknown error'}`);
      }
    }
  };

  // Role management functions
  const handleAddRole = () => {
    setIsAddingRole(true);
  };

  const handleCloseRoleModal = () => {
    setIsAddingRole(false);
    setIsEditingRole(false);
    setEditingRole(null);
    setNewRole({
      name: '',
      description: '',
      isActive: true
    });
  };

  const handleRoleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRole(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmitRole = async (e) => {
    e.preventDefault();
    if (isSubmittingRole) return;
    
    setIsSubmittingRole(true);
    try {
      if (isEditingRole) {
        await teamRoleService.update(editingRole._id, newRole);
      } else {
        await teamRoleService.create(newRole);
      }
      handleCloseRoleModal();
      await fetchTeamRoles();
    } catch (error) {
      console.error('Failed to save team role:', error);
      alert(`Failed to save team role: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setIsSubmittingRole(false);
    }
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setNewRole({
      name: role.name,
      description: role.description || '',
      isActive: role.isActive
    });
    setIsEditingRole(true);
  };

  const handleDeleteRole = async (roleId, roleName) => {
    if (window.confirm(`Are you sure you want to delete "${roleName}"?`)) {
      try {
        await teamRoleService.delete(roleId);
        await fetchTeamRoles();
      } catch (error) {
        console.error('Failed to delete team role:', error);
        alert(`Failed to delete team role: ${error.response?.data?.message || error.message || 'Unknown error'}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Team</h1>
            <p className="text-gray-600">Manage your team members</p>
          </div>
          <div className="flex gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={() => setIsManagingRoles(true)} size="lg" variant="outline" className="gap-2">
                <Briefcase className="w-4 h-4" />
                Manage Roles
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handleAddMember} size="lg" className="gap-2">
                <Plus className="w-4 h-4" />
                New Member
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Team Grid */}
        {teamMembers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No team members yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first team member</p>
            <Button onClick={handleAddMember} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Member
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {teamMembers.map(member => (
              <motion.div
                key={member._id}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="cursor-pointer"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-lg truncate">
                          {member.fullName}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Briefcase className="w-3 h-3" />
                          <span className="truncate">{member.role}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditMember(member); }}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); handleDeleteMember(member._id, member.fullName); }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <a 
                        href={`mailto:${member.email}`} 
                        className="hover:text-gray-900 truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {member.email}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <a 
                        href={`tel:${member.phone}`} 
                        className="hover:text-gray-900"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {member.phone}
                      </a>
                    </div>

                    {member.department && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{member.department}</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Add/Edit Member Modal */}
      <Dialog open={isAddingMember || isEditingMember} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditingMember ? 'Edit Team Member' : 'Create New Team Member'}</DialogTitle>
            <DialogDescription>
              {isEditingMember ? 'Update the team member information below.' : 'Add a new team member to your workspace. Fill in the details below.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Section */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-5 space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={newMember.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  required
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="middleInitial">M.I.</Label>
                <Input
                  id="middleInitial"
                  name="middleInitial"
                  value={newMember.middleInitial}
                  onChange={handleInputChange}
                  placeholder="A"
                  maxLength={1}
                />
              </div>

              <div className="col-span-5 space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={newMember.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            {/* Contact Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={newMember.email}
                  onChange={handleInputChange}
                  placeholder="john.doe@company.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={newMember.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
            </div>

            {/* Role & Department Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <select
                  id="role"
                  name="role"
                  value={newMember.role}
                  onChange={handleInputChange}
                  required
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="">Select a role...</option>
                  {teamRoles
                    .filter(role => role.isActive)
                    .map(role => (
                      <option key={role._id} value={role.name}>
                        {role.name}
                      </option>
                    ))
                  }
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  value={newMember.department}
                  onChange={handleInputChange}
                  placeholder="Engineering"
                />
              </div>
            </div>

            {/* Status Section */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                value={newMember.status}
                onChange={handleInputChange}
                className="flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  isEditingMember ? 'Update Member' : 'Create Member'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manage Roles Dialog */}
      <Dialog open={isManagingRoles} onOpenChange={setIsManagingRoles}>
        <DialogContent className="max-w-3xl h-[600px] flex flex-col" onClose={() => setIsManagingRoles(false)}>
          <DialogHeader>
            <DialogTitle>Manage Team Roles</DialogTitle>
            <DialogDescription>
              Create and manage role definitions for your team members
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 flex-1 flex flex-col overflow-hidden">
            <div className="flex justify-end">
              <Button onClick={handleAddRole} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Role
              </Button>
            </div>

            {loadingRoles ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : teamRoles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No team roles defined yet</p>
                <p className="text-sm mt-1">Create your first role to get started</p>
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto pr-2">
                {teamRoles.map((role) => (
                  <div
                    key={role._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">{role.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          role.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {role.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {role.description && (
                        <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRole(role)}
                        className="gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRole(role._id, role.name)}
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Role Dialog */}
      <Dialog open={isAddingRole || isEditingRole} onOpenChange={handleCloseRoleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditingRole ? 'Edit Team Role' : 'Create New Team Role'}</DialogTitle>
            <DialogDescription>
              {isEditingRole ? 'Update the team role information below.' : 'Define a new role for your team members.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitRole} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">
                Role Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="roleName"
                name="name"
                value={newRole.name}
                onChange={handleRoleInputChange}
                placeholder="e.g., Project Manager, Developer, Designer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleDescription">Description</Label>
              <Textarea
                id="roleDescription"
                name="description"
                value={newRole.description}
                onChange={handleRoleInputChange}
                placeholder="Brief description of this role..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="roleIsActive"
                name="isActive"
                checked={newRole.isActive}
                onChange={handleRoleInputChange}
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="roleIsActive" className="cursor-pointer">
                Active role
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseRoleModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingRole}>
                {isSubmittingRole ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  isEditingRole ? 'Update Role' : 'Create Role'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Team;
