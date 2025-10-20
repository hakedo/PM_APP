import api from './api';

/**
 * Milestone Service
 * Handles all milestone-related API calls
 */
const milestoneService = {
  /**
   * Get all milestones for a project
   * @param {string} projectId - The project ID
   * @returns {Promise<Array>} Array of milestones with CPM calculations
   */
  async getProjectMilestones(projectId) {
    try {
      const data = await api.get(`/projects/${projectId}/milestones`);
      return data;
    } catch (error) {
      console.error('Error fetching milestones:', error);
      throw error;
    }
  },

  /**
   * Get a single milestone
   * @param {string} projectId - The project ID
   * @param {string} milestoneId - The milestone ID
   * @returns {Promise<Object>} Milestone object
   */
  async getMilestone(projectId, milestoneId) {
    try {
      const data = await api.get(`/projects/${projectId}/milestones/${milestoneId}`);
      return data;
    } catch (error) {
      console.error('Error fetching milestone:', error);
      throw error;
    }
  },

  /**
   * Create a new milestone
   * @param {string} projectId - The project ID
   * @param {Object} milestoneData - Milestone data
   * @returns {Promise<Object>} Created milestone with CPM data
   */
  async createMilestone(projectId, milestoneData) {
    try {
      const data = await api.post(`/projects/${projectId}/milestones`, milestoneData);
      return data;
    } catch (error) {
      console.error('Error creating milestone:', error);
      throw error;
    }
  },

  /**
   * Update a milestone
   * @param {string} projectId - The project ID
   * @param {string} milestoneId - The milestone ID
   * @param {Object} milestoneData - Updated milestone data
   * @returns {Promise<Object>} Updated milestone with CPM data
   */
  async updateMilestone(projectId, milestoneId, milestoneData) {
    try {
      const data = await api.put(
        `/projects/${projectId}/milestones/${milestoneId}`,
        milestoneData
      );
      return data;
    } catch (error) {
      console.error('Error updating milestone:', error);
      throw error;
    }
  },

  /**
   * Delete a milestone
   * @param {string} projectId - The project ID
   * @param {string} milestoneId - The milestone ID
   * @param {Object} options - Optional delete options (e.g., reassignments)
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteMilestone(projectId, milestoneId, options = {}) {
    try {
      const data = await api.delete(
        `/projects/${projectId}/milestones/${milestoneId}`,
        options
      );
      return data;
    } catch (error) {
      console.error('Error deleting milestone:', error);
      throw error;
    }
  },

  /**
   * Recalculate critical path for a project
   * @param {string} projectId - The project ID
   * @returns {Promise<Array>} Updated milestones with recalculated CPM data
   */
  async recalculateCriticalPath(projectId) {
    try {
      const data = await api.post(`/projects/${projectId}/milestones/recalculate`);
      return data;
    } catch (error) {
      console.error('Error recalculating critical path:', error);
      throw error;
    }
  },

  /**
   * Get only critical path milestones
   * @param {string} projectId - The project ID
   * @returns {Promise<Array>} Array of critical path milestones
   */
  async getCriticalPathMilestones(projectId) {
    try {
      const milestones = await this.getProjectMilestones(projectId);
      return milestones.filter(m => m.isCritical);
    } catch (error) {
      console.error('Error fetching critical path:', error);
      throw error;
    }
  }
};

export default milestoneService;
