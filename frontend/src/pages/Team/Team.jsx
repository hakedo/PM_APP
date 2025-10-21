import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Loader2, Mail, Phone, Briefcase, Building2, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { useTeam } from '../../hooks';

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
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={handleAddMember} size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              New Member
            </Button>
          </motion.div>
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
                <Input
                  id="role"
                  name="role"
                  value={newMember.role}
                  onChange={handleInputChange}
                  placeholder="Senior Developer"
                  required
                />
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
    </div>
  );
}

export default Team;
