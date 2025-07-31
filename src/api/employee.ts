import api from './index';

// Employee API functions
export const getEmployees = async (active?: boolean | null) => {
  const params = new URLSearchParams();
  if (active !== null && active !== undefined) {
    params.append('active', active.toString());
  }
  
  const queryString = params.toString();
  const url = queryString ? `/employees?${queryString}` : '/employees';
  
  const { data } = await api.get(url);
  return data;
};

export const getEmployeeByUserId = async (userId: string) => {
  const { data } = await api.get(`/employees/user/${userId}`);
  return data;
};