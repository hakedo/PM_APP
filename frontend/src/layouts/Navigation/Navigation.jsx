import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, FolderKanban, Sparkles, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/settings', label: 'Settings', icon: Settings },
];

function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200 flex flex-col z-40">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">PM App</span>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1 h-6 bg-gray-900 rounded-r"
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="text-xs text-gray-400">
          v1.0.0
        </div>
      </div>
    </nav>
  );
}

export default Navigation;