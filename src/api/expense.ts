import api from './index';
import { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../models/Expense';

export const getExpenses = async (storeNumber: number, startDate?: string, endDate?: string): Promise<Expense[]> => {
  let url = `/expenses?storenumber=${storeNumber}`;
  
  if (startDate && endDate) {
    url += `&startdate=${startDate}&enddate=${endDate}`;
  }
  
  const response = await api.get(url);
  return response.data;
};

export const getExpense = async (expenseId: string): Promise<Expense> => {
  const response = await api.get(`/expenses/${expenseId}`);
  return response.data;
};

export const createExpense = async (expense: CreateExpenseRequest): Promise<Expense> => {
  const response = await api.post('/expenses', expense);
  return response.data;
};

export const updateExpense = async (expenseId: string, expense: UpdateExpenseRequest): Promise<Expense> => {
  const response = await api.put(`/expenses/${expenseId}`, expense);
  return response.data;
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  await api.delete(`/expenses/${expenseId}`);
}; 