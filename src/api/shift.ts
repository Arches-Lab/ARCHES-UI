import api from './index';
import { Shift, CreateShiftRequest, UpdateShiftRequest } from '../models/Shift';

// Get all shifts for a store
export const getShifts = async (storeNumber: number) => {
  const { data } = await api.get(`/shifts?storeNumber=${storeNumber}`);
  return data;
};

// Get a specific shift
export const getShift = async (shiftId: string) => {
  const { data } = await api.get(`/shifts/${shiftId}`);
  return data;
};

// Create a new shift
export const createShift = async (shiftData: CreateShiftRequest) => {
  const { data } = await api.post('/shifts', shiftData);
  return data;
};

// Update an existing shift
export const updateShift = async (shiftId: string, shiftData: UpdateShiftRequest) => {
  const { data } = await api.put(`/shifts/${shiftId}`, shiftData);
  return data;
};

// Delete a shift
export const deleteShift = async (shiftId: string) => {
  const { data } = await api.delete(`/shifts/${shiftId}`);
  return data;
}; 