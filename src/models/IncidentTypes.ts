export interface IncidentType {
  code: string;
  displayName: string;
  icon: string;
}

export const INCIDENT_TYPES: IncidentType[] = [
  { code: 'GENERAL', displayName: 'General', icon: '⚠️' },
  { code: 'MAILBOX', displayName: 'Mailboxes', icon: '📬' },
  { code: 'UPSCLAIM', displayName: 'UPS Claim', icon: '🚛' },
  { code: 'UPSBILLING', displayName: 'UPS Billing', icon: '🚛' },
];

export const getIncidentTypeDisplayName = (code: string): string => {
  const incidentType = INCIDENT_TYPES.find(type => type.code === code);
  return incidentType ? incidentType.displayName : code;
}; 

export const getIncidentTypeStatusIcon = (code: string): string => {
  const incidentType = INCIDENT_TYPES.find(s => s.code === code);
  return incidentType ? incidentType.icon : '📋';
}; 