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
    // Start date configuration
    startDateMode: {
      type: String,
      enum: ['manual', 'relative'],
      default: 'relative'
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
      default: 'relative'
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
    collection: 'project_milestone_deliverables'
  }
);

// Indexes for better query performance
deliverableSchema.index({ milestoneId: 1, order: 1 });
deliverableSchema.index({ completed: 1 });

// Validation method to check if deliverable dates are within milestone bounds
deliverableSchema.methods.validateDatesWithinMilestone = async function() {
  const Milestone = mongoose.model('Milestone');
  const milestone = await Milestone.findById(this.milestoneId);
  
  if (!milestone) {
    throw new Error('Associated milestone not found');
  }

  const errors = [];
  
  // Get milestone effective dates
  const milestoneStart = milestone.dateMode === 'manual' ? milestone.startDate : milestone.calculatedStartDate;
  const milestoneEnd = milestone.endDateMode === 'manual' ? milestone.endDate : milestone.calculatedEndDate;

  if (!milestoneStart || !milestoneEnd) {
    throw new Error('Milestone dates are not properly configured');
  }

  // Validate start date if provided
  if (this.startDate) {
    if (this.startDate < milestoneStart) {
      errors.push(`Deliverable start date cannot be before milestone start date (${milestoneStart.toISOString().split('T')[0]})`);
    }
    if (this.startDate > milestoneEnd) {
      errors.push(`Deliverable start date cannot be after milestone end date (${milestoneEnd.toISOString().split('T')[0]})`);
    }
  }

  // Validate end date if provided
  if (this.endDate) {
    if (this.endDate < milestoneStart) {
      errors.push(`Deliverable end date cannot be before milestone start date (${milestoneStart.toISOString().split('T')[0]})`);
    }
    if (this.endDate > milestoneEnd) {
      errors.push(`Deliverable end date cannot be after milestone end date (${milestoneEnd.toISOString().split('T')[0]})`);
    }
  }

  // Validate start date is before end date
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    errors.push('Deliverable start date must be before or equal to end date');
  }

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  return true;
};

const Deliverable = mongoose.model('Deliverable', deliverableSchema);

export default Deliverable;
