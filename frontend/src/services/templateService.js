import apiClient from './api';

export const templateService = {
  // Get all templates
  getAll: () => apiClient.get('/templates'),

  // Get template by ID
  getById: (id) => apiClient.get(`/templates/${id}`),

  // Create new template
  create: (templateData) => apiClient.post('/templates', templateData),

  // Update template
  update: (id, templateData) => apiClient.patch(`/templates/${id}`, templateData),

  // Delete template
  delete: (id) => apiClient.delete(`/templates/${id}`),
};

export default templateService;
