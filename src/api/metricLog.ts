import api from './index';
import { MetricLog, CreateMetricLogRequest } from '../models/MetricLog';

export const getMetricLogs = async (metricId: string, params?: { from?: string; to?: string; }): Promise<MetricLog[]> => {
  const search = new URLSearchParams();
  if (params?.from) search.append('from', params.from);
  if (params?.to) search.append('to', params.to);

  const url = search.toString()
    ? `/metriclogs/${metricId}?${search.toString()}`
    : `/metriclogs/${metricId}`;

  const { data } = await api.get(url);
  return data;
};

export const createMetricLog = async (logData: CreateMetricLogRequest): Promise<MetricLog> => {
  const { data } = await api.post('/metriclogs', logData);
  return data;
};
