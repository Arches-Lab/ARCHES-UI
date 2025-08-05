import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaTasks, FaUser, FaCalendar, FaStore, FaEye, FaPlus, FaSpinner, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';
import { useStore } from '../auth/StoreContext';
import { getTasks, getEmployees, createTask } from '../api';
import { Task, Employee } from '../models';
import TaskModal from '../components/TaskModal';

export default function Tasks() {
  const { user } = useAuth();
  const { selectedStore } = useStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterAssignedTo, setFilterAssignedTo] = useState<string>('');
  const navigate = useNavigate();

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🔄 Fetching tasks for store: ${selectedStore}`);
      const tasksData = await getTasks();
      console.log('Tasks from API:', tasksData);
      console.log('Status values found:', [...new Set(tasksData.map((task: Task) => task.taskstatus))]);
      console.log('Unique status values:', Array.from(new Set(tasksData.map((task: Task) => task.taskstatus?.toLowerCase()))));
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees for the filter dropdown
  const fetchEmployees = async () => {
    try {
      const employeesData = await getEmployees();
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  };

  useEffect(() => {
    console.log(`🔄 Tasks useEffect - selectedStore: ${selectedStore}`);
    
    // Only fetch if selectedStore is a valid number (not null, undefined, or 0)
    if (selectedStore !== null && selectedStore !== undefined) {
      console.log(`🔄 Loading tasks for store: ${selectedStore}`);
      fetchTasks();
      fetchEmployees();
    } else {
      // Clear data only when no store is selected
      console.log(`🔄 No store selected, clearing tasks data`);
      setTasks([]);
      setLoading(false);
      setError(null);
    }
  }, [selectedStore]);

  const filteredTasks = tasks.filter(task => {
    const taskStatusLower = task.taskstatus?.toLowerCase();
    const filterStatusLower = filterStatus.toLowerCase();
    
    // Handle both "in-progress" and "inprogress" variations
    const matchesStatus = !filterStatus || 
      taskStatusLower === filterStatusLower ||
      (filterStatusLower === 'in-progress' && (taskStatusLower === 'inprogress' || taskStatusLower === 'in-progress')) ||
      (filterStatusLower === 'inprogress' && (taskStatusLower === 'inprogress' || taskStatusLower === 'in-progress'));
    
    const matchesAssignedTo = !filterAssignedTo || task.assignedto === filterAssignedTo;
    
    return matchesStatus && matchesAssignedTo;
  });

  // Get unique employee IDs from tasks
  const getUniqueAssignedEmployees = () => {
    const assignedEmployeeIds = Array.from(new Set(tasks.map(task => task.assignedto).filter(Boolean)));
    return employees.filter(employee => assignedEmployeeIds.includes(employee.employeeid));
  };

  // Get employee name by ID
  const getEmployeeNameById = (employeeId: string) => {
    const employee = employees.find(emp => emp.employeeid === employeeId);
    return employee ? `${employee.firstname} ${employee.lastname}` : employeeId;
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const handleViewTask = (task: Task) => {
    navigate(`/tasks/${task.taskid}`);
  };

  const handleCreateTask = () => {
    setShowCreateModal(true);
  };

  const handleTaskCreated = async () => {
    setShowCreateModal(false);
    // Refresh tasks data
    try {
      const tasksData = await getTasks();
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    }
  };

  const handleSaveTask = async (taskData: {
    taskname: string;
    taskdescription: string;
    taskstatus: string;
    assignedto: string;
    storenumber: number;
  }) => {
    try {
      await createTask(taskData);
      await handleTaskCreated();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading tasks...</p>
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
          <FaTasks className="text-3xl text-blue-600" />
          <h2 className="text-2xl font-semibold">Tasks</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Assigned To Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
            <select
              value={filterAssignedTo}
              onChange={(e) => setFilterAssignedTo(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Users</option>
              {getUniqueAssignedEmployees().map(employee => (
                <option key={employee.employeeid} value={employee.employeeid}>
                  {employee.firstname} {employee.lastname}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <FaTasks className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks</h3>
          <p className="text-gray-600">
            You don't have any tasks at the moment.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By/On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task.taskid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 w-1/2">
                      <div className="max-w-full">
                        <div className="flex items-start gap-2">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap" title={task.taskdescription}>
                            <span className={`inline-flex items-center px-1 py-0.5 text-xs font-medium rounded-full ${getStatusColor(task.taskstatus || '')} mr-2`}>
                              {getStatusIcon(task.taskstatus || '')} {task.taskstatus || 'unknown'}
                            </span>
                            <span className="font-semibold text-gray-900">{task.taskname}:</span> {task.taskdescription || 'No description'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 min-w-[120px]">
                      {task.assignedto ? (
                        <div className="flex items-center gap-1">
                          <FaUser className="w-4 h-4" />
                          <span>
                            {task.assignee ? `${task.assignee.firstname} ${task.assignee.lastname}` : getEmployeeNameById(task.assignedto)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 min-w-[150px]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <FaUser className="w-4 h-4" />
                          <span>
                            {task.creator ? `${task.creator.firstname} ${task.creator.lastname}` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <FaClock className="w-4 h-4" />
                          <span>{formatDate(task.createdon)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium min-w-[100px]">
                      <button
                        onClick={() => handleViewTask(task)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                        title="View task details"
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

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <TaskModal
          task={null}
          onSave={handleSaveTask}
          onCancel={() => setShowCreateModal(false)}
          selectedStore={selectedStore || 1}
        />
      )}
    </div>
  );
} 