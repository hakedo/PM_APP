import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Milestone name is required'],
      trim: true,
      maxlength: [200, 'Milestone name cannot exceed 200 characters']
    },
    abbreviation: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [5, 'Abbreviation cannot exceed 5 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Milestone description cannot exceed 1000 characters']
    },
    teamMember: {
      type: String,
      trim: true
    },
    order: {
      type: Number,
      default: 0
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required']
    },
    // Calculated dates (dynamically computed from deliverables)
    calculatedStartDate: {
      type: Date,
      required: false
    },
    calculatedEndDate: {
      type: Date,
      required: false
    }
  },
  { 
    timestamps: true,
    collection: 'project_milestones'
  }
);

// Indexes for better query performance
milestoneSchema.index({ projectId: 1, order: 1 });
milestoneSchema.index({ calculatedStartDate: 1, calculatedEndDate: 1 });

// Virtual for getting the effective start date
milestoneSchema.virtual('effectiveStartDate').get(function() {
  return this.dateMode === 'manual' ? this.startDate : this.calculatedStartDate;
});

// Virtual for getting the effective end date
milestoneSchema.virtual('effectiveEndDate').get(function() {
  if (this.endDateMode === 'manual') {
    return this.endDate;
  }
  return this.calculatedEndDate;
});

// Ensure virtuals are included when converting to JSON
milestoneSchema.set('toJSON', { virtuals: true });
milestoneSchema.set('toObject', { virtuals: true });

const Milestone = mongoose.model('Milestone', milestoneSchema);

export default Milestone;
