import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployee, updateEmployee } from '../api/employee';
import { getActivitiesForEmployee } from '../api/activity';
import { FaUsers, FaSpinner, FaExclamationTriangle, FaClock, FaUser, FaStore, FaArrowLeft, FaListAlt, FaVoicemail, FaComment, FaCalendar, FaFileAlt, FaHandshake, FaChartLine, FaExclamationCircle, FaEdit, FaEnvelope, FaBuilding } from 'react-icons/fa';
import { useStore } from '../auth/StoreContext';
import ActivityCreation from '../components/ActivityCreation';
import EmployeeModal from '../components/EmployeeModal';
import { Employee, Activity } from '../models';
import { getEmployeeRoleDisplayName } from '../models/EmployeeRoles';

export default function EmployeeDetail() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { selectedStore } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔄 Fetching employee details and activities for employee: ${employeeId}, store: ${selectedStore}`);
        
        if (!employeeId) {
          setError('Employee ID is required');
          return;
        }
        
        // Fetch employee and activities in parallel
        const [employeeData, activitiesData] = await Promise.all([
          getEmployee(employeeId),
          getActivitiesForEmployee(employeeId)
        ]);
        
        console.log('Employee data:', employeeData);
        console.log('Activities data:', activitiesData);
        
        setEmployee(employeeData);
        setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if selectedStore is a valid number and employeeId exists
    if (selectedStore !== null && selectedStore !== undefined && employeeId) {
      console.log(`🔄 Loading employee details for employee: ${employeeId}, store: ${selectedStore}`);
      fetchData();
    } else {
      setEmployee(null);
      setActivities([]);
      setLoading(false);
      setError(null);
    }
  }, [selectedStore, employeeId]);

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const handleActivityCreated = async () => {
    try {
      if (employeeId) {
        const activitiesData = await getActivitiesForEmployee(employeeId);
        setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      }
    } catch (error) {
      console.error('Error refreshing activities:', error);
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'PHONE': return <FaVoicemail className="w-4 h-4" />;
      case 'EMAIL': return <FaComment className="w-4 h-4" />;
      case 'MEETING': return <FaHandshake className="w-4 h-4" />;
      case 'FOLLOWUP': return <FaChartLine className="w-4 h-4" />;
      case 'NOTE': return <FaFileAlt className="w-4 h-4" />;
      default: return <FaListAlt className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <FaUser className="w-4 h-4" />;
      case 'Inactive': return <FaExclamationCircle className="w-4 h-4" />;
      default: return <FaUser className="w-4 h-4" />;
    }
  };

  const handleEditEmployee = () => {
    setShowEditModal(true);
  };

  const handleSaveEmployee = async (employeeData: {
    firstname: string;
    lastname: string;
    email: string;
    role?: string;
    active: boolean;
  }) => {
    try {
      if (employeeId) {
        await updateEmployee(employeeId, {
          ...employeeData,
          storenumber: selectedStore || 0
        });
        
        // Refresh employee data
        const updatedEmployee = await getEmployee(employeeId);
        setEmployee(updatedEmployee);
        setShowEditModal(false);
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Failed to update employee. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading employee details...</p>
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

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Employee not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/employees')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Employees
          </button>
          <div className="flex items-center gap-3">
            <FaUsers className="text-3xl text-blue-600" />
            <div>
              <h2 className="text-2xl font-semibold">Employee Details</h2>
            </div>
          </div>
        </div>
        <button
          onClick={handleEditEmployee}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaEdit className="w-4 h-4" />
          Edit Employee
        </button>
      </div>

      {/* Employee Details */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-2xl font-medium text-blue-600">
              {(employee.firstname || '').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {employee.firstname} {employee.lastname}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <FaUser className="text-gray-400 w-4 h-4" />
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-gray-900">{employee.firstname} {employee.lastname}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FaEnvelope className="text-gray-400 w-4 h-4" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">{employee.email || 'No email'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FaBuilding className="text-gray-400 w-4 h-4" />
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="text-gray-900">{employee.role ? getEmployeeRoleDisplayName(employee.role) : 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FaUser className="text-gray-400 w-4 h-4" />
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.active ? 'Active' : 'Inactive')}`}>
                {getStatusIcon(employee.active ? 'Active' : 'Inactive')}
                {employee.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Activities Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Activities ({activities.length})</h3>
          </div>
        </div>

        <div className="p-6">
          <ActivityCreation
            parentType="EMPLOYEE"
            parentId={employeeId || ''}
            storeNumber={selectedStore || 0}
            onActivityCreated={handleActivityCreated}
          />

          {activities.length === 0 ? (
            <div className="text-center py-8">
              <FaListAlt className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No activities yet</p>
            </div>
          ) : (
            <div className="space-y-4 mt-6">
              {activities.map((activity) => (
                <div key={activity.activityid} className="border border-gray-200 rounded-lg p-4">
                  {/* Activity Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-blue-600">
                        {getActivityIcon(activity.activitytypecode)}
                      </div>
                      <span className="font-medium text-gray-900">
                        {activity.activitytypecode.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <FaCalendar className="w-3 h-3" />
                        <span>Created On: {formatTimestamp(activity.createdon)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaUser className="w-3 h-3" />
                        <span>Created By: {activity.creator.firstname} {activity.creator.lastname}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Activity Details */}
                  {activity.details && (
                    <div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{activity.details}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Employee Modal */}
      {showEditModal && (
        <EmployeeModal
          employee={employee}
          onSave={handleSaveEmployee}
          onCancel={() => setShowEditModal(false)}
          selectedStore={selectedStore || 0}
        />
      )}
    </div>
  );
} 