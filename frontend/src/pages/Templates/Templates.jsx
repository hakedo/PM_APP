import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Plus, Circle, CheckCircle2, AlertCircle, Clock, Loader2, X,
  Play, Pause, RotateCcw, Ban, Zap, Star, Flag, Target, TrendingUp,
  Archive, Inbox, Send, FileCheck, FileX, FileClock, Rocket, Sparkles,
  Eye, EyeOff, ThumbsUp, ThumbsDown, CheckCircle, XCircle, AlertTriangle,
  Info, HelpCircle, Lightbulb, Coffee, Flame, Heart, Gift, Award
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

function Templates() {
  const [projectStatuses, setProjectStatuses] = useState([]);
  const [taskStatuses, setTaskStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingStatus, setIsAddingStatus] = useState(false);
  const [statusType, setStatusType] = useState(''); // 'project' or 'task'
  const [newStatus, setNewStatus] = useState({
    name: '',
    color: 'bg-blue-500',
    icon: 'Circle',
  });

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const [projectRes, taskRes] = await Promise.all([
        fetch('http://localhost:5050/templates/project'),
        fetch('http://localhost:5050/templates/task'),
      ]);

      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProjectStatuses(projectData.statuses || []);
      }

      if (taskRes.ok) {
        const taskData = await taskRes.json();
        setTaskStatuses(taskData.statuses || []);
      }
    } catch (error) {
      console.error('Error fetching statuses:', error);
    } finally {
      setLoading(false);
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
    console.log('Submitting status:', newStatus, 'Type:', statusType);
    
    try {
      const response = await fetch(`http://localhost:5050/templates/${statusType}/statuses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStatus),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Status added successfully:', data);
        handleCloseModal();
        fetchStatuses();
      } else {
        const error = await response.text();
        console.error('Error response:', error);
      }
    } catch (error) {
      console.error('Error adding status:', error);
    }
  };

  const handleDeleteStatus = async (type, statusId) => {
    try {
      const response = await fetch(`http://localhost:5050/templates/${type}/statuses/${statusId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchStatuses();
      }
    } catch (error) {
      console.error('Error deleting status:', error);
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Templates</h1>
              </div>
            </div>
            <p className="text-gray-600 ml-[60px]">
              Create and manage reusable templates for your projects
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              New Template
            </Button>
          </motion.div>
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
                  <CardTitle className="text-2xl mb-2">Default Project Statuses</CardTitle>
                  <CardDescription className="text-base">
                    Manage the default statuses that can be used across all projects
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => handleAddStatus('project')}>
                  <Plus className="w-4 h-4" />
                  Add Status
                </Button>
              </div>
            </CardHeader>
            <CardContent>
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
                        onClick={() => handleDeleteStatus('project', status._id)}
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
                  <CardTitle className="text-2xl mb-2">Default Task Statuses</CardTitle>
                  <CardDescription className="text-base">
                    Manage the default statuses that can be used for all tasks
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => handleAddStatus('task')}>
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
                        onClick={() => handleDeleteStatus('task', status._id)}
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

        {/* Add Status Dialog */}
        <Dialog open={isAddingStatus} onOpenChange={setIsAddingStatus}>
          <DialogContent onClose={handleCloseModal}>
            <DialogHeader>
              <DialogTitle>Add New {statusType === 'project' ? 'Project' : 'Task'} Status</DialogTitle>
              <DialogDescription>
                Create a new status for your {statusType === 'project' ? 'projects' : 'tasks'}
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
      </motion.div>
    </div>
  );
}

export default Templates;
