import express from 'express';
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

// Get template by ID
router.get('/:id', async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ 
        error: 'Template not found',
        message: `No template found with id: ${req.params.id}`
      });
    }

    res.json(template);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid template ID',
        message: 'The provided template ID is not valid'
      });
    }
    next(error);
  }
});

// Create new template
router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const template = new Template({
      name,
      description: description || ''
    });

    const savedTemplate = await template.save();
    res.status(201).json(savedTemplate);
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

// Update template
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
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid template ID',
        message: 'The provided template ID is not valid'
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
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid template ID',
        message: 'The provided template ID is not valid'
      });
    }
    next(error);
  }
});

export default router;
