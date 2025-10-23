import api from './api';

export const deliverableGroupService = {
  // Get all groups for a project
  getByProject: async (projectId) => {
    return await api.get(`/deliverable-groups/project/${projectId}`);
  },

  // Create a new group
  create: async (groupData) => {
    return await api.post('/deliverable-groups', groupData);
  },

  // Update a group
  update: async (id, updates) => {
    return await api.put(`/deliverable-groups/${id}`, updates);
  },

  // Reorder groups
  reorder: async (groups) => {
    return await api.post('/deliverable-groups/reorder', { groups });
  },

  // Delete a group
  delete: async (id) => {
    return await api.delete(`/deliverable-groups/${id}`);
  }
};
