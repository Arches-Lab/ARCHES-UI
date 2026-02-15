import api from './index';
import { Metric, CreateMetricRequest, UpdateMetricRequest } from '../models/Metric';

export const getMetrics = async (): Promise<Metric[]> => {
  const { data } = await api.get('/metrics');
  return data;
};

export const getMetric = async (metricId: string): Promise<Metric> => {
  const { data } = await api.get(`/metrics/${metricId}`);
  return data;
};

export const createMetric = async (metricData: CreateMetricRequest): Promise<Metric> => {
  const { data } = await api.post('/metrics', metricData);
  return data;
};

export const updateMetric = async (metricId: string, metricData: UpdateMetricRequest): Promise<Metric> => {
  const { data } = await api.put(`/metrics/${metricId}`, metricData);
  return data;
};

export const getMetricTrend = async (metricId: string, params: {
  groupBy: 'month' | 'year';
  from?: string;
  to?: string;
}): Promise<{ labels: string[]; values: number[] }> => {
  const search = new URLSearchParams();
  search.append('groupBy', params.groupBy);
  if (params.from) search.append('from', params.from);
  if (params.to) search.append('to', params.to);

  const { data } = await api.get(`/metrics/${metricId}/trend?${search.toString()}`);
  return data;
};
