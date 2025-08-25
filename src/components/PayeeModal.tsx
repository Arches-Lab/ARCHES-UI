import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaTrash } from 'react-icons/fa';
import { Payee, CreatePayeeRequest, UpdatePayeeRequest } from '../models/Payee';
import { PAYEE_CATEGORY_TYPES } from '../models/PayeeCategoryTypes';

interface PayeeModalProps {
  payee?: Payee | null;
  storeNumber: number;
  onSave: (data: CreatePayeeRequest | UpdatePayeeRequest) => void;
  onDelete?: (payeeId: string) => void;
  onCancel: () => void;
}

export default function PayeeModal({ 
  payee, 
  storeNumber,
  onSave, 
  onDelete, 
  onCancel 
}: PayeeModalProps) {
  const [formData, setFormData] = useState({
    payeename: '',
    category: ''
  });

  const isEditing = !!payee;

  // Use payee categories from the model
  const payeeCategories = PAYEE_CATEGORY_TYPES;

  useEffect(() => {
    if (payee) {
      setFormData({
        payeename: payee.payeename,
        category: payee.category
      });
    } else {
      setFormData({
        payeename: '',
        category: ''
      });
    }
  }, [payee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.payeename.trim()) {
      alert('Please enter a payee name');
      return;
    }

    if (!formData.category.trim()) {
      alert('Please select a category');
      return;
    }

    if (isEditing) {
      // Update existing payee
      const updateData: UpdatePayeeRequest = {
        payeename: formData.payeename.trim(),
        category: formData.category.trim()
      };
      onSave(updateData);
    } else {
      // Create new payee
      const createData: CreatePayeeRequest = {
        storenumber: storeNumber,
        payeename: formData.payeename.trim(),
        category: formData.category.trim(),
        createdby: 'current-user' // This should come from auth context
      };
      onSave(createData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
            {isEditing ? 'Edit Payee' : 'Add Payee'}
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
            {/* Payee Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payee Name *
              </label>
              <input
                type="text"
                name="payeename"
                value={formData.payeename}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter payee name"
                required
              />
            </div>

            {/* Payee Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a category</option>
                {payeeCategories.map((category) => (
                  <option key={category.code} value={category.code}>
                    {category.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(payee!.payeeid!)}
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