import api from './api';

export const financeGroupService = {
  // Get all groups for a project
  getByProject: async (projectId) => {
    return await api.get(`/finance-groups/project/${projectId}`);
  },

  // Create a new group
  create: async (groupData) => {
    return await api.post('/finance-groups', groupData);
  },

  // Update a group
  update: async (id, updates) => {
    return await api.put(`/finance-groups/${id}`, updates);
  },

  // Reorder groups
  reorder: async (groups) => {
    return await api.post('/finance-groups/reorder', { groups });
  },

  // Delete a group
  delete: async (id) => {
    return await api.delete(`/finance-groups/${id}`);
  }
};
