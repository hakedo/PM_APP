import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../ui';
import { FinanceGroup } from './FinanceGroup';
import { FinanceFormDialog } from './FinanceFormDialog';
import { SubItemFormDialog } from './SubItemFormDialog';
import { financeGroupService, financeItemService } from '@/services';

export function FinancesSection({ projectId }) {
  const [groups, setGroups] = useState([]);
  const [items, setItems] = useState([]);
  const [subItemsMap, setSubItemsMap] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isSubItemDialogOpen, setIsSubItemDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentSubItem, setCurrentSubItem] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      
      // Fetch groups
      const groupsData = await financeGroupService.getByProject(projectId);
      const validGroups = (groupsData || []).filter(g => g && g._id);
      setGroups(validGroups);

      // Fetch items
      const itemsData = await financeItemService.getByProject(projectId);
      setItems(itemsData || []);

      // Fetch sub-items for each item
      const subItemsData = {};
      for (const item of itemsData || []) {
        if (item && item._id) {
          const subItems = await financeItemService.getSubItems(item._id);
          subItemsData[item._id] = subItems || [];
        }
      }
      setSubItemsMap(subItemsData);
      
    } catch (error) {
      console.error('Error fetching finances data:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Group handlers
  const handleAddGroup = async () => {
    const name = prompt('Enter group name:');
    if (!name || !name.trim()) return;
    
    try {
      const newGroup = await financeGroupService.create({
        project: projectId,
        name: name.trim(),
        order: groups.length
      });
      
      if (newGroup && newGroup._id) {
        setGroups([...groups, newGroup]);
      }
    } catch (error) {
      console.error('Error creating finance group:', error);
      alert('Failed to create group. Please try again.');
    }
  };

  const handleUpdateGroupName = async (groupId, newName) => {
    try {
      const updated = await financeGroupService.update(groupId, { name: newName });
      if (updated && updated._id) {
        setGroups(groups.map(g => g._id === groupId ? updated : g));
      }
    } catch (error) {
      console.error('Error updating group name:', error);
    }
  };

  const handleMoveGroup = async (groupId, direction) => {
    const index = groups.findIndex(g => g._id === groupId);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === groups.length - 1)
    ) {
      return;
    }

    const newGroups = [...groups];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newGroups[index], newGroups[newIndex]] = [newGroups[newIndex], newGroups[index]];
    
    setGroups(newGroups);

    try {
      await financeGroupService.reorder(
        projectId,
        newGroups.map(g => g._id)
      );
    } catch (error) {
      console.error('Error reordering groups:', error);
      setGroups(groups);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group? All finance items in this group will also be deleted.')) {
      return;
    }

    try {
      await financeGroupService.delete(groupId);
      setGroups(groups.filter(g => g._id !== groupId));
      setItems(items.filter(item => item.group !== groupId));
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  // Item handlers
  const handleAddItem = (groupId) => {
    setSelectedGroupId(groupId);
    setCurrentItem(null);
    setIsItemDialogOpen(true);
  };

  const handleEditItem = (item) => {
    setSelectedGroupId(item.group);
    setCurrentItem(item);
    setIsItemDialogOpen(true);
  };

  const handleItemSubmit = async (formData) => {
    try {
      if (currentItem) {
        // Update existing item
        const updated = await financeItemService.update(currentItem._id, formData);
        if (updated && updated._id) {
          setItems(items.map(item => item._id === currentItem._id ? updated : item));
        }
      } else {
        // Create new item
        const newItem = await financeItemService.create(formData);
        if (newItem && newItem._id) {
          setItems([...items, newItem]);
          setSubItemsMap({ ...subItemsMap, [newItem._id]: [] });
        }
      }
    } catch (error) {
      console.error('Error saving finance item:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this finance item? All sub-items will also be deleted.')) {
      return;
    }

    try {
      await financeItemService.delete(itemId);
      setItems(items.filter(item => item._id !== itemId));
      const newSubItemsMap = { ...subItemsMap };
      delete newSubItemsMap[itemId];
      setSubItemsMap(newSubItemsMap);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleUpdateItemField = async (itemId, updates) => {
    try {
      const updated = await financeItemService.update(itemId, updates);
      if (updated && updated._id) {
        setItems(items.map(item => item._id === itemId ? updated : item));
      }
    } catch (error) {
      console.error('Error updating item field:', error);
    }
  };

  // Sub-item handlers
  const handleAddSubItem = (itemId) => {
    setSelectedItemId(itemId);
    setCurrentSubItem(null);
    setIsSubItemDialogOpen(true);
  };

  const handleEditSubItem = (itemId, subItem) => {
    setSelectedItemId(itemId);
    setCurrentSubItem(subItem);
    setIsSubItemDialogOpen(true);
  };

  const handleSubItemSubmit = async (formData) => {
    try {
      if (currentSubItem) {
        // Update existing sub-item
        const updated = await financeItemService.updateSubItem(
          selectedItemId,
          currentSubItem._id,
          formData
        );
        if (updated && updated._id) {
          setSubItemsMap({
            ...subItemsMap,
            [selectedItemId]: subItemsMap[selectedItemId].map(sub =>
              sub._id === currentSubItem._id ? updated : sub
            )
          });
        }
      } else {
        // Create new sub-item
        const newSubItem = await financeItemService.createSubItem(selectedItemId, formData);
        if (newSubItem && newSubItem._id) {
          setSubItemsMap({
            ...subItemsMap,
            [selectedItemId]: [...(subItemsMap[selectedItemId] || []), newSubItem]
          });
        }
      }
    } catch (error) {
      console.error('Error saving sub-item:', error);
    }
  };

  const handleToggleSubItem = async (itemId, subItemId, currentStatus) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    
    try {
      const updated = await financeItemService.updateSubItem(itemId, subItemId, {
        status: newStatus
      });
      
      if (updated && updated._id) {
        setSubItemsMap({
          ...subItemsMap,
          [itemId]: subItemsMap[itemId].map(sub =>
            sub._id === subItemId ? updated : sub
          )
        });
      }
    } catch (error) {
      console.error('Error toggling sub-item:', error);
    }
  };

  const handleDeleteSubItem = async (itemId, subItemId) => {
    if (!window.confirm('Are you sure you want to delete this sub-item?')) {
      return;
    }

    try {
      await financeItemService.deleteSubItem(itemId, subItemId);
      setSubItemsMap({
        ...subItemsMap,
        [itemId]: subItemsMap[itemId].filter(sub => sub._id !== subItemId)
      });
    } catch (error) {
      console.error('Error deleting sub-item:', error);
    }
  };

  // Helper to get items by group
  const getItemsByGroup = (groupId) => {
    return items
      .filter(item => item.group === groupId)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Finances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">Loading finances...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Finances ({groups.length})</CardTitle>
          <Button onClick={handleAddGroup} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Group
          </Button>
        </CardHeader>
        
        <CardContent className="p-0">
          {groups.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 mb-4">No finance groups yet. Create your first group to get started.</p>
              <Button onClick={handleAddGroup} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Add First Group
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {groups.map((group, index) => (
                <FinanceGroup
                  key={group._id}
                  group={group}
                  items={getItemsByGroup(group._id)}
                  subItemsMap={subItemsMap}
                  isFirst={index === 0}
                  isLast={index === groups.length - 1}
                  onAddItem={handleAddItem}
                  onEditItem={handleEditItem}
                  onDeleteItem={handleDeleteItem}
                  onAddSubItem={handleAddSubItem}
                  onToggleSubItem={handleToggleSubItem}
                  onEditSubItem={handleEditSubItem}
                  onDeleteSubItem={handleDeleteSubItem}
                  onUpdateItemField={handleUpdateItemField}
                  onUpdateGroupName={handleUpdateGroupName}
                  onMoveGroup={handleMoveGroup}
                  onDeleteGroup={handleDeleteGroup}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <FinanceFormDialog
        isOpen={isItemDialogOpen}
        onClose={() => setIsItemDialogOpen(false)}
        onSubmit={handleItemSubmit}
        item={currentItem}
        groupId={selectedGroupId}
      />

      <SubItemFormDialog
        isOpen={isSubItemDialogOpen}
        onClose={() => setIsSubItemDialogOpen(false)}
        onSubmit={handleSubItemSubmit}
        subItem={currentSubItem}
      />
    </>
  );
}
