import api from './index';
import { PaymentAccount, CreatePaymentAccountRequest, UpdatePaymentAccountRequest } from '../models/PaymentAccount';

export const getPaymentAccounts = async (storeNumber: number): Promise<PaymentAccount[]> => {
  const response = await api.get(`/paymentaccounts?storenumber=${storeNumber}`);
  return response.data;
};

export const getPaymentAccount = async (paymentAccountId: string): Promise<PaymentAccount> => {
  const response = await api.get(`/paymentaccounts/${paymentAccountId}`);
  return response.data;
};

export const createPaymentAccount = async (paymentAccount: CreatePaymentAccountRequest): Promise<PaymentAccount> => {
  const response = await api.post('/paymentaccounts', paymentAccount);
  return response.data;
};

export const updatePaymentAccount = async (paymentAccountId: string, paymentAccount: UpdatePaymentAccountRequest): Promise<PaymentAccount> => {
  const response = await api.put(`/paymentaccounts/${paymentAccountId}`, paymentAccount);
  return response.data;
};

export const deletePaymentAccount = async (paymentAccountId: string): Promise<void> => {
  await api.delete(`/paymentaccounts/${paymentAccountId}`);
}; 