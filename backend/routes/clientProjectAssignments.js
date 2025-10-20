import express from 'express';
import { ClientProjectAssignment, Client, Project } from '../models/index.js';

const router = express.Router();

// Get all clients assigned to a specific project
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const assignments = await ClientProjectAssignment.find({ projectId })
      .populate('clientId')
      .sort({ assignedAt: -1 });

    const clients = assignments.map(assignment => ({
      ...assignment.clientId.toObject(),
      assignmentId: assignment._id,
      role: assignment.role,
      assignedAt: assignment.assignedAt
    }));

    res.json(clients);
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

// Get all projects assigned to a specific client
router.get('/client/:clientId', async (req, res, next) => {
  try {
    const { clientId } = req.params;

    const assignments = await ClientProjectAssignment.find({ clientId })
      .populate('projectId')
      .sort({ assignedAt: -1 });

    const projects = assignments.map(assignment => ({
      ...assignment.projectId.toObject(),
      assignmentId: assignment._id,
      role: assignment.role,
      assignedAt: assignment.assignedAt
    }));

    res.json(projects);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid client ID',
        message: 'The provided client ID is not valid'
      });
    }
    next(error);
  }
});

// Assign a client to a project
router.post('/', async (req, res, next) => {
  try {
    const { clientId, projectId, role } = req.body;

    // Validate that client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        error: 'Client not found',
        message: 'The specified client does not exist'
      });
    }

    // Validate that project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'The specified project does not exist'
      });
    }

    // Check if assignment already exists
    const existingAssignment = await ClientProjectAssignment.findOne({
      clientId,
      projectId
    });

    if (existingAssignment) {
      return res.status(409).json({
        error: 'Assignment already exists',
        message: 'This client is already assigned to the project'
      });
    }

    // Create the assignment
    const assignment = await ClientProjectAssignment.create({
      clientId,
      projectId,
      role: role || 'primary'
    });

    // Populate and return
    const populatedAssignment = await ClientProjectAssignment.findById(assignment._id)
      .populate('clientId')
      .populate('projectId');

    res.status(201).json(populatedAssignment);
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

// Remove a client from a project
router.delete('/:assignmentId', async (req, res, next) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await ClientProjectAssignment.findByIdAndDelete(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        error: 'Assignment not found',
        message: 'The specified assignment does not exist'
      });
    }

    res.json({ 
      message: 'Assignment removed successfully',
      assignment
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid assignment ID',
        message: 'The provided assignment ID is not valid'
      });
    }
    next(error);
  }
});

// Remove assignment by clientId and projectId
router.delete('/project/:projectId/client/:clientId', async (req, res, next) => {
  try {
    const { projectId, clientId } = req.params;

    const assignment = await ClientProjectAssignment.findOneAndDelete({
      projectId,
      clientId
    });

    if (!assignment) {
      return res.status(404).json({
        error: 'Assignment not found',
        message: 'No assignment exists between this client and project'
      });
    }

    res.json({ 
      message: 'Assignment removed successfully',
      assignment
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'The provided project ID or client ID is not valid'
      });
    }
    next(error);
  }
});

export default router;
