import api from './index';

// Lead API functions
export const getLeads = async () => {
  const { data } = await api.get('/leads');
  return data;
};

export const createLead = async (leadData: {
  storenumber: number;
  description: string;
  contactname: string;
  phone: string;
  email: string;
  assignedto: string;
  status: string;
}) => {
  const { data } = await api.post('/leads', leadData);
  return data;
};

export const updateLead = async (leadId: string, leadData: {
  storenumber: number;
  description: string;
  contactname: string;
  phone: string;
  email: string;
  assignedto: string;
  status: string;
}) => {
  const { data } = await api.put(`/leads/${leadId}`, leadData);
  return data;
};