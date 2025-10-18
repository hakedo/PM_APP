import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

console.log('🔄 Connecting to MongoDB Atlas...');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(process.env.PORT || 5050, () =>
      console.log(`Server running on port ${process.env.PORT || 5050}`)
    );
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: false }
  },
  { 
    timestamps: true,
    collection: 'projects' // Explicitly set collection name
  }
);

const Project = mongoose.model('Project', projectSchema);

// Unified Template Schema for all reusable project templates
const templateSchema = new mongoose.Schema(
  {
    // Template name (e.g., "Website Development Template")
    name: { type: String, required: true, trim: true },
    
    // Optional description for the template
    description: { type: String, trim: true, default: '' },
    
    // Legacy type field for backward compatibility with old templates
    type: { 
      type: String, 
      enum: ['projectStatus', 'taskStatus', 'phase', 'deliverable']
    },
    
    // Project statuses for this template
    projectStatuses: [
      {
        name: { type: String, required: true },
        color: { type: String, required: true },
        icon: { type: String, required: true },
        order: { type: Number, required: true }
      }
    ],
    
    // Task statuses for this template
    taskStatuses: [
      {
        name: { type: String, required: true },
        color: { type: String, required: true },
        icon: { type: String, required: true },
        order: { type: Number, required: true }
      }
    ],
    
    // For statuses (legacy support for old structure)
    statuses: [
      {
        name: { type: String, required: true },
        color: { type: String, required: true },
        icon: { type: String, required: true },
        order: { type: Number, required: true }
      }
    ],
    
    // For phases
    phases: [
      {
        name: { type: String, required: true },
        color: { type: String, required: true },
        icon: { type: String, required: true },
        order: { type: Number, required: true }
      }
    ],
    
    // For deliverables
    deliverables: [
      {
        name: { type: String, required: true },
        order: { type: Number, required: true },
        defaultTasks: [
          {
            name: { type: String, required: true },
            order: { type: Number, required: true }
          }
        ]
      }
    ]
  },
  { 
    timestamps: true,
    collection: 'templates'
  }
);

const Template = mongoose.model('Template', templateSchema);

app.get('/', (_req, res) => {
  res.send('✅ API up. Try GET /projects');
});

// Routes
app.get('/projects', async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

app.post('/projects', async (req, res) => {
  try {
    console.log('📩 Received POST /projects:', req.body);
    const newProject = new Project(req.body);
    const saved = await newProject.save();
    res.json(saved);
  } catch (err) {
    console.error('❌ Error saving project:', err);
    res.status(500).json({ error: 'Failed to save project' });
  }
});

// Get single project by ID
app.get('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    console.error('❌ Error fetching project:', err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Update project by ID
app.put('/projects/:id', async (req, res) => {
  try {
    console.log('📩 Received PUT /projects/:id:', req.body);
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(updatedProject);
  } catch (err) {
    console.error('❌ Error updating project:', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Template Routes

// Get all templates (project and task statuses)
app.get('/templates', async (req, res) => {
  try {
    const templates = await Template.find();
    res.json(templates);
  } catch (err) {
    console.error('❌ Error fetching templates:', err);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get template by type (projectStatus, taskStatus, phase, deliverable)
app.get('/templates/:type', async (req, res) => {
  try {
    const template = await Template.findOne({ type: req.params.type });
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (err) {
    console.error('❌ Error fetching template:', err);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Create or update template statuses
app.post('/templates', async (req, res) => {
  try {
    console.log('📩 Received POST /templates:', req.body);
    const { name, description, type, statuses } = req.body;
    
    // If creating a new named template
    if (name) {
      const template = new Template({ 
        name,
        description: description || '',
        projectStatuses: [],
        taskStatuses: [],
        phases: [],
        deliverables: []
      });
      await template.save();
      return res.json(template);
    }
    
    // Legacy: Find existing template or create new one (for old structure)
    let template = await Template.findOne({ type });
    
    if (template) {
      template.statuses = statuses;
      await template.save();
    } else {
      template = new Template({ type, statuses });
      await template.save();
    }
    
    res.json(template);
  } catch (err) {
    console.error('❌ Error saving template:', err);
    res.status(500).json({ error: 'Failed to save template' });
  }
});

// Get template by ID (for individual template details)
app.get('/templates/:id', async (req, res) => {
  try {
    // Check if it's an ObjectId or a type string
    if (mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24) {
      const template = await Template.findById(req.params.id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      return res.json(template);
    }
    
    // Otherwise treat it as a type (legacy support)
    const template = await Template.findOne({ type: req.params.id });
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (err) {
    console.error('❌ Error fetching template:', err);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Update template (edit name and description)
app.patch('/templates/:id', async (req, res) => {
  try {
    console.log('📩 Updating template:', req.params.id, req.body);
    const { name, description } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Template name is required' });
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
      return res.status(404).json({ error: 'Template not found' });
    }
    
    console.log('✅ Template updated:', template);
    res.json(template);
  } catch (err) {
    console.error('❌ Error updating template:', err);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete template
app.delete('/templates/:id', async (req, res) => {
  try {
    console.log('📩 Deleting template:', req.params.id);
    
    const template = await Template.findByIdAndDelete(req.params.id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    console.log('✅ Template deleted:', template.name);
    res.json({ message: 'Template deleted successfully', template });
  } catch (err) {
    console.error('❌ Error deleting template:', err);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Add a single status to a template (supports both ID-based and type-based)
app.post('/templates/:idOrType/statuses', async (req, res) => {
  try {
    console.log('📩 Adding status to template:', req.params.idOrType, req.body);
    const { idOrType } = req.params;
    const newStatus = req.body;
    
    let template;
    
    // Check if it's an ObjectId (individual template) or type string (legacy)
    if (mongoose.Types.ObjectId.isValid(idOrType) && idOrType.length === 24) {
      template = await Template.findById(idOrType);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      // For individual templates, we don't use the statuses array
      return res.status(400).json({ error: 'Use specific endpoint for individual templates' });
    } else {
      // Legacy type-based template
      template = await Template.findOne({ type: idOrType });
      
      if (!template) {
        // Create new template if it doesn't exist
        template = new Template({
          type: idOrType,
          statuses: [{ ...newStatus, order: 0 }]
        });
      } else {
        // Add status with the next order number
        const maxOrder = template.statuses.reduce((max, s) => Math.max(max, s.order), -1);
        template.statuses.push({ ...newStatus, order: maxOrder + 1 });
      }
    }
    
    await template.save();
    res.json(template);
  } catch (err) {
    console.error('❌ Error adding status:', err);
    res.status(500).json({ error: 'Failed to add status' });
  }
});

// Add project status to individual template
app.post('/templates/:id/projectStatus/statuses', async (req, res) => {
  try {
    console.log('📩 Adding project status to template:', req.params.id, req.body);
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Initialize array if it doesn't exist
    if (!template.projectStatuses) {
      template.projectStatuses = [];
    }
    
    const maxOrder = template.projectStatuses.length > 0 
      ? template.projectStatuses.reduce((max, s) => Math.max(max, s.order), -1)
      : -1;
    template.projectStatuses.push({ ...req.body, order: maxOrder + 1 });
    await template.save();
    console.log('✅ Project status added successfully');
    res.json(template);
  } catch (err) {
    console.error('❌ Error adding project status:', err);
    res.status(500).json({ error: 'Failed to add project status' });
  }
});

// Add task status to individual template
app.post('/templates/:id/taskStatus/statuses', async (req, res) => {
  try {
    console.log('📩 Adding task status to template:', req.params.id, req.body);
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Initialize array if it doesn't exist
    if (!template.taskStatuses) {
      template.taskStatuses = [];
    }
    
    const maxOrder = template.taskStatuses.length > 0
      ? template.taskStatuses.reduce((max, s) => Math.max(max, s.order), -1)
      : -1;
    template.taskStatuses.push({ ...req.body, order: maxOrder + 1 });
    await template.save();
    console.log('✅ Task status added successfully');
    res.json(template);
  } catch (err) {
    console.error('❌ Error adding task status:', err);
    res.status(500).json({ error: 'Failed to add task status' });
  }
});

// Delete a status from a template
app.delete('/templates/:idOrType/statuses/:statusId', async (req, res) => {
  try {
    const { idOrType, statusId } = req.params;
    
    let template;
    
    // Check if it's an ObjectId or type string
    if (mongoose.Types.ObjectId.isValid(idOrType) && idOrType.length === 24) {
      return res.status(400).json({ error: 'Use specific endpoint for individual templates' });
    } else {
      template = await Template.findOne({ type: idOrType });
    }
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    template.statuses = template.statuses.filter(s => s._id.toString() !== statusId);
    await template.save();
    
    res.json(template);
  } catch (err) {
    console.error('❌ Error deleting status:', err);
    res.status(500).json({ error: 'Failed to delete status' });
  }
});

// Delete project status from individual template
app.delete('/templates/:id/projectStatus/statuses/:statusId', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    template.projectStatuses = template.projectStatuses.filter(s => s._id.toString() !== req.params.statusId);
    await template.save();
    res.json(template);
  } catch (err) {
    console.error('❌ Error deleting project status:', err);
    res.status(500).json({ error: 'Failed to delete project status' });
  }
});

// Delete task status from individual template
app.delete('/templates/:id/taskStatus/statuses/:statusId', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    template.taskStatuses = template.taskStatuses.filter(s => s._id.toString() !== req.params.statusId);
    await template.save();
    res.json(template);
  } catch (err) {
    console.error('❌ Error deleting task status:', err);
    res.status(500).json({ error: 'Failed to delete task status' });
  }
});

// Phase Template Routes

// Add a phase (legacy support)
app.post('/templates/phase/items', async (req, res) => {
  try {
    console.log('📩 Adding phase:', req.body);
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
  } catch (err) {
    console.error('❌ Error adding phase:', err);
    res.status(500).json({ error: 'Failed to add phase' });
  }
});

// Add a phase to individual template
app.post('/templates/:id/phase/items', async (req, res) => {
  try {
    console.log('📩 Adding phase to template:', req.params.id, req.body);
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Initialize array if it doesn't exist
    if (!template.phases) {
      template.phases = [];
    }
    
    const maxOrder = template.phases.length > 0
      ? template.phases.reduce((max, p) => Math.max(max, p.order), -1)
      : -1;
    template.phases.push({ ...req.body, order: maxOrder + 1 });
    await template.save();
    console.log('✅ Phase added successfully');
    res.json(template);
  } catch (err) {
    console.error('❌ Error adding phase:', err);
    res.status(500).json({ error: 'Failed to add phase' });
  }
});

// Delete a phase (legacy)
app.delete('/templates/phase/items/:phaseId', async (req, res) => {
  try {
    const template = await Template.findOne({ type: 'phase' });
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    template.phases = template.phases.filter(p => p._id.toString() !== req.params.phaseId);
    await template.save();
    
    res.json(template);
  } catch (err) {
    console.error('❌ Error deleting phase:', err);
    res.status(500).json({ error: 'Failed to delete phase' });
  }
});

// Delete a phase from individual template
app.delete('/templates/:id/phase/items/:phaseId', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    template.phases = template.phases.filter(p => p._id.toString() !== req.params.phaseId);
    await template.save();
    res.json(template);
  } catch (err) {
    console.error('❌ Error deleting phase:', err);
    res.status(500).json({ error: 'Failed to delete phase' });
  }
});

// Deliverable Template Routes

// Add a deliverable (legacy)
app.post('/templates/deliverable/items', async (req, res) => {
  try {
    console.log('📩 Adding deliverable:', req.body);
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
  } catch (err) {
    console.error('❌ Error adding deliverable:', err);
    res.status(500).json({ error: 'Failed to add deliverable' });
  }
});

// Add a deliverable to individual template
app.post('/templates/:id/deliverable/items', async (req, res) => {
  try {
    console.log('📩 Adding deliverable to template:', req.params.id, req.body);
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Initialize array if it doesn't exist
    if (!template.deliverables) {
      template.deliverables = [];
    }
    
    const maxOrder = template.deliverables.length > 0
      ? template.deliverables.reduce((max, d) => Math.max(max, d.order), -1)
      : -1;
    template.deliverables.push({ ...req.body, order: maxOrder + 1, defaultTasks: [] });
    await template.save();
    console.log('✅ Deliverable added successfully');
    res.json(template);
  } catch (err) {
    console.error('❌ Error adding deliverable:', err);
    res.status(500).json({ error: 'Failed to add deliverable' });
  }
});

// Delete a deliverable (legacy)
app.delete('/templates/deliverable/items/:deliverableId', async (req, res) => {
  try {
    const template = await Template.findOne({ type: 'deliverable' });
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    template.deliverables = template.deliverables.filter(
      d => d._id.toString() !== req.params.deliverableId
    );
    await template.save();
    
    res.json(template);
  } catch (err) {
    console.error('❌ Error deleting deliverable:', err);
    res.status(500).json({ error: 'Failed to delete deliverable' });
  }
});

// Delete a deliverable from individual template
app.delete('/templates/:id/deliverable/items/:deliverableId', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    template.deliverables = template.deliverables.filter(
      d => d._id.toString() !== req.params.deliverableId
    );
    await template.save();
    res.json(template);
  } catch (err) {
    console.error('❌ Error deleting deliverable:', err);
    res.status(500).json({ error: 'Failed to delete deliverable' });
  }
});

// Add a task to a deliverable (legacy)
app.post('/templates/deliverable/items/:deliverableId/tasks', async (req, res) => {
  try {
    const template = await Template.findOne({ type: 'deliverable' });
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const deliverable = template.deliverables.id(req.params.deliverableId);
    if (!deliverable) {
      return res.status(404).json({ error: 'Deliverable not found' });
    }
    
    const maxOrder = deliverable.defaultTasks.reduce((max, t) => Math.max(max, t.order), -1);
    deliverable.defaultTasks.push({
      ...req.body,
      order: maxOrder + 1
    });
    
    await template.save();
    res.json(template);
  } catch (err) {
    console.error('❌ Error adding task:', err);
    res.status(500).json({ error: 'Failed to add task' });
  }
});

// Add a task to a deliverable in individual template
app.post('/templates/:id/deliverable/items/:deliverableId/tasks', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const deliverable = template.deliverables.id(req.params.deliverableId);
    if (!deliverable) {
      return res.status(404).json({ error: 'Deliverable not found' });
    }
    
    const maxOrder = deliverable.defaultTasks.reduce((max, t) => Math.max(max, t.order), -1);
    deliverable.defaultTasks.push({
      ...req.body,
      order: maxOrder + 1
    });
    
    await template.save();
    res.json(template);
  } catch (err) {
    console.error('❌ Error adding task:', err);
    res.status(500).json({ error: 'Failed to add task' });
  }
});

// Delete a task from a deliverable (legacy)
app.delete('/templates/deliverable/items/:deliverableId/tasks/:taskId', async (req, res) => {
  try {
    const template = await Template.findOne({ type: 'deliverable' });
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const deliverable = template.deliverables.id(req.params.deliverableId);
    if (!deliverable) {
      return res.status(404).json({ error: 'Deliverable not found' });
    }
    
    deliverable.defaultTasks = deliverable.defaultTasks.filter(
      t => t._id.toString() !== req.params.taskId
    );
    
    await template.save();
    res.json(template);
  } catch (err) {
    console.error('❌ Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Delete a task from a deliverable in individual template
app.delete('/templates/:id/deliverable/items/:deliverableId/tasks/:taskId', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const deliverable = template.deliverables.id(req.params.deliverableId);
    if (!deliverable) {
      return res.status(404).json({ error: 'Deliverable not found' });
    }
    
    deliverable.defaultTasks = deliverable.defaultTasks.filter(
      t => t._id.toString() !== req.params.taskId
    );
    
    await template.save();
    res.json(template);
  } catch (err) {
    console.error('❌ Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

