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

export const createEmployee = async (employeeData: {
  firstname: string;
  lastname: string;
  email: string;
  role?: string;
  active: boolean;
  authid?: string;
  storenumber: number;
}) => {
  const { data } = await api.post('/employees', employeeData);
  return data;
};

export const updateEmployee = async (employeeId: string, employeeData: {
  storenumber: number;
  firstname?: string;
  lastname?: string;
  email?: string;
  role?: string;
  active?: boolean;
  authid?: string;
}) => {
  const { data } = await api.put(`/employees/${employeeId}`, employeeData);
  return data;
};

export const getEmployee = async (employeeId: string) => {
  const { data } = await api.get(`/employees/${employeeId}`);
  return data;
};