import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaUser, FaStore, FaExclamationTriangle, FaAlignLeft } from 'react-icons/fa';
import { getEmployees } from '../api';
import { Incident, Employee, INCIDENT_TYPES, INCIDENT_STATUSES } from '../models';

interface IncidentModalProps {
  incident?: Incident | null;
  onSave: (incidentData: {
    incidenttypecode: string;
    title: string;
    description: string;
    status: string;
    casenumber?: string;
    assignedto: string;
    storenumber: number;
  }) => void;
  onCancel: () => void;
  selectedStore: number;
}

export default function IncidentModal({ incident, onSave, onCancel, selectedStore }: IncidentModalProps) {
  const [formData, setFormData] = useState({
    incidenttypecode: '',
    title: '',
    description: '',
    status: 'NEW',
    casenumber: '',
    assignedto: ''
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const isEditing = !!incident;

  // Fetch employees for the dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const employeesData = await getEmployees();
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
    if (incident) {
      setFormData({
        incidenttypecode: incident.incidenttypecode,
        title: incident.title,
        description: incident.description || '',
        status: incident.status || 'NEW',
        casenumber: incident.casenumber || '',
        assignedto: incident.assignedto || ''
      });
    }
  }, [incident, employees]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Incident title is required');
      return;
    }

    if (!formData.incidenttypecode.trim()) {
      alert('Incident type is required');
      return;
    }

    if (!formData.description.trim()) {
      alert('Incident description is required');
      return;
    }

    onSave({
      ...formData,
      storenumber: selectedStore
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-2xl text-red-600" />
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Edit Incident' : 'Create New Incident'}
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
          {/* Incident Type */}
          <div>
            <label htmlFor="incidenttypecode" className="block text-sm font-medium text-gray-700 mb-2">
              Incident Type *
            </label>
            <select
              id="incidenttypecode"
              name="incidenttypecode"
              value={formData.incidenttypecode}
              onChange={handleInputChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select incident type</option>
              {INCIDENT_TYPES.map(type => (
                <option key={type.code} value={type.code}>
                  {type.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Incident Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Incident Title *
            </label>
            <div className="relative">
              <FaExclamationTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter incident title"
              />
            </div>
          </div>

          {/* Incident Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="relative">
              <FaAlignLeft className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter incident description"
              />
            </div>
          </div>

          {/* Case Number */}
          <div>
            <label htmlFor="casenumber" className="block text-sm font-medium text-gray-700 mb-2">
              Case Number
            </label>
            <input
              type="text"
              id="casenumber"
              name="casenumber"
              value={formData.casenumber}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Enter case number (optional)"
            />
          </div>

          {/* Status and Assigned To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {INCIDENT_STATUSES.map(status => (
                  <option key={status.code} value={status.code}>
                    {status.displayName}
                  </option>
                ))}
              </select>
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
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSave className="w-4 h-4" />
              {isEditing ? 'Update Incident' : 'Create Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 