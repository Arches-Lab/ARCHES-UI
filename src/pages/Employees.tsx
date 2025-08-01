import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmployees, createEmployee } from '../api';
import { FaUsers, FaSpinner, FaExclamationTriangle, FaPlus, FaEye, FaUser, FaCalendar } from 'react-icons/fa';
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
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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
            onClick={handleCreateEmployee}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <FaUsers className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500">No employees found</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="divide-y divide-gray-200">
            {employees.map((employee) => (
              <div key={employee.employeeid} className="p-4 hover:bg-gray-50 transition-colors">
                {/* Main Content Row */}
                <div className="flex items-start justify-between">
                  {/* Left Side - Employee Details */}
                  <div className="flex-1 pr-3">
                    {/* Employee Name and Email */}
                    <div>
                      <h4 className="text-base font-medium text-gray-900 mb-1">
                        {employee.firstname || 'N/A'} {employee.lastname || ''}
                      </h4>
                      <p className="text-sm text-gray-600">{employee.email || 'No email'}</p>
                    </div>
                  </div>
                  
                  {/* Right Side - Information */}
                  <div className="flex flex-col items-end gap-1 text-xs text-gray-500 min-w-[180px]">
                    <button
                      onClick={() => handleViewEmployee(employee)}
                      className="flex items-center gap-2 p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="View details"
                    >
                      <FaEye className="w-3 h-3" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
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