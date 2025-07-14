import { useEffect, useState } from 'react';
import { getLeads, getActivities } from '../api';
import { FaLightbulb, FaSpinner, FaExclamationTriangle, FaClock, FaUser, FaStore, FaPhone, FaEnvelope, FaUserTie, FaFlag, FaListAlt } from 'react-icons/fa';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
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

    fetchData();
  }, []);

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
                return leadActivities.length > 0 ? (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FaListAlt className="w-4 h-4 text-purple-500" />
                      <h4 className="text-sm font-semibold text-gray-900">Activities ({leadActivities.length})</h4>
                    </div>
                    <div className="space-y-3">
                      {leadActivities.map((activity) => (
                        <div key={activity.activityid} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                          {/* Activity Header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FaUser className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">
                                {activity.creator.firstname} {activity.creator.lastname}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FaClock className="w-3 h-3" />
                              <span>{formatTimestamp(activity.createdon)}</span>
                            </div>
                          </div>

                          {/* Activity Details */}
                          <div>
                            <h5 className="text-sm font-semibold text-gray-900 mb-1">Activity Details</h5>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{activity.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}


            </div>
          ))}
        </div>
      )}
    </div>
  );
} 