import { useState, useEffect } from 'react';
import { FaUserPlus, FaSpinner, FaExclamationTriangle, FaCheck, FaEnvelope, FaLock, FaUser, FaPhone, FaBuilding, FaStore, FaUsers, FaEye } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import PinAuth from '../components/PinAuth';
import { getEmployees, updateEmployee } from '../api/employee';
import { Employee } from '../models';
import { useStore } from '../auth/StoreContext';

interface EmployeeWithoutAuth extends Employee {
  authid?: string;
}

export default function NewUser() {
  const [employees, setEmployees] = useState<EmployeeWithoutAuth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingUsers, setCreatingUsers] = useState<Set<string>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPinAuthenticated, setIsPinAuthenticated] = useState(false);
  const { selectedStore } = useStore();

  // Fetch employees without authid
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployees(true);
      // Filter to only show employees without authid
      const employeesWithoutAuth = Array.isArray(data) 
        ? data.filter((emp: EmployeeWithoutAuth) => !emp.authid)
        : [];
      setEmployees(employeesWithoutAuth);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPinAuthenticated && selectedStore) {
      fetchEmployees();
    }
  }, [isPinAuthenticated, selectedStore]);

  const handleCreateUser = async (employee: EmployeeWithoutAuth) => {
    if (!employee.email) {
      alert('Employee must have an email address to create a user account.');
      return;
    }

    setCreatingUsers(prev => new Set(prev).add(employee.employeeid));
    setError(null);

    try {
      // Create user account using Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: employee.email,
        password: 'Welcome123!', // Temporary password that user will change
        options: {
          data: {
            first_name: employee.firstname,
            last_name: employee.lastname
          }
        }
      });

      if (error) {
        throw error;
      }

      console.log('User created successfully:', data);

      // Update employee record with the user ID
      if (data.user) {
        await updateEmployee(employee.employeeid, {
          "storenumber": selectedStore || 0,
          "firstname": employee.firstname,
          "lastname": employee.lastname,
          "email": employee.email,
          "role": employee.role,
          "active": employee.active,
          "authid": data.user.id
        });

        setSuccessMessage(`User account created for ${employee.firstname} ${employee.lastname}. They can now log in with their email and temporary password: Welcome123!`);
        
        // Refresh the employee list
        await fetchEmployees();
      }

    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || err.error_description || 'Failed to create user. Please try again.');
    } finally {
      setCreatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(employee.employeeid);
        return newSet;
      });
    }
  };

  // Show PIN authentication if not authenticated
  if (!isPinAuthenticated) {
    return (
      <PinAuth
        onSuccess={() => setIsPinAuthenticated(true)}
        onCancel={() => window.history.back()}
      />
    );
  }

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
          <FaUserPlus className="text-3xl text-blue-600" />
          <h2 className="text-2xl font-semibold">Create User Accounts</h2>
        </div>
        <div className="text-sm text-gray-600">
          {employees.length} employee{employees.length !== 1 ? 's' : ''} without user accounts
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <FaCheck className="text-green-500 w-4 h-4" />
            <p className="text-green-700">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-green-600 hover:text-green-800 text-sm mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {employees.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Employees Found</h3>
          <p className="text-gray-600">All employees already have user accounts or there are no employees to display.</p>
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.employeeid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {(employee.firstname || '').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.firstname || 'N/A'} {employee.lastname || ''}
                          </div>
                          <div className="text-sm text-gray-500">
                            Employee ID: {employee.employeeid}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {employee.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {employee.role || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        employee.active 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!employee.email ? (
                        <span className="text-sm text-gray-500">No email address</span>
                      ) : (
                        <button
                          onClick={() => handleCreateUser(employee)}
                          disabled={creatingUsers.has(employee.employeeid)}
                          className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {creatingUsers.has(employee.employeeid) ? (
                            <>
                              <FaSpinner className="animate-spin w-3 h-3" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <FaUserPlus className="w-3 h-3" />
                              Create User
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 