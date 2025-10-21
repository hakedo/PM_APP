import mongoose from 'mongoose';

const milestoneTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Task title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Task description cannot exceed 1000 characters']
    },
    completed: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    },
    // Start date configuration
    startDateMode: {
      type: String,
      enum: ['manual', 'relative'],
      default: 'manual'
    },
    startDate: {
      type: Date,
      required: false
    },
    // Days offset from milestone start (used when startDateMode is 'relative')
    startDateOffset: {
      type: Number,
      default: 0
    },
    // Offset type for start date: 'business' or 'calendar'
    startDateOffsetType: {
      type: String,
      enum: ['business', 'calendar'],
      default: 'business'
    },
    // End date configuration
    endDateMode: {
      type: String,
      enum: ['manual', 'relative'],
      default: 'manual'
    },
    endDate: {
      type: Date,
      required: false
    },
    // Days offset from milestone start (used when endDateMode is 'relative')
    endDateOffset: {
      type: Number,
      default: 0
    },
    // Offset type for end date: 'business' or 'calendar'
    endDateOffsetType: {
      type: String,
      enum: ['business', 'calendar'],
      default: 'business'
    },
    // Calculated dates (computed based on mode and settings)
    calculatedStartDate: {
      type: Date,
      required: false
    },
    calculatedEndDate: {
      type: Date,
      required: false
    },
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
      required: [true, 'Milestone ID is required']
    }
  },
  { 
    timestamps: true,
    collection: 'project_milestone_tasks'
  }
);

// Indexes for better query performance
milestoneTaskSchema.index({ milestoneId: 1, order: 1 });
milestoneTaskSchema.index({ completed: 1 });

// Validation method to check if task dates are within milestone bounds
milestoneTaskSchema.methods.validateDatesWithinMilestone = async function() {
  const Milestone = mongoose.model('Milestone');
  const milestone = await Milestone.findById(this.milestoneId);
  
  if (!milestone) {
    throw new Error('Associated milestone not found');
  }

  const errors = [];
  
  // Get milestone effective dates
  const milestoneStart = milestone.calculatedStartDate || milestone.startDate;
  const milestoneEnd = milestone.calculatedEndDate || milestone.endDate;

  // Only validate if milestone has dates set
  if (!milestoneStart && !milestoneEnd) {
    // If milestone has no dates, task dates are not restricted
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      errors.push('Task start date must be before or equal to end date');
    }
    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }
    return true;
  }

  // Validate start date if provided
  if (this.startDate) {
    if (milestoneStart && this.startDate < milestoneStart) {
      errors.push(`Task start date cannot be before milestone start date (${milestoneStart.toISOString().split('T')[0]})`);
    }
    if (milestoneEnd && this.startDate > milestoneEnd) {
      errors.push(`Task start date cannot be after milestone end date (${milestoneEnd.toISOString().split('T')[0]})`);
    }
  }

  // Validate end date if provided
  if (this.endDate) {
    if (milestoneStart && this.endDate < milestoneStart) {
      errors.push(`Task end date cannot be before milestone start date (${milestoneStart.toISOString().split('T')[0]})`);
    }
    if (milestoneEnd && this.endDate > milestoneEnd) {
      errors.push(`Task end date cannot be after milestone end date (${milestoneEnd.toISOString().split('T')[0]})`);
    }
  }

  // Validate start date is before end date
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    errors.push('Task start date must be before or equal to end date');
  }

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  return true;
};

const MilestoneTask = mongoose.model('MilestoneTask', milestoneTaskSchema);

export default MilestoneTask;
