export type InventoryCountStatus = 'OPEN' | 'COMPLETED' | string;

export interface InventoryCount {
  inventorycountid: string;
  storenumber: number;
  countdate: string;
  status: InventoryCountStatus;
  createdby?: string;
  createdon?: string;
  creator?: { email: string | null; lastname: string; firstname: string; };
}

export interface CreateInventoryCountRequest {
  storenumber: number;
  countdate: string;
  status?: InventoryCountStatus;
}

export interface UpdateInventoryCountRequest {
  countdate?: string;
  status?: InventoryCountStatus;
}
