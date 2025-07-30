import api from './index';

// Employee Store API functions
export const getEmployeeStores = async () => {
  const { data } = await api.get('/employee-stores/me');
  return data;
};

export const updateDefaultStore = async (storeNumber: number) => {
  const { data } = await api.put('/employee-stores/default', { storenumber: storeNumber });
  return data;
};

export const getDefaultStore = async () => {
  const { data } = await api.get('/employee-stores/default');
  return data;
};