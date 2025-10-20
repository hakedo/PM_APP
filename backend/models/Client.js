import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Company name cannot exceed 200 characters']
    },
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
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    },
    unit: {
      type: String,
      trim: true,
      maxlength: [50, 'Unit/STE cannot exceed 50 characters'],
      default: ''
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters']
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      uppercase: true,
      maxlength: [2, 'State must be a 2-letter abbreviation'],
      minlength: [2, 'State must be a 2-letter abbreviation'],
      validate: {
        validator: function(v) {
          return /^[A-Z]{2}$/.test(v);
        },
        message: 'State must be a 2-letter abbreviation (e.g., NY, CA)'
      }
    },
    zip: {
      type: String,
      required: [true, 'ZIP code is required'],
      trim: true,
      validate: {
        validator: function(v) {
          return /^\d{5}(-\d{4})?$/.test(v);
        },
        message: 'Please provide a valid ZIP code (e.g., 12345 or 12345-6789)'
      }
    }
  },
  {
    timestamps: true,
    collection: 'clients'
  }
);

// Virtual field for full name
clientSchema.virtual('fullName').get(function() {
  if (this.middleInitial) {
    return `${this.firstName} ${this.middleInitial}. ${this.lastName}`;
  }
  return `${this.firstName} ${this.lastName}`;
});

// Virtual field for display name
clientSchema.virtual('displayName').get(function() {
  if (this.company) {
    return `${this.company} - ${this.fullName}`;
  }
  return this.fullName;
});

// Virtual field for full address
clientSchema.virtual('fullAddress').get(function() {
  const parts = [this.address];
  if (this.unit) parts[0] += ` ${this.unit}`;
  parts.push(`${this.city}, ${this.state} ${this.zip}`);
  return parts.join(', ');
});

// Ensure virtuals are included in JSON
clientSchema.set('toJSON', { virtuals: true });
clientSchema.set('toObject', { virtuals: true });

// Indexes
clientSchema.index({ email: 1 }, { unique: true });
clientSchema.index({ lastName: 1, firstName: 1 });
clientSchema.index({ company: 1 });
clientSchema.index({ city: 1, state: 1 });
clientSchema.index({ createdAt: -1 });

const Client = mongoose.model('Client', clientSchema);

export default Client;
