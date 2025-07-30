export interface LeadStatus {
  code: string;
  displayName: string;
}

export const LEAD_STATUSES: LeadStatus[] = [
  { code: 'NEW', displayName: 'New' },
  { code: 'ASSIGNED', displayName: 'Assigned' },
  { code: 'CONTACTED', displayName: 'Contacted' },
  { code: 'LOST', displayName: 'Lost' },
  { code: 'WON', displayName: 'Won' },
];

export const getLeadStatusDisplayName = (code: string): string => {
  const leadStatus = LEAD_STATUSES.find(status => status.code === code);
  return leadStatus ? leadStatus.displayName : code;
}; 