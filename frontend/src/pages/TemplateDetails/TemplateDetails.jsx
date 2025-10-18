import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Loader2, Edit2, Save, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { useTemplate } from '../../hooks';
import { templateService } from '../../services';

function TemplateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { template, loading, refetch } = useTemplate(id);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleEdit = () => {
    setEditedTemplate({
      name: template.name,
      description: template.description || ''
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTemplate(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await templateService.update(id, {
        name: editedTemplate.name,
        description: editedTemplate.description
      });
      await refetch();
      setIsEditing(false);
      setEditedTemplate(null);
    } catch (error) {
      console.error('Failed to update template:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Template not found</h2>
          <p className="text-gray-600 mb-6">The template you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/templates')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/templates')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Input
                        value={editedTemplate.name}
                        onChange={(e) => setEditedTemplate({ ...editedTemplate, name: e.target.value })}
                        className="text-3xl font-bold border-gray-300 shadow-none px-3 focus-visible:ring-1 focus-visible:ring-gray-400"
                        placeholder="Template name"
                      />
                    </div>
                    <div>
                      <Textarea
                        value={editedTemplate.description}
                        onChange={(e) => setEditedTemplate({ ...editedTemplate, description: e.target.value })}
                        className="min-h-[80px] resize-none border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-400"
                        placeholder="Template description"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
                    {template.description && (
                      <p className="text-gray-600 mt-2">{template.description}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={saving}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving || !editedTemplate.name.trim()}
                    className="gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Template
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default TemplateDetails;
