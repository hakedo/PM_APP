import apiClient from './api';

export const projectService = {
  // Get all projects
  getAll: () => apiClient.get('/projects'),

  // Get project by ID
  getById: (id) => apiClient.get(`/projects/${id}`),

  // Create new project
  create: (projectData) => apiClient.post('/projects', projectData),

  // Update project
  update: (id, projectData) => apiClient.put(`/projects/${id}`, projectData),

  // Delete project
  delete: (id) => apiClient.delete(`/projects/${id}`),
};

export default projectService;
