import mongoose from 'mongoose';

// Sub-schemas for better organization
const statusItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  color: { type: String, required: true },
  icon: { type: String, required: true },
  order: { type: Number, required: true, min: 0 }
}, { _id: true });

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  order: { type: Number, required: true, min: 0 }
}, { _id: true });

const deliverableSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  order: { type: Number, required: true, min: 0 },
  defaultTasks: [taskSchema]
}, { _id: true });

// Main Template Schema
const templateSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Template name is required'],
      trim: true,
      minlength: [1, 'Name cannot be empty'],
      maxlength: [200, 'Name cannot exceed 200 characters']
    },
    description: { 
      type: String, 
      trim: true, 
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    // Legacy type field for backward compatibility
    type: { 
      type: String, 
      enum: ['projectStatus', 'taskStatus', 'phase', 'deliverable'],
      sparse: true
    },
    projectStatuses: [statusItemSchema],
    taskStatuses: [statusItemSchema],
    phases: [statusItemSchema],
    deliverables: [deliverableSchema],
    // Legacy statuses for backward compatibility
    statuses: [statusItemSchema]
  },
  { 
    timestamps: true,
    collection: 'templates'
  }
);

// Indexes
templateSchema.index({ name: 1 });
templateSchema.index({ createdAt: -1 });

const Template = mongoose.model('Template', templateSchema);

export default Template;
