import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaTrash } from 'react-icons/fa';
import { ExpenseCategory, CreateExpenseCategoryRequest, UpdateExpenseCategoryRequest } from '../models/ExpenseCategory';

interface ExpenseCategoryModalProps {
  category?: ExpenseCategory | null;
  storeNumber: number;
  onSave: (data: CreateExpenseCategoryRequest | UpdateExpenseCategoryRequest) => void;
  onDelete?: (categoryId: string) => void;
  onCancel: () => void;
}

export default function ExpenseCategoryModal({ 
  category, 
  storeNumber,
  onSave, 
  onDelete, 
  onCancel 
}: ExpenseCategoryModalProps) {
  const [formData, setFormData] = useState({
    expensecategoryname: '',
    expensecategorydescription: ''
  });

  const isEditing = !!category;

  useEffect(() => {
    if (category) {
      setFormData({
        expensecategoryname: category.expensecategoryname,
        expensecategorydescription: category.expensecategorydescription
      });
    } else {
      setFormData({
        expensecategoryname: '',
        expensecategorydescription: ''
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.expensecategoryname.trim()) {
      alert('Please enter a category name');
      return;
    }

    if (isEditing) {
      // Update existing category
      const updateData: UpdateExpenseCategoryRequest = {
        expensecategoryname: formData.expensecategoryname.trim(),
        expensecategorydescription: formData.expensecategorydescription.trim()
      };
      onSave(updateData);
    } else {
      // Create new category
      const createData: CreateExpenseCategoryRequest = {
        storenumber: storeNumber,
        expensecategoryname: formData.expensecategoryname.trim(),
        expensecategorydescription: formData.expensecategorydescription.trim(),
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
            {isEditing ? 'Edit Category' : 'Add Category'}
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
            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                name="expensecategoryname"
                value={formData.expensecategoryname}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter category name"
                required
              />
            </div>

            {/* Category Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="expensecategorydescription"
                value={formData.expensecategorydescription}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter category description (optional)"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(category!.expensecategoryid!)}
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