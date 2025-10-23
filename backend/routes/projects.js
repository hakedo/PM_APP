import express from 'express';
import { Project, ClientProjectAssignment } from '../models/index.js';
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
    
    // Convert date strings to UTC dates at midnight
    if (projectData.startDate) {
      const [year, month, day] = projectData.startDate.split('-').map(Number);
      projectData.startDate = new Date(Date.UTC(year, month - 1, day));
    }
    if (projectData.endDate) {
      const [year, month, day] = projectData.endDate.split('-').map(Number);
      projectData.endDate = new Date(Date.UTC(year, month - 1, day));
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
    
    // Convert date strings to UTC dates at midnight
    if (updateData.startDate) {
      const [year, month, day] = updateData.startDate.split('-').map(Number);
      updateData.startDate = new Date(Date.UTC(year, month - 1, day));
    }
    if (updateData.endDate) {
      const [year, month, day] = updateData.endDate.split('-').map(Number);
      updateData.endDate = new Date(Date.UTC(year, month - 1, day));
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

    // Find all milestones for this project
    const milestones = await Milestone.find({ projectId: req.params.id });
    const milestoneIds = milestones.map(m => m._id);

    // Find all deliverables for these milestones
    const deliverables = await Deliverable.find({ milestoneId: { $in: milestoneIds } });
    const deliverableIds = deliverables.map(d => d._id);

    // Delete all tasks for these deliverables
    await Task.deleteMany({ deliverableId: { $in: deliverableIds } });

    // Delete all deliverables for these milestones
    await Deliverable.deleteMany({ milestoneId: { $in: milestoneIds } });

    // Delete all milestones for this project
    await Milestone.deleteMany({ projectId: req.params.id });
    
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
