import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Loader2, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { useTemplates } from '../../hooks';

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
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useTemplates();
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) return;

    try {
      await createTemplate({
        name: templateName,
        description: templateDescription
      });
      setIsCreatingTemplate(false);
      setTemplateName('');
      setTemplateDescription('');
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const handleEditTemplate = async () => {
    if (!newTemplateName.trim() || !selectedTemplate) return;

    try {
      await updateTemplate(selectedTemplate._id, {
        name: newTemplateName,
        description: newTemplateDescription
      });
      setIsEditingTemplate(false);
      setSelectedTemplate(null);
      setNewTemplateName('');
      setNewTemplateDescription('');
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      await deleteTemplate(selectedTemplate._id);
      setIsDeletingTemplate(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const openEditDialog = (template) => {
    setSelectedTemplate(template);
    setNewTemplateName(template.name);
    setNewTemplateDescription(template.description || '');
    setIsEditingTemplate(true);
  };

  const openDeleteDialog = (template) => {
    setSelectedTemplate(template);
    setIsDeletingTemplate(true);
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
        <Dialog 
          open={isCreatingTemplate} 
          onOpenChange={(open) => {
            setIsCreatingTemplate(open);
            if (!open) {
              setTemplateName('');
              setTemplateDescription('');
            }
          }}
        >
          <DialogContent
            onClose={() => {
              setIsCreatingTemplate(false);
              setTemplateName('');
              setTemplateDescription('');
            }}
          >
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Give your template a name and description to get started
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
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-description">
                  Description
                </Label>
                <Textarea
                  id="template-description"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Describe what this template is for..."
                  rows={3}
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
                  setTemplateDescription('');
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
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-gray-200 relative">
                  <CardHeader>
                    <CardTitle className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <span className="line-clamp-2 flex-1">{template.name}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(template);
                            }}
                            className="cursor-pointer"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(template);
                            }}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardTitle>
                    {template.description && (
                      <CardDescription className="mt-2 line-clamp-2">
                        {template.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Edit Template Dialog */}
        <Dialog 
          open={isEditingTemplate} 
          onOpenChange={(open) => {
            setIsEditingTemplate(open);
            if (!open) {
              setSelectedTemplate(null);
              setNewTemplateName('');
              setNewTemplateDescription('');
            }
          }}
        >
          <DialogContent
            onClose={() => {
              setIsEditingTemplate(false);
              setSelectedTemplate(null);
              setNewTemplateName('');
              setNewTemplateDescription('');
            }}
          >
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>
                Update your template name and description
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-template-name">
                  Template Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-template-name"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-template-description">
                  Description
                </Label>
                <Textarea
                  id="edit-template-description"
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                  placeholder="Describe what this template is for..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditingTemplate(false);
                  setSelectedTemplate(null);
                  setNewTemplateName('');
                  setNewTemplateDescription('');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditTemplate}
                disabled={!newTemplateName.trim()}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Template Dialog */}
        <Dialog 
          open={isDeletingTemplate} 
          onOpenChange={(open) => {
            setIsDeletingTemplate(open);
            if (!open) setSelectedTemplate(null);
          }}
        >
          <DialogContent
            onClose={() => {
              setIsDeletingTemplate(false);
              setSelectedTemplate(null);
            }}
          >
            <DialogHeader>
              <DialogTitle>Delete Template</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedTemplate?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsDeletingTemplate(false);
                  setSelectedTemplate(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteTemplate}
                variant="destructive"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}

export default Templates;
