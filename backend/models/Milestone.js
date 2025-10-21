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
    supervisor: {
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
    // Date configuration
    dateMode: {
      type: String,
      enum: ['manual', 'auto'],
      default: 'auto',
      required: true
    },
    // Manual start date (used when dateMode is 'manual')
    startDate: {
      type: Date,
      required: false
    },
    // End date configuration
    endDateMode: {
      type: String,
      enum: ['manual', 'duration'],
      default: 'duration',
      required: true
    },
    // Manual end date (used when endDateMode is 'manual')
    endDate: {
      type: Date,
      required: false
    },
    // Duration in days (used when endDateMode is 'duration')
    durationDays: {
      type: Number,
      min: [1, 'Duration must be at least 1 day'],
      default: 1
    },
    // Gap after previous milestone in days (used when dateMode is 'auto')
    daysAfterPrevious: {
      type: Number,
      min: [0, 'Days after previous milestone cannot be negative'],
      default: 0
    },
    // Calculated dates (computed based on mode and settings)
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
