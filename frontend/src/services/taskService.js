import api from './api';

const taskService = {
  // Get all tasks for a deliverable
  async getTasks(projectId, milestoneId, deliverableId) {
    try {
      const response = await api.get(`/projects/${projectId}/milestones/${milestoneId}/deliverables/${deliverableId}/tasks`);
      return response;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Get a single task
  async getTask(projectId, milestoneId, deliverableId, taskId) {
    try {
      const response = await api.get(`/projects/${projectId}/milestones/${milestoneId}/deliverables/${deliverableId}/tasks/${taskId}`);
      return response;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  },

  // Create a new task
  async createTask(projectId, milestoneId, deliverableId, taskData) {
    try {
      const response = await api.post(`/projects/${projectId}/milestones/${milestoneId}/deliverables/${deliverableId}/tasks`, taskData);
      return response;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Update a task
  async updateTask(projectId, milestoneId, deliverableId, taskId, taskData) {
    try {
      const response = await api.put(`/projects/${projectId}/milestones/${milestoneId}/deliverables/${deliverableId}/tasks/${taskId}`, taskData);
      return response;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Delete a task
  async deleteTask(projectId, milestoneId, deliverableId, taskId) {
    try {
      const response = await api.delete(`/projects/${projectId}/milestones/${milestoneId}/deliverables/${deliverableId}/tasks/${taskId}`);
      return response;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
};

export default taskService;
