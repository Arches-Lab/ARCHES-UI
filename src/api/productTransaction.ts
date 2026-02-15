import api from './index';
import { ProductTransaction, CreateProductTransactionRequest } from '../models/ProductTransaction';

export const getProductTransactions = async (filters?: {
  storenumber?: number;
  productid?: string;
}): Promise<ProductTransaction[]> => {
  const params = new URLSearchParams();
  if (filters?.storenumber) {
    params.append('storenumber', filters.storenumber.toString());
  }
  if (filters?.productid) {
    params.append('productid', filters.productid);
  }

  const queryString = params.toString();
  const url = queryString ? `/product-transactions?${queryString}` : '/product-transactions';

  const { data } = await api.get(url);
  return data;
};

export const createProductTransaction = async (
  transactionData: CreateProductTransactionRequest
): Promise<ProductTransaction> => {
  const { data } = await api.post('/product-transactions', transactionData);
  return data;
};
