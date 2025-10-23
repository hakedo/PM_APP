import mongoose from 'mongoose';

const financeItemSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinanceGroup',
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    default: 'expense'
  },
  category: {
    type: String,
    default: 'General'
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  assignee: {
    type: String,
    default: 'Unassigned'
  }
}, {
  timestamps: true
});

// Index for efficient queries
financeItemSchema.index({ project: 1, group: 1, date: 1 });

const FinanceItem = mongoose.model('FinanceItem', financeItemSchema);

export default FinanceItem;
