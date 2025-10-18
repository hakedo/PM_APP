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
    type: { 
      type: String, 
      required: true, 
      enum: ['projectStatus', 'taskStatus', 'phase', 'deliverable']
    },
    // For statuses (projectStatus, taskStatus)
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
    const { type, statuses } = req.body;
    
    // Find existing template or create new one
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

// Add a single status to a template
app.post('/templates/:type/statuses', async (req, res) => {
  try {
    console.log('📩 Adding status to template:', req.params.type, req.body);
    const { type } = req.params;
    const newStatus = req.body;
    
    let template = await Template.findOne({ type });
    
    if (!template) {
      // Create new template if it doesn't exist
      template = new Template({
        type,
        statuses: [{ ...newStatus, order: 0 }]
      });
    } else {
      // Add status with the next order number
      const maxOrder = template.statuses.reduce((max, s) => Math.max(max, s.order), -1);
      template.statuses.push({ ...newStatus, order: maxOrder + 1 });
    }
    
    await template.save();
    res.json(template);
  } catch (err) {
    console.error('❌ Error adding status:', err);
    res.status(500).json({ error: 'Failed to add status' });
  }
});

// Delete a status from a template
app.delete('/templates/:type/statuses/:statusId', async (req, res) => {
  try {
    const { type, statusId } = req.params;
    
    const template = await Template.findOne({ type });
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

// Phase Template Routes

// Add a phase
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

// Delete a phase
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

// Deliverable Template Routes

// Add a deliverable
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

// Delete a deliverable
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

// Add a task to a deliverable
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

// Delete a task from a deliverable
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

