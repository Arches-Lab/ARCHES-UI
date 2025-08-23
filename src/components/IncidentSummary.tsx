import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaUser, FaClock, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { getIncidents } from '../api/incident';
import { Incident } from '../models/Incident';
import { useStore } from '../auth/StoreContext';
import { useAuth } from '../auth/AuthContext';
import { INCIDENT_STATUSES } from '../models/IncidentStatus';

interface IncidentStatusCount {
  status: string;
  count: number;
  color: string;
  icon: React.ReactNode;
}

const IncidentSummary: React.FC = () => {
  const { selectedStore } = useStore();
  const { employeeId } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      if (!selectedStore) return;

      try {
        setLoading(true);
        setError(null);
        const incidentsData = await getIncidents();
        setIncidents(incidentsData);
      } catch (err) {
        console.error('Error fetching incidents:', err);
        setError('Failed to load incidents');
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, [selectedStore]);

  // Filter incidents by logged-in employee and open status
  const openIncidents = incidents.filter(incident => {
    const isOpen = incident.status !== 'RESOLVED';
    const isAssignedToMe = incident.assignedto === employeeId;
    
    // Debug logging
    if (incident.assignedto && employeeId) {
      console.log(`🔍 Incident ${incident.incidentid}: assignedto=${incident.assignedto}, employeeId=${employeeId}, isAssignedToMe=${isAssignedToMe}`);
    }
    
    return isOpen && isAssignedToMe;
  });

  // Group incidents by status
  const getStatusCounts = (): IncidentStatusCount[] => {
    const statusMap = new Map<string, number>();
    
    openIncidents.forEach(incident => {
      const count = statusMap.get(incident.status || 'Unknown') || 0;
      statusMap.set(incident.status || 'Unknown', count + 1);
    });

    const statusConfigs: { [key: string]: { color: string; icon: React.ReactNode } } = {
      'NEW': { color: 'bg-red-500', icon: <FaExclamationTriangle className="w-4 h-4" /> },
      'INPROGRESS': { color: 'bg-blue-500', icon: <FaSpinner className="w-4 h-4" /> },
      'RESOLVED': { color: 'bg-green-500', icon: <FaCheckCircle className="w-4 h-4" /> },
    };

    return Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
      color: statusConfigs[status]?.color || 'bg-gray-500',
      icon: statusConfigs[status]?.icon || <FaExclamationTriangle className="w-4 h-4" />
    }));
  };

  const statusCounts = getStatusCounts();
  const totalOpenIncidents = openIncidents.length;

  if (!selectedStore) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Store Selected</h3>
          <p className="text-gray-500">Please select a store to view incident summary.</p>
        </div>
      </div>
    );
  }

  if (!employeeId) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto text-4xl text-gray-400 mb-4" />
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
          <p className="text-gray-600">Loading incident summary...</p>
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
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">My Incidents</h3>
          <span className="text-sm text-gray-500">
            {totalOpenIncidents} incident{totalOpenIncidents !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Chart Visualization */}
      {statusCounts.length > 0 && (
        <div className="p-4">
          <div className="space-y-2">
            {statusCounts.map((statusCount) => {
              const percentage = totalOpenIncidents > 0 ? (statusCount.count / totalOpenIncidents) * 100 : 0;
              const displayName = INCIDENT_STATUSES.find(s => s.code === statusCount.status)?.displayName || statusCount.status;
              
              // Convert Tailwind color classes to hex colors for inline styles
              const getColorHex = (colorClass: string) => {
                switch (colorClass) {
                  case 'bg-red-500': return '#ef4444';
                  case 'bg-blue-500': return '#3b82f6';
                  case 'bg-green-500': return '#22c55e';
                  case 'bg-orange-500': return '#f97316';
                  default: return '#6b7280';
                }
              };
              
              const backgroundColor = getColorHex(statusCount.color);
              
              return (
                <div key={statusCount.status} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 w-32">
                    <div 
                      className="p-1 rounded-full text-white flex-shrink-0"
                      style={{ backgroundColor }}
                    >
                      {statusCount.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700 truncate whitespace-nowrap">{displayName}</span>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor
                      }}
                    />
                  </div>
                  <div className="w-12 text-right">
                    <span className="text-sm font-medium text-gray-900">{statusCount.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {openIncidents.length === 0 && !loading && (
        <div className="p-4 text-center">
          <FaExclamationTriangle className="mx-auto text-2xl text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">No open incidents assigned</p>
        </div>
      )}
    </div>
  );
};

export default IncidentSummary; 