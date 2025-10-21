import express from 'express';
import { Project, ClientProjectAssignment, Milestone, Deliverable, Task } from '../models/index.js';
import { recalculateMilestoneDates, validateMilestoneDates } from '../utils/milestoneUtils.js';

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

    // Fetch milestones for this project
    const milestones = await Milestone.find({ projectId: req.params.id }).sort({ order: 1 });
    
    // Fetch deliverables for all milestones
    const milestoneIds = milestones.map(m => m._id);
    const deliverables = await Deliverable.find({ milestoneId: { $in: milestoneIds } }).sort({ order: 1 });
    
    // Fetch tasks for all deliverables
    const deliverableIds = deliverables.map(d => d._id);
    const tasks = await Task.find({ deliverableId: { $in: deliverableIds } }).sort({ order: 1 });
    
    // Build the nested structure
    const milestonesWithData = milestones.map(milestone => {
      const milestoneDeliverables = deliverables
        .filter(d => d.milestoneId.toString() === milestone._id.toString())
        .map(deliverable => {
          const deliverableTasks = tasks.filter(t => t.deliverableId.toString() === deliverable._id.toString());
          return {
            ...deliverable.toObject(),
            tasks: deliverableTasks
          };
        });
      
      return {
        ...milestone.toObject(),
        deliverables: milestoneDeliverables
      };
    });
    
    // Add milestones to project response
    const projectWithMilestones = {
      ...project.toObject(),
      milestones: milestonesWithData
    };
    
    res.json(projectWithMilestones);
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

// ====== MILESTONE ROUTES ======

// Add a milestone to a project
router.post('/:id/milestones', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: `No project found with id: ${req.params.id}`
      });
    }

    // Get existing milestones to determine previous milestone's end date
    const existingMilestones = await Milestone.find({ projectId: req.params.id }).sort({ order: 1 });
    const milestoneCount = existingMilestones.length;
    
    // Determine previous end date (project start if first milestone, otherwise previous milestone's end)
    let previousEndDate = project.startDate;
    if (milestoneCount > 0) {
      const lastMilestone = existingMilestones[milestoneCount - 1];
      previousEndDate = lastMilestone.calculatedEndDate || lastMilestone.endDate || project.startDate;
    }

    // Create milestone with date fields
    const milestoneData = {
      name: req.body.name,
      abbreviation: req.body.abbreviation,
      description: req.body.description,
      teamMember: req.body.teamMember,
      supervisor: req.body.supervisor,
      projectId: req.params.id,
      order: milestoneCount,
      dateMode: req.body.dateMode || 'auto',
      endDateMode: req.body.endDateMode || 'duration',
      durationDays: req.body.durationDays || 1,
      daysAfterPrevious: req.body.daysAfterPrevious || 0
    };

    // Add manual dates if provided
    if (req.body.startDate) milestoneData.startDate = req.body.startDate;
    if (req.body.endDate) milestoneData.endDate = req.body.endDate;

    // Validate dates
    const validation = validateMilestoneDates(milestoneData, previousEndDate, project.endDate);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        message: validation.errors.join(', ')
      });
    }

    const milestone = new Milestone(milestoneData);
    
    // Calculate dates before saving
    const calculated = recalculateMilestoneDates([milestone.toObject()], previousEndDate);
    milestone.calculatedStartDate = calculated[0].calculatedStartDate;
    milestone.calculatedEndDate = calculated[0].calculatedEndDate;

    await milestone.save();

    // Recalculate all subsequent milestones
    const allMilestones = await Milestone.find({ projectId: req.params.id }).sort({ order: 1 });
    const recalculated = recalculateMilestoneDates(
      allMilestones.map(m => m.toObject()), 
      project.startDate
    );

    // Update all milestones with recalculated dates
    for (let i = 0; i < allMilestones.length; i++) {
      allMilestones[i].calculatedStartDate = recalculated[i].calculatedStartDate;
      allMilestones[i].calculatedEndDate = recalculated[i].calculatedEndDate;
      await allMilestones[i].save();
    }

    // Return the project with all milestones populated
    const updatedMilestones = await Milestone.find({ projectId: req.params.id }).sort({ order: 1 });
    const projectWithMilestones = {
      ...project.toObject(),
      milestones: updatedMilestones.map(m => ({ ...m.toObject(), deliverables: [] }))
    };

    res.status(201).json(projectWithMilestones);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: error.message
      });
    }
    next(error);
  }
});

// Update a milestone
router.put('/:id/milestones/:milestoneId', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: `No project found with id: ${req.params.id}`
      });
    }

    const milestone = await Milestone.findOne({ 
      _id: req.params.milestoneId, 
      projectId: req.params.id 
    });

    if (!milestone) {
      return res.status(404).json({ 
        error: 'Milestone not found'
      });
    }

    // Update basic fields
    if (req.body.name !== undefined) milestone.name = req.body.name;
    if (req.body.abbreviation !== undefined) milestone.abbreviation = req.body.abbreviation;
    if (req.body.description !== undefined) milestone.description = req.body.description;
    if (req.body.teamMember !== undefined) milestone.teamMember = req.body.teamMember;
    if (req.body.supervisor !== undefined) milestone.supervisor = req.body.supervisor;
    if (req.body.order !== undefined) milestone.order = req.body.order;
    
    // Update date fields
    if (req.body.dateMode !== undefined) milestone.dateMode = req.body.dateMode;
    if (req.body.endDateMode !== undefined) milestone.endDateMode = req.body.endDateMode;
    if (req.body.durationDays !== undefined) milestone.durationDays = req.body.durationDays;
    if (req.body.daysAfterPrevious !== undefined) milestone.daysAfterPrevious = req.body.daysAfterPrevious;
    if (req.body.startDate !== undefined) milestone.startDate = req.body.startDate;
    if (req.body.endDate !== undefined) milestone.endDate = req.body.endDate;

    await milestone.save();

    // Recalculate all milestones after any date change
    const allMilestones = await Milestone.find({ projectId: req.params.id }).sort({ order: 1 });
    const recalculated = recalculateMilestoneDates(
      allMilestones.map(m => m.toObject()), 
      project.startDate
    );

    // Update all milestones with recalculated dates
    for (let i = 0; i < allMilestones.length; i++) {
      allMilestones[i].calculatedStartDate = recalculated[i].calculatedStartDate;
      allMilestones[i].calculatedEndDate = recalculated[i].calculatedEndDate;
      await allMilestones[i].save();
    }

    // Return the project with all milestones populated
    const milestones = await Milestone.find({ projectId: req.params.id }).sort({ order: 1 });
    const deliverables = await Deliverable.find({ milestoneId: { $in: milestones.map(m => m._id) } }).sort({ order: 1 });
    const deliverableIds = deliverables.map(d => d._id);
    const tasks = await Task.find({ deliverableId: { $in: deliverableIds } }).sort({ order: 1 });

    const milestonesWithData = milestones.map(m => {
      const milestoneDeliverables = deliverables
        .filter(d => d.milestoneId.toString() === m._id.toString())
        .map(d => {
          const deliverableTasks = tasks.filter(t => t.deliverableId.toString() === d._id.toString());
          return { ...d.toObject(), tasks: deliverableTasks };
        });
      return { ...m.toObject(), deliverables: milestoneDeliverables };
    });

    const projectWithMilestones = {
      ...project.toObject(),
      milestones: milestonesWithData
    };

    res.json(projectWithMilestones);
  } catch (error) {
    next(error);
  }
});

// Delete a milestone
router.delete('/:id/milestones/:milestoneId', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: `No project found with id: ${req.params.id}`
      });
    }

    const milestone = await Milestone.findOne({ 
      _id: req.params.milestoneId, 
      projectId: req.params.id 
    });

    if (!milestone) {
      return res.status(404).json({ 
        error: 'Milestone not found'
      });
    }

    // Find all deliverables for this milestone
    const deliverables = await Deliverable.find({ milestoneId: req.params.milestoneId });
    const deliverableIds = deliverables.map(d => d._id);

    // Delete all tasks for these deliverables
    await Task.deleteMany({ deliverableId: { $in: deliverableIds } });

    // Delete all deliverables for this milestone
    await Deliverable.deleteMany({ milestoneId: req.params.milestoneId });

    // Delete the milestone
    await Milestone.findByIdAndDelete(req.params.milestoneId);

    // Return the project with remaining milestones
    const milestones = await Milestone.find({ projectId: req.params.id }).sort({ order: 1 });
    const projectWithMilestones = {
      ...project.toObject(),
      milestones: milestones.map(m => ({ ...m.toObject(), deliverables: [] }))
    };

    res.json(projectWithMilestones);
  } catch (error) {
    next(error);
  }
});

// ====== DELIVERABLE ROUTES ======

// Add a deliverable to a milestone
router.post('/:id/milestones/:milestoneId/deliverables', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: `No project found with id: ${req.params.id}`
      });
    }

    const milestone = await Milestone.findOne({ 
      _id: req.params.milestoneId, 
      projectId: req.params.id 
    });

    if (!milestone) {
      return res.status(404).json({ 
        error: 'Milestone not found'
      });
    }

    // Get the count of existing deliverables to set the order
    const deliverableCount = await Deliverable.countDocuments({ milestoneId: req.params.milestoneId });

    const deliverable = new Deliverable({
      title: req.body.title,
      description: req.body.description,
      milestoneId: req.params.milestoneId,
      completed: false,
      order: deliverableCount,
      startDate: req.body.startDate,
      endDate: req.body.endDate
    });

    // Validate dates are within milestone bounds
    try {
      await deliverable.validateDatesWithinMilestone();
    } catch (validationError) {
      return res.status(400).json({
        error: 'Validation failed',
        message: validationError.message
      });
    }

    await deliverable.save();

    // Return the full project structure
    const milestones = await Milestone.find({ projectId: req.params.id }).sort({ order: 1 });
    const deliverables = await Deliverable.find({ milestoneId: { $in: milestones.map(m => m._id) } }).sort({ order: 1 });
    const deliverableIds = deliverables.map(d => d._id);
    const tasks = await Task.find({ deliverableId: { $in: deliverableIds } }).sort({ order: 1 });

    const milestonesWithData = milestones.map(m => {
      const milestoneDeliverables = deliverables
        .filter(d => d.milestoneId.toString() === m._id.toString())
        .map(d => {
          const deliverableTasks = tasks.filter(t => t.deliverableId.toString() === d._id.toString());
          return { ...d.toObject(), tasks: deliverableTasks };
        });
      return { ...m.toObject(), deliverables: milestoneDeliverables };
    });

    const projectWithMilestones = {
      ...project.toObject(),
      milestones: milestonesWithData
    };

    res.status(201).json(projectWithMilestones);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: error.message
      });
    }
    next(error);
  }
});

// Update a deliverable
router.put('/:id/milestones/:milestoneId/deliverables/:deliverableId', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: `No project found with id: ${req.params.id}`
      });
    }

    const milestone = await Milestone.findOne({ 
      _id: req.params.milestoneId, 
      projectId: req.params.id 
    });

    if (!milestone) {
      return res.status(404).json({ 
        error: 'Milestone not found'
      });
    }

    const deliverable = await Deliverable.findOne({ 
      _id: req.params.deliverableId, 
      milestoneId: req.params.milestoneId 
    });

    if (!deliverable) {
      return res.status(404).json({ 
        error: 'Deliverable not found'
      });
    }

    if (req.body.title !== undefined) deliverable.title = req.body.title;
    if (req.body.description !== undefined) deliverable.description = req.body.description;
    if (req.body.completed !== undefined) deliverable.completed = req.body.completed;
    if (req.body.order !== undefined) deliverable.order = req.body.order;
    if (req.body.startDate !== undefined) deliverable.startDate = req.body.startDate;
    if (req.body.endDate !== undefined) deliverable.endDate = req.body.endDate;

    // Validate dates are within milestone bounds if dates are being updated
    if (req.body.startDate !== undefined || req.body.endDate !== undefined) {
      try {
        await deliverable.validateDatesWithinMilestone();
      } catch (validationError) {
        return res.status(400).json({
          error: 'Validation failed',
          message: validationError.message
        });
      }
    }

    await deliverable.save();

    // Return the full project structure
    const milestones = await Milestone.find({ projectId: req.params.id }).sort({ order: 1 });
    const deliverables = await Deliverable.find({ milestoneId: { $in: milestones.map(m => m._id) } }).sort({ order: 1 });
    const deliverableIds = deliverables.map(d => d._id);
    const tasks = await Task.find({ deliverableId: { $in: deliverableIds } }).sort({ order: 1 });

    const milestonesWithData = milestones.map(m => {
      const milestoneDeliverables = deliverables
        .filter(d => d.milestoneId.toString() === m._id.toString())
        .map(d => {
          const deliverableTasks = tasks.filter(t => t.deliverableId.toString() === d._id.toString());
          return { ...d.toObject(), tasks: deliverableTasks };
        });
      return { ...m.toObject(), deliverables: milestoneDeliverables };
    });

    const projectWithMilestones = {
      ...project.toObject(),
      milestones: milestonesWithData
    };

    res.json(projectWithMilestones);
  } catch (error) {
    next(error);
  }
});

// Delete a deliverable
router.delete('/:id/milestones/:milestoneId/deliverables/:deliverableId', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: `No project found with id: ${req.params.id}`
      });
    }

    const milestone = await Milestone.findOne({ 
      _id: req.params.milestoneId, 
      projectId: req.params.id 
    });

    if (!milestone) {
      return res.status(404).json({ 
        error: 'Milestone not found'
      });
    }

    const deliverable = await Deliverable.findOne({ 
      _id: req.params.deliverableId, 
      milestoneId: req.params.milestoneId 
    });

    if (!deliverable) {
      return res.status(404).json({ 
        error: 'Deliverable not found'
      });
    }

    // Delete all tasks for this deliverable
    await Task.deleteMany({ deliverableId: req.params.deliverableId });

    // Delete the deliverable
    await Deliverable.findByIdAndDelete(req.params.deliverableId);

    // Return the full project structure
    const milestones = await Milestone.find({ projectId: req.params.id }).sort({ order: 1 });
    const deliverables = await Deliverable.find({ milestoneId: { $in: milestones.map(m => m._id) } }).sort({ order: 1 });
    const deliverableIds = deliverables.map(d => d._id);
    const tasks = await Task.find({ deliverableId: { $in: deliverableIds } }).sort({ order: 1 });

    const milestonesWithData = milestones.map(m => {
      const milestoneDeliverables = deliverables
        .filter(d => d.milestoneId.toString() === m._id.toString())
        .map(d => {
          const deliverableTasks = tasks.filter(t => t.deliverableId.toString() === d._id.toString());
          return { ...d.toObject(), tasks: deliverableTasks };
        });
      return { ...m.toObject(), deliverables: milestoneDeliverables };
    });

    const projectWithMilestones = {
      ...project.toObject(),
      milestones: milestonesWithData
    };

    res.json(projectWithMilestones);
  } catch (error) {
    next(error);
  }
});

// ====== TASK ROUTES ======

// Add a task to a deliverable
router.post('/:id/milestones/:milestoneId/deliverables/:deliverableId/tasks', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: `No project found with id: ${req.params.id}`
      });
    }

    const milestone = await Milestone.findOne({ 
      _id: req.params.milestoneId, 
      projectId: req.params.id 
    });

    if (!milestone) {
      return res.status(404).json({ 
        error: 'Milestone not found'
      });
    }

    const deliverable = await Deliverable.findOne({ 
      _id: req.params.deliverableId, 
      milestoneId: req.params.milestoneId 
    });

    if (!deliverable) {
      return res.status(404).json({ 
        error: 'Deliverable not found'
      });
    }

    // Get the count of existing tasks to set the order
    const taskCount = await Task.countDocuments({ deliverableId: req.params.deliverableId });

    const task = new Task({
      title: req.body.title,
      description: req.body.description,
      deliverableId: req.params.deliverableId,
      completed: false,
      order: taskCount,
      startDate: req.body.startDate,
      endDate: req.body.endDate
    });

    // Validate dates are within deliverable bounds
    try {
      await task.validateDatesWithinDeliverable();
    } catch (validationError) {
      return res.status(400).json({
        error: 'Validation failed',
        message: validationError.message
      });
    }

    await task.save();

    // Return the full project structure
    const milestones = await Milestone.find({ projectId: req.params.id }).sort({ order: 1 });
    const deliverables = await Deliverable.find({ milestoneId: { $in: milestones.map(m => m._id) } }).sort({ order: 1 });
    const deliverableIds = deliverables.map(d => d._id);
    const tasks = await Task.find({ deliverableId: { $in: deliverableIds } }).sort({ order: 1 });

    const milestonesWithData = milestones.map(m => {
      const milestoneDeliverables = deliverables
        .filter(d => d.milestoneId.toString() === m._id.toString())
        .map(d => {
          const deliverableTasks = tasks.filter(t => t.deliverableId.toString() === d._id.toString());
          return { ...d.toObject(), tasks: deliverableTasks };
        });
      return { ...m.toObject(), deliverables: milestoneDeliverables };
    });

    const projectWithMilestones = {
      ...project.toObject(),
      milestones: milestonesWithData
    };

    res.status(201).json(projectWithMilestones);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: error.message
      });
    }
    next(error);
  }
});

// Update a task
router.put('/:id/milestones/:milestoneId/deliverables/:deliverableId/tasks/:taskId', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: `No project found with id: ${req.params.id}`
      });
    }

    const milestone = await Milestone.findOne({ 
      _id: req.params.milestoneId, 
      projectId: req.params.id 
    });

    if (!milestone) {
      return res.status(404).json({ 
        error: 'Milestone not found'
      });
    }

    const deliverable = await Deliverable.findOne({ 
      _id: req.params.deliverableId, 
      milestoneId: req.params.milestoneId 
    });

    if (!deliverable) {
      return res.status(404).json({ 
        error: 'Deliverable not found'
      });
    }

    const task = await Task.findOne({ 
      _id: req.params.taskId, 
      deliverableId: req.params.deliverableId 
    });

    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found'
      });
    }

    if (req.body.title !== undefined) task.title = req.body.title;
    if (req.body.description !== undefined) task.description = req.body.description;
    if (req.body.completed !== undefined) task.completed = req.body.completed;
    if (req.body.order !== undefined) task.order = req.body.order;
    if (req.body.startDate !== undefined) task.startDate = req.body.startDate;
    if (req.body.endDate !== undefined) task.endDate = req.body.endDate;

    // Validate dates are within deliverable bounds if dates are being updated
    if (req.body.startDate !== undefined || req.body.endDate !== undefined) {
      try {
        await task.validateDatesWithinDeliverable();
      } catch (validationError) {
        return res.status(400).json({
          error: 'Validation failed',
          message: validationError.message
        });
      }
    }

    await task.save();

    // Return the full project structure
    const milestones = await Milestone.find({ projectId: req.params.id }).sort({ order: 1 });
    const deliverables = await Deliverable.find({ milestoneId: { $in: milestones.map(m => m._id) } }).sort({ order: 1 });
    const deliverableIds = deliverables.map(d => d._id);
    const tasks = await Task.find({ deliverableId: { $in: deliverableIds } }).sort({ order: 1 });

    const milestonesWithData = milestones.map(m => {
      const milestoneDeliverables = deliverables
        .filter(d => d.milestoneId.toString() === m._id.toString())
        .map(d => {
          const deliverableTasks = tasks.filter(t => t.deliverableId.toString() === d._id.toString());
          return { ...d.toObject(), tasks: deliverableTasks };
        });
      return { ...m.toObject(), deliverables: milestoneDeliverables };
    });

    const projectWithMilestones = {
      ...project.toObject(),
      milestones: milestonesWithData
    };

    res.json(projectWithMilestones);
  } catch (error) {
    next(error);
  }
});

// Delete a task
router.delete('/:id/milestones/:milestoneId/deliverables/:deliverableId/tasks/:taskId', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: `No project found with id: ${req.params.id}`
      });
    }

    const milestone = await Milestone.findOne({ 
      _id: req.params.milestoneId, 
      projectId: req.params.id 
    });

    if (!milestone) {
      return res.status(404).json({ 
        error: 'Milestone not found'
      });
    }

    const deliverable = await Deliverable.findOne({ 
      _id: req.params.deliverableId, 
      milestoneId: req.params.milestoneId 
    });

    if (!deliverable) {
      return res.status(404).json({ 
        error: 'Deliverable not found'
      });
    }

    const task = await Task.findOne({ 
      _id: req.params.taskId, 
      deliverableId: req.params.deliverableId 
    });

    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found'
      });
    }

    // Delete the task
    await Task.findByIdAndDelete(req.params.taskId);

    // Return the full project structure
    const milestones = await Milestone.find({ projectId: req.params.id }).sort({ order: 1 });
    const deliverables = await Deliverable.find({ milestoneId: { $in: milestones.map(m => m._id) } }).sort({ order: 1 });
    const deliverableIds = deliverables.map(d => d._id);
    const tasks = await Task.find({ deliverableId: { $in: deliverableIds } }).sort({ order: 1 });

    const milestonesWithData = milestones.map(m => {
      const milestoneDeliverables = deliverables
        .filter(d => d.milestoneId.toString() === m._id.toString())
        .map(d => {
          const deliverableTasks = tasks.filter(t => t.deliverableId.toString() === d._id.toString());
          return { ...d.toObject(), tasks: deliverableTasks };
        });
      return { ...m.toObject(), deliverables: milestoneDeliverables };
    });

    const projectWithMilestones = {
      ...project.toObject(),
      milestones: milestonesWithData
    };

    res.json(projectWithMilestones);
  } catch (error) {
    next(error);
  }
});

export default router;
