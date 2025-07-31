import api from './index';

// Task API functions
export const getTasks = async () => {
  const { data } = await api.get('/tasks');
  return data;
};

export const getTask = async (taskId: string) => {
  const { data } = await api.get(`/tasks/${taskId}`);
  return data;
};

export const createTask = async (taskData: {
  storenumber: number;
  taskname: string;
  taskdescription?: string;
  taskstatus?: string;
  assignedto?: string;
}) => {
  const { data } = await api.post('/tasks', taskData);
  return data;
};

export const updateTask = async (taskId: string, taskData: {
  storenumber: number;
  taskname: string;
  taskdescription?: string;
  taskstatus?: string;
  assignedto?: string;
}) => {
  const { data } = await api.put(`/tasks/${taskId}`, taskData);
  return data;
};

export const getActivitiesForTask = async (taskId: string) => {
  const { data } = await api.get(`/activities/parent/TASK/${taskId}`);
  return data;
}; 