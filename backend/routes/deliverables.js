import express from 'express';
import DeliverableNew from '../models/DeliverableNew.js';
import TaskNew from '../models/TaskNew.js';

const router = express.Router();

// Get all deliverables for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const deliverables = await DeliverableNew.find({ project: req.params.projectId })
      .sort({ group: 1, startDate: 1 })
      .lean();
    
    res.json(deliverables);
  } catch (error) {
    console.error('Error fetching deliverables:', error);
    res.status(500).json({ message: 'Error fetching deliverables', error: error.message });
  }
});

// Get single deliverable with tasks
router.get('/:id', async (req, res) => {
  try {
    const deliverable = await DeliverableNew.findById(req.params.id).lean();
    
    if (!deliverable) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }
    
    const tasks = await TaskNew.find({ deliverable: req.params.id })
      .sort({ order: 1 })
      .lean();
    
    res.json({ ...deliverable, tasks });
  } catch (error) {
    console.error('Error fetching deliverable:', error);
    res.status(500).json({ message: 'Error fetching deliverable', error: error.message });
  }
});

// Create deliverable
router.post('/', async (req, res) => {
  try {
    const { project, group, name, startDate, endDate, status, assignee } = req.body;
    
    const deliverable = new DeliverableNew({
      project,
      group,
      name,
      startDate,
      endDate,
      status: status || 'not-started',
      assignee: assignee || 'Unassigned'
    });
    
    await deliverable.save();
    res.status(201).json(deliverable);
  } catch (error) {
    console.error('Error creating deliverable:', error);
    res.status(500).json({ message: 'Error creating deliverable', error: error.message });
  }
});

// Update deliverable
router.put('/:id', async (req, res) => {
  try {
    const { name, startDate, endDate, status, assignee, group } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (status !== undefined) updateData.status = status;
    if (assignee !== undefined) updateData.assignee = assignee;
    if (group !== undefined) updateData.group = group;
    
    const deliverable = await DeliverableNew.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!deliverable) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }
    
    res.json(deliverable);
  } catch (error) {
    console.error('Error updating deliverable:', error);
    res.status(500).json({ message: 'Error updating deliverable', error: error.message });
  }
});

// Delete deliverable (and its tasks)
router.delete('/:id', async (req, res) => {
  try {
    const deliverable = await DeliverableNew.findByIdAndDelete(req.params.id);
    
    if (!deliverable) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }
    
    // Delete all tasks associated with this deliverable
    await TaskNew.deleteMany({ deliverable: req.params.id });
    
    res.json({ message: 'Deliverable deleted successfully' });
  } catch (error) {
    console.error('Error deleting deliverable:', error);
    res.status(500).json({ message: 'Error deleting deliverable', error: error.message });
  }
});

// Get tasks for a deliverable
router.get('/:deliverableId/tasks', async (req, res) => {
  try {
    const tasks = await TaskNew.find({ deliverable: req.params.deliverableId })
      .sort({ order: 1 })
      .lean();
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// Create task for a deliverable
router.post('/:deliverableId/tasks', async (req, res) => {
  try {
    const { name, dueDate, status, order } = req.body;
    
    const task = new TaskNew({
      deliverable: req.params.deliverableId,
      name,
      dueDate,
      status: status || 'pending',
      order: order || 0
    });
    
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});

// Update task
router.put('/:deliverableId/tasks/:taskId', async (req, res) => {
  try {
    const { name, dueDate, status, order } = req.body;
    
    const task = await TaskNew.findOneAndUpdate(
      { _id: req.params.taskId, deliverable: req.params.deliverableId },
      { name, dueDate, status, order },
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});

// Delete task
router.delete('/:deliverableId/tasks/:taskId', async (req, res) => {
  try {
    const task = await TaskNew.findOneAndDelete({
      _id: req.params.taskId,
      deliverable: req.params.deliverableId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
});

export default router;
