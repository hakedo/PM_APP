import mongoose from 'mongoose';
import config from './config/index.js';
import DeliverableGroup from './models/DeliverableGroup.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clean up duplicate groups
const cleanupDuplicateGroups = async () => {
  try {
    // Get all groups
    const allGroups = await DeliverableGroup.find({}).sort({ createdAt: 1 });
    
    console.log(`Found ${allGroups.length} total groups`);
    
    // Group by project
    const groupsByProject = {};
    allGroups.forEach(group => {
      const projectId = group.project.toString();
      if (!groupsByProject[projectId]) {
        groupsByProject[projectId] = [];
      }
      groupsByProject[projectId].push(group);
    });
    
    // For each project, keep only the first "To Do" group and delete the rest
    let deletedCount = 0;
    for (const projectId in groupsByProject) {
      const projectGroups = groupsByProject[projectId];
      const todoGroups = projectGroups.filter(g => g.name === 'To Do');
      
      if (todoGroups.length > 1) {
        console.log(`Project ${projectId} has ${todoGroups.length} "To Do" groups`);
        
        // Keep the first one, delete the rest
        for (let i = 1; i < todoGroups.length; i++) {
          await DeliverableGroup.findByIdAndDelete(todoGroups[i]._id);
          console.log(`  Deleted duplicate: ${todoGroups[i]._id}`);
          deletedCount++;
        }
      }
    }
    
    console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} duplicate groups`);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await cleanupDuplicateGroups();
  await mongoose.connection.close();
  console.log('🔌 MongoDB connection closed');
  process.exit(0);
};

run();
