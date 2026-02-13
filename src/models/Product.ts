export interface Product {
  productid: string;
  storenumber: number;
  sku: string;
  productname: string;
  reorderlevel: number;
  reorderquantity: number;
  isactive: boolean;
  createdby?: string;
  createdon?: string;
  creator?: { email: string | null; lastname: string; firstname: string; };
}

export interface CreateProductRequest {
  storenumber: number;
  sku: string;
  productname: string;
  reorderlevel: number;
  reorderquantity: number;
  isactive: boolean;
}

export interface UpdateProductRequest {
  storenumber: number;
  sku?: string;
  productname?: string;
  reorderlevel?: number;
  reorderquantity?: number;
  isactive?: boolean;
}

export interface ReorderReportItem {
  productid: string;
  sku: string;
  productname: string;
  storenumber: number;
  currentbalance: number;
  reorderlevel: number;
  reorderquantity: number;
}
