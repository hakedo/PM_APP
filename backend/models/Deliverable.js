import mongoose from 'mongoose';

const deliverableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  startDate: {
    type: Date,
    required: false
  },
  endDate: {
    type: Date,
    required: false
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
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'project_milestone_deliverables'
});

// Index for efficient querying
deliverableSchema.index({ milestoneId: 1, projectId: 1 });

// Validate that dates are within milestone date range
deliverableSchema.pre('save', async function(next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    throw new Error('Start date must be before end date');
  }
  next();
});

const Deliverable = mongoose.model('Deliverable', deliverableSchema);

export default Deliverable;
