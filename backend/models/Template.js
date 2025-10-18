import mongoose from 'mongoose';

// Simplified Template Schema - Only name and description
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
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    }
  },
  { 
    timestamps: true,
    collection: 'templates'
  }
);

// Indexes for better query performance
templateSchema.index({ name: 1 });
templateSchema.index({ createdAt: -1 });

const Template = mongoose.model('Template', templateSchema);

export default Template;
