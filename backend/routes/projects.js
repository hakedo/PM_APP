import express from 'express';
import { Project, ClientProjectAssignment, Milestone, Deliverable, Task } from '../models/index.js';
import { recalculateMilestoneDates, validateMilestoneDates } from '../utils/milestoneUtils.js';
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

    // Fetch milestones for this project
    const milestones = await Milestone.find({ projectId: req.params.id }).sort({ order: 1 });
    
    // Fetch deliverables for all milestones
    const milestoneIds = milestones.map(m => m._id);
    const deliverables = await Deliverable.find({ milestoneId: { $in: milestoneIds } }).sort({ order: 1 });
    
    // Fetch tasks for all deliverables
    const deliverableIds = deliverables.map(d => d._id);
    const tasks = await Task.find({ deliverableId: { $in: deliverableIds } }).sort({ order: 1 });
    
    // Build milestones with their deliverables for date calculation
    const milestonesWithDeliverables = milestones.map(m => ({
      ...m.toObject(),
      deliverables: deliverables.filter(d => d.milestoneId.toString() === m._id.toString())
    }));
    
    // Recalculate milestone dates from deliverables
    const milestonesWithCalculatedDates = recalculateMilestoneDates(milestonesWithDeliverables, project.startDate);
    
    // Build the nested structure with calculated dates
    const milestonesWithData = milestonesWithCalculatedDates.map((milestone, index) => {
      const milestoneDeliverables = deliverables
        .filter(d => d.milestoneId.toString() === milestone._id.toString())
        .map(deliverable => {
          // Get deliverable tasks
          const deliverableTasks = tasks
            .filter(t => t.deliverableId.toString() === deliverable._id.toString())
            .map(task => task.toObject());
          
          return {
            ...deliverable.toObject(),
            tasks: deliverableTasks
          };
        });
      
      return {
        ...milestone,
        deliverables: milestoneDeliverables
      };
    });
    
    // Sort milestones by calculated start date (earliest first)
    const sortedMilestones = milestonesWithData.sort((a, b) => {
      if (!a.calculatedStartDate && !b.calculatedStartDate) return 0;
      if (!a.calculatedStartDate) return 1; // Put milestones without dates at the end
      if (!b.calculatedStartDate) return -1;
      return new Date(a.calculatedStartDate) - new Date(b.calculatedStartDate);
    });
    
    // Add milestones to project response
    const projectWithMilestones = {
      ...project.toObject(),
      milestones: sortedMilestones
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

    console.log('Received milestone data:', req.body);
    console.log('Project start date from DB:', project.startDate);

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
      projectId: req.params.id,
      order: milestoneCount,
      dateMode: req.body.dateMode || 'auto',
      endDateMode: req.body.endDateMode || 'duration',
      durationDays: req.body.durationDays || 1,
      durationType: req.body.durationType || 'business',
      daysAfterPrevious: req.body.daysAfterPrevious || 0,
      gapType: req.body.gapType || 'business'
    };

    // Add manual dates if provided
    if (req.body.startDate) {
      // Convert YYYY-MM-DD string to UTC date at midnight
      const [year, month, day] = req.body.startDate.split('-').map(Number);
      milestoneData.startDate = new Date(Date.UTC(year, month - 1, day));
    }
    if (req.body.endDate) {
      // Convert YYYY-MM-DD string to UTC date at midnight
      const [year, month, day] = req.body.endDate.split('-').map(Number);
      milestoneData.endDate = new Date(Date.UTC(year, month - 1, day));
    }

    // Validate dates
    const validation = validateMilestoneDates(milestoneData, previousEndDate, project.endDate, project.startDate);
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
    if (req.body.order !== undefined) milestone.order = req.body.order;
    
    // Update date fields
    if (req.body.dateMode !== undefined) milestone.dateMode = req.body.dateMode;
    if (req.body.endDateMode !== undefined) milestone.endDateMode = req.body.endDateMode;
    if (req.body.durationDays !== undefined) milestone.durationDays = req.body.durationDays;
    if (req.body.durationType !== undefined) milestone.durationType = req.body.durationType;
    if (req.body.daysAfterPrevious !== undefined) milestone.daysAfterPrevious = req.body.daysAfterPrevious;
    if (req.body.gapType !== undefined) milestone.gapType = req.body.gapType;
    if (req.body.startDate !== undefined) {
      // Convert YYYY-MM-DD string to UTC date at midnight
      const [year, month, day] = req.body.startDate.split('-').map(Number);
      milestone.startDate = new Date(Date.UTC(year, month - 1, day));
    }
    if (req.body.endDate !== undefined) {
      // Convert YYYY-MM-DD string to UTC date at midnight
      const [year, month, day] = req.body.endDate.split('-').map(Number);
      milestone.endDate = new Date(Date.UTC(year, month - 1, day));
    }

    // Get previous milestone end date for validation
    const allMilestones = await Milestone.find({ projectId: req.params.id }).sort({ order: 1 });
    const milestoneIndex = allMilestones.findIndex(m => m._id.toString() === milestone._id.toString());
    let previousEndDate = project.startDate;
    if (milestoneIndex > 0) {
      const previousMilestone = allMilestones[milestoneIndex - 1];
      previousEndDate = previousMilestone.calculatedEndDate || previousMilestone.endDate || project.startDate;
    }

    // Validate dates before saving
    const validation = validateMilestoneDates(milestone.toObject(), previousEndDate, project.endDate, project.startDate);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        message: validation.errors.join(', ')
      });
    }

    await milestone.save();

    // Recalculate all milestones after any date change
    const updatedMilestones = await Milestone.find({ projectId: req.params.id }).sort({ order: 1 });
    const recalculated = recalculateMilestoneDates(
      updatedMilestones.map(m => m.toObject()), 
      project.startDate
    );

    // Update all milestones with recalculated dates
    for (let i = 0; i < updatedMilestones.length; i++) {
      updatedMilestones[i].calculatedStartDate = recalculated[i].calculatedStartDate;
      updatedMilestones[i].calculatedEndDate = recalculated[i].calculatedEndDate;
      await updatedMilestones[i].save();
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
      endDate: req.body.endDate,
      calculatedStartDate: req.body.startDate,
      calculatedEndDate: req.body.endDate
    });

    await deliverable.save();

    // Return the full project structure with calculated dates
    const milestones = await Milestone.find({ projectId: req.params.id }).sort({ order: 1 });
    const deliverables = await Deliverable.find({ milestoneId: { $in: milestones.map(m => m._id) } }).sort({ order: 1 });
    const deliverableIds = deliverables.map(d => d._id);
    const tasks = await Task.find({ deliverableId: { $in: deliverableIds } }).sort({ order: 1 });

    // Build milestones with their deliverables for date calculation
    const milestonesWithDeliverables = milestones.map(m => ({
      ...m.toObject(),
      deliverables: deliverables.filter(d => d.milestoneId.toString() === m._id.toString())
    }));
    
    // Recalculate milestone dates from deliverables
    const milestonesWithCalculatedDates = recalculateMilestoneDates(milestonesWithDeliverables, project.startDate);
    
    // Update milestones in database with calculated dates
    for (const milestone of milestonesWithCalculatedDates) {
      await Milestone.findByIdAndUpdate(milestone._id, {
        calculatedStartDate: milestone.calculatedStartDate,
        calculatedEndDate: milestone.calculatedEndDate
      });
    }

    const milestonesWithData = milestonesWithCalculatedDates.map(m => {
      const milestoneDeliverables = deliverables
        .filter(d => d.milestoneId.toString() === m._id.toString())
        .map(d => {
          const deliverableTasks = tasks
            .filter(t => t.deliverableId.toString() === d._id.toString())
            .map(task => task.toObject());
          
          return { ...d.toObject(), tasks: deliverableTasks };
        });
      return { ...m, deliverables: milestoneDeliverables };
    });
    
    // Sort milestones by calculated start date (earliest first)
    const sortedMilestones = milestonesWithData.sort((a, b) => {
      if (!a.calculatedStartDate && !b.calculatedStartDate) return 0;
      if (!a.calculatedStartDate) return 1;
      if (!b.calculatedStartDate) return -1;
      return new Date(a.calculatedStartDate) - new Date(b.calculatedStartDate);
    });

    const projectWithMilestones = {
      ...project.toObject(),
      milestones: sortedMilestones
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
    if (req.body.startDate !== undefined) {
      deliverable.startDate = req.body.startDate;
      deliverable.calculatedStartDate = req.body.startDate;
    }
    if (req.body.endDate !== undefined) {
      deliverable.endDate = req.body.endDate;
      deliverable.calculatedEndDate = req.body.endDate;
    }

    await deliverable.save();

    // Return the full project structure with calculated dates
    const milestones = await Milestone.find({ projectId: req.params.id }).sort({ order: 1 });
    const deliverables = await Deliverable.find({ milestoneId: { $in: milestones.map(m => m._id) } }).sort({ order: 1 });
    const deliverableIds = deliverables.map(d => d._id);
    const tasks = await Task.find({ deliverableId: { $in: deliverableIds } }).sort({ order: 1 });

    // Build milestones with their deliverables for date calculation
    const milestonesWithDeliverables = milestones.map(m => ({
      ...m.toObject(),
      deliverables: deliverables.filter(d => d.milestoneId.toString() === m._id.toString())
    }));
    
    // Recalculate milestone dates from deliverables
    const milestonesWithCalculatedDates = recalculateMilestoneDates(milestonesWithDeliverables, project.startDate);
    
    // Update milestones in database with calculated dates
    for (const milestone of milestonesWithCalculatedDates) {
      await Milestone.findByIdAndUpdate(milestone._id, {
        calculatedStartDate: milestone.calculatedStartDate,
        calculatedEndDate: milestone.calculatedEndDate
      });
    }

    const milestonesWithData = milestonesWithCalculatedDates.map(m => {
      const milestoneDeliverables = deliverables
        .filter(d => d.milestoneId.toString() === m._id.toString())
        .map(d => {
          const deliverableTasks = tasks
            .filter(t => t.deliverableId.toString() === d._id.toString())
            .map(task => task.toObject());
          
          return { ...d.toObject(), tasks: deliverableTasks };
        });
      return { ...m, deliverables: milestoneDeliverables };
    });
    
    // Sort milestones by calculated start date (earliest first)
    const sortedMilestones = milestonesWithData.sort((a, b) => {
      if (!a.calculatedStartDate && !b.calculatedStartDate) return 0;
      if (!a.calculatedStartDate) return 1;
      if (!b.calculatedStartDate) return -1;
      return new Date(a.calculatedStartDate) - new Date(b.calculatedStartDate);
    });

    const projectWithMilestones = {
      ...project.toObject(),
      milestones: sortedMilestones
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
      dueDateMode: req.body.dueDateMode || 'date',
      dueDate: req.body.dueDate,
      dueDateOffset: req.body.dueDateOffset || 0,
      dueDateOffsetType: req.body.dueDateOffsetType || 'business'
    });

    // Calculate due date based on mode
    const deliverableStartDate = deliverable.calculatedStartDate || deliverable.startDate;
    const deliverableEndDate = deliverable.calculatedEndDate || deliverable.endDate;
    
    if (task.dueDateMode === 'date') {
      task.calculatedDueDate = task.dueDate;
    } else if (task.dueDateMode === 'afterStart' && deliverableStartDate) {
      const { addBusinessDays, addDays } = require('../utils/milestoneUtils');
      const addFunc = task.dueDateOffsetType === 'business' ? addBusinessDays : addDays;
      task.calculatedDueDate = addFunc(new Date(deliverableStartDate), task.dueDateOffset);
    } else if (task.dueDateMode === 'beforeEnd' && deliverableEndDate) {
      const { addBusinessDays, addDays } = require('../utils/milestoneUtils');
      const addFunc = task.dueDateOffsetType === 'business' ? addBusinessDays : addDays;
      task.calculatedDueDate = addFunc(new Date(deliverableEndDate), -task.dueDateOffset);
    }

    await task.save();

    // Return the full project structure with calculated dates
    const milestones = await Milestone.find({ projectId: req.params.id }).sort({ order: 1 });
    
    // Recalculate milestone dates
    const milestonesWithCalculatedDates = recalculateMilestoneDates(
      milestones.map(m => m.toObject()),
      project.startDate
    );
    
    const deliverables = await Deliverable.find({ milestoneId: { $in: milestones.map(m => m._id) } }).sort({ order: 1 });
    const deliverableIds = deliverables.map(d => d._id);
    const tasks = await Task.find({ deliverableId: { $in: deliverableIds } }).sort({ order: 1 });

    const milestonesWithData = milestonesWithCalculatedDates.map(m => {
      const milestoneDeliverables = deliverables
        .filter(d => d.milestoneId.toString() === m._id.toString())
        .map(d => {
          // Calculate deliverable dates
          const deliverableWithDates = recalculateDeliverableDates(d.toObject(), m.calculatedStartDate);
          
          // Calculate task dates
          const deliverableTasks = tasks
            .filter(t => t.deliverableId.toString() === d._id.toString())
            .map(task => {
              const taskStartDate = deliverableWithDates.calculatedStartDate || deliverableWithDates.startDate;
              return recalculateTaskDates(task.toObject(), taskStartDate);
            });
          
          return { ...deliverableWithDates, tasks: deliverableTasks };
        });
      return { ...m, deliverables: milestoneDeliverables };
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
    if (req.body.dueDateMode !== undefined) task.dueDateMode = req.body.dueDateMode;
    if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate;
    if (req.body.dueDateOffset !== undefined) task.dueDateOffset = req.body.dueDateOffset;
    if (req.body.dueDateOffsetType !== undefined) task.dueDateOffsetType = req.body.dueDateOffsetType;

    // Recalculate due date based on mode
    const deliverableStartDate = deliverable.calculatedStartDate || deliverable.startDate;
    const deliverableEndDate = deliverable.calculatedEndDate || deliverable.endDate;
    
    if (task.dueDateMode === 'date') {
      task.calculatedDueDate = task.dueDate;
    } else if (task.dueDateMode === 'afterStart' && deliverableStartDate) {
      const { addBusinessDays, addDays } = require('../utils/milestoneUtils');
      const addFunc = task.dueDateOffsetType === 'business' ? addBusinessDays : addDays;
      task.calculatedDueDate = addFunc(new Date(deliverableStartDate), task.dueDateOffset);
    } else if (task.dueDateMode === 'beforeEnd' && deliverableEndDate) {
      const { addBusinessDays, addDays } = require('../utils/milestoneUtils');
      const addFunc = task.dueDateOffsetType === 'business' ? addBusinessDays : addDays;
      task.calculatedDueDate = addFunc(new Date(deliverableEndDate), -task.dueDateOffset);
    }

    await task.save();

    // Return the full project structure with calculated dates
    const milestones = await Milestone.find({ projectId: req.params.id }).sort({ order: 1 });
    
    // Recalculate milestone dates
    const milestonesWithCalculatedDates = recalculateMilestoneDates(
      milestones.map(m => m.toObject()),
      project.startDate
    );
    
    const deliverables = await Deliverable.find({ milestoneId: { $in: milestones.map(m => m._id) } }).sort({ order: 1 });
    const deliverableIds = deliverables.map(d => d._id);
    const tasks = await Task.find({ deliverableId: { $in: deliverableIds } }).sort({ order: 1 });

    const milestonesWithData = milestonesWithCalculatedDates.map(m => {
      const milestoneDeliverables = deliverables
        .filter(d => d.milestoneId.toString() === m._id.toString())
        .map(d => {
          // Calculate deliverable dates
          const deliverableWithDates = recalculateDeliverableDates(d.toObject(), m.calculatedStartDate);
          
          // Calculate task dates
          const deliverableTasks = tasks
            .filter(t => t.deliverableId.toString() === d._id.toString())
            .map(task => {
              const taskStartDate = deliverableWithDates.calculatedStartDate || deliverableWithDates.startDate;
              return recalculateTaskDates(task.toObject(), taskStartDate);
            });
          
          return { ...deliverableWithDates, tasks: deliverableTasks };
        });
      return { ...m, deliverables: milestoneDeliverables };
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
