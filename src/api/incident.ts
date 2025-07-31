import api from './index';

// Incident API functions
export const getIncidents = async () => {
  const { data } = await api.get('/incidents');
  return data;
};

export const getIncident = async (incidentId: string) => {
  const { data } = await api.get(`/incidents/${incidentId}`);
  return data;
};

export const createIncident = async (incidentData: {
  storenumber: number;
  incidenttypecode: string;
  title: string;
  description?: string;
  status?: string;
  assignedto?: string;
}) => {
  const { data } = await api.post('/incidents', incidentData);
  return data;
};

export const updateIncident = async (incidentId: string, incidentData: {
  storenumber: number;
  incidenttypecode: string;
  title: string;
  description?: string;
  status?: string;
  assignedto?: string;
}) => {
  const { data } = await api.put(`/incidents/${incidentId}`, incidentData);
  return data;
};

export const getActivitiesForIncident = async (incidentId: string) => {
  const { data } = await api.get(`/activities/parent/INCIDENT/${incidentId}`);
  return data;
}; 