import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Milestone name is required'],
      trim: true,
      maxlength: [200, 'Milestone name cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Milestone description cannot exceed 1000 characters']
    },
    order: {
      type: Number,
      default: 0
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required']
    }
  },
  { 
    timestamps: true,
    collection: 'project_milestones'
  }
);

// Indexes for better query performance
milestoneSchema.index({ projectId: 1, order: 1 });

const Milestone = mongoose.model('Milestone', milestoneSchema);

export default Milestone;
