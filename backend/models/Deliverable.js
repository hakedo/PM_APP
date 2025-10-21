import mongoose from 'mongoose';

const deliverableSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Deliverable title is required'],
      trim: true,
      maxlength: [200, 'Deliverable title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Deliverable description cannot exceed 1000 characters']
    },
    completed: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    },
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
      required: [true, 'Milestone ID is required']
    }
  },
  { 
    timestamps: true,
    collection: 'project_milestone_deliverables'
  }
);

// Indexes for better query performance
deliverableSchema.index({ milestoneId: 1, order: 1 });
deliverableSchema.index({ completed: 1 });

const Deliverable = mongoose.model('Deliverable', deliverableSchema);

export default Deliverable;
