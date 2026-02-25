import api from './index';
import { Training, CreateTrainingRequest, UpdateTrainingRequest } from '../models/Training';

export const getTrainings = async (params?: {
  search?: string;
  category?: string;
  active?: boolean | null;
}): Promise<Training[]> => {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.append('search', params.search);
  if (params?.category) searchParams.append('category', params.category);
  if (params?.active !== null && params?.active !== undefined) searchParams.append('active', String(params.active));
  const query = searchParams.toString();
  const url = query ? `/training?${query}` : '/training';
  const { data } = await api.get(url);
  return Array.isArray(data) ? data : [];
};

export const getTraining = async (trainingId: string): Promise<Training> => {
  const { data } = await api.get(`/training/${trainingId}`);
  return data;
};

export const createTraining = async (payload: CreateTrainingRequest): Promise<Training> => {
  const { data } = await api.post('/training', payload);
  return data;
};

export const updateTraining = async (trainingId: string, payload: UpdateTrainingRequest): Promise<Training> => {
  const { data } = await api.put(`/training/${trainingId}`, payload);
  return data;
};

export const deleteTraining = async (trainingId: string): Promise<void> => {
  await api.delete(`/training/${trainingId}`);
};
