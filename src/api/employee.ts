import api from './index';

// Employee API functions
export const getEmployees = async () => {
  const { data } = await api.get('/employees');
  return data;
};

export const getEmployeeByUserId = async (userId: string) => {
  const { data } = await api.get(`/employees/user/${userId}`);
  return data;
};