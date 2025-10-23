import express from 'express';
import { DeliverableGroup } from '../models/index.js';

const router = express.Router();

// Get all groups for a project
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const groups = await DeliverableGroup.find({ 
      project: req.params.projectId 
    }).sort({ order: 1 });
    res.json(groups);
  } catch (error) {
    next(error);
  }
});

// Create a new group
router.post('/', async (req, res, next) => {
  try {
    const { project, name } = req.body;
    
    // Get the highest order number for this project
    const maxOrderGroup = await DeliverableGroup.findOne({ project })
      .sort({ order: -1 })
      .limit(1);
    
    const order = maxOrderGroup ? maxOrderGroup.order + 1 : 0;
    
    const group = new DeliverableGroup({
      project,
      name,
      order
    });
    
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
});

// Update a group
router.put('/:id', async (req, res, next) => {
  try {
    const { name, order } = req.body;
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (order !== undefined) updateData.order = order;
    
    const group = await DeliverableGroup.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    res.json(group);
  } catch (error) {
    next(error);
  }
});

// Reorder groups
router.post('/reorder', async (req, res, next) => {
  try {
    const { groups } = req.body; // Array of { id, order }
    
    const updatePromises = groups.map(({ id, order }) =>
      DeliverableGroup.findByIdAndUpdate(id, { order })
    );
    
    await Promise.all(updatePromises);
    res.json({ message: 'Groups reordered successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete a group (will need to handle deliverables in it)
router.delete('/:id', async (req, res, next) => {
  try {
    const group = await DeliverableGroup.findByIdAndDelete(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Note: You might want to reassign deliverables or delete them
    // For now, this assumes deliverables are handled separately
    
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
