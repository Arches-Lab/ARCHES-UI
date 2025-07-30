import axios from 'axios';
import config from '../config/env';

const api = axios.create({
  baseURL: config.api.baseURL,
});

// Create functions to get the token and selected store dynamically
let getToken: (() => Promise<string>) | null = null;
let getSelectedStore: (() => number | null) | null = null;

export const setTokenGetter = (tokenGetter: () => Promise<string>) => {
  getToken = tokenGetter;
};

export const setSelectedStoreGetter = (storeGetter: () => number | null) => {
  getSelectedStore = storeGetter;
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

  // Add selected store to request headers or query params
  if (getSelectedStore) {
    const selectedStore = getSelectedStore();
    console.log(`🔍 API Interceptor - Store: ${selectedStore}, URL: ${config.url}`);
    if (selectedStore !== null && selectedStore !== undefined) {
      // Add as header
      config.headers['X-Selected-Store'] = selectedStore.toString();
      
      // Also add as query parameter for GET requests
      if (config.method === 'get' && config.params) {
        config.params.storeId = selectedStore;
      } else if (config.method === 'get') {
        config.params = { storeId: selectedStore };
      }
      
      console.log(`🔄 API Request for Store ${selectedStore}:`, config.url);
    } else {
      console.log(`⚠️ No store selected for URL: ${config.url}`);
    }
  } else {
    console.log(`⚠️ Store getter not available for URL: ${config.url}`);
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

// Re-export task functions from tasks.ts
export * from './task';
export * from './message';
export * from './lead';
export * from './activity';
export * from './mailbox';
export * from './employee';
export * from './employeestore';

export default api;
