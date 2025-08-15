import React, { useState, useEffect } from 'react';
import { FaTasks, FaUser, FaClock, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { getTasks } from '../api/task';
import { Task } from '../models/Task';
import { useStore } from '../auth/StoreContext';
import { useAuth } from '../auth/AuthContext';

interface TaskStatusCount {
  status: string;
  displayName: string;
  count: number;
  color: string;
  icon: React.ReactNode;
}

const TaskSummary: React.FC = () => {
  const { selectedStore } = useStore();
  const { employeeId } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedStore) return;

      try {
        setLoading(true);
        setError(null);
        const tasksData = await getTasks();
        setTasks(tasksData);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [selectedStore]);

  // Filter tasks by logged-in employee and open status
  const openTasks = tasks.filter(task => {
    const isOpen = task.taskstatus !== 'COMPLETED' && task.taskstatus !== 'CANCELLED';
    const isAssignedToMe = task.assignedto === employeeId;
    
    // Debug logging
    if (task.assignedto && employeeId) {
      console.log(`🔍 Task ${task.taskid}: assignedto=${task.assignedto}, employeeId=${employeeId}, isAssignedToMe=${isAssignedToMe}`);
    }
    
    return isOpen && isAssignedToMe;
  });

  // Group tasks by status
  const getStatusCounts = (): TaskStatusCount[] => {
    const statusMap = new Map<string, number>();
    
    openTasks.forEach(task => {
      const count = statusMap.get(task.taskstatus || 'Unknown') || 0;
      statusMap.set(task.taskstatus || 'Unknown', count + 1);
    });

    // Debug: log the actual statuses we're getting
    console.log('🔍 Task statuses found:', Array.from(statusMap.keys()));

    const statusConfigs: { [key: string]: { color: string; icon: React.ReactNode; displayName: string } } = {
      'NEW': { color: 'bg-red-500', icon: <FaExclamationTriangle className="w-4 h-4" />, displayName: 'New' },
      'INPROGRESS': { color: 'bg-blue-500', icon: <FaSpinner className="w-4 h-4" />, displayName: 'In Progress' },
      'COMPLETED': { color: 'bg-green-500', icon: <FaCheckCircle className="w-4 h-4" />, displayName: 'Completed' },
      'CANCELLED': { color: 'bg-orange-500', icon: <FaCheckCircle className="w-4 h-4" />, displayName: 'Cancelled' }
    };

    return Array.from(statusMap.entries()).map(([status, count]) => {
      const config = statusConfigs[status] || statusConfigs[status.toLowerCase()] || { 
        color: 'bg-gray-500', 
        icon: <FaTasks className="w-4 h-4" />,
        displayName: status
      };
      
      console.log(`🔍 Status: ${status}, Color: ${config.color}`);
      
      return {
        status,
        displayName: config.displayName,
        count,
        color: config.color,
        icon: config.icon
      };
    });
  };

  const statusCounts = getStatusCounts();
  const totalOpenTasks = openTasks.length;

  if (!selectedStore) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaTasks className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Store Selected</h3>
          <p className="text-gray-500">Please select a store to view task summary.</p>
        </div>
      </div>
    );
  }

  if (!employeeId) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaTasks className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Employee ID Not Available</h3>
          <p className="text-gray-500">Unable to identify your employee ID. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-2xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading task summary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Visualization */}
      {statusCounts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">My Tasks</h3>
          <div className="space-y-3">
            {statusCounts.map((statusCount) => {
              const percentage = totalOpenTasks > 0 ? (statusCount.count / totalOpenTasks) * 100 : 0;
              
              // Convert Tailwind color classes to hex colors for inline styles
              const getColorHex = (colorClass: string) => {
                switch (colorClass) {
                  case 'bg-red-500': return '#ef4444';
                  case 'bg-blue-500': return '#3b82f6';
                  case 'bg-green-500': return '#22c55e';
                  case 'bg-orange-500': return '#f97316';
                  // case 'bg-yellow-500': return '#eab308';
                  // case 'bg-purple-500': return '#8b5cf6';
                  // case 'bg-gray-500': return '#6b7280';
                  default: return '#6b7280';
                }
              };
              
              const backgroundColor = getColorHex(statusCount.color);
              
              console.log(`🔍 Progress bar for ${statusCount.status}:`, { 
                colorClass: statusCount.color, 
                backgroundColor, 
                percentage 
              });
              
              return (
                <div key={statusCount.status} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-32">
                    <div 
                      className={`p-2 rounded-full text-white`}
                      style={{ backgroundColor }}
                    >
                      {statusCount.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{statusCount.displayName}</span>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor
                      }}
                    />
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-sm font-medium text-gray-900">{statusCount.count}</span>
                    {/* <span className="text-xs text-gray-500 ml-1">({percentage.toFixed(1)}%)</span> */}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {openTasks.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FaTasks className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Open Tasks Assigned to You</h3>
        </div>
      )}
    </div>
  );
};

export default TaskSummary; 