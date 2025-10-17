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

