import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaList, FaChevronDown } from 'react-icons/fa';
import { List } from '../models/List';
import { ListItem, CreateListItemRequest, UpdateListItemRequest } from '../models/ListItem';
import { getLists, createList } from '../api/list';
import { getListItems, createListItem, updateListItem, deleteListItem } from '../api/listItem';
import ListItemModal from '../components/ListItemModal';
import ListModal from '../components/ListModal';
import { useSelectedStore } from '../auth/useSelectedStore';

export default function ListItems() {
  const { selectedStore } = useSelectedStore();
  const [lists, setLists] = useState<List[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [editingListItem, setEditingListItem] = useState<ListItem | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debug logging
  console.log('ListItems component rendered', { selectedStore, lists, selectedListId });

  // Format phone number function
  const formatPhoneNumber = (phoneNumber: string): string => {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a valid US phone number (10 or 11 digits)
    if (cleaned.length === 10) {
      // Format as (XXX) XXX-XXXX
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      // Format as 1 (XXX) XXX-XXXX
      return `1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 7) {
      // Format as XXX-XXXX
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }
    
    // If it doesn't match standard formats, return as is
    return phoneNumber;
  };

  // Load lists when store changes
  useEffect(() => {
    if (selectedStore !== null) {
      loadLists();
    }
  }, [selectedStore]);

  // Load list items when selected list changes
  useEffect(() => {
    if (selectedListId) {
      loadListItems();
    } else {
      setListItems([]);
      setSelectedList(null);
    }
  }, [selectedListId]);

  const loadLists = async () => {
    if (selectedStore === null) return;
    
    try {
      setLoading(true);
      const listsData = await getLists(selectedStore);
      setLists(listsData || []);
      
      // Auto-select first list if available
      if (listsData && listsData.length > 0 && !selectedListId) {
        setSelectedListId(listsData[0].listid);
        setSelectedList(listsData[0]);
      }
    } catch (error) {
      console.error('Error loading lists:', error);
      setLists([]);
      // Don't show alert for now, just log the error
    } finally {
      setLoading(false);
    }
  };

  const loadListItems = async () => {
    try {
      setLoading(true);
      const itemsData = await getListItems(selectedListId);
      setListItems(itemsData || []);
      
      // Find and set the selected list object
      const list = lists.find(l => l.listid === selectedListId);
      setSelectedList(list || null);
    } catch (error) {
      console.error('Error loading list items:', error);
      setListItems([]);
      // Don't show alert for now, just log the error
    } finally {
      setLoading(false);
    }
  };

  const handleListSelect = (list: List) => {
    setSelectedListId(list.listid);
    setSelectedList(list);
    setShowDropdown(false);
  };

  const handleAddItem = () => {
    setEditingListItem(null);
    setShowModal(true);
  };

  const handleAddList = () => {
    setShowListModal(true);
  };

  const handleEditItem = (listItem: ListItem) => {
    setEditingListItem(listItem);
    setShowModal(true);
  };

  const handleDeleteItem = async (listItemId: string) => {
    if (!confirm('Are you sure you want to delete this list item?')) {
      return;
    }

    try {
      await deleteListItem(listItemId);
      await loadListItems(); // Reload the list
      // alert('List item deleted successfully');
    } catch (error) {
      console.error('Error deleting list item:', error);
      alert('Failed to delete list item');
    }
  };

  const handleSaveItem = async (data: CreateListItemRequest | UpdateListItemRequest) => {
    try {
      if (editingListItem) {
        // Update existing item
        await updateListItem(editingListItem.listitemid!, data as UpdateListItemRequest);
        // alert('List item updated successfully');
      } else {
        // Create new item
        await createListItem(data as CreateListItemRequest);
        // alert('List item created successfully');
      }
      
      setShowModal(false);
      setEditingListItem(null);
      await loadListItems(); // Reload the list
    } catch (error) {
      console.error('Error saving list item:', error);
      alert('Failed to save list item');
    }
  };

  const handleCancelModal = () => {
    setShowModal(false);
    setEditingListItem(null);
  };

  const handleSaveList = async (listData: {
    storenumber: number;
    listname: string;
    description?: string;
    datatype?: string;
    createdby: string;
  }) => {
    try {
      await createList(listData);
      setShowListModal(false);
      await loadLists(); // Reload the lists
      alert('List created successfully');
    } catch (error) {
      console.error('Error creating list:', error);
      alert('Failed to create list');
    }
  };

  const handleCancelListModal = () => {
    setShowListModal(false);
  };

  if (selectedStore === null) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Please select a store to manage list items.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">List Management</h1>
          <p className="text-gray-600">Manage items for your lists</p>
        </div>
      </div>

      {/* List Selection */}
      <div className="mb-6">
        <div className="flex justify-between items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select List
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
              >
                <span className={selectedList ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedList ? selectedList.listname : 'Select a list...'}
                </span>
                <FaChevronDown className={`text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {lists.map((list) => (
                    <button
                      key={list.listid}
                      type="button"
                      onClick={() => handleListSelect(list)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${
                        selectedListId === list.listid ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                      }`}
                    >
                      <div className="font-medium">{list.listname}</div>
                      {list.datatype && (
                        <div className="text-xs text-gray-500">{list.datatype}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleAddList}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 whitespace-nowrap"
          >
            <FaPlus />
            Add New List
          </button>
        </div>
      </div>

      {/* List Items Table */}
      {selectedListId && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedList?.listname} - Items ({listItems.length})
                </h2>
                {selectedList?.datatype && (
                  <p className="text-sm text-gray-600 mt-1">{selectedList.datatype}</p>
                )}
              </div>
              <button
                onClick={handleAddItem}
                disabled={!selectedListId}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaPlus />
                Add List Item
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500">
              Loading list items...
            </div>
          ) : listItems.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No items found for this list. Click "Add Item" to create your first item.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {listItems.map((item) => (
                    <tr key={item.listitemid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.itemname}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={item.itemvalue}>
                          {selectedList?.datatype === 'PHONE' ? formatPhoneNumber(item.itemvalue) : item.itemvalue}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.createdon ? new Date(item.createdon).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Edit"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.listitemid!)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* List Item Modal */}
      {showModal && selectedListId && selectedStore !== null && (
        <ListItemModal
          listItem={editingListItem}
          listId={selectedListId}
          storeNumber={selectedStore}
          list={selectedList}
          onSave={handleSaveItem}
          onDelete={handleDeleteItem}
          onCancel={handleCancelModal}
        />
      )}

      {/* List Modal */}
      {showListModal && selectedStore !== null && (
        <ListModal
          storeNumber={selectedStore}
          onSave={handleSaveList}
          onCancel={handleCancelListModal}
        />
      )}
    </div>
  );
} 