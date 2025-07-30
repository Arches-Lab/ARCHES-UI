import api from './index';

// Employee API functions
export const getEmployees = async () => {
  const { data } = await api.get('/employees');
  return data;
};