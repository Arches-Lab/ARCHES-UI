import api from './index';
import { Supply } from '../models/Supply';

export const getSupplies = async (includeArchived?: boolean | null) => {
  const params = new URLSearchParams();
  if (includeArchived !== null && includeArchived !== undefined) {
    params.append('archived', includeArchived.toString());
  }
  
  const { data } = await api.get(`/supplies${params.toString() ? `?${params.toString()}` : ''}`);
  return data;
};

export const getSupply = async (supplyId: string) => {
  const { data } = await api.get(`/supplies/${supplyId}`);
  return data;
};

export const createSupply = async (supplyData: {
  storenumber: number;
  supplyname: string;
  quantity: number;
}) => {
  const { data } = await api.post('/supplies', supplyData);
  return data;
};

export const updateSupply = async (supplyId: string, supplyData: {
  storenumber: number;
  supplyname: string;
  quantity: number;
}) => {
  const { data } = await api.put(`/supplies/${supplyId}`, supplyData);
  return data;
};

export const archiveSupply = async (supplyId: string) => {
  const { data } = await api.put(`/supplies/${supplyId}/archive`);
  return data;
};

export const unarchiveSupply = async (supplyId: string) => {
  const { data } = await api.put(`/supplies/${supplyId}/unarchive`);
  return data;
}; 