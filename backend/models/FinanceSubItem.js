import mongoose from 'mongoose';

const financeSubItemSchema = new mongoose.Schema({
  financeItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinanceItem',
    required: true,
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
  status: {
    type: String,
    enum: ['pending', 'paid'],
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
financeSubItemSchema.index({ financeItem: 1, order: 1 });

const FinanceSubItem = mongoose.model('FinanceSubItem', financeSubItemSchema, 'finance_subitems');

export default FinanceSubItem;
