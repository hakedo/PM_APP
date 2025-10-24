import { Button } from './button';

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction} 
          size="lg"
          className="gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
