export interface IncidentStatus {
  code: string;
  displayName: string;
  color: string;
  icon: string;
}

export const INCIDENT_STATUSES: IncidentStatus[] = [
  { code: 'NEW', displayName: 'New', color: 'bg-red-100 text-red-800', icon: '🚨' },
  { code: 'ASSIGNED', displayName: 'Assigned', color: 'bg-yellow-100 text-yellow-800', icon: '🔄' },
  { code: 'IN_PROGRESS', displayName: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: '🔄' },
  { code: 'RESOLVED', displayName: 'Resolved', color: 'bg-green-100 text-green-800', icon: '✅' }
];

export const getIncidentStatusDisplayName = (code: string): string => {
  const status = INCIDENT_STATUSES.find(s => s.code === code);
  return status ? status.displayName : code;
};

export const getIncidentStatusColor = (code: string): string => {
  const status = INCIDENT_STATUSES.find(s => s.code === code);
  return status ? status.color : 'bg-gray-100 text-gray-800';
};

export const getIncidentStatusIcon = (code: string): string => {
  const status = INCIDENT_STATUSES.find(s => s.code === code);
  return status ? status.icon : '📋';
}; 
