import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const deliverables = await mongoose.connection.db.collection('project_milestone_deliverables').find({}).toArray();
    console.log('\n📊 Total deliverables:', deliverables.length);
    console.log('\n📋 Deliverables:');
    deliverables.forEach((deliverable, i) => {
      console.log(`\n--- Deliverable ${i + 1} ---`);
      console.log('ID:', deliverable._id);
      console.log('Name:', deliverable.name);
      console.log('Description:', deliverable.description);
      console.log('Project ID:', deliverable.projectId);
      console.log('Milestone ID:', deliverable.milestoneId);
      console.log('Status:', deliverable.status);
      console.log('Start Date:', deliverable.startDate);
      console.log('End Date:', deliverable.endDate);
      console.log('Order:', deliverable.order);
      console.log('Created:', deliverable.createdAt);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
