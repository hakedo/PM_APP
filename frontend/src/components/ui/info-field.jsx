import { Input } from '../ui/input';

export function InfoField({ 
  icon: Icon, 
  label, 
  value, 
  isEditing, 
  name, 
  editValue, 
  onChange,
  type = "text",
  placeholder,
  maxLength,
  multiline = false
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </h3>
      </div>
      {isEditing ? (
        <Input
          name={name}
          type={type}
          value={editValue}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className="pl-7 border-gray-300"
        />
      ) : (
        <p className="text-gray-900 font-medium pl-7">
          {value || 'Not set'}
        </p>
      )}
    </div>
  );
}
