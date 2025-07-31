import api from './index';

// Messages API functions
export const getMessages = async (archived?: boolean | null) => {
  const params = new URLSearchParams();
  if (archived !== null && archived !== undefined) {
    params.append('archived', archived.toString());
  }
  
  const queryString = params.toString();
  const url = queryString ? `/messages?${queryString}` : '/messages';
  
  const { data } = await api.get(url);
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

