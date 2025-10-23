import { useState } from 'react';
import { ChevronRight, ChevronDown, MoreVertical, Plus, Edit2, Trash2, Check, Circle } from 'lucide-react';
import { 
  Badge, 
  Button, 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  Checkbox,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui';
import { cn } from '@/lib/utils';
import { formatDateDisplay } from '@/utils/dateUtils';

const statusConfig = {
  'pending': { label: 'Pending', variant: 'secondary', color: 'text-gray-600' },
  'paid': { label: 'Paid', variant: 'default', color: 'text-green-600' },
  'overdue': { label: 'Overdue', variant: 'destructive', color: 'text-red-600' }
};

const typeConfig = {
  'income': { label: 'Income', color: 'text-green-600' },
  'expense': { label: 'Expense', color: 'text-red-600' }
};

export function FinanceRow({ 
  item, 
  subItems = [],
  onEdit, 
  onDelete, 
  onAddSubItem,
  onToggleSubItem,
  onEditSubItem,
  onDeleteSubItem,
  onUpdateField
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const completedSubItems = subItems.filter(s => s.status === 'paid').length;
  const totalSubItems = subItems.length;

  const handleFieldUpdate = (field, value) => {
    if (onUpdateField) {
      onUpdateField(item._id, { [field]: value });
    }
  };

  return (
    <div className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50 transition-colors">
      {/* Finance Item Row */}
      <div className="flex items-center gap-2 px-4 py-3 group">
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center w-6 h-6 hover:bg-gray-200 rounded transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Name */}
        <div className="flex-1 min-w-0 font-medium text-gray-900">
          {item.name}
        </div>

        {/* Amount */}
        <div className="w-32">
          <Input
            value={item.amount || 0}
            onChange={(e) => handleFieldUpdate('amount', parseFloat(e.target.value) || 0)}
            onBlur={(e) => handleFieldUpdate('amount', parseFloat(e.target.value) || 0)}
            type="number"
            className="h-7 border-0 shadow-none hover:bg-gray-100 focus:bg-white focus:border focus:border-gray-200 text-sm"
          />
        </div>

        {/* Type */}
        <div className="w-24">
          <Select
            value={item.type}
            onValueChange={(value) => handleFieldUpdate('type', value)}
          >
            <SelectTrigger className="h-7 border-0 shadow-none hover:bg-gray-100">
              <span className={cn("text-xs font-medium", typeConfig[item.type]?.color)}>
                {typeConfig[item.type]?.label}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="w-32">
          <Select
            value={item.status}
            onValueChange={(value) => handleFieldUpdate('status', value)}
          >
            <SelectTrigger className="h-7 border-0 shadow-none hover:bg-gray-100">
              <Badge 
                variant={statusConfig[item.status].variant}
                className={cn("text-xs pointer-events-none", statusConfig[item.status].color)}
              >
                {statusConfig[item.status].label}
              </Badge>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sub-items Count */}
        <div className="w-20 text-xs text-gray-500">
          {completedSubItems}/{totalSubItems}
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon-sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAddSubItem(item._id)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Sub-item
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(item._id)}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Expanded Sub-items */}
      {isExpanded && (
        <div className="bg-gray-50/50 border-t border-gray-200">
          {subItems.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-500 mb-3">No sub-items yet</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onAddSubItem(item._id)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add First Sub-item
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {subItems.map((subItem) => (
                <div 
                  key={subItem._id}
                  className="flex items-center gap-2 px-4 py-2 pl-12 hover:bg-gray-100/50 transition-colors group"
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={subItem.status === 'paid'}
                    onCheckedChange={() => onToggleSubItem(item._id, subItem._id, subItem.status)}
                    className="flex-shrink-0"
                  />

                  {/* Sub-item Name */}
                  <div className={cn(
                    "flex-1 min-w-0 text-sm",
                    subItem.status === 'paid' ? "line-through text-gray-500" : "text-gray-900"
                  )}>
                    {subItem.name}
                  </div>

                  {/* Amount */}
                  <div className="w-32 text-sm text-gray-600">
                    ${subItem.amount.toFixed(2)}
                  </div>

                  {/* Status Icon */}
                  <div className="w-20 flex items-center justify-center">
                    {subItem.status === 'paid' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {/* Sub-item Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon-sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditSubItem(item._id, subItem)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDeleteSubItem(item._id, subItem._id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
