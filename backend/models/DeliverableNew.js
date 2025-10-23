import mongoose from 'mongoose';

const deliverableSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliverableGroup',
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'blocked'],
    default: 'not-started'
  },
  assignee: {
    type: String,
    default: 'Unassigned'
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
deliverableSchema.index({ project: 1, group: 1, startDate: 1 });

const DeliverableNew = mongoose.model('DeliverableNew', deliverableSchema, 'deliverable_items');

export default DeliverableNew;
