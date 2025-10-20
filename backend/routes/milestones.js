import express from 'express';
import { Milestone, Project, Deliverable, DeliverableTask } from '../models/index.js';
import { calculateCriticalPath, detectCircularDependencies } from '../utils/cpm.js';

const router = express.Router();

// Get all milestones for a project
router.get('/:projectId/milestones', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: `No project found with id: ${projectId}`
      });
    }

    // Get all milestones for the project
    const milestones = await Milestone.find({ projectId })
      .populate('dependencies', 'name')
      .sort({ order: 1, earliestStart: 1 });

    // Calculate critical path
    const milestonesWithCPM = calculateCriticalPath(
      milestones.map(m => m.toObject()),
      project.startDate
    );

    res.json(milestonesWithCPM);
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

// Get a single milestone
router.get('/:projectId/milestones/:milestoneId', async (req, res, next) => {
  try {
    const { projectId, milestoneId } = req.params;
    
    const milestone = await Milestone.findOne({
      _id: milestoneId,
      projectId
    }).populate('dependencies', 'name');

    if (!milestone) {
      return res.status(404).json({
        error: 'Milestone not found',
        message: `No milestone found with id: ${milestoneId}`
      });
    }

    res.json(milestone);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'The provided ID is not valid'
      });
    }
    next(error);
  }
});

// Create a new milestone
router.post('/:projectId/milestones', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: `No project found with id: ${projectId}`
      });
    }

    // Verify dependencies exist
    if (req.body.dependencies && req.body.dependencies.length > 0) {
      const depCount = await Milestone.countDocuments({
        _id: { $in: req.body.dependencies },
        projectId
      });
      
      if (depCount !== req.body.dependencies.length) {
        return res.status(400).json({
          error: 'Invalid dependencies',
          message: 'One or more dependency milestones not found in this project'
        });
      }

      // Check for circular dependencies
      const allMilestones = await Milestone.find({ projectId });
      const testMilestone = {
        _id: 'temp_' + Date.now(),
        ...req.body,
        projectId
      };
      
      if (detectCircularDependencies([...allMilestones.map(m => m.toObject()), testMilestone])) {
        return res.status(400).json({
          error: 'Circular dependency',
          message: 'The specified dependencies would create a circular dependency'
        });
      }
    }

    // Get the next order number
    const lastMilestone = await Milestone.findOne({ projectId })
      .sort({ order: -1 })
      .select('order');
    const nextOrder = lastMilestone ? lastMilestone.order + 1 : 0;

    const newMilestone = new Milestone({
      ...req.body,
      projectId,
      order: req.body.order !== undefined ? req.body.order : nextOrder
    });

    const savedMilestone = await newMilestone.save();
    
    // Recalculate critical path for all milestones
    const allMilestones = await Milestone.find({ projectId });
    const milestonesWithCPM = calculateCriticalPath(
      allMilestones.map(m => m.toObject()),
      project.startDate
    );

    // Update all milestones with CPM data
    await Promise.all(
      milestonesWithCPM.map(m =>
        Milestone.findByIdAndUpdate(m._id, {
          earliestStart: m.earliestStart,
          earliestFinish: m.earliestFinish,
          latestStart: m.latestStart,
          latestFinish: m.latestFinish,
          slack: m.slack,
          isCritical: m.isCritical
        })
      )
    );

    // Return the newly created milestone with CPM data
    const updatedMilestone = milestonesWithCPM.find(
      m => m._id.toString() === savedMilestone._id.toString()
    );

    res.status(201).json(updatedMilestone || savedMilestone);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.message,
        details: Object.values(error.errors).map(e => e.message)
      });
    }
    next(error);
  }
});

// Update a milestone
router.put('/:projectId/milestones/:milestoneId', async (req, res, next) => {
  try {
    const { projectId, milestoneId } = req.params;
    
    const milestone = await Milestone.findOne({
      _id: milestoneId,
      projectId
    });

    if (!milestone) {
      return res.status(404).json({
        error: 'Milestone not found',
        message: `No milestone found with id: ${milestoneId}`
      });
    }

    // Verify dependencies exist and check for circular dependencies
    if (req.body.dependencies && req.body.dependencies.length > 0) {
      const depCount = await Milestone.countDocuments({
        _id: { $in: req.body.dependencies },
        projectId
      });
      
      if (depCount !== req.body.dependencies.length) {
        return res.status(400).json({
          error: 'Invalid dependencies',
          message: 'One or more dependency milestones not found in this project'
        });
      }

      // Check for circular dependencies
      const allMilestones = await Milestone.find({ projectId });
      const testMilestones = allMilestones.map(m => {
        if (m._id.toString() === milestoneId) {
          return { ...m.toObject(), ...req.body };
        }
        return m.toObject();
      });
      
      if (detectCircularDependencies(testMilestones)) {
        return res.status(400).json({
          error: 'Circular dependency',
          message: 'The specified dependencies would create a circular dependency'
        });
      }
    }

    // Update milestone
    Object.assign(milestone, req.body);
    const updatedMilestone = await milestone.save();

    // Recalculate critical path for all milestones
    const project = await Project.findById(projectId);
    const allMilestones = await Milestone.find({ projectId });
    const milestonesWithCPM = calculateCriticalPath(
      allMilestones.map(m => m.toObject()),
      project.startDate
    );

    // Update all milestones with CPM data
    await Promise.all(
      milestonesWithCPM.map(m =>
        Milestone.findByIdAndUpdate(m._id, {
          earliestStart: m.earliestStart,
          earliestFinish: m.earliestFinish,
          latestStart: m.latestStart,
          latestFinish: m.latestFinish,
          slack: m.slack,
          isCritical: m.isCritical
        })
      )
    );

    // Return the updated milestone with CPM data
    const finalMilestone = milestonesWithCPM.find(
      m => m._id.toString() === milestoneId
    );

    res.json(finalMilestone || updatedMilestone);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.message,
        details: Object.values(error.errors).map(e => e.message)
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'The provided ID is not valid'
      });
    }
    next(error);
  }
});

// Delete a milestone
router.delete('/:projectId/milestones/:milestoneId', async (req, res, next) => {
  try {
    const { projectId, milestoneId } = req.params;
    const { reassignments } = req.body; // Optional: user-specified dependency reassignments
    
    const milestone = await Milestone.findOne({
      _id: milestoneId,
      projectId
    });

    if (!milestone) {
      return res.status(404).json({
        error: 'Milestone not found',
        message: `No milestone found with id: ${milestoneId}`
      });
    }

    // Check if other milestones depend on this one
    const dependents = await Milestone.find({
      projectId,
      dependencies: milestoneId
    });

    if (dependents.length > 0) {
      // If no reassignments provided, offer options
      if (!reassignments) {
        // Get the dependencies of the milestone being deleted
        const deletedMilestoneDeps = milestone.dependencies || [];
        
        // Determine if automatic reassignment is possible
        if (deletedMilestoneDeps.length === 1) {
          // Simple case: Only one dependency - automatically reassign to it
          // Fetch the dependency milestone to get its name
          const depMilestone = await Milestone.findById(deletedMilestoneDeps[0]);
          
          return res.status(409).json({
            error: 'Dependency conflict',
            message: 'Other milestones depend on this milestone.',
            canAutoReassign: true,
            suggestion: {
              type: 'automatic',
              description: `Reassign all dependents to "${depMilestone?.name || 'previous milestone'}"`,
              newDependency: deletedMilestoneDeps[0]
            },
            dependents: dependents.map(m => ({ 
              id: m._id, 
              name: m.name,
              currentDependencies: m.dependencies 
            })),
            milestoneDependencies: deletedMilestoneDeps
          });
        } else if (deletedMilestoneDeps.length > 1) {
          // Multiple dependencies - user must choose
          const depMilestones = await Milestone.find({
            _id: { $in: deletedMilestoneDeps },
            projectId
          });
          
          return res.status(409).json({
            error: 'Dependency conflict',
            message: 'Other milestones depend on this milestone.',
            canAutoReassign: false,
            requiresUserChoice: true,
            description: 'This milestone has multiple dependencies. Please choose which one to reassign dependents to.',
            options: depMilestones.map(m => ({
              id: m._id,
              name: m.name,
              description: m.description
            })),
            dependents: dependents.map(m => ({ 
              id: m._id, 
              name: m.name,
              currentDependencies: m.dependencies 
            })),
            milestoneDependencies: deletedMilestoneDeps
          });
        } else {
          // No dependencies - remove this milestone from dependents
          return res.status(409).json({
            error: 'Dependency conflict',
            message: 'Other milestones depend on this milestone.',
            canAutoReassign: true,
            suggestion: {
              type: 'remove',
              description: 'Remove this dependency from all dependent milestones (they will have no dependencies)'
            },
            dependents: dependents.map(m => ({ 
              id: m._id, 
              name: m.name,
              currentDependencies: m.dependencies 
            })),
            milestoneDependencies: []
          });
        }
      }

      // Process reassignments
      for (const dependent of dependents) {
        // Remove the deleted milestone from dependencies
        const newDependencies = dependent.dependencies.filter(
          dep => dep.toString() !== milestoneId
        );

        // Add reassigned dependencies
        if (reassignments && reassignments.newDependency) {
          // User specified a new dependency
          if (!newDependencies.includes(reassignments.newDependency)) {
            newDependencies.push(reassignments.newDependency);
          }
        } else if (milestone.dependencies && milestone.dependencies.length === 1) {
          // Automatic reassignment to the single dependency
          if (!newDependencies.includes(milestone.dependencies[0].toString())) {
            newDependencies.push(milestone.dependencies[0]);
          }
        }
        // If no dependencies, newDependencies will be empty (milestone becomes independent)

        // Update the dependent milestone
        await Milestone.findByIdAndUpdate(dependent._id, {
          dependencies: newDependencies
        });
      }
    }

    // CASCADE DELETE: Remove all deliverables and tasks for this milestone
    const deliverables = await Deliverable.find({ milestoneId });
    const deliverableIds = deliverables.map(d => d._id);
    
    // Delete all tasks for these deliverables
    if (deliverableIds.length > 0) {
      await DeliverableTask.deleteMany({ deliverableId: { $in: deliverableIds } });
    }
    
    // Delete all deliverables for this milestone
    await Deliverable.deleteMany({ milestoneId });

    // Delete the milestone
    await milestone.deleteOne();

    // Recalculate critical path for remaining milestones
    const project = await Project.findById(projectId);
    const allMilestones = await Milestone.find({ projectId });
    
    if (allMilestones.length > 0) {
      const milestonesWithCPM = calculateCriticalPath(
        allMilestones.map(m => m.toObject()),
        project.startDate
      );

      // Update all milestones with CPM data
      await Promise.all(
        milestonesWithCPM.map(m =>
          Milestone.findByIdAndUpdate(m._id, {
            earliestStart: m.earliestStart,
            earliestFinish: m.earliestFinish,
            latestStart: m.latestStart,
            latestFinish: m.latestFinish,
            slack: m.slack,
            isCritical: m.isCritical
          })
        )
      );
    }

    res.json({
      message: 'Milestone deleted successfully',
      milestone: milestone
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'The provided ID is not valid'
      });
    }
    next(error);
  }
});

// Recalculate critical path for a project
router.post('/:projectId/milestones/recalculate', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: `No project found with id: ${projectId}`
      });
    }

    const allMilestones = await Milestone.find({ projectId });
    const milestonesWithCPM = calculateCriticalPath(
      allMilestones.map(m => m.toObject()),
      project.startDate
    );

    // Update all milestones with CPM data
    await Promise.all(
      milestonesWithCPM.map(m =>
        Milestone.findByIdAndUpdate(m._id, {
          earliestStart: m.earliestStart,
          earliestFinish: m.earliestFinish,
          latestStart: m.latestStart,
          latestFinish: m.latestFinish,
          slack: m.slack,
          isCritical: m.isCritical
        })
      )
    );

    res.json({
      message: 'Critical path recalculated successfully',
      milestones: milestonesWithCPM
    });
  } catch (error) {
    next(error);
  }
});

export default router;
