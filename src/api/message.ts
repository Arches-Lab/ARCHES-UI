import api from './index';

// Messages API functions
export const getMessages = async (archived?: boolean | null) => {
  const params: Record<string, string> = {};
  if (archived !== null && archived !== undefined) {
    // Use 0/1 - some backends expect numeric booleans; "false" can cause 500 in certain stacks
    params.archived = archived ? '1' : '0';
  }

  const { data } = await api.get('/messages', { params });
  return data;
};

export const createMessage = async (messageData: {
  storenumber: number;
  message: string;
  createdfor?: string;
  parentmessageid?: number | null;
  notification: boolean;
}) => {
  const { data } = await api.post('/messages', messageData);
  return data;
};

export const archiveMessage = async (messageId: string) => {
  const { data } = await api.put(`/messages/${messageId}/archive`);
  return data;
};

export const readMessage = async (messageId: string) => {
  const { data } = await api.put(`/messages/${messageId}/read`);
  return data;
};
