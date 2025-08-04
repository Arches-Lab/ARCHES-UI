import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaUser, FaStore, FaLightbulb, FaAlignLeft, FaPhone, FaEnvelope, FaFlag } from 'react-icons/fa';
import { getEmployees, createLead, updateLead } from '../api';
import { Lead, Employee, getLeadStatusDisplayName, LEAD_STATUSES } from '../models';
import { useStore } from '../auth/StoreContext';

interface LeadModalProps {
  lead?: Lead | null;
  onSave: (leadData: {
    description: string;
    contactname: string;
    phone: string;
    email: string;
    status: string;
    assignedto: string;
    storenumber: number;
  }) => void;
  onCancel: () => void;
  selectedStore: number;
}

export default function LeadModal({ lead, onSave, onCancel, selectedStore }: LeadModalProps) {
  const [formData, setFormData] = useState({
    description: '',
    contactname: '',
    phone: '',
    email: '',
    status: 'NEW',
    assignedto: '',
    storenumber: selectedStore
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const isEditing = !!lead;

  // Fetch employees for the dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const employeesData = await getEmployees();
        console.log('Employees loaded:', employeesData);
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    if (lead) {
      setFormData({
        description: lead.description || '',
        contactname: lead.contactname || '',
        phone: lead.phone || '',
        email: lead.email || '',
        status: lead.status || 'NEW',
        assignedto: lead.assignedto || '',
        storenumber: lead.storenumber
      });
    }
  }, [lead, employees]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      alert('Lead description is required');
      return;
    }

    if (!formData.contactname.trim()) {
      alert('Contact name is required');
      return;
    }

    console.log('Submitting lead data:', formData);
    
    onSave(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log(`Field ${name} changed to:`, value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length >= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    } else if (phoneNumber.length >= 3) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    
    return phoneNumber;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({
      ...prev,
      phone: formatted
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FaLightbulb className="text-2xl text-yellow-600" />
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Edit Lead' : 'Create New Lead'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Lead Description *
            </label>
            <div className="relative">
              <FaLightbulb className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Enter lead description"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Name */}
            <div>
              <label htmlFor="contactname" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name *
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  id="contactname"
                  name="contactname"
                  value={formData.contactname}
                  onChange={handleInputChange}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Enter contact name"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Email */}
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="contact@example.com"
              />
            </div>
          </div>

          {/* Status and Assigned To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="relative">
                <FaFlag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                >
                  {LEAD_STATUSES.map(status => (
                    <option key={status.code} value={status.code}>
                      {status.displayName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assigned To */}
            <div>
              <label htmlFor="assignedto" className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  id="assignedto"
                  name="assignedto"
                  value={formData.assignedto}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                >
                  <option value="">Select an employee</option>
                  {loadingEmployees ? (
                    <option value="">Loading employees...</option>
                  ) : employees.length === 0 ? (
                    <option value="">No employees found</option>
                  ) : (
                    employees.map(employee => {
                      const employeeValue = employee.employeeid || employee.email;
                      return (
                        <option key={employee.employeeid || employee.email} value={employeeValue}>
                          {employee.firstname} {employee.lastname}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Store Number */}
          {/* <div>
            <label htmlFor="storenumber" className="block text-sm font-medium text-gray-700 mb-2">
              Store Number
            </label>
            <div className="relative">
              <FaStore className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                id="storenumber"
                name="storenumber"
                value={formData.storenumber}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Enter store number"
              />
            </div>
          </div> */}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              <FaSave className="w-4 h-4" />
              {isEditing ? 'Update Lead' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 