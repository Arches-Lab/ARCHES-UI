import api from './index';
import { ScheduleDraft, CreateScheduleDraftRequest, UpdateScheduleDraftRequest } from '../models/ScheduleDraft';

// Get schedule drafts for a date range, optionally filtered by employee
export const getScheduleDrafts = async (startDate: string, endDate: string, employeeId?: string) => {
  const params = new URLSearchParams({
    startdate: startDate,
    enddate: endDate
  });
  
  if (employeeId) {
    params.append('employeeid', employeeId);
  }
  
  const { data } = await api.get(`/scheduledrafts?${params}`);
  return data;
};

// Get schedule drafts for a specific employee
export const getEmployeeScheduleDrafts = async (employeeId: string, storeNumber: number) => {
  const { data } = await api.get(`/scheduledrafts?employeeId=${employeeId}&storeNumber=${storeNumber}`);
  return data;
};

// Get a specific schedule draft
export const getScheduleDraft = async (scheduleDraftId: string) => {
  const { data } = await api.get(`/scheduledrafts/${scheduleDraftId}`);
  return data;
};

// Create a new schedule draft
export const createScheduleDraft = async (scheduleDraftData: CreateScheduleDraftRequest) => {
  const { data } = await api.post('/scheduledrafts', scheduleDraftData);
  return data;
};

// Update an existing schedule draft
export const updateScheduleDraft = async (scheduleDraftId: string, scheduleDraftData: UpdateScheduleDraftRequest) => {
  const { data } = await api.put(`/scheduledrafts/${scheduleDraftId}`, scheduleDraftData);
  return data;
};

// Delete a schedule draft
export const deleteScheduleDraft = async (scheduleDraftId: string) => {
  const { data } = await api.delete(`/scheduledrafts/${scheduleDraftId}`);
  return data;
};

// Publish schedule drafts for a date range
export const publishScheduleDrafts = async (startDate: string, endDate: string) => {
  const { data } = await api.post('/scheduledrafts/publish', {
    startdate: startDate,
    enddate: endDate
  });
  return data;
}; 