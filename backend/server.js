import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

console.log('🔄 Connecting to MongoDB Atlas...');

mongoose.connect('mongodb+srv://hak3do_db_user:OXg8AA2vON5nJmSp@cluster0.sfqwsng.mongodb.net/projectmanager?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(5000, () => console.log('Server running on port 5000'));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

const projectSchema = new mongoose.Schema({
  name: String,
  tasks: [{ title: String, completed: Boolean }],
});

const Project = mongoose.model('Project', projectSchema);

// Routes
app.get('/projects', async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

app.post('/projects', async (req, res) => {
  const newProject = new Project(req.body);
  await newProject.save();
  res.json(newProject);
});