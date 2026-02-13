export type InventoryReconcileStatus = 'OPEN' | 'COMPLETED' | string;

export interface InventoryReconcile {
  inventoryreconcileid: string;
  storenumber: number;
  reconciledate: string;
  status: InventoryReconcileStatus;
  createdby?: string;
  createdon?: string;
  creator?: { firstname: string; lastname: string; email: string | null };
  completedby?: string;
  completedon?: string;
  completer?: { firstname: string; lastname: string; email: string | null };
}

export interface CreateInventoryReconcileRequest {
  storenumber: number;
  reconciledate: string;
  status?: InventoryReconcileStatus;
}

export interface UpdateInventoryReconcileRequest {
  reconciledate?: string;
  status?: InventoryReconcileStatus;
}
