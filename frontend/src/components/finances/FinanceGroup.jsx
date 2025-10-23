import { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, MoreVertical, Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { 
  Button, 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  Input
} from '../ui';
import { FinanceRow } from './FinanceRow';

export function FinanceGroup({
  group,
  items = [],
  subItemsMap = {},
  isFirst,
  isLast,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onAddSubItem,
  onToggleSubItem,
  onEditSubItem,
  onDeleteSubItem,
  onUpdateItemField,
  onUpdateGroupName,
  onMoveGroup,
  onDeleteGroup
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(group.name);

  const handleNameDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditingName(true);
  };

  const handleNameChange = (e) => {
    setEditedName(e.target.value);
  };

  const handleNameBlur = () => {
    if (editedName.trim() && editedName !== group.name) {
      onUpdateGroupName(group._id, editedName.trim());
    } else {
      setEditedName(group.name);
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setEditedName(group.name);
      setIsEditingName(false);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Calculate totals
  const totalIncome = items
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + (item.amount || 0), 0);
  
  const totalExpense = items
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + (item.amount || 0), 0);

  const netTotal = totalIncome - totalExpense;

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      {/* Group Header */}
      <div 
        onClick={toggleExpanded}
        className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer group"
      >
        {/* Expand/Collapse Icon */}
        <div className="flex items-center justify-center w-6 h-6">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          )}
        </div>

        {/* Group Name */}
        <div className="flex-1 flex items-center gap-3">
          {isEditingName ? (
            <Input
              value={editedName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              className="h-7 font-semibold text-gray-900 max-w-xs"
            />
          ) : (
            <span 
              onDoubleClick={handleNameDoubleClick}
              className="font-semibold text-gray-900"
            >
              {group.name}
            </span>
          )}

          {/* Totals */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-600 font-medium">
              Income: ${totalIncome.toFixed(2)}
            </span>
            <span className="text-red-600 font-medium">
              Expense: ${totalExpense.toFixed(2)}
            </span>
            <span className={`font-semibold ${netTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Net: ${netTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {/* Add Item Button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddItem(group._id);
            }}
            className="h-7 w-7 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>

          {/* Move Up/Down Buttons */}
          <div className="flex items-center border border-gray-300 rounded divide-x divide-gray-300">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onMoveGroup(group._id, 'up');
              }}
              disabled={isFirst}
              className="h-7 w-7 p-0 rounded-r-none hover:bg-gray-300"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onMoveGroup(group._id, 'down');
              }}
              disabled={isLast}
              className="h-7 w-7 p-0 rounded-l-none hover:bg-gray-300"
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
          </div>

          {/* More Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon-sm"
                className="h-7 w-7 p-0"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDeleteGroup(group._id)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Finance Items */}
      {isExpanded && (
        <div>
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3">No finance items yet</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onAddItem(group._id)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add First Item
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <FinanceRow
                key={item._id}
                item={item}
                subItems={subItemsMap[item._id] || []}
                onEdit={onEditItem}
                onDelete={onDeleteItem}
                onAddSubItem={onAddSubItem}
                onToggleSubItem={onToggleSubItem}
                onEditSubItem={onEditSubItem}
                onDeleteSubItem={onDeleteSubItem}
                onUpdateField={onUpdateItemField}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
