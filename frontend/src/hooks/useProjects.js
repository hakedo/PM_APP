import { useState, useEffect } from 'react';
import { projectService } from '../services';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getAll();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async (projectData) => {
    try {
      const newProject = await projectService.create(projectData);
      // Refetch all projects to ensure UI is in sync with backend
      await fetchProjects();
      return newProject;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      const updatedProject = await projectService.update(id, projectData);
      setProjects(prev =>
        prev.map(p => (p._id === id ? updatedProject : p))
      );
      return updatedProject;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      await projectService.delete(id);
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};

export const useProject = (id) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProject = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getById(id);
      setProject(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const updateProject = async (projectData) => {
    try {
      const updated = await projectService.update(id, projectData);
      setProject(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    project,
    loading,
    error,
    refetch: fetchProject,
    updateProject,
  };
};
