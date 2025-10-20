/**
 * Create a test project network matching the CPM diagram example
 * Network structure:
 * Start → A(10) → B(12) → C(9) → End
 * Start → D(5) → E(7) → F(6) → End
 * Start → G(3) → H(4) → I(6) → End
 * 
 * Where:
 * - A, D, G start from Start (parallel paths)
 * - B depends on A, D
 * - E depends on D
 * - H depends on G
 * - C depends on B
 * - F depends on E
 * - I depends on H
 * - End depends on C, F, I
 */

import mongoose from 'mongoose';
import { Project, Milestone } from './models/index.js';
import config from './config/index.js';

async function createTestNetwork() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');

    // Create a test project
    console.log('🔄 Creating test project...');
    const project = new Project({
      title: 'CPM Network Test Project',
      description: 'Test project to demonstrate CPM-based network layout with parallel paths (A→B→C, D→E→F, G→H→I)',
      startDate: new Date('2025-01-01'),
      endDate: null
    });
    await project.save();
    console.log(`✅ Created project: ${project.title} (ID: ${project._id})`);

    const projectId = project._id;
    const projectStartDate = new Date('2025-01-01');

    // Create milestones according to the network structure
    console.log('🔄 Creating milestones...');

    // Path 1: A → B → C
    const milestoneA = new Milestone({
      name: 'Task A',
      description: 'First task in path 1 (Duration: 10 days)',
      projectId: projectId,
      duration: 10,
      startDate: projectStartDate,
      endDate: new Date('2025-01-11'),
      status: 'not-started',
      dependencies: []
    });
    await milestoneA.save();
    console.log(`✅ Created Milestone A (Duration: 10)`);

    const milestoneB = new Milestone({
      name: 'Task B',
      description: 'Second task in path 1 (Duration: 12 days) - Depends on A and D',
      projectId: projectId,
      duration: 12,
      startDate: new Date('2025-01-11'),
      endDate: new Date('2025-01-23'),
      status: 'not-started',
      dependencies: [milestoneA._id] // Will add D later
    });
    await milestoneB.save();
    console.log(`✅ Created Milestone B (Duration: 12)`);

    const milestoneC = new Milestone({
      name: 'Task C',
      description: 'Third task in path 1 (Duration: 9 days) - Depends on B',
      projectId: projectId,
      duration: 9,
      startDate: new Date('2025-01-23'),
      endDate: new Date('2025-02-01'),
      status: 'not-started',
      dependencies: [milestoneB._id]
    });
    await milestoneC.save();
    console.log(`✅ Created Milestone C (Duration: 9)`);

    // Path 2: D → E → F
    const milestoneD = new Milestone({
      name: 'Task D',
      description: 'First task in path 2 (Duration: 5 days)',
      projectId: projectId,
      duration: 5,
      startDate: projectStartDate,
      endDate: new Date('2025-01-06'),
      status: 'not-started',
      dependencies: []
    });
    await milestoneD.save();
    console.log(`✅ Created Milestone D (Duration: 5)`);

    // Update B to depend on both A and D
    milestoneB.dependencies.push(milestoneD._id);
    await milestoneB.save();
    console.log(`✅ Updated Milestone B to depend on A and D`);

    const milestoneE = new Milestone({
      name: 'Task E',
      description: 'Second task in path 2 (Duration: 7 days) - Depends on D',
      projectId: projectId,
      duration: 7,
      startDate: new Date('2025-01-06'),
      endDate: new Date('2025-01-13'),
      status: 'not-started',
      dependencies: [milestoneD._id]
    });
    await milestoneE.save();
    console.log(`✅ Created Milestone E (Duration: 7)`);

    const milestoneF = new Milestone({
      name: 'Task F',
      description: 'Third task in path 2 (Duration: 6 days) - Depends on E',
      projectId: projectId,
      duration: 6,
      startDate: new Date('2025-01-13'),
      endDate: new Date('2025-01-19'),
      status: 'not-started',
      dependencies: [milestoneE._id]
    });
    await milestoneF.save();
    console.log(`✅ Created Milestone F (Duration: 6)`);

    // Path 3: G → H → I
    const milestoneG = new Milestone({
      name: 'Task G',
      description: 'First task in path 3 (Duration: 3 days)',
      projectId: projectId,
      duration: 3,
      startDate: projectStartDate,
      endDate: new Date('2025-01-04'),
      status: 'not-started',
      dependencies: []
    });
    await milestoneG.save();
    console.log(`✅ Created Milestone G (Duration: 3)`);

    const milestoneH = new Milestone({
      name: 'Task H',
      description: 'Second task in path 3 (Duration: 4 days) - Depends on G',
      projectId: projectId,
      duration: 4,
      startDate: new Date('2025-01-04'),
      endDate: new Date('2025-01-08'),
      status: 'not-started',
      dependencies: [milestoneG._id]
    });
    await milestoneH.save();
    console.log(`✅ Created Milestone H (Duration: 4)`);

    const milestoneI = new Milestone({
      name: 'Task I',
      description: 'Third task in path 3 (Duration: 6 days) - Depends on H',
      projectId: projectId,
      duration: 6,
      startDate: new Date('2025-01-08'),
      endDate: new Date('2025-01-14'),
      status: 'not-started',
      dependencies: [milestoneH._id]
    });
    await milestoneI.save();
    console.log(`✅ Created Milestone I (Duration: 6)`);

    console.log('\n🎉 Test network created successfully!');
    console.log('\n📊 Network Structure:');
    console.log('   Path 1: A(10) → B(12) → C(9)');
    console.log('   Path 2: D(5) → B(12), D(5) → E(7) → F(6)');
    console.log('   Path 3: G(3) → H(4) → I(6)');
    console.log('\n📝 Project Details:');
    console.log(`   Project ID: ${project._id}`);
    console.log(`   Project Title: ${project.title}`);
    console.log('\n🔗 View in browser:');
    console.log(`   http://localhost:5174/projects/${project._id}`);
    console.log('\n💡 Expected Layout (by earliest start time):');
    console.log('   Column 0: Start (Day 0)');
    console.log('   Column 1: A, D, G (all start Day 0)');
    console.log('   Column 2: E, H (E starts Day 5, H starts Day 3)');
    console.log('   Column 3: B (starts Day 10)');
    console.log('   Column 4: F, I (F starts Day 12, I starts Day 7)');
    console.log('   Column 5: C (starts Day 22)');
    console.log('   Column 6: End (Day 31)');

  } catch (error) {
    console.error('❌ Error creating test network:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the script
createTestNetwork();
