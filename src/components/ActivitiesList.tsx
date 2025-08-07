import { useState, useEffect } from 'react';
import { FaCalendar, FaUser, FaClock, FaSpinner, FaExclamationTriangle, FaListAlt, FaComment, FaChartLine, FaFileAlt, FaHandshake, FaEnvelope, FaVoicemail, FaPhone } from 'react-icons/fa';
import { getActivitiesForParent } from '../api/activity';
import { Activity } from '../models';
import ActivityCreation from './ActivityCreation';

interface ActivitiesListProps {
  parentType: 'LEAD' | 'MAILBOX' | 'TASK' | 'INCIDENT' | 'EMPLOYEE';
  parentId: string;
  title?: string;
  storeNumber?: number;
}

// Activity type definitions matching ActivityCreation.tsx
const activityTypes = [
  { type: 'PHONE', label: 'Phone', icon: <FaPhone className="text-green-500" /> },
  { type: 'VOICEMAIL', label: 'Voicemail', icon: <FaVoicemail className="text-blue-500" /> },
  { type: 'EMAIL', label: 'Email', icon: <FaEnvelope className="text-red-500" /> },
  { type: 'FAX', label: 'Fax', icon: <FaEnvelope className="text-orange-500" /> },
  { type: 'FOLLOWUP', label: 'Follow Up', icon: <FaHandshake className="text-teal-500" /> },
  { type: 'MEETING', label: 'Meeting', icon: <FaCalendar className="text-purple-500" /> },
  { type: 'NOTE', label: 'Note', icon: <FaComment className="text-gray-500" /> },
  { type: 'QUOTE', label: 'Quote', icon: <FaChartLine className="text-indigo-500" /> },
  { type: 'OTHER', label: 'Other', icon: <FaComment className="text-gray-400" /> },
];

export default function ActivitiesList({ parentType, parentId, title = "Activities", storeNumber }: ActivitiesListProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    if (!parentId) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Fetching activities for ${parentType}: ${parentId}`);
      
      const activitiesData = await getActivitiesForParent(parentId, parentType);
      console.log('Activities data:', activitiesData);
      
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activities. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [parentId, parentType]);

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const getActivityIcon = (activityType: string) => {
    const activityTypeDef = activityTypes.find(type => type.type === activityType);
    return activityTypeDef ? activityTypeDef.icon : <FaComment className="w-4 h-4 text-gray-400" />;
  };

  const getActivityTypeLabel = (activityType: string) => {
    const activityTypeDef = activityTypes.find(type => type.type === activityType);
    return activityTypeDef ? activityTypeDef.label : activityType;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">{title} ({activities.length})</h3>
          {storeNumber && (
            <ActivityCreation 
              parentType={parentType} 
              parentId={parentId} 
              storeNumber={storeNumber}
              onActivityCreated={() => {
                // Refresh activities by refetching
                fetchActivities();
              }}
            />
          )}
        </div>
      </div>

      <div className="p-0">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <FaSpinner className="animate-spin text-2xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading activities...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Activities Table */}
        {!loading && !error && (
          <>
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <FaListAlt className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No activities yet</p>
              </div>
            ) : (
              <div className="w-full">
                <table className="w-full divide-y divide-gray-200">
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activities.map((activity) => (
                      <tr key={activity.activityid} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="text-lg">
                              {getActivityIcon(activity.activitytypecode)}
                            </div>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                              {getActivityTypeLabel(activity.activitytypecode)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 w-2/5">
                          <div className="max-w-full">
                            <p className="text-sm text-gray-900 whitespace-pre-wrap" title={activity.details}>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 