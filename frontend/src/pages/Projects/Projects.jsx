import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderKanban } from 'lucide-react';
import { Button, LoadingSpinner, EmptyState, PageHeader } from '../../components/ui';
import { ProjectGrid } from '../../components/projects';
import { ProjectFormDialog } from '../../components/forms/ProjectFormDialog';
import { useProjects, useTeam } from '../../hooks';

const emptyProjectState = {
  title: '',
  description: '',
  startDate: '',
  endDate: ''
};

function Projects() {
  const navigate = useNavigate();
  const { projects, loading, createProject, deleteProject } = useProjects();
  const { teamMembers } = useTeam();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectData, setProjectData] = useState(emptyProjectState);

  const handleAddProject = () => {
    setProjectData(emptyProjectState);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setProjectData(emptyProjectState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await createProject(projectData);
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId, projectTitle) => {
    if (window.confirm(`Are you sure you want to delete "${projectTitle}"?\n\nThis will permanently delete the project and all its milestones, deliverables, and tasks. This action cannot be undone.`)) {
      try {
        await deleteProject(projectId);
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project. Please try again.');
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
          title="Projects"
          description="Manage your projects and track progress"
          action={
            <Button onClick={handleAddProject} size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          }
        />

        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Get started by creating your first project"
            actionLabel={
              <>
                <Plus className="w-4 h-4" />
                Create Project
              </>
            }
            onAction={handleAddProject}
          />
        ) : (
          <ProjectGrid
            projects={projects}
            onProjectClick={(projectId) => navigate(`/projects/${projectId}`)}
            onDeleteProject={handleDeleteProject}
            teamMembers={teamMembers}
          />
        )}

        <ProjectFormDialog
          open={isDialogOpen}
          onOpenChange={handleCloseDialog}
          project={projectData}
          onChange={setProjectData}
          onSubmit={handleSubmit}
          loading={isSubmitting}
        />
      </div>
    </div>
  );
}

export default Projects;
