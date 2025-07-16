import { useEffect, useState } from 'react';
import { getLeads, getActivities } from '../api';
import { FaLightbulb, FaSpinner, FaExclamationTriangle, FaClock, FaUser, FaStore, FaPhone, FaEnvelope, FaUserTie, FaFlag, FaListAlt, FaVoicemail, FaComment, FaCalendar, FaFileAlt, FaHandshake, FaChartLine, FaExclamationCircle, FaPlus } from 'react-icons/fa';
import { useStore } from '../auth/StoreContext';
import CreateActivity from '../components/CreateActivity';

interface Lead {
  leadid: string;
  storenumber: number;
  description: string;
  contactname: string | null;
  phone: string | null;
  email: string | null;
  createdby: string;
  creator: {
    email: string | null;
    lastname: string;
    firstname: string;
  };
  createdon: string;
  assignedto: string | null;
  assigned: {
    email: string | null;
    lastname: string;
    firstname: string;
  };
  status: string;
}

interface Activity {
  activityid: string;
  storenumber: number;
  parentid: string;
  parenttypecode: string;
  activitytypecode: string;
  details: string;
  createdby: string;
  creator: {
    email: string | null;
    lastname: string;
    firstname: string;
  };
  createdon: string;
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { selectedStore } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔄 Fetching leads and activities for store: ${selectedStore}`);
        
        // Fetch leads and activities in parallel
        const [leadsData, activitiesData] = await Promise.all([
          getLeads(),
          getActivities()
        ]);
        
        console.log('Leads data:', leadsData);
        console.log('Activities data:', activitiesData);
        
        setLeads(Array.isArray(leadsData) ? leadsData : []);
        setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if selectedStore is a valid number (not null, undefined, or 0)
    if (selectedStore !== null && selectedStore !== undefined) {
      console.log(`🔄 Loading leads and activities for store: ${selectedStore}`);
      fetchData();
    } else {
      // Clear data only when no store is selected
      setLeads([]);
      setActivities([]);
      setLoading(false);
      setError(null);
    }
  }, [selectedStore]);

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

  const handleAddActivity = (lead: Lead) => {
    setSelectedLead(lead);
    setShowCreateModal(true);
  };

  const handleActivityCreated = async () => {
    setShowCreateModal(false);
    setSelectedLead(null);
    
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
          <p className="text-gray-600">Loading leads...</p>
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
          <FaLightbulb className="text-3xl text-yellow-600" />
          <h2 className="text-2xl font-semibold">Leads</h2>
        </div>
        <div className="text-sm text-gray-600">
          {leads.length} lead{leads.length !== 1 ? 's' : ''}
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <FaLightbulb className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Leads</h3>
          <p className="text-gray-600">You don't have any leads at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div
              key={lead.leadid}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FaStore className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Store {lead.storenumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaFlag className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {lead.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <FaClock className="w-3 h-3" />
                    <span>{formatTimestamp(lead.createdon)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaUser className="w-3 h-3" />
                    <span>Created by: {lead.creator.firstname} {lead.creator.lastname}</span>
                  </div>
                  {lead.assigned && (
                    <div className="flex items-center gap-1">
                      <FaUserTie className="w-3 h-3" />
                      <span>Assigned to: {lead.assigned.firstname} {lead.assigned.lastname}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Lead Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{lead.description}</p>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 mb-4">
                {lead.contactname && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaUserTie className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{lead.contactname}</span>
                  </div>
                )}
                
                {lead.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
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
                  <div className="flex items-center gap-2 text-sm text-gray-600">
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

              {/* Activities */}
              {(() => {
                const leadActivities = getActivitiesForLead(lead.leadid);
                return (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FaListAlt className="w-4 h-4 text-purple-500" />
                        <h4 className="text-sm font-semibold text-gray-900">Activities ({leadActivities.length})</h4>
                      </div>
                      <button
                        onClick={() => handleAddActivity(lead)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="Add activity"
                      >
                        <FaPlus className="w-3 h-3" />
                        Add Activity
                      </button>
                    </div>
                    {leadActivities.length > 0 && (
                      <div className="space-y-3">
                        {leadActivities.map((activity) => (
                          <div key={activity.activityid} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                            {/* Activity Header */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getActivityIcon(activity.activitytypecode)}
                                <span className="text-sm font-medium text-gray-700">
                                  {activity.activitytypecode}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
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

      {/* Create Activity Modal */}
      {showCreateModal && selectedLead && (
        <CreateActivity
          leadId={selectedLead.leadid}
          leadDescription={selectedLead.description}
          onActivityCreated={handleActivityCreated}
          onCancel={() => {
            setShowCreateModal(false);
            setSelectedLead(null);
          }}
        />
      )}
    </div>
  );
})()}


            </div>
          ))}
        </div>
      )}
    </div>
  );
} 