import api from './api';

export const financeItemService = {
  // Get all finance items for a project
  async getByProject(projectId) {
    return await api.get(`/finance-items/project/${projectId}`);
  },

  // Get single finance item with sub-items
  async getById(id) {
    return await api.get(`/finance-items/${id}`);
  },

  // Create finance item
  async create(itemData) {
    return await api.post('/finance-items', itemData);
  },

  // Update finance item
  async update(id, itemData) {
    return await api.put(`/finance-items/${id}`, itemData);
  },

  // Delete finance item
  async delete(id) {
    return await api.delete(`/finance-items/${id}`);
  },

  // Get sub-items for a finance item
  async getSubItems(itemId) {
    return await api.get(`/finance-items/${itemId}/subitems`);
  },

  // Create sub-item
  async createSubItem(itemId, subItemData) {
    return await api.post(`/finance-items/${itemId}/subitems`, subItemData);
  },

  // Update sub-item
  async updateSubItem(itemId, subItemId, subItemData) {
    return await api.put(`/finance-items/${itemId}/subitems/${subItemId}`, subItemData);
  },

  // Delete sub-item
  async deleteSubItem(itemId, subItemId) {
    return await api.delete(`/finance-items/${itemId}/subitems/${subItemId}`);
  }
};
