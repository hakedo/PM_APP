import express from 'express';
import { TeamRole } from '../models/index.js';

const router = express.Router();

// Get all team roles
router.get('/', async (req, res) => {
  try {
    const { isActive } = req.query;
    const filter = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    const roles = await TeamRole.find(filter).sort({ name: 1 });
    res.json(roles);
  } catch (error) {
    console.error('Error fetching team roles:', error);
    res.status(500).json({ message: 'Failed to fetch team roles', error: error.message });
  }
});

// Get single team role
router.get('/:id', async (req, res) => {
  try {
    const role = await TeamRole.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Team role not found' });
    }
    res.json(role);
  } catch (error) {
    console.error('Error fetching team role:', error);
    res.status(500).json({ message: 'Failed to fetch team role', error: error.message });
  }
});

// Create new team role
router.post('/', async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    
    // Check if role name already exists
    const existingRole = await TeamRole.findOne({ name: name.trim() });
    if (existingRole) {
      return res.status(400).json({ message: 'A role with this name already exists' });
    }
    
    const role = new TeamRole({
      name: name.trim(),
      description: description?.trim(),
      isActive: isActive !== undefined ? isActive : true
    });
    
    await role.save();
    res.status(201).json(role);
  } catch (error) {
    console.error('Error creating team role:', error);
    res.status(500).json({ message: 'Failed to create team role', error: error.message });
  }
});

// Update team role
router.patch('/:id', async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const role = await TeamRole.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: 'Team role not found' });
    }
    
    // If name is being changed, check for duplicates
    if (name && name.trim() !== role.name) {
      const existingRole = await TeamRole.findOne({ name: name.trim() });
      if (existingRole) {
        return res.status(400).json({ message: 'A role with this name already exists' });
      }
      role.name = name.trim();
    }
    
    if (description !== undefined) {
      role.description = description.trim();
    }
    
    if (isActive !== undefined) {
      role.isActive = isActive;
    }
    
    await role.save();
    res.json(role);
  } catch (error) {
    console.error('Error updating team role:', error);
    res.status(500).json({ message: 'Failed to update team role', error: error.message });
  }
});

// Delete team role
router.delete('/:id', async (req, res) => {
  try {
    const role = await TeamRole.findByIdAndDelete(req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: 'Team role not found' });
    }
    
    res.json({ message: 'Team role deleted successfully' });
  } catch (error) {
    console.error('Error deleting team role:', error);
    res.status(500).json({ message: 'Failed to delete team role', error: error.message });
  }
});

export default router;
