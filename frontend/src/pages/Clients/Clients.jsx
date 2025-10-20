import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Loader2, Mail, Phone, MapPin, Building2, MoreVertical, Edit2, Trash2 } from 'lucide-react';
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
import { useClients } from '../../hooks';

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

function Clients() {
  const navigate = useNavigate();
  const { clients, loading, createClient, updateClient, deleteClient } = useClients();
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleAddClient = () => {
    setIsAddingClient(true);
  };

  const handleCloseModal = () => {
    setIsAddingClient(false);
    setIsEditingClient(false);
    setEditingClient(null);
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

  const handleInputChange = (e) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (isEditingClient) {
        await updateClient(editingClient._id, newClient);
        setIsEditingClient(false);
        setEditingClient(null);
      } else {
        await createClient(newClient);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save client:', error);
      alert(`Failed to save client: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setNewClient({
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
    setIsEditingClient(true);
  };

  const handleDeleteClient = async (clientId, clientName) => {
    if (window.confirm(`Are you sure you want to delete ${clientName}?`)) {
      try {
        await deleteClient(clientId);
      } catch (error) {
        console.error('Failed to delete client:', error);
        alert(`Failed to delete client: ${error.message || 'Unknown error'}`);
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Clients</h1>
            <p className="text-gray-600">Manage your client contacts</p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={handleAddClient} size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              New Client
            </Button>
          </motion.div>
        </div>

        {/* Clients Grid */}
        {clients.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No clients yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first client</p>
            <Button onClick={handleAddClient} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Client
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {clients.map(client => (
              <motion.div
                key={client._id}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/clients/${client._id}`)}
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
                          {client.fullName}
                        </div>
                        {client.company && (
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Building2 className="w-3 h-3" />
                            <span className="truncate">{client.company}</span>
                          </div>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleEditClient(client);
                          }}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClient(client._id, client.fullName);
                            }}
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
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{formatPhoneNumber(client.phone)}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="line-clamp-1">{client.address}{client.unit && ` ${client.unit}`}</div>
                        <div className="line-clamp-1">{client.city}, {client.state} {client.zip}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Add/Edit Client Dialog */}
      <AnimatePresence>
        {(isAddingClient || isEditingClient) && (
          <Dialog open={isAddingClient || isEditingClient} onOpenChange={(open) => {
            if (!open) {
              handleCloseModal();
            }
          }}>
            <DialogContent className="sm:max-w-[500px]" onClose={handleCloseModal}>
              <DialogHeader>
                <DialogTitle>{isEditingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
                <DialogDescription>
                  {isEditingClient 
                    ? 'Update the client\'s information. Fields marked with * are required.'
                    : 'Enter the client\'s information. Fields marked with * are required.'
                  }
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      value={newClient.company}
                      onChange={handleInputChange}
                      placeholder="Company name"
                    />
                  </div>

                  <div className="grid grid-cols-6 gap-2">
                    <div className="col-span-3">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={newClient.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="col-span-1">
                      <Label htmlFor="middleInitial">M.I.</Label>
                      <Input
                        id="middleInitial"
                        name="middleInitial"
                        value={newClient.middleInitial}
                        onChange={handleInputChange}
                        placeholder="M"
                        maxLength={1}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={newClient.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newClient.email}
                      onChange={handleInputChange}
                      placeholder="john.doe@example.com"
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
                      onChange={handleInputChange}
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={newClient.address}
                      onChange={handleInputChange}
                      placeholder="123 Main St"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unit/STE</Label>
                    <Input
                      id="unit"
                      name="unit"
                      value={newClient.unit}
                      onChange={handleInputChange}
                      placeholder="Apt 4B, Suite 200"
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-6">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={newClient.city}
                        onChange={handleInputChange}
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={newClient.state}
                        onChange={handleInputChange}
                        placeholder="NY"
                        maxLength={2}
                        className="uppercase"
                        required
                      />
                    </div>
                    <div className="col-span-4">
                      <Label htmlFor="zip">ZIP *</Label>
                      <Input
                        id="zip"
                        name="zip"
                        value={newClient.zip}
                        onChange={handleInputChange}
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
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isEditingClient ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      isEditingClient ? 'Update Client' : 'Create Client'
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

export default Clients;
