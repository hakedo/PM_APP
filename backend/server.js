import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import connectDB from './config/database.js';
import { projectRoutes, templateRoutes, clientRoutes, clientProjectAssignmentRoutes, teamRoutes, teamRoleRoutes, deliverableRoutes, deliverableGroupRoutes } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';
import logger from './utils/logger.js';

const app = express();

// Middleware
app.use(cors({
  origin: [config.corsOrigin, 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

app.use(requestLogger);

// Health check route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'PM App API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/projects', projectRoutes);
app.use('/templates', templateRoutes);
app.use('/clients', clientRoutes);
app.use('/assignments', clientProjectAssignmentRoutes);
app.use('/team', teamRoutes);
app.use('/team-roles', teamRoleRoutes);
app.use('/deliverables', deliverableRoutes);
app.use('/deliverable-groups', deliverableGroupRoutes);

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start listening
    app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📝 Environment: ${config.nodeEnv}`);
      logger.info(`🌐 CORS enabled for: ${config.corsOrigin}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();

export default app;