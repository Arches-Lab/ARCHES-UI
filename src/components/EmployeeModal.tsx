import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaUser, FaEnvelope, FaBuilding } from 'react-icons/fa';
import { Employee } from '../models';
import { EMPLOYEE_ROLES } from '../models/EmployeeRoles';

interface EmployeeModalProps {
  employee?: Employee | null;
  onSave: (employeeData: {
    firstname: string;
    lastname: string;
    email: string;
    role?: string;
    active: boolean;
  }) => void;
  onCancel: () => void;
  selectedStore: number;
}

export default function EmployeeModal({ employee, onSave, onCancel, selectedStore }: EmployeeModalProps) {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    role: 'ASSOCIATE',
    active: true
  });

  const isEditing = !!employee;

  useEffect(() => {
    if (employee) {
      setFormData({
        firstname: employee.firstname,
        lastname: employee.lastname,
        email: employee.email,
        role: employee.role || 'ASSOCIATE',
        active: employee.active
      });
    }
  }, [employee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstname.trim()) {
      alert('First name is required');
      return;
    }

    if (!formData.lastname.trim()) {
      alert('Last name is required');
      return;
    }

    if (!formData.email.trim()) {
      alert('Email is required');
      return;
    }

    onSave({
      ...formData
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FaUser className="text-2xl text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Employee' : 'Create New Employee'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="firstname"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter first name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter last name"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Work Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {EMPLOYEE_ROLES.map((role) => (
                    <option key={role.code} value={role.code}>
                      {role.displayName}
                    </option>
                  ))}
                </select>
              </div>


            </div>
          </div>

          {/* Status */}
          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                Active Employee
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Active employees can log in and access the system
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <FaSave className="w-4 h-4" />
              {isEditing ? 'Update Employee' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 