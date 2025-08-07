import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLeads } from '../api';
import { FaLightbulb, FaSpinner, FaExclamationTriangle, FaClock, FaUser, FaStore, FaPhone, FaEnvelope, FaUserTie, FaFlag, FaArrowLeft, FaListAlt, FaVoicemail, FaComment, FaCalendar, FaFileAlt, FaHandshake, FaChartLine, FaExclamationCircle, FaEdit } from 'react-icons/fa';
import { useStore } from '../auth/StoreContext';
import LeadModal from '../components/LeadModal';
import ActivitiesList from '../components/ActivitiesList';
import { Lead, getLeadStatusDisplayName, getLeadStatusColor, getLeadStatusIcon } from '../models';

export default function LeadDetails() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { selectedStore } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔄 Fetching lead details for lead: ${leadId}, store: ${selectedStore}`);
        
        // Fetch leads
        const leadsData = await getLeads();
        
        console.log('Leads data:', leadsData);
        
        // Find the specific lead
        const leads = Array.isArray(leadsData) ? leadsData : [];
        const foundLead = leads.find(l => l.leadid === leadId);
        
        if (!foundLead) {
          setError('Lead not found');
          return;
        }
        
        setLead(foundLead);
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

  const handleEditLead = () => {
    setShowEditModal(true);
  };

  const handleSaveLead = async (leadData: {
    description: string;
    contactname: string;
    phone: string;
    email: string;
    status: string;
    assignedto: string;
    storenumber: number;
  }) => {
    try {
      if (lead) {
        const { updateLead } = await import('../api');
        const updatedLead = await updateLead(lead.leadid, leadData);
        setLead(updatedLead);
        setShowEditModal(false);
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Failed to update lead. Please try again.');
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/leads')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Leads
          </button>
          <div className="flex items-center gap-3">
            <FaLightbulb className="text-3xl text-yellow-600" />
            <div>
              <h2 className="text-2xl font-semibold">Lead Details</h2>
            </div>
          </div>
        </div>
        <button
          onClick={handleEditLead}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          <FaEdit className="w-4 h-4" />
          Edit Lead
        </button>
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
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLeadStatusColor(lead.status || '')}`}>
                    {getLeadStatusIcon(lead.status || '')} {getLeadStatusDisplayName(lead.status || '')}
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
      <ActivitiesList 
        parentType="LEAD" 
        parentId={lead.leadid} 
        title="Activities"
        storeNumber={selectedStore || 1}
      />

      {/* Edit Lead Modal */}
      {showEditModal && lead && (
        <LeadModal
          lead={lead}
          onSave={handleSaveLead}
          onCancel={() => setShowEditModal(false)}
          selectedStore={selectedStore || 1}
        />
      )}
    </div>
  );
} 