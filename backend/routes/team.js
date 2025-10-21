import express from 'express';
import { TeamMember } from '../models/index.js';

const router = express.Router();

// Get all team members
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    const teamMembers = await TeamMember.find(filter).sort({ lastName: 1, firstName: 1 });
    res.json(teamMembers);
  } catch (error) {
    next(error);
  }
});

// Get team member by ID
router.get('/:id', async (req, res, next) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);

    if (!teamMember) {
      return res.status(404).json({
        error: 'Team member not found',
        message: `No team member found with id: ${req.params.id}`
      });
    }

    res.json(teamMember);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid team member ID',
        message: 'The provided team member ID is not valid'
      });
    }
    next(error);
  }
});

// Create new team member
router.post('/', async (req, res, next) => {
  try {
    const { firstName, middleInitial, lastName, email, phone, role, department, status } = req.body;

    // Check if team member with this email already exists
    const existingMember = await TeamMember.findOne({ email: email?.toLowerCase() });
    if (existingMember) {
      return res.status(409).json({
        error: 'Team member already exists',
        message: 'A team member with this email address already exists'
      });
    }

    const teamMember = new TeamMember({
      firstName,
      middleInitial: middleInitial || '',
      lastName,
      email,
      phone,
      role,
      department: department || '',
      status: status || 'active'
    });

    const savedMember = await teamMember.save();
    res.status(201).json(savedMember);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.message,
        details: error.errors
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Team member already exists',
        message: 'A team member with this email address already exists'
      });
    }
    next(error);
  }
});

// Update team member
router.patch('/:id', async (req, res, next) => {
  try {
    const { firstName, middleInitial, lastName, email, phone, role, department, status } = req.body;

    // If email is being updated, check if it's already in use
    if (email) {
      const existingMember = await TeamMember.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.params.id }
      });
      if (existingMember) {
        return res.status(409).json({
          error: 'Email already in use',
          message: 'Another team member is already using this email address'
        });
      }
    }

    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (middleInitial !== undefined) updateData.middleInitial = middleInitial;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (status !== undefined) updateData.status = status;

    const teamMember = await TeamMember.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!teamMember) {
      return res.status(404).json({
        error: 'Team member not found',
        message: `No team member found with id: ${req.params.id}`
      });
    }

    res.json(teamMember);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.message,
        details: error.errors
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid team member ID',
        message: 'The provided team member ID is not valid'
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Email already in use',
        message: 'Another team member is already using this email address'
      });
    }
    next(error);
  }
});

// Delete team member
router.delete('/:id', async (req, res, next) => {
  try {
    const teamMember = await TeamMember.findByIdAndDelete(req.params.id);

    if (!teamMember) {
      return res.status(404).json({
        error: 'Team member not found',
        message: `No team member found with id: ${req.params.id}`
      });
    }

    res.json({
      message: 'Team member deleted successfully',
      teamMember
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid team member ID',
        message: 'The provided team member ID is not valid'
      });
    }
    next(error);
  }
});

export default router;
