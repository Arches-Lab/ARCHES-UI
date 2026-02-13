export type ProductTransactionType = 'PURCHASE' | 'SALE' | string;

export interface ProductTransaction {
  producttransactionid: string;
  storenumber: number;
  productid: string;
  transactiontype: ProductTransactionType;
  quantitychange: number;
  productprice?: number | null;
  referencetype?: string | null;
  referenceid?: string | null;
  note?: string | null;
  createdby?: string;
  createdon?: string;
  product?: { productid: string; sku: string; productname: string; };
  creator?: { email: string | null; lastname: string; firstname: string; };
}

export interface CreateProductTransactionRequest {
  storenumber: number;
  productid: string;
  transactiontype: ProductTransactionType;
  quantitychange: number;
  productprice?: number | null;
  referencetype?: string | null;
  referenceid?: string | null;
  note?: string | null;
}
