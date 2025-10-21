import apiClient from './api';

export const teamService = {
  // Get all team members
  getAll: (status = null) => {
    const params = status ? { status } : {};
    return apiClient.get('/team', { params });
  },

  // Get team member by ID
  getById: (id) => apiClient.get(`/team/${id}`),

  // Create new team member
  create: (teamMemberData) => apiClient.post('/team', teamMemberData),

  // Update team member
  update: (id, teamMemberData) => apiClient.patch(`/team/${id}`, teamMemberData),

  // Delete team member
  delete: (id) => apiClient.delete(`/team/${id}`),
};

export default teamService;
