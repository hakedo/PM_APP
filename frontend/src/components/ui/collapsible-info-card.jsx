import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Edit2, Save, X, Loader2 } from 'lucide-react';
import { useState } from 'react';

export function CollapsibleInfoCard({
  title,
  icon: Icon,
  subtitle,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  saving,
  children,
  defaultCollapsed = false
}) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <Card className="border-gray-200">
      <CardHeader 
        className="pb-6 cursor-pointer" 
        onClick={() => !isEditing && setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-4">
            {Icon && (
              <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center">
                <Icon className="w-7 h-7 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
            </div>
          </CardTitle>

          <div className="flex items-center gap-3">
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCollapsed(!isCollapsed);
                }}
                className="gap-2 hover:scale-105 transition-all duration-200"
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Expand
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Collapse
                  </>
                )}
              </Button>
            )}

            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel();
                  }}
                  disabled={saving}
                  className="gap-2 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave();
                  }}
                  disabled={saving}
                  className="gap-2 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
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
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="gap-2 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <CardContent className="pt-0">{children}</CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
