import api from './index';
import {
  InventoryReconcile,
  CreateInventoryReconcileRequest,
  UpdateInventoryReconcileRequest,
} from '../models/InventoryReconcile';

export const getInventoryReconciles = async (
  storenumber?: number
): Promise<InventoryReconcile[]> => {
  const params = new URLSearchParams();
  if (storenumber) {
    params.append('storenumber', storenumber.toString());
  }
  const queryString = params.toString();
  const url = queryString ? `/inventory-reconciles?${queryString}` : '/inventory-reconciles';
  const { data } = await api.get(url);
  return data;
};

export const getInventoryReconcile = async (
  inventoryReconcileId: string
): Promise<InventoryReconcile> => {
  const { data } = await api.get(`/inventory-reconciles/${inventoryReconcileId}`);
  return data;
};

export const createInventoryReconcile = async (
  request: CreateInventoryReconcileRequest
): Promise<InventoryReconcile> => {
  const { data } = await api.post('/inventory-reconciles', request);
  return data;
};

export const updateInventoryReconcile = async (
  inventoryReconcileId: string,
  request: UpdateInventoryReconcileRequest
): Promise<InventoryReconcile> => {
  const { data } = await api.put(`/inventory-reconciles/${inventoryReconcileId}`, request);
  return data;
};

export const completeInventoryReconcile = async (
  inventoryReconcileId: string
): Promise<InventoryReconcile> => {
  const { data } = await api.post(`/inventory-reconciles/${inventoryReconcileId}/complete`);
  return data;
};
