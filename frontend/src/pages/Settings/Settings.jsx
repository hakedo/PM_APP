import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, User, Bell, Lock, Palette, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

const settingsSections = [
  {
    icon: User,
    title: 'Profile',
    description: 'Manage your account settings and preferences',
    path: null,
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Configure how you receive updates',
    path: null,
  },
  {
    icon: Lock,
    title: 'Privacy & Security',
    description: 'Control your privacy and security settings',
    path: null,
  },
  {
    icon: Palette,
    title: 'Appearance',
    description: 'Customize how your workspace looks',
    path: null,
  },
  {
    icon: FileText,
    title: 'Templates',
    description: 'Create and manage reusable project templates',
    path: '/templates',
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
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
            </div>
          </div>
          <p className="text-gray-600 ml-[60px]">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Settings Sections */}
        <div className="grid gap-4">
          {settingsSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.2 + index * 0.1,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer border-gray-200"
                  onClick={() => handleSectionClick(section.path)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-gray-700" />
                      </div>
                      <div>
                        <CardTitle className="text-xl mb-1">{section.title}</CardTitle>
                        <CardDescription className="text-base">
                          {section.description}
                        </CardDescription>
                      </div>
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
