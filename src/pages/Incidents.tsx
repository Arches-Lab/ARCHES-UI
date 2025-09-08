import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaExclamationTriangle, FaUser, FaCalendar, FaStore, FaEye, FaPlus, FaSpinner, FaClock, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';
import { useStore } from '../auth/StoreContext';
import { getIncidents, getEmployees, createIncident } from '../api';
import { Incident, Employee, getIncidentTypeDisplayName, getIncidentTypeStatusIcon, getIncidentStatusDisplayName, getIncidentStatusColor, getIncidentStatusIcon, INCIDENT_STATUSES } from '../models';
import IncidentModal from '../components/IncidentModal';
import { logDebug, logError } from '../utils/logger';

export default function Incidents() {
  const { user } = useAuth();
  const { selectedStore } = useStore();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALLOPEN');
  const [filterAssignedTo, setFilterAssignedTo] = useState<string>('');
  const [showDescriptionFor, setShowDescriptionFor] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch incidents from API
  const fetchIncidents = async (status?: string) => {
    try {
      setLoading(true);
      setError(null);
      logDebug(`🔄 Fetching incidents for store: ${selectedStore}, status: ${status || 'all'}`);
      const incidentsData = await getIncidents(status);
      logDebug('Incidents from API:', incidentsData);
      const incidentsArray = Array.isArray(incidentsData) ? incidentsData : [];
      setIncidents(incidentsArray);
    } catch (err) {
      logError('Error fetching incidents:', err);
      setError('Failed to load incidents. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees for the filter dropdown
  const fetchEmployees = async () => {
    try {
      const employeesData = await getEmployees();
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
    } catch (error) {
      logError('Error fetching employees:', error);
      setEmployees([]);
    }
  };

  useEffect(() => {
    // Only fetch if selectedStore is a valid number (not null, undefined, or 0)
    if (selectedStore !== null && selectedStore !== undefined) {
      logDebug(`🔄 Loading incidents for store: ${selectedStore}`);
      fetchIncidents(filterStatus || undefined);
      fetchEmployees();
    } else {
      // Clear data only when no store is selected
      logDebug(`🔄 No store selected, clearing incidents data`);
      setIncidents([]);
      setLoading(false);
      setError(null);
    }
  }, [selectedStore, filterStatus]);

  const filteredIncidents = incidents.filter(incident => {
    // If we have a server-side filter applied, only do client-side filtering for assignedTo
    const matchesAssignedTo = !filterAssignedTo || incident.assignedto === filterAssignedTo;
    return matchesAssignedTo;
  });

  // Get unique employee IDs from incidents
  const getUniqueAssignedEmployees = () => {
    const assignedEmployeeIds = Array.from(new Set(incidents.map(incident => incident.assignedto).filter(Boolean)));
    return employees.filter(employee => assignedEmployeeIds.includes(employee.employeeid));
  };

  // Get employee name by ID
  const getEmployeeNameById = (employeeId: string) => {
    const employee = employees.find(emp => emp.employeeid === employeeId);
    return employee ? `${employee.firstname} ${employee.lastname}` : employeeId;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const handleViewIncident = (incident: Incident) => {
    navigate(`/incidents/${incident.incidentid}`);
  };

  const handleCreateIncident = () => {
    setShowCreateModal(true);
  };

  const toggleDescription = (incidentId: string) => {
    setShowDescriptionFor(showDescriptionFor === incidentId ? null : incidentId);
  };

  const handleIncidentCreated = async () => {
    setShowCreateModal(false);
    // Refresh incidents data
    try {
      const incidentsData = await getIncidents(filterStatus || undefined);
      setIncidents(Array.isArray(incidentsData) ? incidentsData : []);
    } catch (error) {
      logError('Error refreshing incidents:', error);
    }
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
      await createIncident(incidentData);
      await handleIncidentCreated();
    } catch (error) {
      logError('Error creating incident:', error);
      alert('Failed to create incident. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading incidents...</p>
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
          <FaExclamationTriangle className="text-3xl text-red-600" />
          <h2 className="text-2xl font-semibold">Incidents</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            New Incident
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
              onChange={(e) => {
                const newStatus = e.target.value;
                setFilterStatus(newStatus);
                setFilterAssignedTo('');
                fetchIncidents(newStatus || undefined);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="ALLOPEN">All Open</option>
              {INCIDENT_STATUSES.map(status => (
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
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
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

      {filteredIncidents.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <FaExclamationTriangle className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Incidents</h3>
          <p className="text-gray-600">
            You don't have any incidents at the moment.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Incident
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By/On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIncidents.map((incident) => (
                  <tr key={incident.incidentid} className="hover:bg-gray-50">
                    {/* Incident Column */}
                    <td className="px-6 py-4 align-top w-2/5">
                      <div className="max-w-full">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            {incident.casenumber && (
                              <span className="font-normal text-blue-600 flex-shrink-0">
                                Case #{incident.casenumber}:
                              </span>
                            )}
                            <div className="font-normal text-gray-900" title={incident.description}>
                              {incident.title}
                            </div>
                            <button
                              onClick={() => toggleDescription(incident.incidentid)}
                              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Show description"
                            >
                              <FaInfoCircle className="w-3 h-3" />
                            </button>
                          </div>
                          {showDescriptionFor === incident.incidentid && (
                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border">
                              {incident.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    {/* Type Column */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm align-top w-1/8">
                      {/* <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"> */}
                        {/* {getIncidentTypeStatusIcon(incident.incidenttypecode)}  */}
                        {getIncidentTypeDisplayName(incident.incidenttypecode)}
                      {/* </span> */}
                    </td>
                    
                    {/* Assigned To Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top w-1/6">
                      <div className="flex items-center gap-2">
                        {incident.assignedto ? (
                          <>
                            <FaUser className="w-4 h-4 text-gray-400" />
                            <span>
                              {incident.assignee ? `${incident.assignee.firstname} ${incident.assignee.lastname}` : getEmployeeNameById(incident.assignedto)}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Status Column */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm align-top w-1/8">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getIncidentStatusColor(incident.status || '')}`}>
                        {getIncidentStatusIcon(incident.status || '')} {getIncidentStatusDisplayName(incident.status || '')}
                      </span>
                    </td>
                    
                    {/* Created By/On Column */}
                    <td className="px-4 py-4 text-sm text-gray-500 align-top w-1/6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <FaUser className="w-3 h-3 text-gray-400" />
                          <span className="text-xs">
                            {incident.creator ? `${incident.creator.firstname} ${incident.creator.lastname}` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <FaClock className="w-3 h-3" />
                          <span className="text-xs">{formatDate(incident.createdon)}</span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Actions Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium align-top">
                      <button
                        onClick={() => handleViewIncident(incident)}
                        className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        title="View incident details"
                      >
                        <FaEye className="w-3 h-3" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <IncidentModal
          incident={null}
          onSave={handleSaveIncident}
          onCancel={() => setShowCreateModal(false)}
          selectedStore={selectedStore || 1}
        />
      )}
    </div>
  );
} 