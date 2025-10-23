import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, FolderKanban, Users, Sparkles, Settings, UserCog, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Separator } from '../../components/ui';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/clients', label: 'Clients', icon: Users },
  { path: '/team', label: 'Team', icon: UserCog },
];

const settingsItems = [
  { path: '/templates', label: 'Templates', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200/80 flex flex-col z-40 shadow-sm">
      {/* Header */}
      <div className="flex items-center px-6 py-5 border-b border-gray-200/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-xl flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-lg">PM App</span>
            <p className="text-xs text-gray-500">Project Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</p>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group",
                  isActive
                    ? "bg-gray-900 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
                  isActive && "text-white"
                )} />
                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}

        <Separator className="my-4" />

        <div className="px-3 mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Settings</p>
        </div>
        {settingsItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group",
                  isActive
                    ? "bg-gray-900 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
                  isActive && "text-white"
                )} />
                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200/80 bg-gray-50/50">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">All systems operational</span>
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Version 1.0.0
        </div>
      </div>
    </nav>
  );
}

export default Navigation;