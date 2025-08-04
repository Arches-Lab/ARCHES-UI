import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaTasks, FaUser, FaCalendar, FaStore, FaEye, FaPlus } from 'react-icons/fa';
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
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterAssignedTo, setFilterAssignedTo] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const tasksData = await getTasks();
      console.log('Tasks from API:', tasksData);
      console.log('Status values found:', [...new Set(tasksData.map((task: Task) => task.taskstatus))]);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Fallback to empty array if API fails
      setTasks([]);
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
    fetchTasks();
    fetchEmployees();
  }, [selectedStore]);

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = !filterStatus || task.taskstatus?.toLowerCase() === filterStatus.toLowerCase();
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      setTasks(tasksData);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaTasks className="text-3xl text-blue-600" />
          <div>
            <h2 className="text-2xl font-semibold">Tasks</h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={handleCreateTask}
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

      {/* Tasks List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center">
            <FaTasks className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No tasks found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <div key={task.taskid} className="p-4 hover:bg-gray-50 transition-colors">
                {/* Row 1: Status, Task Name, Assigned To */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Status */}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.taskstatus || '')}`}>
                      {getStatusIcon(task.taskstatus || '')} {task.taskstatus || 'unknown'}
                    </span>
                    
                    {/* Assigned To */}
                    {task.assignedto && (
                      <div className="flex items-center gap-2">
                        <FaUser className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-700">Assigned: {task.assignee.firstname} {task.assignee.lastname}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* View Details Button */}
                  <button
                    onClick={() => handleViewTask(task)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors ml-4"
                    title="View task details"
                  >
                    <FaEye className="w-3 h-3" />
                    <span>View Details</span>
                  </button>
                </div>
                
                {/* Row 2: Task Name: Description, Created Info */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                      <span className="font-semibold text-gray-900">{task.taskname}:</span> {task.taskdescription || 'No description'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 min-w-[200px] flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <FaCalendar className="w-3 h-3" />
                      <span>Created: {formatDate(task.createdon)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaUser className="w-3 h-3" />
                      <span>By: {task.creator ? task.creator.firstname + " " + task.creator.lastname : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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