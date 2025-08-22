import api from './index';
import { Schedule, CreateScheduleRequest, UpdateScheduleRequest } from '../models/Schedule';

// Get schedules for a date range, optionally filtered by employee
export const getSchedules = async (startDate: string, endDate: string, employeeId?: string) => {
  console.log('employeeId', employeeId);
  const params = new URLSearchParams({
    startdate: startDate,
    enddate: endDate
  });
  
  if (employeeId) {
    params.append('employeeid', employeeId);
  }
  console.log('params', params);
  const { data } = await api.get(`/schedules?${params}`);
  console.log('data', data);
  return data;
};

// Get schedules for a specific employee
export const getEmployeeSchedules = async (employeeId: string, startDate: string, endDate: string) => {
  const params = new URLSearchParams({
    startDate,
    endDate
  });
  
  const { data } = await api.get(`/employees/${employeeId}/schedules?${params}`);
  return data;
};

// Create a new schedule
export const createSchedule = async (scheduleData: CreateScheduleRequest) => {
  const { data } = await api.post('/schedules', scheduleData);
  return data;
};

// Update an existing schedule
export const updateSchedule = async (scheduleId: string, scheduleData: UpdateScheduleRequest) => {
  const { data } = await api.put(`/schedules/${scheduleId}`, scheduleData);
  return data;
};

// Delete a schedule
export const deleteSchedule = async (scheduleId: string) => {
  const { data } = await api.delete(`/schedules/${scheduleId}`);
  return data;
};

// Get a specific schedule
export const getSchedule = async (scheduleId: string) => {
  const { data } = await api.get(`/schedules/${scheduleId}`);
  return data;
}; 