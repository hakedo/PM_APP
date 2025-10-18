import express from 'express';
import mongoose from 'mongoose';
import { Template } from '../models/index.js';

const router = express.Router();

// Get all templates
router.get('/', async (req, res, next) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (error) {
    next(error);
  }
});

// Get template by ID or type
router.get('/:idOrType', async (req, res, next) => {
  try {
    const { idOrType } = req.params;
    let template;

    // Check if it's an ObjectId or a type string
    if (mongoose.Types.ObjectId.isValid(idOrType) && idOrType.length === 24) {
      template = await Template.findById(idOrType);
    } else {
      // Legacy: treat it as a type
      template = await Template.findOne({ type: idOrType });
    }

    if (!template) {
      return res.status(404).json({ 
        error: 'Template not found',
        message: `No template found with identifier: ${idOrType}`
      });
    }

    res.json(template);
  } catch (error) {
    next(error);
  }
});

// Create new template
router.post('/', async (req, res, next) => {
  try {
    const { name, description, type, statuses } = req.body;

    // Create new named template
    if (name) {
      const template = new Template({
        name,
        description: description || '',
        projectStatuses: [],
        taskStatuses: [],
        phases: [],
        deliverables: []
      });
      const savedTemplate = await template.save();
      return res.status(201).json(savedTemplate);
    }

    // Legacy: Find existing template or create new one
    let template = await Template.findOne({ type });

    if (template) {
      template.statuses = statuses;
      await template.save();
    } else {
      template = new Template({ type, statuses });
      await template.save();
    }

    res.json(template);
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

// Update template (name and description)
router.patch('/:id', async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ 
        error: 'Template name is required',
        message: 'Please provide a valid template name'
      });
    }

    const updateData = { name: name.trim() };
    if (description !== undefined) {
      updateData.description = description.trim();
    }

    const template = await Template.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({ 
        error: 'Template not found',
        message: `No template found with id: ${req.params.id}`
      });
    }

    res.json(template);
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

// Delete template
router.delete('/:id', async (req, res, next) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);

    if (!template) {
      return res.status(404).json({ 
        error: 'Template not found',
        message: `No template found with id: ${req.params.id}`
      });
    }

    res.json({ 
      message: 'Template deleted successfully',
      template
    });
  } catch (error) {
    next(error);
  }
});

// Add project status to template
router.post('/:id/projectStatus/statuses', async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ 
        error: 'Template not found',
        message: `No template found with id: ${req.params.id}`
      });
    }

    if (!template.projectStatuses) {
      template.projectStatuses = [];
    }

    const maxOrder = template.projectStatuses.length > 0
      ? template.projectStatuses.reduce((max, s) => Math.max(max, s.order), -1)
      : -1;

    template.projectStatuses.push({ ...req.body, order: maxOrder + 1 });
    await template.save();

    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
});

// Add task status to template
router.post('/:id/taskStatus/statuses', async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ 
        error: 'Template not found',
        message: `No template found with id: ${req.params.id}`
      });
    }

    if (!template.taskStatuses) {
      template.taskStatuses = [];
    }

    const maxOrder = template.taskStatuses.length > 0
      ? template.taskStatuses.reduce((max, s) => Math.max(max, s.order), -1)
      : -1;

    template.taskStatuses.push({ ...req.body, order: maxOrder + 1 });
    await template.save();

    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
});

// Delete project status from template
router.delete('/:id/projectStatus/statuses/:statusId', async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ 
        error: 'Template not found',
        message: `No template found with id: ${req.params.id}`
      });
    }

    template.projectStatuses = template.projectStatuses.filter(
      s => s._id.toString() !== req.params.statusId
    );
    await template.save();

    res.json(template);
  } catch (error) {
    next(error);
  }
});

// Delete task status from template
router.delete('/:id/taskStatus/statuses/:statusId', async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ 
        error: 'Template not found',
        message: `No template found with id: ${req.params.id}`
      });
    }

    template.taskStatuses = template.taskStatuses.filter(
      s => s._id.toString() !== req.params.statusId
    );
    await template.save();

    res.json(template);
  } catch (error) {
    next(error);
  }
});

// Add phase to template
router.post('/:id/phase/items', async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ 
        error: 'Template not found',
        message: `No template found with id: ${req.params.id}`
      });
    }

    if (!template.phases) {
      template.phases = [];
    }

    const maxOrder = template.phases.length > 0
      ? template.phases.reduce((max, p) => Math.max(max, p.order), -1)
      : -1;

    template.phases.push({ ...req.body, order: maxOrder + 1 });
    await template.save();

    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
});

// Delete phase from template
router.delete('/:id/phase/items/:phaseId', async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ 
        error: 'Template not found',
        message: `No template found with id: ${req.params.id}`
      });
    }

    template.phases = template.phases.filter(
      p => p._id.toString() !== req.params.phaseId
    );
    await template.save();

    res.json(template);
  } catch (error) {
    next(error);
  }
});

// Add deliverable to template
router.post('/:id/deliverable/items', async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ 
        error: 'Template not found',
        message: `No template found with id: ${req.params.id}`
      });
    }

    if (!template.deliverables) {
      template.deliverables = [];
    }

    const maxOrder = template.deliverables.length > 0
      ? template.deliverables.reduce((max, d) => Math.max(max, d.order), -1)
      : -1;

    template.deliverables.push({ 
      ...req.body, 
      order: maxOrder + 1, 
      defaultTasks: req.body.defaultTasks || []
    });
    await template.save();

    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
});

// Delete deliverable from template
router.delete('/:id/deliverable/items/:deliverableId', async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ 
        error: 'Template not found',
        message: `No template found with id: ${req.params.id}`
      });
    }

    template.deliverables = template.deliverables.filter(
      d => d._id.toString() !== req.params.deliverableId
    );
    await template.save();

    res.json(template);
  } catch (error) {
    next(error);
  }
});

// Add task to deliverable
router.post('/:id/deliverable/items/:deliverableId/tasks', async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ 
        error: 'Template not found',
        message: `No template found with id: ${req.params.id}`
      });
    }

    const deliverable = template.deliverables.id(req.params.deliverableId);
    
    if (!deliverable) {
      return res.status(404).json({ 
        error: 'Deliverable not found',
        message: `No deliverable found with id: ${req.params.deliverableId}`
      });
    }

    const maxOrder = deliverable.defaultTasks.reduce(
      (max, t) => Math.max(max, t.order), -1
    );
    
    deliverable.defaultTasks.push({
      ...req.body,
      order: maxOrder + 1
    });

    await template.save();
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
});

// Delete task from deliverable
router.delete('/:id/deliverable/items/:deliverableId/tasks/:taskId', async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ 
        error: 'Template not found',
        message: `No template found with id: ${req.params.id}`
      });
    }

    const deliverable = template.deliverables.id(req.params.deliverableId);
    
    if (!deliverable) {
      return res.status(404).json({ 
        error: 'Deliverable not found',
        message: `No deliverable found with id: ${req.params.deliverableId}`
      });
    }

    deliverable.defaultTasks = deliverable.defaultTasks.filter(
      t => t._id.toString() !== req.params.taskId
    );

    await template.save();
    res.json(template);
  } catch (error) {
    next(error);
  }
});

// Legacy route handlers for backward compatibility
router.post('/:idOrType/statuses', async (req, res, next) => {
  try {
    const { idOrType } = req.params;
    const newStatus = req.body;

    // Check if it's an ObjectId (individual template) or type string (legacy)
    if (mongoose.Types.ObjectId.isValid(idOrType) && idOrType.length === 24) {
      return res.status(400).json({ 
        error: 'Use specific endpoint for individual templates',
        message: 'Please use /projectStatus/statuses or /taskStatus/statuses endpoints'
      });
    }

    // Legacy type-based template
    let template = await Template.findOne({ type: idOrType });

    if (!template) {
      template = new Template({
        type: idOrType,
        statuses: [{ ...newStatus, order: 0 }]
      });
    } else {
      const maxOrder = template.statuses.reduce((max, s) => Math.max(max, s.order), -1);
      template.statuses.push({ ...newStatus, order: maxOrder + 1 });
    }

    await template.save();
    res.json(template);
  } catch (error) {
    next(error);
  }
});

router.delete('/:idOrType/statuses/:statusId', async (req, res, next) => {
  try {
    const { idOrType, statusId } = req.params;

    if (mongoose.Types.ObjectId.isValid(idOrType) && idOrType.length === 24) {
      return res.status(400).json({ 
        error: 'Use specific endpoint for individual templates',
        message: 'Please use /projectStatus/statuses or /taskStatus/statuses endpoints'
      });
    }

    const template = await Template.findOne({ type: idOrType });

    if (!template) {
      return res.status(404).json({ 
        error: 'Template not found',
        message: `No template found with type: ${idOrType}`
      });
    }

    template.statuses = template.statuses.filter(
      s => s._id.toString() !== statusId
    );
    await template.save();

    res.json(template);
  } catch (error) {
    next(error);
  }
});

router.post('/phase/items', async (req, res, next) => {
  try {
    const newPhase = req.body;
    let template = await Template.findOne({ type: 'phase' });

    if (!template) {
      template = new Template({
        type: 'phase',
        phases: [{ ...newPhase, order: 0 }]
      });
    } else {
      const maxOrder = template.phases.reduce((max, p) => Math.max(max, p.order), -1);
      template.phases.push({ ...newPhase, order: maxOrder + 1 });
    }

    await template.save();
    res.json(template);
  } catch (error) {
    next(error);
  }
});

router.delete('/phase/items/:phaseId', async (req, res, next) => {
  try {
    const template = await Template.findOne({ type: 'phase' });
    
    if (!template) {
      return res.status(404).json({ 
        error: 'Template not found',
        message: 'Phase template not found'
      });
    }

    template.phases = template.phases.filter(
      p => p._id.toString() !== req.params.phaseId
    );
    await template.save();

    res.json(template);
  } catch (error) {
    next(error);
  }
});

router.post('/deliverable/items', async (req, res, next) => {
  try {
    const newDeliverable = req.body;
    let template = await Template.findOne({ type: 'deliverable' });

    if (!template) {
      template = new Template({
        type: 'deliverable',
        deliverables: [{ ...newDeliverable, order: 0, defaultTasks: [] }]
      });
    } else {
      const maxOrder = template.deliverables.reduce((max, d) => Math.max(max, d.order), -1);
      template.deliverables.push({ ...newDeliverable, order: maxOrder + 1, defaultTasks: [] });
    }

    await template.save();
    res.json(template);
  } catch (error) {
    next(error);
  }
});

router.delete('/deliverable/items/:deliverableId', async (req, res, next) => {
  try {
    const template = await Template.findOne({ type: 'deliverable' });
    
    if (!template) {
      return res.status(404).json({ 
        error: 'Template not found',
        message: 'Deliverable template not found'
      });
    }

    template.deliverables = template.deliverables.filter(
      d => d._id.toString() !== req.params.deliverableId
    );
    await template.save();

    res.json(template);
  } catch (error) {
    next(error);
  }
});

router.post('/deliverable/items/:deliverableId/tasks', async (req, res, next) => {
  try {
    const template = await Template.findOne({ type: 'deliverable' });
    
    if (!template) {
      return res.status(404).json({ 
        error: 'Template not found',
        message: 'Deliverable template not found'
      });
    }

    const deliverable = template.deliverables.id(req.params.deliverableId);
    
    if (!deliverable) {
      return res.status(404).json({ 
        error: 'Deliverable not found',
        message: `No deliverable found with id: ${req.params.deliverableId}`
      });
    }

    const maxOrder = deliverable.defaultTasks.reduce((max, t) => Math.max(max, t.order), -1);
    deliverable.defaultTasks.push({
      ...req.body,
      order: maxOrder + 1
    });

    await template.save();
    res.json(template);
  } catch (error) {
    next(error);
  }
});

router.delete('/deliverable/items/:deliverableId/tasks/:taskId', async (req, res, next) => {
  try {
    const template = await Template.findOne({ type: 'deliverable' });
    
    if (!template) {
      return res.status(404).json({ 
        error: 'Template not found',
        message: 'Deliverable template not found'
      });
    }

    const deliverable = template.deliverables.id(req.params.deliverableId);
    
    if (!deliverable) {
      return res.status(404).json({ 
        error: 'Deliverable not found',
        message: `No deliverable found with id: ${req.params.deliverableId}`
      });
    }

    deliverable.defaultTasks = deliverable.defaultTasks.filter(
      t => t._id.toString() !== req.params.taskId
    );

    await template.save();
    res.json(template);
  } catch (error) {
    next(error);
  }
});

export default router;
