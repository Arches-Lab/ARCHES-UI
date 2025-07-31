export interface LeadStatus {
  code: string;
  displayName: string;
  color: string;
  icon: string;
}

export const LEAD_STATUSES: LeadStatus[] = [
  { code: 'NEW', displayName: 'New', color: 'bg-blue-100 text-blue-800', icon: '🆕' },
  { code: 'ASSIGNED', displayName: 'Assigned', color: 'bg-green-100 text-green-800', icon: '✅' },
  { code: 'CONTACTED', displayName: 'Contacted', color: 'bg-yellow-100 text-yellow-800', icon: '📞' },
  { code: 'PROPOSAL', displayName: 'Proposal', color: 'bg-purple-100 text-purple-800', icon: '📋' },
  { code: 'CLOSED_WON', displayName: 'Closed Won', color: 'bg-green-100 text-green-800', icon: '🏆' },
  { code: 'CLOSED_LOST', displayName: 'Closed Lost', color: 'bg-red-100 text-red-800', icon: '❌' },
];

export const getLeadStatusDisplayName = (code: string): string => {
  const status = LEAD_STATUSES.find(s => s.code === code);
  return status ? status.displayName : code;
};

export const getLeadStatusColor = (code: string): string => {
  const status = LEAD_STATUSES.find(s => s.code === code);
  return status ? status.color : 'bg-gray-100 text-gray-800';
};

export const getLeadStatusIcon = (code: string): string => {
  const status = LEAD_STATUSES.find(s => s.code === code);
  return status ? status.icon : '📋';
}; 