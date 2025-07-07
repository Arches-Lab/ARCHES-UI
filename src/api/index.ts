import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
});

api.interceptors.request.use((config) => {
  const token = '';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getDashboardData = async () => {
  const { data } = await api.get('/dashboard');
  return data;
};

export const getUserProfile = async () => {
  const { data } = await api.get('/profile');
  return data;
};

export const updateSettings = async (payload: any) => {
  const { data } = await api.post('/settings', payload);
  return data;
};

export default api;
