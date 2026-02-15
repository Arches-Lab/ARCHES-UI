import api from './index';
import {
  InventoryReconcileItem,
  UpsertInventoryReconcileItemRequest,
} from '../models/InventoryReconcileItem';

export const getInventoryReconcileItems = async (
  inventoryReconcileId: string
): Promise<InventoryReconcileItem[]> => {
  console.log('getInventoryReconcileItems', inventoryReconcileId);
  const { data } = await api.get(`/inventory-reconcile-items/${inventoryReconcileId}`);
  return data;
};

export const upsertInventoryReconcileItem = async (
  itemData: UpsertInventoryReconcileItemRequest
): Promise<InventoryReconcileItem> => {
  console.log('upsertInventoryReconcileItem', itemData);
  const { data } = await api.post('/inventory-reconcile-items', itemData);
  return data;
};
