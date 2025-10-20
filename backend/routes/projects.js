import express from 'express';
import { Project, ClientProjectAssignment, Milestone, Deliverable, DeliverableTask } from '../models/index.js';

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
    const newProject = new Project(req.body);
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
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
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
    const projectId = req.params.id;
    
    const deletedProject = await Project.findById(projectId);
    
    if (!deletedProject) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: `No project found with id: ${projectId}`
      });
    }

    // CASCADE DELETE: Remove all related data
    // 1. Get all milestones for this project
    const milestones = await Milestone.find({ projectId });
    const milestoneIds = milestones.map(m => m._id);
    
    // 2. Get all deliverables for these milestones
    const deliverables = await Deliverable.find({ projectId });
    const deliverableIds = deliverables.map(d => d._id);
    
    // 3. Delete all tasks for these deliverables
    if (deliverableIds.length > 0) {
      await DeliverableTask.deleteMany({ projectId });
    }
    
    // 4. Delete all deliverables for these milestones
    if (milestoneIds.length > 0) {
      await Deliverable.deleteMany({ projectId });
    }
    
    // 5. Delete all milestones for this project
    await Milestone.deleteMany({ projectId });
    
    // 6. Remove all client assignments for this project
    await ClientProjectAssignment.deleteMany({ projectId });
    
    // 7. Finally, delete the project itself
    await deletedProject.deleteOne();
    
    res.json({ 
      message: 'Project and all related data deleted successfully',
      project: deletedProject,
      deletedCounts: {
        milestones: milestoneIds.length,
        deliverables: deliverableIds.length,
        tasks: deliverableIds.length > 0 ? 'cascade' : 0,
        clientAssignments: 'cascade'
      }
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
