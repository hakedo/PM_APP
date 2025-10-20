import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Milestone name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters']
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [5, 'Code cannot exceed 5 characters'],
      match: [/^[A-Z0-9]*$/, 'Code can only contain uppercase letters and numbers']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    // For standalone milestones with fixed dates
    startDate: {
      type: Date,
      required: false
    },
    endDate: {
      type: Date,
      required: false
    },
    // For dependent milestones - duration in days
    duration: {
      type: Number,
      required: false,
      min: [0, 'Duration cannot be negative'],
      default: 0
    },
    // For duration-based milestones: custom start date override
    customStartDate: {
      type: Date,
      required: false
    },
    // For duration-based milestones: days to wait after dependency completion
    startDateOffset: {
      type: Number,
      required: false,
      min: [0, 'Start date offset cannot be negative'],
      default: 0
    },
    // Array of milestone IDs this milestone depends on
    dependencies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone'
    }],
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'blocked'],
      default: 'not-started'
    },
    // CPM calculated fields
    earliestStart: {
      type: Date,
      required: false
    },
    earliestFinish: {
      type: Date,
      required: false
    },
    latestStart: {
      type: Date,
      required: false
    },
    latestFinish: {
      type: Date,
      required: false
    },
    slack: {
      type: Number,
      default: 0
    },
    isCritical: {
      type: Boolean,
      default: false
    },
    // Display order
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    collection: 'project_milestones'
  }
);

// Indexes for better query performance
milestoneSchema.index({ projectId: 1, order: 1 });
milestoneSchema.index({ projectId: 1, isCritical: 1 });
milestoneSchema.index({ startDate: 1, endDate: 1 });

// Validation: Milestone must have either fixed dates OR duration (with or without dependencies)
milestoneSchema.pre('validate', function(next) {
  const hasFixedDates = this.startDate && this.endDate;
  const hasDuration = this.duration !== undefined && this.duration > 0;
  const hasDependencies = this.dependencies && this.dependencies.length > 0;

  // Must have either fixed dates OR duration
  if (!hasFixedDates && !hasDuration) {
    this.invalidate('duration', 'Milestone must have either fixed dates or a duration');
  }

  // If it has dependencies, it should have duration (not fixed dates)
  // But we allow both for flexibility
  // No additional validation needed here

  // Validate end date is after start date
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }

  next();
});

const Milestone = mongoose.model('Milestone', milestoneSchema);

export default Milestone;
