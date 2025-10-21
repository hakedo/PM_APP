import api from './api';

// ====== MILESTONE OPERATIONS ======

export const createMilestone = async (projectId, milestoneData) => {
  const response = await api.post(`/projects/${projectId}/milestones`, milestoneData);
  return response.data;
};

export const updateMilestone = async (projectId, milestoneId, milestoneData) => {
  const response = await api.put(`/projects/${projectId}/milestones/${milestoneId}`, milestoneData);
  return response.data;
};

export const deleteMilestone = async (projectId, milestoneId) => {
  const response = await api.delete(`/projects/${projectId}/milestones/${milestoneId}`);
  return response.data;
};

// ====== DELIVERABLE OPERATIONS ======

export const createDeliverable = async (projectId, milestoneId, deliverableData) => {
  const response = await api.post(
    `/projects/${projectId}/milestones/${milestoneId}/deliverables`,
    deliverableData
  );
  return response.data;
};

export const updateDeliverable = async (projectId, milestoneId, deliverableId, deliverableData) => {
  const response = await api.put(
    `/projects/${projectId}/milestones/${milestoneId}/deliverables/${deliverableId}`,
    deliverableData
  );
  return response.data;
};

export const deleteDeliverable = async (projectId, milestoneId, deliverableId) => {
  const response = await api.delete(
    `/projects/${projectId}/milestones/${milestoneId}/deliverables/${deliverableId}`
  );
  return response.data;
};

// ====== TASK OPERATIONS ======

export const createTask = async (projectId, milestoneId, deliverableId, taskData) => {
  const response = await api.post(
    `/projects/${projectId}/milestones/${milestoneId}/deliverables/${deliverableId}/tasks`,
    taskData
  );
  return response.data;
};

export const updateTask = async (projectId, milestoneId, deliverableId, taskId, taskData) => {
  const response = await api.put(
    `/projects/${projectId}/milestones/${milestoneId}/deliverables/${deliverableId}/tasks/${taskId}`,
    taskData
  );
  return response.data;
};

export const deleteTask = async (projectId, milestoneId, deliverableId, taskId) => {
  const response = await api.delete(
    `/projects/${projectId}/milestones/${milestoneId}/deliverables/${deliverableId}/tasks/${taskId}`
  );
  return response.data;
};

// ====== MILESTONE TASK OPERATIONS (Standalone Tasks) ======

export const addMilestoneTask = async (projectId, milestoneId, taskData) => {
  const response = await api.post(
    `/projects/${projectId}/milestones/${milestoneId}/tasks`,
    taskData
  );
  return response.data;
};

export const updateMilestoneTask = async (projectId, milestoneId, taskId, taskData) => {
  const response = await api.put(
    `/projects/${projectId}/milestones/${milestoneId}/tasks/${taskId}`,
    taskData
  );
  return response.data;
};

export const deleteMilestoneTask = async (projectId, milestoneId, taskId) => {
  const response = await api.delete(
    `/projects/${projectId}/milestones/${milestoneId}/tasks/${taskId}`
  );
  return response.data;
};

export default {
  createMilestone,
  updateMilestone,
  deleteMilestone,
  createDeliverable,
  updateDeliverable,
  deleteDeliverable,
  createTask,
  updateTask,
  deleteTask,
  addMilestoneTask,
  updateMilestoneTask,
  deleteMilestoneTask,
};
