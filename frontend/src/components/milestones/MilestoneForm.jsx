import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Calendar as CalendarIcon, Clock, Link as LinkIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import PropTypes from 'prop-types';

/**
 * MilestoneForm Component
 * Form for creating and editing milestones
 */
function MilestoneForm({ 
  milestone, 
  projectId, 
  allMilestones = [], 
  onSave, 
  onCancel, 
  isOpen 
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    duration: 0,
    dependencies: [],
    status: 'not-started',
    useDuration: false
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (milestone) {
      setFormData({
        name: milestone.name || '',
        description: milestone.description || '',
        startDate: milestone.startDate ? formatDateForInput(milestone.startDate) : '',
        endDate: milestone.endDate ? formatDateForInput(milestone.endDate) : '',
        duration: milestone.duration || 0,
        dependencies: milestone.dependencies?.map(d => typeof d === 'object' ? d._id : d) || [],
        status: milestone.status || 'not-started',
        useDuration: !milestone.startDate && (milestone.duration > 0 || milestone.dependencies?.length > 0)
      });
    } else {
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        duration: 0,
        dependencies: [],
        status: 'not-started',
        useDuration: false
      });
    }
    setErrors({});
  }, [milestone, isOpen]);

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

    if (formData.useDuration) {
      if (formData.duration <= 0) {
        newErrors.duration = 'Duration must be greater than 0';
      }
      if (formData.dependencies.length === 0) {
        newErrors.dependencies = 'Dependent milestones must have at least one dependency';
      }
    } else {
      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required for standalone milestones';
      }
      if (!formData.endDate) {
        newErrors.endDate = 'End date is required for standalone milestones';
      }
      if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after start date';
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
      const submitData = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        dependencies: formData.dependencies
      };

      if (formData.useDuration) {
        submitData.duration = parseInt(formData.duration);
      } else {
        submitData.startDate = formData.startDate;
        submitData.endDate = formData.endDate;
      }

      await onSave(submitData);
    } catch (error) {
      console.error('Error saving milestone:', error);
      setErrors({ submit: error.message || 'Failed to save milestone' });
    } finally {
      setSaving(false);
    }
  }

  function handleDependencyToggle(milestoneId) {
    setFormData(prev => ({
      ...prev,
      dependencies: prev.dependencies.includes(milestoneId)
        ? prev.dependencies.filter(id => id !== milestoneId)
        : [...prev.dependencies, milestoneId]
    }));
  }

  // Filter available dependencies (cannot depend on self or create circular deps)
  const availableDependencies = (allMilestones || []).filter(m => 
    m._id !== milestone?._id && 
    !m.dependencies?.includes(milestone?._id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{milestone ? 'Edit Milestone' : 'Create New Milestone'}</DialogTitle>
          <DialogDescription>
            {milestone ? 'Update milestone details and dependencies' : 'Add a new milestone to your project timeline'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Milestone Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Design Phase Complete"
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
                placeholder="Optional description"
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

            {/* Date Type Toggle */}
            <div className="grid gap-2">
              <Label>Milestone Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!formData.useDuration}
                    onChange={() => setFormData({ ...formData, useDuration: false })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Fixed Dates</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.useDuration}
                    onChange={() => setFormData({ ...formData, useDuration: true })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Duration-based (requires dependencies)</span>
                </label>
              </div>
            </div>

            {/* Fixed Dates or Duration */}
            {!formData.useDuration ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={errors.startDate ? 'border-red-500' : ''}
                  />
                  {errors.startDate && <span className="text-xs text-red-500">{errors.startDate}</span>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={errors.endDate ? 'border-red-500' : ''}
                  />
                  {errors.endDate && <span className="text-xs text-red-500">{errors.endDate}</span>}
                </div>
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (days) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 5"
                  className={errors.duration ? 'border-red-500' : ''}
                />
                {errors.duration && <span className="text-xs text-red-500">{errors.duration}</span>}
                <span className="text-xs text-gray-500">
                  This milestone will start after its dependencies are completed
                </span>
              </div>
            )}

            {/* Dependencies */}
            {availableDependencies.length > 0 && (
              <div className="grid gap-2">
                <Label>Dependencies</Label>
                <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                  {availableDependencies.map((dep) => (
                    <label
                      key={dep._id}
                      className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-50 px-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.dependencies.includes(dep._id)}
                        onChange={() => handleDependencyToggle(dep._id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm flex-1">{dep.name}</span>
                      {dep.isCritical && (
                        <span className="text-xs text-red-500 font-medium">Critical</span>
                      )}
                    </label>
                  ))}
                </div>
                {errors.dependencies && <span className="text-xs text-red-500">{errors.dependencies}</span>}
                <span className="text-xs text-gray-500">
                  Select milestones that must be completed before this one starts
                </span>
              </div>
            )}

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {errors.submit}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {milestone ? 'Update' : 'Create'} Milestone
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

MilestoneForm.propTypes = {
  milestone: PropTypes.object,
  projectId: PropTypes.string.isRequired,
  allMilestones: PropTypes.array,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired
};

MilestoneForm.defaultProps = {
  milestone: null,
  allMilestones: []
};

export default MilestoneForm;
