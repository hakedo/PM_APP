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

const Task = mongoose.model('Task', taskSchema);

export default Task;
