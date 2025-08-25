import api from './index';
import { Payee, CreatePayeeRequest, UpdatePayeeRequest } from '../models/Payee';

export const getPayees = async (storeNumber: number): Promise<Payee[]> => {
  const response = await api.get(`/payees?storenumber=${storeNumber}`);
  return response.data;
};

export const getPayee = async (payeeId: string): Promise<Payee> => {
  const response = await api.get(`/payees/${payeeId}`);
  return response.data;
};

export const createPayee = async (payee: CreatePayeeRequest): Promise<Payee> => {
  const response = await api.post('/payees', payee);
  return response.data;
};

export const updatePayee = async (payeeId: string, payee: UpdatePayeeRequest): Promise<Payee> => {
  const response = await api.put(`/payees/${payeeId}`, payee);
  return response.data;
};

export const deletePayee = async (payeeId: string): Promise<void> => {
  await api.delete(`/payees/${payeeId}`);
}; 