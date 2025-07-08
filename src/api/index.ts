import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
});

// Create a function to get the token dynamically
let getToken: (() => Promise<string>) | null = null;

export const setTokenGetter = (tokenGetter: () => Promise<string>) => {
  getToken = tokenGetter;
};

api.interceptors.request.use(async (config) => {
  if (getToken) {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token for API request:', error);
    }
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
