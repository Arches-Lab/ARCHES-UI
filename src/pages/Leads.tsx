import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeads } from '../api';
import { FaLightbulb, FaSpinner, FaExclamationTriangle, FaClock, FaUser, FaStore, FaPhone, FaEnvelope, FaUserTie, FaFlag, FaPlus, FaEye } from 'react-icons/fa';
import { useStore } from '../auth/StoreContext';
import LeadModal from '../components/LeadModal';
import { Lead, getLeadStatusDisplayName, getLeadStatusColor, getLeadStatusIcon, LEAD_STATUSES } from '../models';

export default function Leads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateLeadModal, setShowCreateLeadModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterAssignedTo, setFilterAssignedTo] = useState<string>('');
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
      const { createLead } = await import('../api');
      await createLead(leadData);
      await handleLeadCreated();
    } catch (error) {
      console.error('Error creating lead:', error);
      alert('Failed to create lead. Please try again.');
    }
  };

  const handleViewLead = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = !filterStatus || lead.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchesAssignedTo = !filterAssignedTo || (lead.assignedto && lead.assignedto === filterAssignedTo);
    
    return matchesStatus && matchesAssignedTo;
  });

  // Get unique assigned employees from leads
  const getUniqueAssignedEmployees = () => {
    const uniqueEmployees = new Map();
    
    leads.forEach(lead => {
      if (lead.assignedto && lead.assigned) {
        const employeeId = lead.assignedto;
        const employeeName = `${lead.assigned.firstname} ${lead.assigned.lastname}`;
        
        if (!uniqueEmployees.has(employeeId)) {
          uniqueEmployees.set(employeeId, {
            employeeid: employeeId,
            firstname: lead.assigned.firstname,
            lastname: lead.assigned.lastname,
            email: lead.assigned.email
          });
        }
      }
    });
    
    return Array.from(uniqueEmployees.values());
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            New Lead
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
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="">All Statuses</option>
              {LEAD_STATUSES.map(status => (
                <option key={status.code} value={status.code.toLowerCase()}>
                  {status.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned To Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
            <select
              value={filterAssignedTo}
              onChange={(e) => setFilterAssignedTo(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
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

      {filteredLeads.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <FaLightbulb className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Leads</h3>
          <p className="text-gray-600">You don't have any leads at the moment.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredLeads.map((lead) => (
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
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLeadStatusColor(lead.status || '')}`}>
                        {getLeadStatusIcon(lead.status || '')} {getLeadStatusDisplayName(lead.status || '')}
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
        <LeadModal
          lead={null}
          onSave={handleSaveLead}
          onCancel={() => setShowCreateLeadModal(false)}
          selectedStore={selectedStore || 1}
        />
      )}
    </div>
  );
} 