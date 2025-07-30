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