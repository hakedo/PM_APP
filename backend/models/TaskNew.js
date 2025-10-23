import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  deliverable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deliverable',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
taskSchema.index({ deliverable: 1, order: 1 });

const TaskNew = mongoose.model('TaskNew', taskSchema);

export default TaskNew;
