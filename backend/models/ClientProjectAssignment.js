import mongoose from 'mongoose';

const clientProjectAssignmentSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client ID is required']
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required']
    },
    role: {
      type: String,
      enum: ['primary', 'secondary', 'stakeholder'],
      default: 'primary',
      trim: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  },
  { 
    timestamps: true,
    collection: 'client_project_assignments'
  }
);

// Compound index to ensure a client can only be assigned to a project once
clientProjectAssignmentSchema.index({ clientId: 1, projectId: 1 }, { unique: true });

// Indexes for efficient lookups
clientProjectAssignmentSchema.index({ clientId: 1 });
clientProjectAssignmentSchema.index({ projectId: 1 });
clientProjectAssignmentSchema.index({ assignedAt: -1 });

const ClientProjectAssignment = mongoose.model('ClientProjectAssignment', clientProjectAssignmentSchema);

export default ClientProjectAssignment;
