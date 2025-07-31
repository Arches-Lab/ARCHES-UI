import api from './index';

// Activity API functions
export const getActivities = async () => {
  const { data } = await api.get('/activities');
  return data;
};

export const createActivity = async (activityData: {
  storenumber: number;
  parentid: string;
  parenttypecode: string;
  activitytypecode: string;
  details: string;
}) => {
  const { data } = await api.post('/activities', activityData);
  return data;
};