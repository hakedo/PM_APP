import api from './api';

export const deliverableService = {
  // Get all deliverables for a project
  async getByProject(projectId) {
    return await api.get(`/deliverables/project/${projectId}`);
  },

  // Get single deliverable with tasks
  async getById(id) {
    return await api.get(`/deliverables/${id}`);
  },

  // Create deliverable
  async create(deliverableData) {
    return await api.post('/deliverables', deliverableData);
  },

  // Update deliverable
  async update(id, deliverableData) {
    return await api.put(`/deliverables/${id}`, deliverableData);
  },

  // Delete deliverable
  async delete(id) {
    return await api.delete(`/deliverables/${id}`);
  },

  // Get tasks for a deliverable
  async getTasks(deliverableId) {
    return await api.get(`/deliverables/${deliverableId}/tasks`);
  },

  // Create task
  async createTask(deliverableId, taskData) {
    return await api.post(`/deliverables/${deliverableId}/tasks`, taskData);
  },

  // Update task
  async updateTask(deliverableId, taskId, taskData) {
    return await api.put(`/deliverables/${deliverableId}/tasks/${taskId}`, taskData);
  },

  // Delete task
  async deleteTask(deliverableId, taskId) {
    return await api.delete(`/deliverables/${deliverableId}/tasks/${taskId}`);
  }
};
