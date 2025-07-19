import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeads } from '../api';
import { FaLightbulb, FaSpinner, FaExclamationTriangle, FaClock, FaUser, FaStore, FaPhone, FaEnvelope, FaUserTie, FaFlag, FaPlus, FaEye } from 'react-icons/fa';
import { useStore } from '../auth/StoreContext';
import CreateLead from '../components/CreateLead';

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

export default function Leads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateLeadModal, setShowCreateLeadModal] = useState(false);
  const { selectedStore } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔄 Fetching leads for store: ${selectedStore}`);
        
        const leadsData = await getLeads();
        
        console.log('Leads data:', leadsData);
        
        setLeads(Array.isArray(leadsData) ? leadsData : []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if selectedStore is a valid number (not null, undefined, or 0)
    if (selectedStore !== null && selectedStore !== undefined) {
      console.log(`🔄 Loading leads for store: ${selectedStore}`);
      fetchData();
    } else {
      // Clear data only when no store is selected
      setLeads([]);
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

  const handleLeadCreated = async () => {
    setShowCreateLeadModal(false);
    
    // Refresh leads data
    try {
      const leadsData = await getLeads();
      setLeads(Array.isArray(leadsData) ? leadsData : []);
    } catch (error) {
      console.error('Error refreshing leads:', error);
    }
  };

  const handleViewLead = (leadId: string) => {
    navigate(`/leads/${leadId}`);
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
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {leads.length} lead{leads.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={() => setShowCreateLeadModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            New Lead
          </button>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <FaLightbulb className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Leads</h3>
          <p className="text-gray-600">You don't have any leads at the moment.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            {leads.map((lead) => (
              <div
                key={lead.leadid}
                className="p-6 transition-all hover:bg-gray-50"
              >
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
                    <br></br>
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
                  
                  {/* Right Side - Information */}
                  <div className="flex flex-col items-end gap-1 text-xs text-gray-500 min-w-[200px]">
                    <button
                      onClick={() => handleViewLead(lead.leadid)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                      title="View lead details"
                    >
                      <FaEye className="w-3 h-3" />
                      <span>View Details</span>
                    </button>
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Lead Modal */}
      {showCreateLeadModal && (
        <CreateLead
          onLeadCreated={handleLeadCreated}
          onCancel={() => setShowCreateLeadModal(false)}
        />
      )}
    </div>
  );
} 