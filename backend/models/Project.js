import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, 'Project title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: { 
      type: String, 
      required: [true, 'Project description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    startDate: { 
      type: Date, 
      required: [true, 'Start date is required']
    },
    endDate: { 
      type: Date, 
      required: false,
      validate: {
        validator: function(value) {
          return !value || value >= this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamMember',
      required: false
    }
  },
  { 
    timestamps: true,
    collection: 'projects'
  }
);

// Indexes for better query performance
projectSchema.index({ title: 1 });
projectSchema.index({ startDate: 1, endDate: 1 });
projectSchema.index({ createdAt: -1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
