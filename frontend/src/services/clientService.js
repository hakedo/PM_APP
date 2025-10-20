import apiClient from './api';

export const clientService = {
  // Get all clients
  getAll: () => apiClient.get('/clients'),

  // Get client by ID
  getById: (id) => apiClient.get(`/clients/${id}`),

  // Create new client
  create: (clientData) => apiClient.post('/clients', clientData),

  // Update client
  update: (id, clientData) => apiClient.patch(`/clients/${id}`, clientData),

  // Delete client
  delete: (id) => apiClient.delete(`/clients/${id}`),
};

export default clientService;
