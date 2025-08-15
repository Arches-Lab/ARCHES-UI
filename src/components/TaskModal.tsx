import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaUser, FaStore, FaTasks, FaAlignLeft } from 'react-icons/fa';
import { getEmployees } from '../api';
import { Task, Employee } from '../models';

interface TaskModalProps {
  task?: Task | null;
  onSave: (taskData: {
    taskname: string;
    taskdescription: string;
    taskstatus: string;
    assignedto: string;
    storenumber: number;
  }) => void;
  onCancel: () => void;
  selectedStore: number;
}

export default function TaskModal({ task, onSave, onCancel, selectedStore }: TaskModalProps) {
  const [formData, setFormData] = useState({
    taskname: '',
    taskdescription: '',
    taskstatus: 'NEW',
    assignedto: '',
    storenumber: selectedStore
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const isEditing = !!task;

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

  // Debug assignedto value changes
  useEffect(() => {
    console.log('assignedto value changed:', formData.assignedto);
  }, [formData.assignedto]);

  useEffect(() => {
    if (task) {
      setFormData({
        taskname: task.taskname,
        taskdescription: task.taskdescription || '',
        taskstatus: task.taskstatus || 'OPEN',
        assignedto: task.assignedto || '',
        storenumber: task.storenumber
      });
    }
  }, [task, employees]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.taskname.trim()) {
      alert('Task name is required');
      return;
    }

    console.log('Submitting task data:', formData);
    console.log('Selected employee ID:', formData.assignedto);
    
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FaTasks className="text-2xl text-blue-600" />
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Edit Task' : 'Create New Task'}
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
          {/* Task Name */}
          <div>
            <label htmlFor="taskname" className="block text-sm font-medium text-gray-700 mb-2">
              Task Name *
            </label>
            <div className="relative">
              <FaTasks className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                id="taskname"
                name="taskname"
                value={formData.taskname}
                onChange={handleInputChange}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter task name"
              />
            </div>
          </div>

          {/* Task Description */}
          <div>
            <label htmlFor="taskdescription" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="relative">
              <FaAlignLeft className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <textarea
                id="taskdescription"
                name="taskdescription"
                value={formData.taskdescription}
                onChange={handleInputChange}
                rows={4}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter task description"
              />
            </div>
          </div>

          {/* Status and Assigned To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label htmlFor="taskstatus" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="taskstatus"
                name="taskstatus"
                value={formData.taskstatus}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="NEW">New</option>
                <option value="INPROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
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
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an employee</option>
                  {loadingEmployees ? (
                    <option value="">Loading employees...</option>
                  ) : employees.length === 0 ? (
                    <option value="">No employees found</option>
                  ) : (
                    employees.map(employee => {
                      console.log(`Creating option for employee:`, employee);
                      console.log(`Employee ID: ${employee.employeeid}, Name: ${employee.firstname} ${employee.lastname}`);
                      console.log(`Employee object keys:`, Object.keys(employee));
                      const employeeValue = employee.employeeid || employee.email;
                      console.log(`Using value: ${employeeValue}`);
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaSave className="w-4 h-4" />
              {isEditing ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 