import api from './index';
import { StoreOperation } from '../models';

// Get store operations for the last 7 days
export const getStoreOperations = async (storeNumber: number) => {
  const { data } = await api.get(`/store-operations?storeNumber=${storeNumber}&days=7`);
  return data;
};

// Create a new store operation
export const createStoreOperation = async (operation: Omit<StoreOperation, 'storeoperationid' | 'createdon' | 'creator' | 'createdby'>) => {
  const { data } = await api.post('/store-operations', operation);
  return data;
}; 