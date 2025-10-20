import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import PropTypes from 'prop-types';

/**
 * DeliverableForm Component
 * Form for creating and editing deliverables within a milestone
 */
function DeliverableForm({ 
  deliverable, 
  milestone,
  projectId,
  onSave, 
  onCancel, 
  isOpen 
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'not-started'
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (deliverable) {
      setFormData({
        name: deliverable.name || '',
        description: deliverable.description || '',
        startDate: deliverable.startDate ? formatDateForInput(deliverable.startDate) : '',
        endDate: deliverable.endDate ? formatDateForInput(deliverable.endDate) : '',
        status: deliverable.status || 'not-started'
      });
    } else {
      // Set default dates based on milestone dates
      const defaultStartDate = milestone?.earliestStart ? formatDateForInput(milestone.earliestStart) : '';
      const defaultEndDate = milestone?.earliestFinish ? formatDateForInput(milestone.earliestFinish) : '';
      
      setFormData({
        name: '',
        description: '',
        startDate: defaultStartDate,
        endDate: defaultEndDate,
        status: 'not-started'
      });
    }
    setErrors({});
  }, [deliverable, milestone, isOpen]);

  function formatDateForInput(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    // Validate against milestone dates
    if (milestone?.earliestStart && formData.startDate) {
      if (new Date(formData.startDate) < new Date(milestone.earliestStart)) {
        newErrors.startDate = 'Start date cannot be before milestone start date';
      }
    }

    if (milestone?.earliestFinish && formData.endDate) {
      if (new Date(formData.endDate) > new Date(milestone.earliestFinish)) {
        newErrors.endDate = 'End date cannot be after milestone end date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving deliverable:', error);
      setErrors({ submit: error.message || 'Failed to save deliverable' });
    } finally {
      setSaving(false);
    }
  }

  // Get milestone date range for display
  const milestoneDateRange = milestone?.earliestStart && milestone?.earliestFinish
    ? `${new Date(milestone.earliestStart).toLocaleDateString()} - ${new Date(milestone.earliestFinish).toLocaleDateString()}`
    : 'No date range set';

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl" onClose={() => onCancel(false)}>
        <DialogHeader>
          <DialogTitle>{deliverable ? 'Edit Deliverable' : 'Create New Deliverable'}</DialogTitle>
          <DialogDescription>
            {deliverable 
              ? 'Update deliverable details' 
              : `Add a new deliverable to ${milestone?.name || 'this milestone'}`}
          </DialogDescription>
          <div className="mt-2 text-xs text-gray-500">
            Milestone date range: {milestoneDateRange}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Deliverable Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., User Interface Mockups"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description of the deliverable"
                rows={3}
              />
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  min={milestone?.earliestStart ? formatDateForInput(milestone.earliestStart) : undefined}
                  max={milestone?.earliestFinish ? formatDateForInput(milestone.earliestFinish) : undefined}
                  className={errors.startDate ? 'border-red-500' : ''}
                />
                {errors.startDate && <span className="text-xs text-red-500">{errors.startDate}</span>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate || (milestone?.earliestStart ? formatDateForInput(milestone.earliestStart) : undefined)}
                  max={milestone?.earliestFinish ? formatDateForInput(milestone.earliestFinish) : undefined}
                  className={errors.endDate ? 'border-red-500' : ''}
                />
                {errors.endDate && <span className="text-xs text-red-500">{errors.endDate}</span>}
              </div>
            </div>

            {errors.submit && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
                {errors.submit}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onCancel(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : deliverable ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

DeliverableForm.propTypes = {
  deliverable: PropTypes.object,
  milestone: PropTypes.object,
  projectId: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired
};

DeliverableForm.defaultProps = {
  deliverable: null,
  milestone: null
};

export default DeliverableForm;
