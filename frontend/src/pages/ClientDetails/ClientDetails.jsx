import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Briefcase, ArrowLeft } from 'lucide-react';
import { LoadingSpinner, EmptyState, CollapsibleInfoCard, AssignedProjectCard, Section, GridLayout } from '../../components/ui';
import { ClientInfoDisplay } from '../../components/clients';
import { Button } from '../../components/ui/button';
import { useClient } from '../../hooks';
import { assignmentService } from '../../services';

function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { client, loading, updateClient } = useClient(id);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [assignedProjects, setAssignedProjects] = useState([]);

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
      await updateClient(editedClient);
      setIsEditing(false);
      setEditedClient(null);
    } catch (error) {
      console.error('Failed to update client:', error);
      alert('Failed to update client. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <EmptyState
          icon={Users}
          title="Client not found"
          description="The client you're looking for doesn't exist"
          actionLabel={
            <>
              <ArrowLeft className="w-4 h-4" />
              Back to Clients
            </>
          }
          onAction={() => navigate('/clients')}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <CollapsibleInfoCard
            title={client.fullName}
            subtitle={client.company}
            icon={Users}
            isEditing={isEditing}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
            defaultCollapsed={false}
          >
            <ClientInfoDisplay
              client={client}
              isEditing={isEditing}
              editedClient={editedClient || client}
              onInputChange={setEditedClient}
            />
          </CollapsibleInfoCard>
        </motion.div>

        <Section
          title="Assigned Projects"
          icon={Briefcase}
          count={assignedProjects.length}
          delay={0.3}
          className="mt-6"
        >
          {assignedProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No projects assigned to this client yet
            </div>
          ) : (
            <GridLayout columns={3} gap={4}>
              {assignedProjects.map(project => (
                <AssignedProjectCard
                  key={project._id}
                  project={project}
                  onClick={(projectId) => navigate(`/projects/${projectId}`)}
                />
              ))}
            </GridLayout>
          )}
        </Section>
      </motion.div>
    </div>
  );
}

export default ClientDetails;
