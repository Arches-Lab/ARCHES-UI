import React, { useState, useEffect } from 'react';
import { FaUser, FaPhone, FaEnvelope, FaCheckCircle, FaTimesCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { getLeads } from '../api/lead';
import { Lead } from '../models/Lead';
import { useStore } from '../auth/StoreContext';
import { useAuth } from '../auth/AuthContext';
import { LEAD_STATUSES } from '../models/LeadStatus';

interface LeadStatusCount {
  status: string;
  displayName: string;
  count: number;
  color: string;
  icon: React.ReactNode;
}

const LeadSummary: React.FC = () => {
  const { selectedStore } = useStore();
  const { employeeId } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      if (!selectedStore) return;

      try {
        setLoading(true);
        setError(null);
        const leadsData = await getLeads();
        setLeads(leadsData);
      } catch (err) {
        console.error('Error fetching leads:', err);
        setError('Failed to load leads');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [selectedStore]);

  // Filter leads by logged-in employee and active status
  const activeLeads = leads.filter(lead => {
    const isActive = lead.status !== 'CLOSED_WON' && lead.status !== 'CLOSED_LOST';
    const isAssignedToMe = lead.assignedto === employeeId;
    
    // Debug logging
    if (lead.assignedto && employeeId) {
      console.log(`🔍 Lead ${lead.leadid}: assignedto=${lead.assignedto}, employeeId=${employeeId}, isAssignedToMe=${isAssignedToMe}`);
    }
    
    return isActive && isAssignedToMe;
  });

  // Group leads by status
  const getStatusCounts = (): LeadStatusCount[] => {
    const statusMap = new Map<string, number>();
    
    activeLeads.forEach(lead => {
      const count = statusMap.get(lead.status || 'Unknown') || 0;
      statusMap.set(lead.status || 'Unknown', count + 1);
    });

    // Debug: log the actual statuses we're getting
    console.log('🔍 Lead statuses found:', Array.from(statusMap.keys()));

    const statusConfigs: { [key: string]: { color: string; icon: React.ReactNode; displayName: string } } = {
      'NEW': { color: 'bg-red-500', icon: <FaUser className="w-4 h-4" />, displayName: 'New' },
      'CONTACTED': { color: 'bg-yellow-500', icon: <FaPhone className="w-4 h-4" />, displayName: 'Contacted' },
      'PROPOSAL': { color: 'bg-purple-500', icon: <FaEnvelope className="w-4 h-4" />, displayName: 'Proposal' },
      'CLOSED_WON': { color: 'bg-green-500', icon: <FaCheckCircle className="w-4 h-4" />, displayName: 'Closed Won' },
      'CLOSED_LOST': { color: 'bg-orange-500', icon: <FaTimesCircle className="w-4 h-4" />, displayName: 'Closed Lost' }
    };

    return Array.from(statusMap.entries()).map(([status, count]) => {
      const config = statusConfigs[status] || statusConfigs[status.toLowerCase()] || { 
        color: 'bg-gray-500', 
        icon: <FaUser className="w-4 h-4" />,
        displayName: status
      };
      
      console.log(`🔍 Lead Status: ${status}, Color: ${config.color}`);
      
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
  const totalActiveLeads = activeLeads.length;

  if (!selectedStore) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaUser className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Store Selected</h3>
          <p className="text-gray-500">Please select a store to view lead summary.</p>
        </div>
      </div>
    );
  }

  if (!employeeId) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaUser className="mx-auto text-4xl text-gray-400 mb-4" />
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
          <p className="text-gray-600">Loading lead summary...</p>
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">My Leads</h3>
          <div className="space-y-3">
            {statusCounts.map((statusCount) => {
              const percentage = totalActiveLeads > 0 ? (statusCount.count / totalActiveLeads) * 100 : 0;
              
              // Convert Tailwind color classes to hex colors for inline styles
              const getColorHex = (colorClass: string) => {
                switch (colorClass) {
                  case 'bg-red-500': return '#ef4444';
                  case 'bg-blue-500': return '#3b82f6';
                  case 'bg-green-500': return '#22c55e';
                  case 'bg-orange-500': return '#f97316';
                  case 'bg-yellow-500': return '#eab308';
                  case 'bg-purple-500': return '#8b5cf6';
                  case 'bg-gray-500': return '#6b7280';
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
      {activeLeads.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FaUser className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Leads Assigned to You</h3>
        </div>
      )}
    </div>
  );
};

export default LeadSummary; 