import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmployees, createEmployee } from '../api';
import { FaUsers, FaSpinner, FaExclamationTriangle, FaPlus, FaEye, FaUser, FaCalendar, FaClock } from 'react-icons/fa';
import { useStore } from '../auth/StoreContext';
import EmployeeModal from '../components/EmployeeModal';

interface Employee {
  employeeid: string;
  firstname: string;
  lastname: string;
  email: string;
  role?: string;
  active: boolean;
  createdon?: string;
  creator?: {
    firstname: string;
    lastname: string;
  };
}

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { selectedStore } = useStore();

  useEffect(() => {
    console.log(`🔄 Employees useEffect - selectedStore: ${selectedStore}`);
    
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`🔄 Fetching employees for store: ${selectedStore}`);
        const data = await getEmployees(true);
        console.log("Employees data received:", data);
        setEmployees(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employees. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if selectedStore is a valid number (not null, undefined, or 0)
    if (selectedStore !== null && selectedStore !== undefined) {
      console.log(`🔄 Loading employees for store: ${selectedStore}`);
      fetchEmployees();
    } else {
      // Clear data only when no store is selected
      console.log(`🔄 No store selected, clearing employees data`);
      setEmployees([]);
      setLoading(false);
      setError(null);
    }
  }, [selectedStore]);

  const handleCreateEmployee = () => {
    setShowCreateModal(true);
  };

  const handleEmployeeCreated = async () => {
    setShowCreateModal(false);
    // Refresh employees data
    try {
      const employeesData = await getEmployees(true);
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
    } catch (error) {
      console.error('Error refreshing employees:', error);
    }
  };

  const handleSaveEmployee = async (employeeData: {
    firstname: string;
    lastname: string;
    email: string;
    role?: string;
    active: boolean;
  }) => {
    try {
      await createEmployee({
        ...employeeData,
        storenumber: selectedStore || 0
      });
      handleEmployeeCreated();
    } catch (error) {
      console.error('Error creating employee:', error);
      alert('Failed to create employee. Please try again.');
    }
  };

  const handleViewEmployee = (employee: Employee) => {
    navigate(`/employees/${employee.employeeid}`);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Error</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaUsers className="text-3xl text-blue-600" />
          <h2 className="text-2xl font-semibold">Employees</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {employees.length} employee{employees.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Employees</h3>
          <p className="text-gray-600">You don't have any employees at the moment.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.employeeid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 w-1/3">
                      <div className="max-w-full">
                        <div className="flex items-start gap-2">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">
                            <span className="font-semibold text-gray-900">{employee.firstname} {employee.lastname}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 min-w-[120px]">
                      <span className="text-gray-600">{employee.email || 'No email'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 min-w-[100px]">
                      {employee.role ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {employee.role}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 min-w-[150px]">
                      <div className="flex items-center gap-4">
                        {/* <div className="flex items-center gap-1">
                          <FaUser className="w-4 h-4" />
                          <span>
                            {employee.creator ? `${employee.creator.firstname} ${employee.creator.lastname}` : 'N/A'}
                          </span>
                        </div> */}
                        <div className="flex items-center gap-1 text-gray-400">
                          <FaClock className="w-4 h-4" />
                          <span>{employee.createdon ? formatDate(employee.createdon) : 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium min-w-[100px]">
                      <button
                        onClick={() => handleViewEmployee(employee)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                        title="View employee details"
                      >
                        <FaEye className="w-3 h-3" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Employee Modal */}
      {showCreateModal && (
        <EmployeeModal
          onSave={handleSaveEmployee}
          onCancel={() => setShowCreateModal(false)}
          selectedStore={selectedStore || 0}
        />
      )}
    </div>
  );
} 