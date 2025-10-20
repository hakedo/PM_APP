import api from './api';

const deliverableService = {
  // Get all deliverables for a milestone
  async getDeliverables(projectId, milestoneId) {
    try {
      const response = await api.get(`/projects/${projectId}/milestones/${milestoneId}/deliverables`);
      return response;
    } catch (error) {
      console.error('Error fetching deliverables:', error);
      throw error;
    }
  },

  // Get a single deliverable
  async getDeliverable(projectId, milestoneId, deliverableId) {
    try {
      const response = await api.get(`/projects/${projectId}/milestones/${milestoneId}/deliverables/${deliverableId}`);
      return response;
    } catch (error) {
      console.error('Error fetching deliverable:', error);
      throw error;
    }
  },

  // Create a new deliverable
  async createDeliverable(projectId, milestoneId, deliverableData) {
    try {
      const response = await api.post(`/projects/${projectId}/milestones/${milestoneId}/deliverables`, deliverableData);
      return response;
    } catch (error) {
      console.error('Error creating deliverable:', error);
      throw error;
    }
  },

  // Update a deliverable
  async updateDeliverable(projectId, milestoneId, deliverableId, deliverableData) {
    try {
      const response = await api.put(`/projects/${projectId}/milestones/${milestoneId}/deliverables/${deliverableId}`, deliverableData);
      return response;
    } catch (error) {
      console.error('Error updating deliverable:', error);
      throw error;
    }
  },

  // Delete a deliverable
  async deleteDeliverable(projectId, milestoneId, deliverableId) {
    try {
      const response = await api.delete(`/projects/${projectId}/milestones/${milestoneId}/deliverables/${deliverableId}`);
      return response;
    } catch (error) {
      console.error('Error deleting deliverable:', error);
      throw error;
    }
  }
};

export default deliverableService;
