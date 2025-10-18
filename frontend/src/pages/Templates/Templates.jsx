import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5050/templates');
      if (response.ok) {
        const data = await response.json();
        console.log('📥 Fetched templates:', data);
        // Filter to only show named templates (not legacy type-based ones)
        const namedTemplates = data.filter(t => t.name);
        setTemplates(namedTemplates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) return;

    try {
      const response = await fetch('http://localhost:5050/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: templateName }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Template created:', data);
        // Close dialog and reset form
        setIsCreatingTemplate(false);
        setTemplateName('');
        // Refresh the templates list
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error creating template:', error);
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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Templates</h1>
            <p className="text-gray-600">Create and manage reusable templates for your projects</p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button size="lg" className="gap-2" onClick={() => setIsCreatingTemplate(true)}>
              <Plus className="w-4 h-4" />
              Create Template
            </Button>
          </motion.div>
        </div>

        {/* Content will go here */}

        {/* Create Template Dialog */}
        <Dialog open={isCreatingTemplate} onOpenChange={setIsCreatingTemplate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Give your template a name to get started
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">
                  Template Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Website Development Template"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateTemplate();
                    }
                  }}
                  autoFocus
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsCreatingTemplate(false);
                  setTemplateName('');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTemplate}
                disabled={!templateName.trim()}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first template</p>
            <Button onClick={() => setIsCreatingTemplate(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Template
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {templates.map((template) => (
              <motion.div
                key={template._id}
                variants={itemVariants}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full cursor-pointer hover:shadow-xl transition-all duration-300 border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <span className="line-clamp-2">{template.name}</span>
                    </CardTitle>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default Templates;
