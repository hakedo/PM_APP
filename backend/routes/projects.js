import express from 'express';
import { Project, ClientProjectAssignment, DeliverableNew, TaskNew, DeliverableGroup } from '../models/index.js';
import { recalculateDeliverableDates, recalculateTaskDates } from '../utils/dateCalculations.js';

const router = express.Router();

// Get all projects
router.get('/', async (req, res, next) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// Get single project by ID
router.get('/:id', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: `No project found with id: ${req.params.id}`
      });
    }

    res.json(project);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid project ID',
        message: 'The provided project ID is not valid'
      });
    }
    next(error);
  }
});

// Create new project
router.post('/', async (req, res, next) => {
  try {
    const projectData = { ...req.body };
    
    // Parse date strings as local dates (YYYY-MM-DD format)
    // Append time to treat as local date, not UTC
    if (projectData.startDate && typeof projectData.startDate === 'string') {
      // Only append time if it's a simple YYYY-MM-DD format
      if (projectData.startDate.length === 10 && !projectData.startDate.includes('T')) {
        projectData.startDate = new Date(projectData.startDate + 'T12:00:00');
      } else {
        projectData.startDate = new Date(projectData.startDate);
      }
    }
    if (projectData.endDate && typeof projectData.endDate === 'string') {
      // Only append time if it's a simple YYYY-MM-DD format
      if (projectData.endDate.length === 10 && !projectData.endDate.includes('T')) {
        projectData.endDate = new Date(projectData.endDate + 'T12:00:00');
      } else {
        projectData.endDate = new Date(projectData.endDate);
      }
    }
    
    const newProject = new Project(projectData);
    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: error.message,
        details: error.errors
      });
    }
    next(error);
  }
});

// Update project by ID
router.put('/:id', async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    
    // Parse date strings as local dates (YYYY-MM-DD format)
    // Append time to treat as local date, not UTC
    if (updateData.startDate && typeof updateData.startDate === 'string') {
      // Only append time if it's a simple YYYY-MM-DD format
      if (updateData.startDate.length === 10 && !updateData.startDate.includes('T')) {
        updateData.startDate = new Date(updateData.startDate + 'T12:00:00');
      } else {
        updateData.startDate = new Date(updateData.startDate);
      }
    }
    if (updateData.endDate && typeof updateData.endDate === 'string') {
      // Only append time if it's a simple YYYY-MM-DD format
      if (updateData.endDate.length === 10 && !updateData.endDate.includes('T')) {
        updateData.endDate = new Date(updateData.endDate + 'T12:00:00');
      } else {
        updateData.endDate = new Date(updateData.endDate);
      }
    }
    
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedProject) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: `No project found with id: ${req.params.id}`
      });
    }
    
    res.json(updatedProject);
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
        error: 'Invalid project ID',
        message: 'The provided project ID is not valid'
      });
    }
    next(error);
  }
});

// Delete project by ID
router.delete('/:id', async (req, res, next) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    
    if (!deletedProject) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: `No project found with id: ${req.params.id}`
      });
    }

    // Remove all client assignments for this project
    await ClientProjectAssignment.deleteMany({ projectId: req.params.id });

    // Delete all deliverable groups for this project
    await DeliverableGroup.deleteMany({ projectId: req.params.id });

    // Find all deliverables for this project
    const deliverables = await DeliverableNew.find({ projectId: req.params.id });
    const deliverableIds = deliverables.map(d => d._id);

    // Delete all tasks for these deliverables
    await TaskNew.deleteMany({ deliverableId: { $in: deliverableIds } });

    // Delete all deliverables for this project
    await DeliverableNew.deleteMany({ projectId: req.params.id });
    
    res.json({ 
      message: 'Project deleted successfully',
      project: deletedProject
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid project ID',
        message: 'The provided project ID is not valid'
      });
    }
    next(error);
  }
});

export default router;
