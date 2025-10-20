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
    code: '',
    description: '',
    startDate: '',
    endDate: '',
    duration: 0,
    dependencies: [],
    status: 'not-started',
    useDuration: false,
    startDateType: 'dependency', // 'dependency' or 'custom'
    startDateOffset: 0 // days after dependency completion
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (milestone) {
      setFormData({
        name: milestone.name || '',
        code: milestone.code || '',
        description: milestone.description || '',
        startDate: milestone.startDate ? formatDateForInput(milestone.startDate) : '',
        endDate: milestone.endDate ? formatDateForInput(milestone.endDate) : '',
        duration: milestone.duration || 0,
        dependencies: milestone.dependencies?.map(d => typeof d === 'object' ? d._id : d) || [],
        status: milestone.status || 'not-started',
        useDuration: !milestone.startDate && (milestone.duration > 0 || milestone.dependencies?.length > 0),
        startDateType: 'dependency',
        startDateOffset: 0
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        startDate: '',
        endDate: '',
        duration: 0,
        dependencies: [],
        status: 'not-started',
        useDuration: false,
        startDateType: 'dependency',
        startDateOffset: 0
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

    console.log('🔍 Validating form with data:', {
      name: formData.name,
      useDuration: formData.useDuration,
      duration: formData.duration,
      dependencies: formData.dependencies,
      startDateType: formData.startDateType,
      allMilestonesCount: (allMilestones || []).length
    });

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.useDuration) {
      if (!formData.duration || formData.duration <= 0) {
        newErrors.duration = 'Duration must be greater than 0';
      }
      // Only require dependencies if there are other milestones available
      const hasAvailableDependencies = (allMilestones || []).filter(m => 
        m._id !== milestone?._id && !m.dependencies?.includes(milestone?._id)
      ).length > 0;
      
      console.log('📊 Dependency check:', {
        hasAvailableDependencies,
        dependenciesCount: formData.dependencies.length
      });
      
      if (hasAvailableDependencies && formData.dependencies.length === 0) {
        newErrors.dependencies = 'Duration-based milestones must have at least one dependency';
      }
      if (formData.startDateType === 'custom' && !formData.startDate) {
        newErrors.startDate = 'Custom start date is required';
      }
    } else {
      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required for fixed-date milestones';
      }
      if (!formData.endDate) {
        newErrors.endDate = 'End date is required for fixed-date milestones';
      }
      if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    console.log('📝 Validation result:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    console.log('Form validation starting...');
    
    const isValid = validateForm();
    
    if (!isValid) {
      console.log('❌ Validation failed with errors:', errors);
      // Scroll to first error
      const firstError = document.querySelector('.border-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    console.log('✅ Validation passed, saving milestone...');
    setSaving(true);
    try {
      const submitData = {
        name: formData.name,
        code: formData.code.toUpperCase(),
        description: formData.description,
        status: formData.status,
        dependencies: formData.dependencies
      };

      if (formData.useDuration) {
        submitData.duration = parseInt(formData.duration);
        // For duration-based, only include custom start date if specified
        if (formData.startDateType === 'custom' && formData.startDate) {
          submitData.customStartDate = formData.startDate;
          submitData.startDateOffset = 0;
        } else {
          // Use offset from dependency
          submitData.startDateOffset = parseInt(formData.startDateOffset) || 0;
        }
      } else {
        submitData.startDate = formData.startDate;
        submitData.endDate = formData.endDate;
      }

      console.log('Submit data:', submitData);
      await onSave(submitData);
      console.log('Save successful');
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onClose={onCancel}>
        <DialogHeader>
          <DialogTitle>{milestone ? 'Edit Milestone' : 'Create New Milestone'}</DialogTitle>
          <DialogDescription>
            {milestone ? 'Update milestone details and dependencies' : 'Add a new milestone to your project timeline'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Validation Error Summary */}
          {Object.keys(errors).length > 0 && !errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-semibold text-red-800 mb-1">Please fix the following errors:</p>
              <ul className="text-xs text-red-700 list-disc list-inside space-y-0.5">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-3 py-4">
            {/* Name and Code Row */}
            <div className="grid grid-cols-[1fr_120px] gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="name" className="text-sm">Milestone Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Design Phase Complete"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="code" className="text-sm">Code (max 5)</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="PLN"
                  maxLength={5}
                  className="uppercase"
                />
              </div>
            </div>

            {/* Description - Optional and Collapsible */}
            <details className="group">
              <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900 list-none flex items-center gap-1">
                <span className="transform group-open:rotate-90 transition-transform">▶</span>
                Description (optional)
              </summary>
              <div className="mt-2">
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={2}
                  className="text-sm"
                />
              </div>
            </details>

            {/* Status and Type Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="status" className="text-sm">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              {/* Type Toggle - Inline Radio */}
              <div className="grid gap-1.5">
                <Label className="text-sm">Milestone Type</Label>
                <div className="flex gap-3 items-center h-9">
                  <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                    <input
                      type="radio"
                      checked={!formData.useDuration}
                      onChange={() => setFormData({ ...formData, useDuration: false })}
                      className="w-4 h-4"
                    />
                    <span>Fixed Dates</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                    <input
                      type="radio"
                      checked={formData.useDuration}
                      onChange={() => setFormData({ ...formData, useDuration: true })}
                      className="w-4 h-4"
                    />
                    <span>Duration-based</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Dates or Duration - Compact */}
            {!formData.useDuration ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="startDate" className="text-sm">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={`text-sm ${errors.startDate ? 'border-red-500' : ''}`}
                  />
                  {errors.startDate && <span className="text-xs text-red-500">{errors.startDate}</span>}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="endDate" className="text-sm">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={`text-sm ${errors.endDate ? 'border-red-500' : ''}`}
                  />
                  {errors.endDate && <span className="text-xs text-red-500">{errors.endDate}</span>}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="duration" className="text-sm">Duration (days) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 5"
                    className={`text-sm ${errors.duration ? 'border-red-500' : ''}`}
                  />
                  {errors.duration && <span className="text-xs text-red-500">{errors.duration}</span>}
                </div>

                {/* Start Date Configuration */}
                <div className="grid gap-1.5">
                  <Label className="text-sm">Start Date Calculation</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="radio"
                        checked={formData.startDateType === 'dependency'}
                        onChange={() => setFormData({ ...formData, startDateType: 'dependency', startDate: '' })}
                        className="w-4 h-4"
                      />
                      <span>After dependency completion</span>
                    </label>
                    {formData.startDateType === 'dependency' && (
                      <div className="ml-6 grid gap-1.5">
                        <Label htmlFor="offset" className="text-xs text-gray-600">Days after completion (0 = immediately)</Label>
                        <Input
                          id="offset"
                          type="number"
                          min="0"
                          value={formData.startDateOffset || ''}
                          onChange={(e) => setFormData({ ...formData, startDateOffset: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                          className="text-sm w-32"
                        />
                      </div>
                    )}
                    
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="radio"
                        checked={formData.startDateType === 'custom'}
                        onChange={() => setFormData({ ...formData, startDateType: 'custom', startDateOffset: 0 })}
                        className="w-4 h-4"
                      />
                      <span>Custom start date</span>
                    </label>
                    {formData.startDateType === 'custom' && (
                      <div className="ml-6 grid gap-1.5">
                        <Input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className={`text-sm ${errors.startDate ? 'border-red-500' : ''}`}
                        />
                        {errors.startDate && <span className="text-xs text-red-500">{errors.startDate}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Dependencies - Compact */}
            {formData.useDuration && (
              <div className="grid gap-1.5">
                <Label className="text-sm">Dependencies {availableDependencies.length > 0 && '*'}</Label>
                {availableDependencies.length > 0 ? (
                  <>
                    <div className="border border-gray-200 rounded-md p-2 max-h-32 overflow-y-auto bg-gray-50">
                      {availableDependencies.map((dep) => (
                        <label
                          key={dep._id}
                          className="flex items-center gap-2 py-1 px-1.5 cursor-pointer hover:bg-white rounded text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={formData.dependencies.includes(dep._id)}
                            onChange={() => handleDependencyToggle(dep._id)}
                            className="w-3.5 h-3.5"
                          />
                          <span className="flex-1">{dep.name}</span>
                          {dep.isCritical && (
                            <span className="text-xs text-red-600 font-medium">!</span>
                          )}
                        </label>
                      ))}
                    </div>
                    {errors.dependencies && <span className="text-xs text-red-500">{errors.dependencies}</span>}
                  </>
                ) : (
                  <div className="border border-blue-200 bg-blue-50 rounded-md p-3 text-sm text-blue-700">
                    <p className="font-medium mb-1">First milestone</p>
                    <p className="text-xs">This milestone will automatically start from the project start date.</p>
                  </div>
                )}
              </div>
            )}

            {errors.submit && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
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
