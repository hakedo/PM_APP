import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { Button, LoadingSpinner, EmptyState, PageHeader } from '../../components/ui';
import { ClientGrid } from '../../components/clients';
import { ClientFormDialog } from '../../components/forms/ClientFormDialog';
import { useClients } from '../../hooks';

const emptyClientState = {
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
};

function Clients() {
  const navigate = useNavigate();
  const { clients, loading, createClient, updateClient, deleteClient } = useClients();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientData, setClientData] = useState(emptyClientState);

  const isEditing = !!editingClient;

  const handleAddClient = () => {
    setClientData(emptyClientState);
    setEditingClient(null);
    setIsDialogOpen(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setClientData({
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
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingClient(null);
    setClientData(emptyClientState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateClient(editingClient._id, clientData);
      } else {
        await createClient(clientData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save client:', error);
      alert(`Failed to save client: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
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
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Clients"
          description="Manage your client contacts"
          action={
            <Button onClick={handleAddClient} size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              New Client
            </Button>
          }
        />

        {clients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No clients yet"
            description="Get started by adding your first client"
            actionLabel={
              <>
                <Plus className="w-4 h-4" />
                Add Client
              </>
            }
            onAction={handleAddClient}
          />
        ) : (
          <ClientGrid
            clients={clients}
            onClientClick={(clientId) => navigate(`/clients/${clientId}`)}
            onEditClient={handleEditClient}
            onDeleteClient={handleDeleteClient}
          />
        )}

        <ClientFormDialog
          open={isDialogOpen}
          onOpenChange={handleCloseDialog}
          client={clientData}
          onChange={setClientData}
          onSubmit={handleSubmit}
          loading={isSubmitting}
          title={isEditing ? 'Edit Client' : 'Add New Client'}
          description={isEditing 
            ? "Update the client's information. Fields marked with * are required."
            : "Enter the client's information. Fields marked with * are required."
          }
        />
      </div>
    </div>
  );
}

export default Clients;
