import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTag } from 'react-icons/fa';
import { ExpenseCategory, CreateExpenseCategoryRequest, UpdateExpenseCategoryRequest } from '../models/ExpenseCategory';
import { getExpenseCategories, createExpenseCategory, updateExpenseCategory, deleteExpenseCategory } from '../api/expenseCategory';
import ExpenseCategoryModal from '../components/ExpenseCategoryModal';
import { useSelectedStore } from '../auth/useSelectedStore';

export default function ExpenseCategories() {
  const { selectedStore } = useSelectedStore();
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);

  // Load categories when store changes
  useEffect(() => {
    if (selectedStore !== null) {
      loadCategories();
    }
  }, [selectedStore]);

  const loadCategories = async () => {
    if (selectedStore === null) return;
    
    try {
      setLoading(true);
      const categoriesData = await getExpenseCategories(selectedStore);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEditCategory = (category: ExpenseCategory) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This will affect all expenses using this category.')) {
      return;
    }

    try {
      await deleteExpenseCategory(categoryId);
      await loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const handleSaveCategory = async (data: CreateExpenseCategoryRequest | UpdateExpenseCategoryRequest) => {
    try {
      if (editingCategory) {
        // Update existing category
        await updateExpenseCategory(editingCategory.expensecategoryid!, data as UpdateExpenseCategoryRequest);
      } else {
        // Create new category
        await createExpenseCategory(data as CreateExpenseCategoryRequest);
      }
      
      setShowModal(false);
      setEditingCategory(null);
      await loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  };

  const handleCancelModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  // Format timestamp in local timezone
  const formatTimestamp = (dateStr: string): string => {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${month}/${day}/${year} ${displayHours}:${minutes}:${seconds} ${ampm}`;
  };

  if (selectedStore === null) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Please select a store to manage expense categories.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Categories</h1>
          <p className="text-gray-600">Manage expense categories for your store</p>
        </div>
        <button
          onClick={handleAddCategory}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus />
          Add Category
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaTag className="text-blue-600 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Categories</p>
            <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Category List</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No categories found. Click "Add Category" to create your first expense category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
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
                {categories.map((category) => (
                  <tr key={category.expensecategoryid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.expensecategoryname}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate" title={category.expensecategorydescription}>
                        {category.expensecategorydescription || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.createdon ? formatTimestamp(category.createdon) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.expensecategoryid!)}
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

      {/* Category Modal */}
      {showModal && selectedStore !== null && (
        <ExpenseCategoryModal
          category={editingCategory}
          storeNumber={selectedStore}
          onSave={handleSaveCategory}
          onDelete={handleDeleteCategory}
          onCancel={handleCancelModal}
        />
      )}
    </div>
  );
} 