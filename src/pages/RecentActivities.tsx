import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaClock, FaExternalLinkAlt, FaFilter } from 'react-icons/fa';
import { getRecentActivities } from '../api/activity';
import { Activity } from '../models';
import { useStore } from '../auth/StoreContext';

export default function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(2);
  const { selectedStore } = useStore();

  useEffect(() => {
    const fetchActivities = async () => {
      if (!selectedStore) return;

      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔄 Fetching recent activities for store: ${selectedStore}, days: ${selectedDays}`);
        
        const activitiesData = await getRecentActivities(selectedDays, selectedStore);
        console.log('Recent activities data:', activitiesData);
        
        setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      } catch (err) {
        console.error('Error fetching recent activities:', err);
        setError('Failed to load recent activities. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [selectedStore, selectedDays]);

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType.toUpperCase()) {
      case 'CREATE':
        return '🆕';
      case 'UPDATE':
        return '✏️';
      case 'DELETE':
        return '🗑️';
      case 'ASSIGN':
        return '👤';
      case 'COMPLETE':
        return '✅';
      case 'CANCEL':
        return '❌';
      default:
        return '📝';
    }
  };

  const getParentTypeLabel = (parentType: string) => {
    switch (parentType.toUpperCase()) {
      case 'LEAD':
        return 'Lead';
      case 'INCIDENT':
        return 'Incident';
      case 'TASK':
        return 'Task';
      case 'EMPLOYEE':
        return 'Employee';
      case 'MAILBOX':
        return 'Mailbox';
      case 'SUPPLY':
        return 'Supply';
      default:
        return parentType;
    }
  };

  const getParentDetailLink = (activity: Activity) => {
    const parentType = activity.parenttypecode.toLowerCase();
    const parentId = activity.parentid;
    
    switch (parentType) {
      case 'lead':
        return `/leads/${parentId}`;
      case 'incident':
        return `/incidents/${parentId}`;
      case 'task':
        return `/tasks/${parentId}`;
      case 'employee':
        return `/employees/${parentId}`;
      case 'mailbox':
        return `/mailboxes`;
      case 'supply':
        return `/supplies`;
      default:
        return '#';
    }
  };

  const getActivityTypeLabel = (activityType: string) => {
    switch (activityType.toUpperCase()) {
      case 'CREATE':
        return 'Created';
      case 'UPDATE':
        return 'Updated';
      case 'DELETE':
        return 'Deleted';
      case 'ASSIGN':
        return 'Assigned';
      case 'COMPLETE':
        return 'Completed';
      case 'CANCEL':
        return 'Cancelled';
      default:
        return activityType;
    }
  };

  if (!selectedStore) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaCalendarAlt className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Store Selected</h3>
          <p className="text-gray-500">Please select a store to view recent activities.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaCalendarAlt className="text-2xl text-blue-600" />
          <h2 className="text-2xl font-semibold">Recent Activities</h2>
        </div>
        {!loading && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Total:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 font-medium rounded">
              {activities.length} activities
            </span>
          </div>
        )}
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4">
          <FaFilter className="text-gray-500" />
          <label htmlFor="days-select" className="text-sm font-medium text-gray-700">
            Show activities from the last:
          </label>
          <select
            id="days-select"
            value={selectedDays}
            onChange={(e) => setSelectedDays(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={1}>1 day</option>
            <option value={2}>2 days</option>
            <option value={3}>3 days</option>
            <option value={4}>4 days</option>
            <option value={5}>5 days</option>
            <option value={6}>6 days</option>
            <option value={7}>7 days</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading recent activities...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Activities List */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {activities.length === 0 ? (
            <div className="p-8 text-center">
              <FaCalendarAlt className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activities</h3>
              <p className="text-gray-500">
                No activities found for the selected time period.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By/On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <tr key={activity.activityid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            {getParentTypeLabel(activity.parenttypecode)}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                            {getActivityTypeLabel(activity.activitytypecode)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 w-2/5">
                        <div className="max-w-full">
                          <p className="text-sm text-gray-900 truncate" title={activity.details}>
                            {activity.details}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 min-w-[150px]">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <FaUser className="w-4 h-4" />
                            <span>
                              {activity.creator.firstname} {activity.creator.lastname}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-400">
                            <FaClock className="w-4 h-4" />
                            <span>{formatTimestamp(activity.createdon)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={getParentDetailLink(activity)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <FaExternalLinkAlt className="w-3 h-3" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 