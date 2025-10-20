import express from 'express';
import DeliverableTask from '../models/DeliverableTask.js';
import Deliverable from '../models/Deliverable.js';

const router = express.Router();

// Get all tasks for a deliverable
router.get('/:projectId/milestones/:milestoneId/deliverables/:deliverableId/tasks', async (req, res) => {
  try {
    const { projectId, milestoneId, deliverableId } = req.params;
    const tasks = await DeliverableTask.find({ 
      projectId, 
      milestoneId,
      deliverableId 
    }).sort({ order: 1, createdAt: 1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
});

// Get a single task
router.get('/:projectId/milestones/:milestoneId/deliverables/:deliverableId/tasks/:taskId', async (req, res) => {
  try {
    const { projectId, milestoneId, deliverableId, taskId } = req.params;
    const task = await DeliverableTask.findOne({ 
      _id: taskId,
      projectId, 
      milestoneId,
      deliverableId 
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Failed to fetch task', error: error.message });
  }
});

// Create a new task
router.post('/:projectId/milestones/:milestoneId/deliverables/:deliverableId/tasks', async (req, res) => {
  try {
    const { projectId, milestoneId, deliverableId } = req.params;
    const { name, description, status, priority, assignedTo, estimatedHours, actualHours, dueDate, order } = req.body;

    // Verify deliverable exists
    const deliverable = await Deliverable.findOne({
      _id: deliverableId,
      projectId,
      milestoneId
    });

    if (!deliverable) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }

    // Create new task
    const task = new DeliverableTask({
      name,
      description,
      deliverableId,
      milestoneId,
      projectId,
      status: status || 'not-started',
      priority: priority || 'medium',
      assignedTo,
      estimatedHours: estimatedHours || 0,
      actualHours: actualHours || 0,
      dueDate,
      order: order !== undefined ? order : 0
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
});

// Update a task
router.put('/:projectId/milestones/:milestoneId/deliverables/:deliverableId/tasks/:taskId', async (req, res) => {
  try {
    const { projectId, milestoneId, deliverableId, taskId } = req.params;
    const { name, description, status, priority, assignedTo, estimatedHours, actualHours, dueDate, order } = req.body;

    const task = await DeliverableTask.findOne({
      _id: taskId,
      projectId,
      milestoneId,
      deliverableId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update fields
    if (name !== undefined) task.name = name;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (actualHours !== undefined) task.actualHours = actualHours;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (order !== undefined) task.order = order;

    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
});

// Delete a task
router.delete('/:projectId/milestones/:milestoneId/deliverables/:deliverableId/tasks/:taskId', async (req, res) => {
  try {
    const { projectId, milestoneId, deliverableId, taskId } = req.params;

    const task = await DeliverableTask.findOneAndDelete({
      _id: taskId,
      projectId,
      milestoneId,
      deliverableId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully', task });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
});

export default router;
