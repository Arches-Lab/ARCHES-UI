import api from './index';
import { TimeCard, TimeCardStatus, TimeCardSummary } from '../models/TimeCard';

export interface ClockInRequest {
  storenumber: number;
  employeeid: string;
  sessiontype: string;
  notes?: string;
}

export interface ClockOutRequest {
  timecardid: string;
  notes?: string;
}

export interface TimeCardResponse {
  timecard: TimeCard;
  message: string;
}

// Clock in an employee
export const clockIn = async (data: ClockInRequest): Promise<TimeCardResponse> => {
  const { data: response } = await api.post('/timecards/clockin', data);
  return response;
};
// Clock ME in
export const clockMeIn = async (): Promise<TimeCardResponse> => {
  const { data: response } = await api.post('/timecards/clockmein');
  return response;
};

// Clock out an employee
export const clockOut = async (data: ClockOutRequest): Promise<TimeCardResponse> => {
  const { data: response } = await api.put('/timecards/clockout', data);
  return response;
};
// Clock ME in
export const clockMeOut = async (): Promise<TimeCardResponse> => {
  const { data: response } = await api.post('/timecards/clockmeout');
  return response;
};

// Start MY break
export const startMyBreak = async (): Promise<TimeCardResponse> => {
  const { data: response } = await api.post('/timecards/startmybreak');
  return response;
};
// End MY break
export const endMyBreak = async (): Promise<TimeCardResponse> => {
  const { data: response } = await api.post('/timecards/endmybreak');
  return response;
};

// Get current timecard for an employee (if they're currently clocked in)
export const getCurrentTimeCard = async (employeeId: string, storeNumber: number): Promise<TimeCard | null> => {
  const { data } = await api.get(`/timecards/current/${employeeId}/${storeNumber}`);
  return data;
};

// Get timecard status for an employee
export const getTimeCardStatus = async (employeeId: string, storeNumber: number): Promise<TimeCardStatus> => {
  const { data } = await api.get(`/timecards/status?employeeid=${employeeId}&storenumber=${storeNumber}`);
  return data;
};

// Get timecard status for ME
export const getMyTimeCardStatus = async (): Promise<TimeCardStatus> => {
  const { data } = await api.get(`/timecards/mystatus`);
  return data;
};

// // Get timecard summary for ME
// export const getMyTimeCardSummary = async (startDate?: string, endDate?: string): Promise<TimeCardSummary[]> => {
//   const params = new URLSearchParams();
//   if (startDate) params.append('dateFrom', startDate);
//   if (endDate) params.append('dateTo', endDate);
  
//   const url = `/timecards/mysummary?${params.toString()}`;
//   console.log('API call URL:', url);
//   console.log('API call params:', { startDate, endDate });
  
//   const { data } = await api.get(url);
//   console.log('API response:', data);
//   return data;
// };

// Get timecard summary for a specific employee
export const getEmployeeTimeCardSummary = async (employeeId: string, startDate?: string, endDate?: string): Promise<TimeCardSummary[]> => {
  const params = new URLSearchParams();
  params.append('employeeId', employeeId);
  if (startDate) params.append('dateFrom', startDate);
  if (endDate) params.append('dateTo', endDate);
  
  const url = `/timecards/summary/${employeeId}?${params.toString()}`;
  console.log('API call URL:', url);
  console.log('API call params:', { employeeId, startDate, endDate });
  
  const { data } = await api.get(url);
  console.log('API response:', data);
  return data;
};

// Get timecards for a specific employee and date
export const getTimeCardsForDate = async (employeeId: string, timecardDate: string): Promise<TimeCard[]> => {
  const params = new URLSearchParams();
  params.append('employeeid', employeeId);
  params.append('timecarddate', timecardDate);
  
  const url = `/timecards/?${params.toString()}`;
  console.log('API call URL:', url);
  console.log('API call params:', { employeeId, timecardDate });
  
  const { data } = await api.get(url);
  console.log('API response:', data);
  return data;
};

// Update timecard record
export const updateTimeCard = async (timecardId: string, updateData: {
  clockin?: string;
  clockout?: string;
  notes?: string;
}): Promise<TimeCard> => {
  const url = `/timecards/${timecardId}`;
  console.log('API call URL:', url);
  console.log('API call data:', updateData);
  
  const { data } = await api.put(url, updateData);
  console.log('API response:', data);
  return data;
};