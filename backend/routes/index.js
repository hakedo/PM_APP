import express from 'express';
import projectRoutes from './projects.js';
import templateRoutes from './templates.js';
import clientRoutes from './clients.js';
import assignmentRoutes from './clientProjectAssignments.js';
import milestoneRoutes from './milestones.js';

const router = express.Router();

router.use('/projects', projectRoutes);
router.use('/projects', milestoneRoutes);
router.use('/templates', templateRoutes);
router.use('/clients', clientRoutes);
router.use('/assignments', assignmentRoutes);

export default router;
