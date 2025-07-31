import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIncident, getActivitiesForIncident, getEmployees, updateIncident } from '../api';
import { FaExclamationTriangle, FaSpinner, FaExclamationCircle, FaClock, FaUser, FaStore, FaArrowLeft, FaListAlt, FaVoicemail, FaComment, FaCalendar, FaFileAlt, FaHandshake, FaChartLine, FaEdit, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useStore } from '../auth/StoreContext';
import ActivityCreation from '../components/ActivityCreation';
import IncidentModal from '../components/IncidentModal';
import { Incident, Employee, Activity, getIncidentTypeDisplayName, getIncidentTypeStatusIcon, getIncidentStatusDisplayName, getIncidentStatusColor, getIncidentStatusIcon } from '../models';

export default function IncidentDetail() {
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<Incident | null>(null);
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
        
        console.log(`🔄 Fetching incident details and activities for incident: ${incidentId}, store: ${selectedStore}`);
        
        if (!incidentId) {
          setError('Incident ID is required');
          return;
        }
        
        // Fetch incident, activities, and employees in parallel
        const [incidentData, activitiesData, employeesData] = await Promise.all([
          getIncident(incidentId),
          getActivitiesForIncident(incidentId),
          getEmployees()
        ]);
        
        console.log('Incident data:', incidentData);
        console.log('Activities data:', activitiesData);
        console.log('Employees data:', employeesData);
        
        setIncident(incidentData);
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
        setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if selectedStore is a valid number and incidentId exists
    if (selectedStore !== null && selectedStore !== undefined && incidentId) {
      console.log(`🔄 Loading incident details for incident: ${incidentId}, store: ${selectedStore}`);
      fetchData();
    } else {
      setIncident(null);
      setActivities([]);
      setEmployees([]);
      setLoading(false);
      setError(null);
    }
  }, [selectedStore, incidentId]);

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
      if (incidentId) {
        const activitiesData = await getActivitiesForIncident(incidentId);
        setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      }
    } catch (error) {
      console.error('Error refreshing activities:', error);
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'PHONE': return <FaPhone className="w-4 h-4" />;
      case 'VOICEMAIL': return <FaVoicemail className="w-4 h-4" />;
      case 'EMAIL': return <FaComment className="w-4 h-4" />;
      case 'FAX': return <FaEnvelope className="w-4 h-4" />;
      case 'FOLLOWUP': return <FaHandshake className="w-4 h-4" />;
      case 'MEETING': return <FaHandshake className="w-4 h-4" />;
      case 'NOTE': return <FaFileAlt className="w-4 h-4" />;
      case 'QUOTE': return <FaChartLine className="w-4 h-4" />;
      case 'OTHER': return <FaComment className="w-4 h-4" />;
      default: return <FaListAlt className="w-4 h-4" />;
    }
  };





  const handleEditIncident = () => {
    setShowEditModal(true);
  };

  const handleSaveIncident = async (incidentData: {
    incidenttypecode: string;
    title: string;
    description: string;
    status: string;
    casenumber?: string;
    assignedto: string;
    storenumber: number;
  }) => {
    try {
      if (incident) {
        const updatedIncident = await updateIncident(incident.incidentid, incidentData);
        setIncident(updatedIncident);
        setShowEditModal(false);
      }
    } catch (error) {
      console.error('Error updating incident:', error);
      alert('Failed to update incident. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading incident details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaExclamationCircle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Error</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/incidents')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Back to Incidents
          </button>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Incident not found</p>
          <button
            onClick={() => navigate('/incidents')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Back to Incidents
          </button>
        </div>
      </div>
    );
  }

  const incidentActivities = activities;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/incidents')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Incidents
          </button>
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-3xl text-red-600" />
            <div>
              <h2 className="text-2xl font-semibold">Incident Details</h2>
            </div>
          </div>
        </div>
        <button
          onClick={handleEditIncident}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <FaEdit className="w-4 h-4" />
          Edit Incident
        </button>
      </div>

      {/* Incident Information */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          <div className="p-6 transition-all hover:bg-gray-50">
            {/* Main Content Row */}
            <div className="flex items-start justify-between mb-4">
              {/* Left Side - Status and Description */}
              <div className="flex-1 pr-4">
                {/* Status and Type */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getIncidentStatusColor(incident.status || '')}`}>
                    {getIncidentStatusIcon(incident.status || '')} {getIncidentStatusDisplayName(incident.status || '')}
                  </span>
                                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {getIncidentTypeStatusIcon(incident.incidenttypecode)} {getIncidentTypeDisplayName(incident.incidenttypecode)}
                    </span>
                </div>
                
                {/* Description */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{incident.title}</h3>
                  {incident.casenumber && (
                    <div className="text-sm text-gray-500 mb-2">
                      Case #: {incident.casenumber}
                    </div>
                  )}
                  {incident.description && (
                    <p className="text-gray-700 whitespace-pre-wrap">{incident.description}</p>
                  )}
                </div>
              </div>
              
              {/* Right Side - Information */}
              <div className="flex flex-col items-end gap-1 text-xs text-gray-500 min-w-[200px]">
                <div className="flex items-center gap-1">
                  <FaCalendar className="w-3 h-3" />
                  <span>Created On: {formatTimestamp(incident.createdon)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaUser className="w-3 h-3" />
                  <span>Created By: {incident.creator.firstname + " " + incident.creator.lastname}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaUser className="w-3 h-3" />
                  <span>Assigned To: {incident.assignee ? incident.assignee.firstname + " " + incident.assignee.lastname : 'Unassigned'}</span>
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
            <h3 className="text-lg font-medium">Activities ({incidentActivities.length})</h3>
          </div>
        </div>

        <div className="p-6">
          <ActivityCreation
            parentId={incident.incidentid}
            parentType="INCIDENT"
            storeNumber={selectedStore || 1}
            onActivityCreated={handleActivityCreated}
          />

          {incidentActivities.length === 0 ? (
            <div className="text-center py-8">
              <FaListAlt className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No activities yet</p>
            </div>
          ) : (
            <div className="space-y-0 mt-6">
              {incidentActivities.map((activity) => (
                <div key={activity.activityid} className="border border-gray-200 rounded-lg p-4">
                  {/* Activity Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-red-600">
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

      {/* Edit Incident Modal */}
      {showEditModal && incident && (
        <IncidentModal
          incident={incident}
          onSave={handleSaveIncident}
          onCancel={() => setShowEditModal(false)}
          selectedStore={selectedStore || 1}
        />
      )}
    </div>
  );
} 