import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTasks, getActivities, getEmployees, updateTask } from '../api';
import { FaTasks, FaSpinner, FaExclamationTriangle, FaClock, FaUser, FaStore, FaArrowLeft, FaListAlt, FaVoicemail, FaComment, FaCalendar, FaFileAlt, FaHandshake, FaChartLine, FaExclamationCircle, FaEdit } from 'react-icons/fa';
import { useStore } from '../auth/StoreContext';
import ActivityCreation from '../components/ActivityCreation';
import TaskModal from '../components/TaskModal';
import { Task, Employee, Activity } from '../models';

export default function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
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
        
        console.log(`🔄 Fetching task details and activities for task: ${taskId}, store: ${selectedStore}`);
        
        // Fetch tasks, activities, and employees in parallel
        const [tasksData, activitiesData, employeesData] = await Promise.all([
          getTasks(),
          getActivities(),
          getEmployees()
        ]);
        
        console.log('Tasks data:', tasksData);
        console.log('Activities data:', activitiesData);
        console.log('Employees data:', employeesData);
        
        // Find the specific task
        const tasks = Array.isArray(tasksData) ? tasksData : [];
        const foundTask = tasks.find(t => t.taskid === taskId);
        
        if (!foundTask) {
          setError('Task not found');
          return;
        }
        
        setTask(foundTask);
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
        setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if selectedStore is a valid number and taskId exists
    if (selectedStore !== null && selectedStore !== undefined && taskId) {
      console.log(`🔄 Loading task details for task: ${taskId}, store: ${selectedStore}`);
      fetchData();
    } else {
      setTask(null);
      setActivities([]);
      setEmployees([]);
      setLoading(false);
      setError(null);
    }
  }, [selectedStore, taskId]);

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const getActivitiesForTask = (taskId: string) => {
    return activities.filter(activity => 
      activity.parentid === taskId && activity.parenttypecode === 'TASK'
    );
  };

  const handleActivityCreated = async () => {
    try {
      const activitiesData = await getActivities();
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
    } catch (error) {
      console.error('Error refreshing activities:', error);
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'CALL': return <FaVoicemail className="w-4 h-4" />;
      case 'EMAIL': return <FaComment className="w-4 h-4" />;
      case 'MEETING': return <FaHandshake className="w-4 h-4" />;
      case 'FOLLOW_UP': return <FaChartLine className="w-4 h-4" />;
      case 'NOTE': return <FaFileAlt className="w-4 h-4" />;
      default: return <FaListAlt className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
      case 'inprogress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'open': return '🔓';
      case 'pending': return '⏳';
      case 'in-progress':
      case 'inprogress': return '🔄';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

//   // Get employee name by ID
//   const getEmployeeNameById = (employeeId: string) => {
//     const employee = employees.find(emp => emp.employeeid === employeeId);
//     return employee ? `${employee.firstname} ${employee.lastname}` : employeeId;
//   };

  const handleEditTask = () => {
    setShowEditModal(true);
  };

  const handleSaveTask = async (taskData: {
    taskname: string;
    taskdescription: string;
    taskstatus: string;
    assignedto: string;
    storenumber: number;
  }) => {
    try {
      if (task) {
        const updatedTask = await updateTask(task.taskid, taskData);
        setTask(updatedTask);
        setShowEditModal(false);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Error</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/tasks')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaTasks className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Task not found</p>
          <button
            onClick={() => navigate('/tasks')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  const taskActivities = getActivitiesForTask(task.taskid);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Tasks
          </button>
          <div className="flex items-center gap-3">
            <FaTasks className="text-3xl text-blue-600" />
            <div>
              <h2 className="text-2xl font-semibold">Task Details</h2>
            </div>
          </div>
        </div>
        <button
          onClick={handleEditTask}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaEdit className="w-4 h-4" />
          Edit Task
        </button>
      </div>

      {/* Task Information */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          <div className="p-6 transition-all hover:bg-gray-50">
            {/* Main Content Row */}
            <div className="flex items-start justify-between mb-4">
              {/* Left Side - Status and Description */}
              <div className="flex-1 pr-4">
                {/* Status */}
                <div className="flex items-center gap-2 mb-3">
                  <FaTasks className="w-4 h-4 text-blue-500" />
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.taskstatus || '')}`}>
                    {getStatusIcon(task.taskstatus || '')} {task.taskstatus || 'unknown'}
                  </span>
                </div>
                
                {/* Description */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{task.taskname}</h3>
                  {task.taskdescription && (
                    <p className="text-gray-700 whitespace-pre-wrap">{task.taskdescription}</p>
                  )}
                </div>
              </div>
              
              {/* Right Side - Information */}
              <div className="flex flex-col items-end gap-1 text-xs text-gray-500 min-w-[200px]">
                <div className="flex items-center gap-1">
                  <FaCalendar className="w-3 h-3" />
                  <span>Created On: {formatTimestamp(task.createdon)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaUser className="w-3 h-3" />
                  <span>Created By: {task.creator.firstname + " " + task.creator.lastname}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaUser className="w-3 h-3" />
                  <span>Assigned To: {task.assignee.firstname + " " + task.assignee.lastname || 'Unassigned'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activities Section */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Activities ({taskActivities.length})</h3>
          </div>
        </div>

        <div className="p-6">
          <ActivityCreation
            parentId={task.taskid}
            parentType="TASK"
            storeNumber={selectedStore || 1}
            onActivityCreated={handleActivityCreated}
          />

          {taskActivities.length === 0 ? (
            <div className="text-center py-8">
              <FaListAlt className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No activities yet</p>
            </div>
          ) : (
            <div className="space-y-4 mt-6">
              {taskActivities.map((activity) => (
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
                        <FaUser className="w-3 h-3" />
                        <span>{activity.creator.firstname} {activity.creator.lastname}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaClock className="w-3 h-3" />
                        <span>{formatTimestamp(activity.createdon)}</span>
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

      {/* Edit Task Modal */}
      {showEditModal && task && (
        <TaskModal
          task={task}
          onSave={handleSaveTask}
          onCancel={() => setShowEditModal(false)}
          selectedStore={selectedStore || 1}
        />
      )}
    </div>
  );
} 