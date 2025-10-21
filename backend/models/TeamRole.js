import mongoose from 'mongoose';

const teamRoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'team_roles'
});

const TeamRole = mongoose.model('TeamRole', teamRoleSchema);

export default TeamRole;
