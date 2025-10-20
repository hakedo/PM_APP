import express from 'express';
import Deliverable from '../models/Deliverable.js';
import Milestone from '../models/Milestone.js';

const router = express.Router();

// Get all deliverables for a milestone
router.get('/:projectId/milestones/:milestoneId/deliverables', async (req, res) => {
  try {
    const { projectId, milestoneId } = req.params;
    const deliverables = await Deliverable.find({ 
      projectId, 
      milestoneId 
    }).sort({ order: 1, createdAt: 1 });
    
    res.json(deliverables);
  } catch (error) {
    console.error('Error fetching deliverables:', error);
    res.status(500).json({ message: 'Failed to fetch deliverables', error: error.message });
  }
});

// Get a single deliverable
router.get('/:projectId/milestones/:milestoneId/deliverables/:deliverableId', async (req, res) => {
  try {
    const { projectId, milestoneId, deliverableId } = req.params;
    const deliverable = await Deliverable.findOne({ 
      _id: deliverableId,
      projectId, 
      milestoneId 
    });
    
    if (!deliverable) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }
    
    res.json(deliverable);
  } catch (error) {
    console.error('Error fetching deliverable:', error);
    res.status(500).json({ message: 'Failed to fetch deliverable', error: error.message });
  }
});

// Create a new deliverable
router.post('/:projectId/milestones/:milestoneId/deliverables', async (req, res) => {
  try {
    const { projectId, milestoneId } = req.params;
    const { name, description, startDate, endDate, status, order } = req.body;

    // Verify milestone exists
    const milestone = await Milestone.findOne({ _id: milestoneId, projectId });
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    // Validate dates against milestone dates if milestone has dates
    if (milestone.earliestStart && milestone.earliestFinish) {
      if (startDate && new Date(startDate) < new Date(milestone.earliestStart)) {
        return res.status(400).json({ 
          message: 'Deliverable start date cannot be before milestone start date' 
        });
      }
      if (endDate && new Date(endDate) > new Date(milestone.earliestFinish)) {
        return res.status(400).json({ 
          message: 'Deliverable end date cannot be after milestone end date' 
        });
      }
    }

    const deliverable = new Deliverable({
      name,
      description,
      startDate,
      endDate,
      milestoneId,
      projectId,
      status: status || 'not-started',
      order: order || 0
    });

    await deliverable.save();
    res.status(201).json(deliverable);
  } catch (error) {
    console.error('Error creating deliverable:', error);
    res.status(500).json({ message: 'Failed to create deliverable', error: error.message });
  }
});

// Update a deliverable
router.put('/:projectId/milestones/:milestoneId/deliverables/:deliverableId', async (req, res) => {
  try {
    const { projectId, milestoneId, deliverableId } = req.params;
    const { name, description, startDate, endDate, status, order } = req.body;

    const deliverable = await Deliverable.findOne({ 
      _id: deliverableId,
      projectId, 
      milestoneId 
    });

    if (!deliverable) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }

    // Verify milestone exists and get its dates
    const milestone = await Milestone.findOne({ _id: milestoneId, projectId });
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    // Validate dates against milestone dates if milestone has dates
    if (milestone.earliestStart && milestone.earliestFinish) {
      if (startDate && new Date(startDate) < new Date(milestone.earliestStart)) {
        return res.status(400).json({ 
          message: 'Deliverable start date cannot be before milestone start date' 
        });
      }
      if (endDate && new Date(endDate) > new Date(milestone.earliestFinish)) {
        return res.status(400).json({ 
          message: 'Deliverable end date cannot be after milestone end date' 
        });
      }
    }

    // Update fields
    if (name !== undefined) deliverable.name = name;
    if (description !== undefined) deliverable.description = description;
    if (startDate !== undefined) deliverable.startDate = startDate;
    if (endDate !== undefined) deliverable.endDate = endDate;
    if (status !== undefined) deliverable.status = status;
    if (order !== undefined) deliverable.order = order;

    await deliverable.save();
    res.json(deliverable);
  } catch (error) {
    console.error('Error updating deliverable:', error);
    res.status(500).json({ message: 'Failed to update deliverable', error: error.message });
  }
});

// Delete a deliverable
router.delete('/:projectId/milestones/:milestoneId/deliverables/:deliverableId', async (req, res) => {
  try {
    const { projectId, milestoneId, deliverableId } = req.params;

    const deliverable = await Deliverable.findOneAndDelete({ 
      _id: deliverableId,
      projectId, 
      milestoneId 
    });

    if (!deliverable) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }

    res.json({ message: 'Deliverable deleted successfully', deliverable });
  } catch (error) {
    console.error('Error deleting deliverable:', error);
    res.status(500).json({ message: 'Failed to delete deliverable', error: error.message });
  }
});

export default router;
