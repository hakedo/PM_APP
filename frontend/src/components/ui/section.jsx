import { Card, CardContent, CardHeader, CardTitle } from './card';
import { motion } from 'framer-motion';

export function Section({ 
  title, 
  icon: Icon, 
  count, 
  actions, 
  children,
  className = "",
  delay = 0
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={className}
    >
      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              {Icon && <Icon className="w-6 h-6" />}
              <span>
                {title}
                {count !== undefined && ` (${count})`}
              </span>
            </CardTitle>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}
