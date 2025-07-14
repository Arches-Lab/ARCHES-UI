import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
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

  // // Add selected store to request headers or query params
  // if (getSelectedStore) {
  //   const selectedStore = getSelectedStore();
  //   if (selectedStore) {
  //     // Add as header
  //     config.headers['X-Selected-Store'] = selectedStore.toString();
      
  //     // Also add as query parameter for GET requests
  //     if (config.method === 'get' && config.params) {
  //       config.params.storeId = selectedStore;
  //     } else if (config.method === 'get') {
  //       config.params = { storeId: selectedStore };
  //     }
      
  //     console.log(`🔄 API Request for Store ${selectedStore}:`, config.url);
  //   }
  // }

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

export const getEmployees = async () => {
  const { data } = await api.get('/employees-auth0');
  return data;
};

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

export const getMessages = async () => {
  const { data } = await api.get('/messages');
  return data;
};

export const createMessage = async (messageData: {
  storenumber: number;
  message: string;
  createdfor?: string;
  notification: boolean;
}) => {
  const { data } = await api.post('/messages', messageData);
  return data;
};

export const archiveMessage = async (messageId: string) => {
  const { data } = await api.put(`/messages/${messageId}/archive`);
  return data;
};

export const getLeads = async () => {
  const { data } = await api.get('/leads');
  return data;
};

export const getActivities = async () => {
  const { data } = await api.get('/activities');
  return data;
};

export default api;
