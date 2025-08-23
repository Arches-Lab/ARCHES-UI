import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaEdit, FaTrash } from 'react-icons/fa';
import { ListItem, CreateListItemRequest, UpdateListItemRequest } from '../models/ListItem';
import { List } from '../models/List';

interface ListItemModalProps {
  listItem?: ListItem | null;
  listId: string;
  storeNumber: number;
  list?: List | null;
  onSave: (data: CreateListItemRequest | UpdateListItemRequest) => void;
  onDelete?: (listItemId: string) => void;
  onCancel: () => void;
}

export default function ListItemModal({ 
  listItem, 
  listId, 
  storeNumber,
  list,
  onSave, 
  onDelete, 
  onCancel 
}: ListItemModalProps) {
  const [formData, setFormData] = useState({
    itemname: '',
    itemvalue: ''
  });

  const isEditing = !!listItem;

  // Validation functions
  const validatePhone = (value: string): boolean => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length === 10 || cleaned.length === 11;
  };

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validateDate = (value: string): boolean => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  };

  const validateNumber = (value: string): boolean => {
    return !isNaN(Number(value)) && value.trim() !== '';
  };

  const validateValue = (value: string, datatype?: string): { isValid: boolean; message: string } => {
    if (!datatype || datatype === 'TEXT') {
      return { isValid: true, message: '' };
    }

    switch (datatype) {
      case 'PHONE':
        if (!validatePhone(value)) {
          return { 
            isValid: false, 
            message: 'Phone number must be 10-11 digits (e.g., 5551234567 or 15551234567)' 
          };
        }
        break;
      case 'EMAIL':
        if (!validateEmail(value)) {
          return { 
            isValid: false, 
            message: 'Please enter a valid email address (e.g., user@example.com)' 
          };
        }
        break;
      case 'DATE':
        if (!validateDate(value)) {
          return { 
            isValid: false, 
            message: 'Please enter a valid date (e.g., 2024-01-15)' 
          };
        }
        break;
      case 'NUMBER':
        if (!validateNumber(value)) {
          return { 
            isValid: false, 
            message: 'Please enter a valid number' 
          };
        }
        break;
    }

    return { isValid: true, message: '' };
  };

  useEffect(() => {
    if (listItem) {
      setFormData({
        itemname: listItem.itemname,
        itemvalue: listItem.itemvalue
      });
    } else {
      setFormData({
        itemname: '',
        itemvalue: ''
      });
    }
  }, [listItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.itemname.trim()) {
      alert('Please enter an item name');
      return;
    }

    if (!formData.itemvalue.trim()) {
      alert('Please enter an item value');
      return;
    }

    // Validate based on datatype
    const validation = validateValue(formData.itemvalue.trim(), list?.datatype);
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    if (isEditing) {
      // Update existing list item
      const updateData: UpdateListItemRequest = {
        itemname: formData.itemname.trim(),
        itemvalue: formData.itemvalue.trim()
      };
      onSave(updateData);
    } else {
      // Create new list item
      const createData: CreateListItemRequest = {
        listid: listId,
        storenumber: storeNumber,
        itemname: formData.itemname.trim(),
        itemvalue: formData.itemvalue.trim(),
        createdby: 'current-user' // This should come from auth context
      };
      onSave(createData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Edit List Item' : 'Add List Item'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                name="itemname"
                value={formData.itemname}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter item name"
                required
              />
            </div>

            {/* Item Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Value *
              </label>
              {list?.datatype && list.datatype !== 'TEXT' && (
                <p className="text-xs text-gray-500 mb-2">
                  Expected format: {
                    list.datatype === 'PHONE' ? '10-11 digits (e.g., 5551234567)' :
                    list.datatype === 'EMAIL' ? 'email@example.com' :
                    list.datatype === 'DATE' ? 'YYYY-MM-DD (e.g., 2024-01-15)' :
                    list.datatype === 'NUMBER' ? 'numeric value (e.g., 123.45)' :
                    'any text'
                  }
                </p>
              )}
              {list?.datatype === 'DATE' ? (
                <input
                  type="date"
                  name="itemvalue"
                  value={formData.itemvalue}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              ) : list?.datatype === 'NUMBER' ? (
                <input
                  type="number"
                  name="itemvalue"
                  value={formData.itemvalue}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter numeric value"
                  required
                />
              ) : (
                <textarea
                  name="itemvalue"
                  value={formData.itemvalue}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    list?.datatype === 'PHONE' ? 'Enter phone number (e.g., 5551234567)' :
                    list?.datatype === 'EMAIL' ? 'Enter email address (e.g., user@example.com)' :
                    'Enter item value'
                  }
                  required
                />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(listItem!.listitemid!)}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaTrash />
                Delete
              </button>
            )}
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <FaSave />
              {isEditing ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 