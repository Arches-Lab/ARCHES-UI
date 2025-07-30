import api from './index';

// Messages API functions
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

