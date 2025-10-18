import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, Plus, Circle, CheckCircle2, AlertCircle, Clock, Loader2, X,
  Play, Pause, RotateCcw, Ban, Zap, Star, Flag, Target, TrendingUp,
  Archive, Inbox, Send, FileCheck, FileX, FileClock, Rocket, Sparkles,
  Eye, EyeOff, ThumbsUp, ThumbsDown, CheckCircle, XCircle, AlertTriangle,
  Info, HelpCircle, Lightbulb, Coffee, Flame, Heart, Gift, Award, Layers, Package, ChevronDown, ChevronRight, ArrowLeft
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const iconMap = {
  'Circle': Circle,
  'Clock': Clock,
  'AlertCircle': AlertCircle,
  'CheckCircle2': CheckCircle2,
  'Play': Play,
  'Pause': Pause,
  'RotateCcw': RotateCcw,
  'Ban': Ban,
  'Zap': Zap,
  'Star': Star,
  'Flag': Flag,
  'Target': Target,
  'TrendingUp': TrendingUp,
  'Archive': Archive,
  'Inbox': Inbox,
  'Send': Send,
  'FileCheck': FileCheck,
  'FileX': FileX,
  'FileClock': FileClock,
  'Rocket': Rocket,
  'Sparkles': Sparkles,
  'Eye': Eye,
  'EyeOff': EyeOff,
  'ThumbsUp': ThumbsUp,
  'ThumbsDown': ThumbsDown,
  'CheckCircle': CheckCircle,
  'XCircle': XCircle,
  'AlertTriangle': AlertTriangle,
  'Info': Info,
  'HelpCircle': HelpCircle,
  'Lightbulb': Lightbulb,
  'Coffee': Coffee,
  'Flame': Flame,
  'Heart': Heart,
  'Gift': Gift,
  'Award': Award,
};

const availableColors = [
  { name: 'Gray', value: 'bg-gray-400' },
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
];

const availableIcons = [
  'Circle', 'CheckCircle2', 'CheckCircle', 'XCircle', 
  'Clock', 'Play', 'Pause', 'RotateCcw',
  'AlertCircle', 'AlertTriangle', 'Info', 'HelpCircle',
  'Ban', 'Zap', 'Star', 'Flag',
  'Target', 'TrendingUp', 'Archive', 'Inbox',
  'Send', 'FileCheck', 'FileX', 'FileClock',
  'Rocket', 'Sparkles', 'Eye', 'EyeOff',
  'ThumbsUp', 'ThumbsDown', 'Lightbulb', 'Coffee',
  'Flame', 'Heart', 'Gift', 'Award'
];

function TemplateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [template, setTemplate] = useState(null);
  const [projectStatuses, setProjectStatuses] = useState([]);
  const [taskStatuses, setTaskStatuses] = useState([]);
  const [phases, setPhases] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [expandedDeliverables, setExpandedDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingStatus, setIsAddingStatus] = useState(false);
  const [isAddingPhase, setIsAddingPhase] = useState(false);
  const [isAddingDeliverable, setIsAddingDeliverable] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);
  const [statusType, setStatusType] = useState(''); // 'project' or 'task'
  const [newStatus, setNewStatus] = useState({
    name: '',
    color: 'bg-blue-500',
    icon: 'Circle',
  });
  const [newPhase, setNewPhase] = useState({
    name: '',
    color: 'bg-blue-500',
    icon: 'Circle',
  });
  const [newDeliverable, setNewDeliverable] = useState({
    name: '',
  });
  const [newTask, setNewTask] = useState({
    name: '',
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadTemplate = async () => {
      setLoading(true);
      await fetchTemplate();
      setLoading(false);
    };
    loadTemplate();
  }, [id, refreshKey]);

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`http://localhost:5050/templates/${id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('📥 Fetched template data:', data);
        setTemplate(data);
        setProjectStatuses(data.projectStatuses || []);
        setTaskStatuses(data.taskStatuses || []);
        setPhases(data.phases || []);
        setDeliverables(data.deliverables || []);
        console.log('✅ State updated - Project Statuses:', data.projectStatuses?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching template:', error);
    }
  };

  const handleAddStatus = (type) => {
    setStatusType(type);
    setIsAddingStatus(true);
  };

  const handleCloseModal = () => {
    setIsAddingStatus(false);
    setNewStatus({ name: '', color: 'bg-blue-500', icon: 'Circle' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('📤 Submitting status:', { type: statusType, status: newStatus });
      const response = await fetch(`http://localhost:5050/templates/${id}/${statusType}/statuses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStatus),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Status added, response:', data);
        handleCloseModal();
        setRefreshKey(prev => prev + 1); // Force refresh
      } else {
        const error = await response.text();
        console.error('❌ Error response:', error);
      }
    } catch (error) {
      console.error('Error adding status:', error);
    }
  };

  const handleDeleteStatus = async (type, statusId) => {
    try {
      const response = await fetch(`http://localhost:5050/templates/${id}/${type}/statuses/${statusId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRefreshKey(prev => prev + 1); // Force refresh
      }
    } catch (error) {
      console.error('Error deleting status:', error);
    }
  };

  // Phase handlers
  const handleAddPhase = () => {
    setIsAddingPhase(true);
  };

  const handleClosePhaseModal = () => {
    setIsAddingPhase(false);
    setNewPhase({ name: '', color: 'bg-blue-500', icon: 'Circle' });
  };

  const handleSubmitPhase = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5050/templates/${id}/phase/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPhase),
      });

      if (response.ok) {
        handleClosePhaseModal();
        setRefreshKey(prev => prev + 1); // Force refresh
      }
    } catch (error) {
      console.error('Error adding phase:', error);
    }
  };

  const handleDeletePhase = async (phaseId) => {
    try {
      const response = await fetch(`http://localhost:5050/templates/${id}/phase/items/${phaseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRefreshKey(prev => prev + 1); // Force refresh
      }
    } catch (error) {
      console.error('Error deleting phase:', error);
    }
  };

  // Deliverable handlers
  const handleAddDeliverable = () => {
    setIsAddingDeliverable(true);
  };

  const handleCloseDeliverableModal = () => {
    setIsAddingDeliverable(false);
    setNewDeliverable({ name: '' });
  };

  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5050/templates/${id}/deliverable/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeliverable),
      });

      if (response.ok) {
        handleCloseDeliverableModal();
        setRefreshKey(prev => prev + 1); // Force refresh
      }
    } catch (error) {
      console.error('Error adding deliverable:', error);
    }
  };

  const handleDeleteDeliverable = async (deliverableId) => {
    try {
      const response = await fetch(`http://localhost:5050/templates/${id}/deliverable/items/${deliverableId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRefreshKey(prev => prev + 1); // Force refresh
      }
    } catch (error) {
      console.error('Error deleting deliverable:', error);
    }
  };

  const toggleDeliverable = (deliverableId) => {
    setExpandedDeliverables(prev =>
      prev.includes(deliverableId)
        ? prev.filter(id => id !== deliverableId)
        : [...prev, deliverableId]
    );
  };

  // Task handlers
  const handleAddTask = (deliverable) => {
    setSelectedDeliverable(deliverable);
    setIsAddingTask(true);
  };

  const handleCloseTaskModal = () => {
    setIsAddingTask(false);
    setSelectedDeliverable(null);
    setNewTask({ name: '' });
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5050/templates/${id}/deliverable/items/${selectedDeliverable._id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        handleCloseTaskModal();
        setRefreshKey(prev => prev + 1); // Force refresh
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleDeleteTask = async (deliverableId, taskId) => {
    try {
      const response = await fetch(`http://localhost:5050/templates/${id}/deliverable/items/${deliverableId}/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRefreshKey(prev => prev + 1); // Force refresh
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="gap-2 mb-4" 
            onClick={() => navigate('/templates')}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Templates
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">{template?.name}</h1>
                </div>
              </div>
              <p className="text-gray-600 ml-[60px]">
                Configure project statuses, task statuses, phases, and deliverables
              </p>
            </div>
          </div>
        </div>

        {/* Default Project Statuses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">Project Statuses</CardTitle>
                  <CardDescription className="text-base">
                    Define the statuses that can be used for projects
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => handleAddStatus('projectStatus')}>
                  <Plus className="w-4 h-4" />
                  Add Status
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {projectStatuses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No project statuses yet. Click "Add Status" to create one.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {projectStatuses.map((status, index) => {
                    const Icon = iconMap[status.icon] || Circle;
                    return (
                      <motion.div
                        key={status._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                        className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors bg-white group relative"
                      >
                        <button
                          onClick={() => handleDeleteStatus('projectStatus', status._id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                        >
                          <X className="w-3 h-3 text-gray-500" />
                        </button>
                        <div className={`w-8 h-8 ${status.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-900 text-sm truncate">{status.name}</span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Default Task Statuses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mb-8"
        >
          <Card className="border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">Task Statuses</CardTitle>
                  <CardDescription className="text-base">
                    Define the statuses that can be used for tasks
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => handleAddStatus('taskStatus')}>
                  <Plus className="w-4 h-4" />
                  Add Status
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {taskStatuses.map((status, index) => {
                  const Icon = iconMap[status.icon] || Circle;
                  return (
                    <motion.div
                      key={status._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                      className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors bg-white group relative"
                    >
                      <button
                        onClick={() => handleDeleteStatus('taskStatus', status._id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </button>
                      <div className={`w-8 h-8 ${status.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-900 text-sm truncate">{status.name}</span>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Default Project Phases */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mb-8"
        >
          <Card className="border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                    <Layers className="w-6 h-6" />
                    Project Phases
                  </CardTitle>
                  <CardDescription className="text-base">
                    Define standard phases for project workflows
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleAddPhase}>
                  <Plus className="w-4 h-4" />
                  Add Phase
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {phases.map((phase, index) => {
                  const Icon = iconMap[phase.icon] || Circle;
                  return (
                    <motion.div
                      key={phase._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
                      className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors bg-white group relative"
                    >
                      <button
                        onClick={() => handleDeletePhase(phase._id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </button>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 ${phase.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{phase.name}</h4>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Default Project Deliverables */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="mb-8"
        >
          <Card className="border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                    <Package className="w-6 h-6" />
                    Project Deliverables
                  </CardTitle>
                  <CardDescription className="text-base">
                    Create deliverable templates with default tasks
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleAddDeliverable}>
                  <Plus className="w-4 h-4" />
                  Add Deliverable
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deliverables.map((deliverable, index) => {
                  const isExpanded = expandedDeliverables.includes(deliverable._id);
                  return (
                    <motion.div
                      key={deliverable._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                      className="rounded-lg border border-gray-200 bg-white overflow-hidden"
                    >
                      <div className="p-4 flex items-center justify-between group">
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => toggleDeliverable(deliverable._id)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{deliverable.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {deliverable.defaultTasks?.length || 0} default tasks
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddTask(deliverable)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Add Task
                          </Button>
                          <button
                            onClick={() => handleDeleteDeliverable(deliverable._id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                          >
                            <X className="w-3 h-3 text-gray-500" />
                          </button>
                        </div>
                      </div>
                      
                      {isExpanded && deliverable.defaultTasks && deliverable.defaultTasks.length > 0 && (
                        <div className="px-4 pb-4 pl-12 space-y-2">
                          {deliverable.defaultTasks.map((task) => (
                            <div
                              key={task._id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group/task"
                            >
                              <h5 className="text-sm font-medium text-gray-900">{task.name}</h5>
                              <button
                                onClick={() => handleDeleteTask(deliverable._id, task._id)}
                                className="opacity-0 group-hover/task:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                              >
                                <X className="w-3 h-3 text-gray-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Add Status Dialog */}
        <Dialog open={isAddingStatus} onOpenChange={setIsAddingStatus}>
          <DialogContent onClose={handleCloseModal}>
            <DialogHeader>
              <DialogTitle>Add New {statusType === 'projectStatus' ? 'Project' : 'Task'} Status</DialogTitle>
              <DialogDescription>
                Create a new status for your {statusType === 'projectStatus' ? 'projects' : 'tasks'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Status Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={newStatus.name}
                    onChange={(e) => setNewStatus({ ...newStatus, name: e.target.value })}
                    placeholder="e.g., In Review"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setNewStatus({ ...newStatus, color: color.value })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          newStatus.color === color.value
                            ? 'border-gray-900 scale-105'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-8 h-8 ${color.value} rounded-md mx-auto`} />
                        <p className="text-xs mt-1 text-gray-600">{color.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                    <div className="grid grid-cols-6 gap-1">
                      {availableIcons.map((iconName) => {
                        const IconComponent = iconMap[iconName];
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setNewStatus({ ...newStatus, icon: iconName })}
                            className={`p-2 rounded-md transition-all hover:bg-gray-200 ${
                              newStatus.icon === iconName
                                ? 'bg-blue-100 hover:bg-blue-200'
                                : 'bg-white'
                            }`}
                            title={iconName}
                          >
                            <IconComponent className={`w-5 h-5 mx-auto ${
                              newStatus.icon === iconName ? 'text-blue-600' : 'text-gray-700'
                            }`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">Add Status</Button>
            </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Phase Dialog */}
        <Dialog open={isAddingPhase} onOpenChange={setIsAddingPhase}>
          <DialogContent onClose={handleClosePhaseModal}>
            <DialogHeader>
              <DialogTitle>Add New Project Phase</DialogTitle>
              <DialogDescription>
                Create a new phase for your project workflow
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmitPhase}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="phase-name">
                    Phase Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phase-name"
                    value={newPhase.name}
                    onChange={(e) => setNewPhase({ ...newPhase, name: e.target.value })}
                    placeholder="e.g., Planning"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setNewPhase({ ...newPhase, color: color.value })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          newPhase.color === color.value
                            ? 'border-gray-900 scale-105'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-8 h-8 ${color.value} rounded-md mx-auto`} />
                        <p className="text-xs mt-1 text-gray-600">{color.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                    <div className="grid grid-cols-6 gap-1">
                      {availableIcons.map((iconName) => {
                        const IconComponent = iconMap[iconName];
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setNewPhase({ ...newPhase, icon: iconName })}
                            className={`p-2 rounded-md transition-all hover:bg-gray-200 ${
                              newPhase.icon === iconName
                                ? 'bg-blue-100 hover:bg-blue-200'
                                : 'bg-white'
                            }`}
                            title={iconName}
                          >
                            <IconComponent className={`w-5 h-5 mx-auto ${
                              newPhase.icon === iconName ? 'text-blue-600' : 'text-gray-700'
                            }`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClosePhaseModal}>
                  Cancel
                </Button>
                <Button type="submit">Add Phase</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Deliverable Dialog */}
        <Dialog open={isAddingDeliverable} onOpenChange={setIsAddingDeliverable}>
          <DialogContent onClose={handleCloseDeliverableModal}>
            <DialogHeader>
              <DialogTitle>Add New Deliverable</DialogTitle>
              <DialogDescription>
                Create a new deliverable template
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmitDeliverable}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="deliverable-name">
                    Deliverable Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="deliverable-name"
                    value={newDeliverable.name}
                    onChange={(e) => setNewDeliverable({ ...newDeliverable, name: e.target.value })}
                    placeholder="e.g., Project Charter"
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDeliverableModal}>
                  Cancel
                </Button>
                <Button type="submit">Add Deliverable</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Task Dialog */}
        <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
          <DialogContent onClose={handleCloseTaskModal}>
            <DialogHeader>
              <DialogTitle>Add Default Task</DialogTitle>
              <DialogDescription>
                Add a task to {selectedDeliverable?.name}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmitTask}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="task-name">
                    Task Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="task-name"
                    value={newTask.name}
                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                    placeholder="e.g., Define project scope"
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseTaskModal}>
                  Cancel
                </Button>
                <Button type="submit">Add Task</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}

export default TemplateDetails;
