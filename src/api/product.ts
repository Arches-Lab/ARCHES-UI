import api from './index';
import { Product, CreateProductRequest, UpdateProductRequest, ReorderReportItem } from '../models/Product';

export const getProducts = async (active?: boolean | null): Promise<Product[]> => {
  const params = new URLSearchParams();
  if (active !== null && active !== undefined) {
    params.append('active', active.toString());
  }

  const queryString = params.toString();
  const url = queryString ? `/products?${queryString}` : '/products';

  const { data } = await api.get(url);
  return data;
};

export const getProduct = async (productId: string): Promise<Product> => {
  const { data } = await api.get(`/products/${productId}`);
  return data;
};

export const createProduct = async (productData: CreateProductRequest): Promise<Product> => {
  const { data } = await api.post('/products', productData);
  return data;
};

export const updateProduct = async (productId: string, productData: UpdateProductRequest): Promise<Product> => {
  const { data } = await api.put(`/products/${productId}`, productData);
  return data;
};

/**
 * Backend Implementation Guide:
 * 
 * The backend endpoint GET /reorder-report should:
 * 1. Accept optional query parameter: storenumber (number)
 * 2. Query products table filtered by storenumber (if provided)
 * 3. Calculate current balance for each product by summing quantitychange from inventory_transactions
 *    WHERE productid = product.productid AND storenumber = product.storenumber
 * 4. Filter products where: currentbalance <= reorderlevel
 * 5. Return array of ReorderReportItem objects with:
 *    - productid, sku, productname, storenumber (from products table)
 *    - currentbalance (calculated from transactions)
 *    - reorderlevel, reorderquantity (from products table)
 * 
 * Example SQL (PostgreSQL):
 * SELECT 
 *   p.productid,
 *   p.sku,
 *   p.productname,
 *   p.storenumber,
 *   COALESCE(SUM(it.quantitychange), 0) as currentbalance,
 *   p.reorderlevel,
 *   p.reorderquantity
 * FROM products p
 * LEFT JOIN inventory_transactions it 
 *   ON it.productid = p.productid 
 *   AND it.storenumber = p.storenumber
 * WHERE p.isactive = true
 *   AND (p.storenumber = $storenumber OR $storenumber IS NULL)
 * GROUP BY p.productid, p.sku, p.productname, p.storenumber, p.reorderlevel, p.reorderquantity
 * HAVING COALESCE(SUM(it.quantitychange), 0) <= p.reorderlevel
 * ORDER BY p.sku;
 */

export const getReorderReport = async (
  storenumber?: number
): Promise<ReorderReportItem[]> => {
  const params = new URLSearchParams();
  if (storenumber) {
    params.append('storenumber', storenumber.toString());
  }

  const queryString = params.toString();
  const url = queryString ? `/products/reorder-report?${queryString}` : '/reorder-report';

  const { data } = await api.get(url);
  return data;
};
