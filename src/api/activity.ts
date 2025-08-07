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

export const getActivitiesForEmployee = async (employeeId: string) => {
  const { data } = await api.get(`/activities/parent/EMPLOYEE/${employeeId}`);
  return data;
};

export const getRecentActivities = async (days: number = 2, storeNumber: number) => {
  // Ensure days is between 1 and 7
  const validDays = Math.max(1, Math.min(7, days));
  
  // Calculate date range
  const endDate = new Date().toISOString().split('T')[0]; // yyyy-mm-dd format
  const startDate = new Date(Date.now() - validDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // days ago
  console.log(`🔄 Fetching recent activities for store: ${storeNumber}, days: ${validDays}`);
  console.log(`🔄 Start date: ${startDate}, End date: ${endDate}`);
  const { data } = await api.get(`/activities/date-range?startDate=${startDate}&endDate=${endDate}&storenumber=${storeNumber}`);
  return data;
};

export const getActivitiesForParent = async (parentId: string, parentType: string) => {
  const { data } = await api.get(`/activities/parent/${parentType}/${parentId}`);
  return data;
};