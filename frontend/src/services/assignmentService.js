import apiClient from './api';

export const assignmentService = {
  // Get all clients assigned to a project
  getClientsForProject: (projectId) => apiClient.get(`/assignments/project/${projectId}`),

  // Get all projects assigned to a client
  getProjectsForClient: (clientId) => apiClient.get(`/assignments/client/${clientId}`),

  // Assign a client to a project
  assignClientToProject: (assignmentData) => apiClient.post('/assignments', assignmentData),

  // Remove assignment by assignment ID
  removeAssignment: (assignmentId) => apiClient.delete(`/assignments/${assignmentId}`),

  // Remove assignment by projectId and clientId
  removeClientFromProject: (projectId, clientId) => 
    apiClient.delete(`/assignments/project/${projectId}/client/${clientId}`),
};

export default assignmentService;
