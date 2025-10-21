import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [1, 'First name cannot be empty'],
      maxlength: [100, 'First name cannot exceed 100 characters']
    },
    middleInitial: {
      type: String,
      trim: true,
      maxlength: [1, 'Middle initial must be a single character'],
      default: ''
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [1, 'Last name cannot be empty'],
      maxlength: [100, 'Last name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,4}$/.test(v);
        },
        message: 'Please provide a valid email address'
      }
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: function(v) {
          return /^[\d\s\-\+\(\)]+$/.test(v);
        },
        message: 'Please provide a valid phone number'
      }
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
      maxlength: [100, 'Role cannot exceed 100 characters']
    },
    department: {
      type: String,
      trim: true,
      maxlength: [100, 'Department cannot exceed 100 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    collection: 'team_members'
  }
);

// Indexes
teamMemberSchema.index({ lastName: 1, firstName: 1 });
teamMemberSchema.index({ email: 1 });
teamMemberSchema.index({ status: 1 });

// Virtual for full name
teamMemberSchema.virtual('fullName').get(function() {
  const middle = this.middleInitial ? ` ${this.middleInitial}.` : '';
  return `${this.firstName}${middle} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
teamMemberSchema.set('toJSON', { virtuals: true });
teamMemberSchema.set('toObject', { virtuals: true });

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);

export default TeamMember;
