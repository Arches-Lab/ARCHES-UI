import { useState } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';

interface ListModalProps {
  storeNumber: number;
  onSave: (listData: {
    storenumber: number;
    listname: string;
    description?: string;
    datatype?: string;
    createdby: string;
  }) => void;
  onCancel: () => void;
}

export default function ListModal({ 
  storeNumber,
  onSave, 
  onCancel 
}: ListModalProps) {
  const [formData, setFormData] = useState({
    listname: '',
    description: '',
    datatype: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.listname.trim()) {
      alert('Please enter a list name');
      return;
    }

    const listData = {
      storenumber: storeNumber,
      listname: formData.listname.trim(),
      description: formData.description.trim() || undefined,
      datatype: formData.datatype.trim() || undefined,
      createdby: 'current-user' // This should come from auth context
    };

    onSave(listData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const datatypeOptions = [
    { value: '', label: 'Select data type (optional)' },
    { value: 'PHONE', label: 'Phone Number' },
    { value: 'EMAIL', label: 'Email Address' },
    { value: 'ADDRESS', label: 'Address' },
    { value: 'DATE', label: 'Date' },
    { value: 'NUMBER', label: 'Number' },
    { value: 'TEXT', label: 'Text' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Create New List
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
            {/* List Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                List Name *
              </label>
              <input
                type="text"
                name="listname"
                value={formData.listname}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter list name"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter description (optional)"
              />
            </div>

            {/* Data Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Type
              </label>
              <select
                name="datatype"
                value={formData.datatype}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {datatypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                This will affect how values are displayed (e.g., phone numbers will be formatted)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <FaSave />
              Create List
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