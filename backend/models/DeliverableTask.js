import mongoose from 'mongoose';

const deliverableTaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  deliverableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deliverable',
    required: true,
    index: true
  },
  milestoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone',
    required: true,
    index: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'blocked'],
    default: 'not-started'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  assignedTo: {
    type: String,
    default: ''
  },
  estimatedHours: {
    type: Number,
    min: 0,
    default: 0
  },
  actualHours: {
    type: Number,
    min: 0,
    default: 0
  },
  dueDate: {
    type: Date
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'project_milestone_deliverable_tasks'
});

// Compound index for efficient queries
deliverableTaskSchema.index({ projectId: 1, milestoneId: 1, deliverableId: 1 });

const DeliverableTask = mongoose.model('DeliverableTask', deliverableTaskSchema);

export default DeliverableTask;
