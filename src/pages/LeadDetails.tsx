import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLeads, getActivities } from '../api';
import { FaLightbulb, FaSpinner, FaExclamationTriangle, FaClock, FaUser, FaStore, FaPhone, FaEnvelope, FaUserTie, FaFlag, FaArrowLeft, FaListAlt, FaVoicemail, FaComment, FaCalendar, FaFileAlt, FaHandshake, FaChartLine, FaExclamationCircle } from 'react-icons/fa';
import { useStore } from '../auth/StoreContext';
import ActivityCreation from '../components/ActivityCreation';
import { Lead, Activity } from '../models';

export default function LeadDetails() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedStore } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔄 Fetching lead details and activities for lead: ${leadId}, store: ${selectedStore}`);
        
        // Fetch leads and activities in parallel
        const [leadsData, activitiesData] = await Promise.all([
          getLeads(),
          getActivities()
        ]);
        
        console.log('Leads data:', leadsData);
        console.log('Activities data:', activitiesData);
        
        // Find the specific lead
        const leads = Array.isArray(leadsData) ? leadsData : [];
        const foundLead = leads.find(l => l.leadid === leadId);
        
        if (!foundLead) {
          setError('Lead not found');
          return;
        }
        
        setLead(foundLead);
        setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if selectedStore is a valid number and leadId exists
    if (selectedStore !== null && selectedStore !== undefined && leadId) {
      console.log(`🔄 Loading lead details for lead: ${leadId}, store: ${selectedStore}`);
      fetchData();
    } else {
      setLead(null);
      setActivities([]);
      setLoading(false);
      setError(null);
    }
  }, [selectedStore, leadId]);

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return 'N/A';
    // Basic phone formatting - you can enhance this
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  const getActivitiesForLead = (leadId: string) => {
    return activities.filter(activity => activity.parenttypecode === 'LEAD' && activity.parentid === leadId);
  };

  const handleActivityCreated = async () => {
    // Refresh activities data
    try {
      const activitiesData = await getActivities();
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
    } catch (error) {
      console.error('Error refreshing activities:', error);
    }
  };

  const getActivityIcon = (activityType: string) => {
    const type = activityType.toLowerCase();
    
    if (type.includes('phone') || type.includes('call')) {
      return <FaPhone className="w-4 h-4 text-green-500" />;
    }
    if (type.includes('voice') || type.includes('voicemail')) {
      return <FaVoicemail className="w-4 h-4 text-blue-500" />;
    }
    if (type.includes('email') || type.includes('mail')) {
      return <FaEnvelope className="w-4 h-4 text-red-500" />;
    }
    if (type.includes('meeting') || type.includes('appointment')) {
      return <FaCalendar className="w-4 h-4 text-purple-500" />;
    }
    if (type.includes('note') || type.includes('comment')) {
      return <FaComment className="w-4 h-4 text-gray-500" />;
    }
    if (type.includes('document') || type.includes('file')) {
      return <FaFileAlt className="w-4 h-4 text-orange-500" />;
    }
    if (type.includes('follow') || type.includes('follow-up')) {
      return <FaHandshake className="w-4 h-4 text-teal-500" />;
    }
    if (type.includes('quote') || type.includes('proposal')) {
      return <FaChartLine className="w-4 h-4 text-indigo-500" />;
    }
    if (type.includes('issue') || type.includes('problem')) {
      return <FaExclamationCircle className="w-4 h-4 text-red-500" />;
    }
    
    // Default icon
    return <FaListAlt className="w-4 h-4 text-gray-400" />;
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading lead details...</p>
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
          <button
            onClick={() => navigate('/leads')}
            className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Leads
          </button>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaLightbulb className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Lead not found</p>
          <button
            onClick={() => navigate('/leads')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Leads
          </button>
        </div>
      </div>
    );
  }

  const leadActivities = getActivitiesForLead(lead.leadid);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/leads')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Leads
          </button>
          <FaLightbulb className="text-3xl text-yellow-600" />
          <h2 className="text-2xl font-semibold">Lead Details</h2>
        </div>
      </div>

      {/* Lead Information */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          <div className="p-6 transition-all hover:bg-gray-50">
            {/* Main Content Row */}
            <div className="flex items-start justify-between mb-4">
              {/* Left Side - Status and Description */}
              <div className="flex-1 pr-4">
                {/* Status */}
                <div className="flex items-center gap-2 mb-3">
                  <FaFlag className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {lead.status}
                  </span>
                </div>
                
                {/* Description */}
                <div>
                  <p className="text-gray-700 whitespace-pre-wrap">{lead.description}</p>
                </div>
              </div>
              
              {/* Right Side - Information */}
              <div className="flex flex-col items-end gap-1 text-xs text-gray-500 min-w-[200px]">
                <div className="flex items-center gap-1">
                  <FaClock className="w-3 h-3" />
                  <span>Created On: {formatTimestamp(lead.createdon)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaUser className="w-3 h-3" />
                  <span>Created By: {lead.creator.firstname} {lead.creator.lastname}</span>
                </div>
                {lead.assigned && (
                  <div className="flex items-center gap-1">
                    <FaUser className="w-3 h-3" />
                    <span>Assigned To: {lead.assigned.firstname} {lead.assigned.lastname}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {lead.contactname && (
                  <div className="flex items-center gap-2">
                    <FaUserTie className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{lead.contactname}</span>
                  </div>
                )}
                
                {lead.phone && (
                  <div className="flex items-center gap-2">
                    <FaPhone className="w-4 h-4 text-green-500" />
                    <a 
                      href={`tel:${lead.phone}`}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {formatPhone(lead.phone)}
                    </a>
                  </div>
                )}
                
                {lead.email && (
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="w-4 h-4 text-red-500" />
                    <a 
                      href={`mailto:${lead.email}`}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {lead.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activities */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaListAlt className="w-4 h-4 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Activities ({leadActivities.length})
            </h3>
          </div>
          <ActivityCreation
            parentId={lead.leadid}
            parentType="LEAD"
            parentName={`Lead ${lead.leadid}`}
            storeNumber={selectedStore || 1}
            onActivityCreated={handleActivityCreated}
          />
        </div>
        
        {leadActivities.length === 0 ? (
          <div className="text-center py-8">
            <FaListAlt className="text-4xl text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Activities</h4>
            <p className="text-gray-600">No activities have been added to this lead yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-200">
              {leadActivities.map((activity) => (
                <div key={activity.activityid} className="p-4 transition-all hover:bg-gray-50">
                  {/* Activity Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getActivityIcon(activity.activitytypecode)}
                      <span className="text-sm font-medium text-gray-700">
                        {activity.activitytypecode}
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
          </div>
        )}
      </div>
    </div>
  );
} 