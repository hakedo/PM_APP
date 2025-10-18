import mongoose from 'mongoose';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    logger.info('🔄 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(config.mongoUri, {
      // Connection options for production
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
    });
    
    logger.info('✅ Connected to MongoDB Atlas');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
