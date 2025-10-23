import mongoose from 'mongoose';

const deliverableGroupSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
deliverableGroupSchema.index({ project: 1, order: 1 });

const DeliverableGroup = mongoose.model('DeliverableGroup', deliverableGroupSchema);

export default DeliverableGroup;
