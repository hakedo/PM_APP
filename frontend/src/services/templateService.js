import apiClient from './api';

export const templateService = {
  // Get all templates
  getAll: () => apiClient.get('/templates'),

  // Get template by ID or type
  getById: (idOrType) => apiClient.get(`/templates/${idOrType}`),

  // Create new template
  create: (templateData) => apiClient.post('/templates', templateData),

  // Update template
  update: (id, templateData) => apiClient.patch(`/templates/${id}`, templateData),

  // Delete template
  delete: (id) => apiClient.delete(`/templates/${id}`),

  // Project Status operations
  addProjectStatus: (templateId, statusData) =>
    apiClient.post(`/templates/${templateId}/projectStatus/statuses`, statusData),

  deleteProjectStatus: (templateId, statusId) =>
    apiClient.delete(`/templates/${templateId}/projectStatus/statuses/${statusId}`),

  // Task Status operations
  addTaskStatus: (templateId, statusData) =>
    apiClient.post(`/templates/${templateId}/taskStatus/statuses`, statusData),

  deleteTaskStatus: (templateId, statusId) =>
    apiClient.delete(`/templates/${templateId}/taskStatus/statuses/${statusId}`),

  // Phase operations
  addPhase: (templateId, phaseData) =>
    apiClient.post(`/templates/${templateId}/phase/items`, phaseData),

  deletePhase: (templateId, phaseId) =>
    apiClient.delete(`/templates/${templateId}/phase/items/${phaseId}`),

  // Deliverable operations
  addDeliverable: (templateId, deliverableData) =>
    apiClient.post(`/templates/${templateId}/deliverable/items`, deliverableData),

  deleteDeliverable: (templateId, deliverableId) =>
    apiClient.delete(`/templates/${templateId}/deliverable/items/${deliverableId}`),

  // Task operations within deliverables
  addTask: (templateId, deliverableId, taskData) =>
    apiClient.post(`/templates/${templateId}/deliverable/items/${deliverableId}/tasks`, taskData),

  deleteTask: (templateId, deliverableId, taskId) =>
    apiClient.delete(`/templates/${templateId}/deliverable/items/${deliverableId}/tasks/${taskId}`),
};

export default templateService;
