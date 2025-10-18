import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const templates = await mongoose.connection.db.collection('templates').find({}).toArray();
    console.log('\n📊 Total templates:', templates.length);
    console.log('\n📋 Templates:');
    templates.forEach((template, i) => {
      console.log(`\n--- Template ${i + 1} ---`);
      console.log('ID:', template._id);
      console.log('Name:', template.name);
      console.log('Type:', template.type);
      console.log('Project Statuses:', template.projectStatuses?.length || 0);
      console.log('Task Statuses:', template.taskStatuses?.length || 0);
      console.log('Phases:', template.phases?.length || 0);
      console.log('Deliverables:', template.deliverables?.length || 0);
      console.log('Legacy Statuses:', template.statuses?.length || 0);
      
      if (template.projectStatuses?.length > 0) {
        console.log('Project Statuses Detail:', JSON.stringify(template.projectStatuses, null, 2));
      }
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
