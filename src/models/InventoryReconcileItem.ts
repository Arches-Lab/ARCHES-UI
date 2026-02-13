export interface InventoryReconcileItem {
  inventoryreconcileitemid?: string;
  storenumber: number;
  inventoryreconcileid: string;
  productid: string;
  countedquantity: number;
  product?: { productid: string; sku: string; productname: string };
}

export interface UpsertInventoryReconcileItemRequest {
  storenumber: number;
  inventoryreconcileid: string;
  productid: string;
  countedquantity: number;
  inventoryreconcileitemid?: string;
}
