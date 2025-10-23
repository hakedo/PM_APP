import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, User, Bell, Lock, Palette, FileText, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Separator } from '../../components/ui';

const settingsSections = [
  {
    icon: User,
    title: 'Profile',
    description: 'Manage your account settings and preferences',
    path: null,
    badge: 'Coming Soon',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Configure how you receive updates',
    path: null,
    badge: 'Coming Soon',
  },
  {
    icon: Lock,
    title: 'Privacy & Security',
    description: 'Control your privacy and security settings',
    path: null,
    badge: 'Coming Soon',
  },
  {
    icon: Palette,
    title: 'Appearance',
    description: 'Customize how your workspace looks',
    path: null,
    badge: 'Coming Soon',
  },
  {
    icon: FileText,
    title: 'Templates',
    description: 'Create and manage reusable project templates',
    path: '/templates',
    badge: null,
  },
];

function Settings() {
  const navigate = useNavigate();

  const handleSectionClick = (path) => {
    if (path) {
      navigate(path);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
              <SettingsIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Settings Sections */}
        <div className="grid gap-4">
          {settingsSections.map((section, index) => {
            const Icon = section.icon;
            const isDisabled = !section.path;
            
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.1 + index * 0.05,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                <Card 
                  className={`transition-all border-gray-200 ${
                    isDisabled 
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'hover:shadow-lg hover:border-gray-300 cursor-pointer'
                  }`}
                  onClick={() => !isDisabled && handleSectionClick(section.path)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                          isDisabled ? 'bg-gray-100' : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                          <Icon className="w-6 h-6 text-gray-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <CardTitle className="text-xl">{section.title}</CardTitle>
                            {section.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {section.badge}
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-base">
                            {section.description}
                          </CardDescription>
                        </div>
                      </div>
                      {!isDisabled && (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

export default Settings;
