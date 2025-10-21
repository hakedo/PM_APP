import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
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
    // Days offset from deliverable start (used when startDateMode is 'relative')
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
    // Days offset from deliverable start (used when endDateMode is 'relative')
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
    deliverableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deliverable',
      required: [true, 'Deliverable ID is required']
    }
  },
  { 
    timestamps: true,
    collection: 'project_milestone_deliverable_tasks'
  }
);

// Indexes for better query performance
taskSchema.index({ deliverableId: 1, order: 1 });
taskSchema.index({ completed: 1 });

// Validation method to check if task dates are within deliverable bounds
taskSchema.methods.validateDatesWithinDeliverable = async function() {
  const Deliverable = mongoose.model('Deliverable');
  const deliverable = await Deliverable.findById(this.deliverableId);
  
  if (!deliverable) {
    throw new Error('Associated deliverable not found');
  }

  const errors = [];
  
  // Only validate if deliverable has dates set
  if (!deliverable.startDate && !deliverable.endDate) {
    // If deliverable has no dates, task dates are not restricted
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
    if (deliverable.startDate && this.startDate < deliverable.startDate) {
      errors.push(`Task start date cannot be before deliverable start date (${deliverable.startDate.toISOString().split('T')[0]})`);
    }
    if (deliverable.endDate && this.startDate > deliverable.endDate) {
      errors.push(`Task start date cannot be after deliverable end date (${deliverable.endDate.toISOString().split('T')[0]})`);
    }
  }

  // Validate end date if provided
  if (this.endDate) {
    if (deliverable.startDate && this.endDate < deliverable.startDate) {
      errors.push(`Task end date cannot be before deliverable start date (${deliverable.startDate.toISOString().split('T')[0]})`);
    }
    if (deliverable.endDate && this.endDate > deliverable.endDate) {
      errors.push(`Task end date cannot be after deliverable end date (${deliverable.endDate.toISOString().split('T')[0]})`);
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

const Task = mongoose.model('Task', taskSchema);

export default Task;
