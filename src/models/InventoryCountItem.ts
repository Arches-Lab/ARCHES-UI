export interface InventoryCountItem {
  inventorycountitemid?: string;
  storenumber: number;
  inventorycountid: string;
  productid: string;
  countedquantity: number;
  product?: { productid: string; sku: string; productname: string; };
}

export interface UpsertInventoryCountItemRequest {
  storenumber: number;
  inventorycountid: string;
  productid: string;
  countedquantity: number;
  inventorycountitemid?: string;
}
