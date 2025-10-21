import apiClient from './api';

const teamRoleService = {
  // Get all team roles
  getAll: (isActive = undefined) => {
    const params = isActive !== undefined ? { isActive } : {};
    return apiClient.get('/team-roles', { params });
  },

  // Get single team role
  getById: (id) => apiClient.get(`/team-roles/${id}`),

  // Create new team role
  create: (roleData) => apiClient.post('/team-roles', roleData),

  // Update team role
  update: (id, roleData) => apiClient.patch(`/team-roles/${id}`, roleData),

  // Delete team role
  delete: (id) => apiClient.delete(`/team-roles/${id}`),

  // Reorder team roles
  reorder: (roles) => apiClient.patch('/team-roles/reorder', { roles })
};

export default teamRoleService;
