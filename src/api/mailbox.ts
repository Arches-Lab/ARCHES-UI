import api from './index';

// Mailbox API functions
export const getMailboxes = async () => {
  const { data } = await api.get('/mailboxes');
  return data;
};
