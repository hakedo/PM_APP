import express from 'express';
import FinanceItem from '../models/FinanceItem.js';
import FinanceSubItem from '../models/FinanceSubItem.js';

const router = express.Router();

// Get all finance items for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const items = await FinanceItem.find({ project: req.params.projectId })
      .sort({ group: 1, date: 1 })
      .lean();
    
    res.json(items);
  } catch (error) {
    console.error('Error fetching finance items:', error);
    res.status(500).json({ message: 'Error fetching finance items', error: error.message });
  }
});

// Get single finance item with sub-items
router.get('/:id', async (req, res) => {
  try {
    const item = await FinanceItem.findById(req.params.id).lean();
    
    if (!item) {
      return res.status(404).json({ message: 'Finance item not found' });
    }
    
    const subItems = await FinanceSubItem.find({ financeItem: req.params.id })
      .sort({ order: 1 })
      .lean();
    
    res.json({ ...item, subItems });
  } catch (error) {
    console.error('Error fetching finance item:', error);
    res.status(500).json({ message: 'Error fetching finance item', error: error.message });
  }
});

// Create finance item
router.post('/', async (req, res) => {
  try {
    const { project, group, name, amount, currency, type, category, date, status, assignee } = req.body;
    
    const item = new FinanceItem({
      project,
      group,
      name,
      amount,
      currency: currency || 'USD',
      type: type || 'expense',
      category: category || 'General',
      date,
      status: status || 'pending',
      assignee: assignee || 'Unassigned'
    });
    
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating finance item:', error);
    res.status(500).json({ message: 'Error creating finance item', error: error.message });
  }
});

// Update finance item
router.put('/:id', async (req, res) => {
  try {
    const { name, amount, currency, type, category, date, status, assignee, group } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (amount !== undefined) updateData.amount = amount;
    if (currency !== undefined) updateData.currency = currency;
    if (type !== undefined) updateData.type = type;
    if (category !== undefined) updateData.category = category;
    if (date !== undefined) updateData.date = date;
    if (status !== undefined) updateData.status = status;
    if (assignee !== undefined) updateData.assignee = assignee;
    if (group !== undefined) updateData.group = group;
    
    const item = await FinanceItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!item) {
      return res.status(404).json({ message: 'Finance item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error updating finance item:', error);
    res.status(500).json({ message: 'Error updating finance item', error: error.message });
  }
});

// Delete finance item
router.delete('/:id', async (req, res) => {
  try {
    const item = await FinanceItem.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Finance item not found' });
    }
    
    // Also delete all sub-items
    await FinanceSubItem.deleteMany({ financeItem: req.params.id });
    
    res.json({ message: 'Finance item deleted successfully' });
  } catch (error) {
    console.error('Error deleting finance item:', error);
    res.status(500).json({ message: 'Error deleting finance item', error: error.message });
  }
});

// Get sub-items for a finance item
router.get('/:id/subitems', async (req, res) => {
  try {
    const subItems = await FinanceSubItem.find({ financeItem: req.params.id })
      .sort({ order: 1 })
      .lean();
    
    res.json(subItems);
  } catch (error) {
    console.error('Error fetching sub-items:', error);
    res.status(500).json({ message: 'Error fetching sub-items', error: error.message });
  }
});

// Create sub-item
router.post('/:id/subitems', async (req, res) => {
  try {
    const { name, amount, status } = req.body;
    
    // Get the highest order number
    const maxOrderSubItem = await FinanceSubItem.findOne({ financeItem: req.params.id })
      .sort({ order: -1 })
      .limit(1);
    
    const order = maxOrderSubItem ? maxOrderSubItem.order + 1 : 0;
    
    const subItem = new FinanceSubItem({
      financeItem: req.params.id,
      name,
      amount,
      status: status || 'pending',
      order
    });
    
    await subItem.save();
    res.status(201).json(subItem);
  } catch (error) {
    console.error('Error creating sub-item:', error);
    res.status(500).json({ message: 'Error creating sub-item', error: error.message });
  }
});

// Update sub-item
router.put('/:id/subitems/:subItemId', async (req, res) => {
  try {
    const { name, amount, status, order } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (amount !== undefined) updateData.amount = amount;
    if (status !== undefined) updateData.status = status;
    if (order !== undefined) updateData.order = order;
    
    const subItem = await FinanceSubItem.findByIdAndUpdate(
      req.params.subItemId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!subItem) {
      return res.status(404).json({ message: 'Sub-item not found' });
    }
    
    res.json(subItem);
  } catch (error) {
    console.error('Error updating sub-item:', error);
    res.status(500).json({ message: 'Error updating sub-item', error: error.message });
  }
});

// Delete sub-item
router.delete('/:id/subitems/:subItemId', async (req, res) => {
  try {
    const subItem = await FinanceSubItem.findByIdAndDelete(req.params.subItemId);
    
    if (!subItem) {
      return res.status(404).json({ message: 'Sub-item not found' });
    }
    
    res.json({ message: 'Sub-item deleted successfully' });
  } catch (error) {
    console.error('Error deleting sub-item:', error);
    res.status(500).json({ message: 'Error deleting sub-item', error: error.message });
  }
});

export default router;
