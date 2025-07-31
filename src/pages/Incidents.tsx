import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaExclamationTriangle, FaUser, FaCalendar, FaStore, FaEye, FaPlus } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';
import { useStore } from '../auth/StoreContext';
import { getIncidents, getEmployees, createIncident } from '../api';
import { Incident, Employee, getIncidentTypeDisplayName, getIncidentTypeStatusIcon, getIncidentStatusDisplayName, getIncidentStatusColor, getIncidentStatusIcon, INCIDENT_STATUSES } from '../models';
import IncidentModal from '../components/IncidentModal';

export default function Incidents() {
  const { user } = useAuth();
  const { selectedStore } = useStore();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterAssignedTo, setFilterAssignedTo] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  // Fetch incidents from API
  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const incidentsData = await getIncidents();
      console.log('Incidents from API:', incidentsData);
      console.log('Status values found:', [...new Set(incidentsData.map((incident: Incident) => incident.status))]);
      setIncidents(incidentsData);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      // Fallback to empty array if API fails
      setIncidents([]);
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
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  };

  useEffect(() => {
    fetchIncidents();
    fetchEmployees();
  }, [selectedStore]);

  const filteredIncidents = incidents.filter(incident => {
    const matchesStatus = !filterStatus || incident.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchesAssignedTo = !filterAssignedTo || incident.assignedto === filterAssignedTo;
    
    return matchesStatus && matchesAssignedTo;
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewIncident = (incident: Incident) => {
    navigate(`/incidents/${incident.incidentid}`);
  };

  const handleCreateIncident = () => {
    setShowCreateModal(true);
  };

  const handleIncidentCreated = async () => {
    setShowCreateModal(false);
    // Refresh incidents data
    try {
      const incidentsData = await getIncidents();
      setIncidents(incidentsData);
    } catch (error) {
      console.error('Error refreshing incidents:', error);
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
      console.error('Error creating incident:', error);
      alert('Failed to create incident. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaExclamationTriangle className="text-3xl text-red-600" />
          <div>
            <h2 className="text-2xl font-semibold">Incidents</h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {incidents.length} incident{incidents.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={handleCreateIncident}
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
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Statuses</option>
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

      {/* Incidents List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        
        {filteredIncidents.length === 0 ? (
          <div className="p-8 text-center">
            <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No incidents found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredIncidents.map((incident) => (
              <div key={incident.incidentid} className="p-6 hover:bg-gray-50 transition-colors">
                {/* Main Content Row */}
                <div className="flex items-start justify-between">
                  {/* Left Side - Incident Details */}
                  <div className="flex-1 pr-4">
                    {/* Status and Type */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getIncidentStatusColor(incident.status || '')}`}>
                        {getIncidentStatusIcon(incident.status || '')} 
                        {getIncidentStatusDisplayName(incident.status || '')}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {getIncidentTypeStatusIcon(incident.incidenttypecode)} {getIncidentTypeDisplayName(incident.incidenttypecode)}
                      </span>
                    </div>
                    
                    {/* Incident Title and Description */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">{incident.title}</h4>
                      {incident.casenumber && (
                        <div className="text-sm text-gray-500 mb-2">
                          Case #: {incident.casenumber}
                        </div>
                      )}
                      {incident.description && (
                        <p className="text-gray-600 mb-3">{incident.description}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Right Side - Information */}
                  <div className="flex flex-col items-end gap-1 text-xs text-gray-500 min-w-[200px]">
                    <button
                      onClick={() => handleViewIncident(incident)}
                      className="flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="View details"
                    >
                      <FaEye className="w-3 h-3" />
                      <span>View Details</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <FaCalendar className="w-3 h-3" />
                      <span>Created On: {formatDate(incident.createdon)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaUser className="w-3 h-3" />
                      <span>Created By: {incident.creator ? incident.creator.firstname + " " + incident.creator.lastname : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaUser className="w-3 h-3" />
                      <span>Assigned To: {incident.assignedto ? incident.assignee.firstname + " " + incident.assignee.lastname : 'Unassigned'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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