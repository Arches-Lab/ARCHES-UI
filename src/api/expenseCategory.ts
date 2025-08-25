import api from './index';
import { ExpenseCategory, CreateExpenseCategoryRequest, UpdateExpenseCategoryRequest } from '../models/ExpenseCategory';

export const getExpenseCategories = async (storeNumber: number): Promise<ExpenseCategory[]> => {
  const response = await api.get(`/expensecategories?storenumber=${storeNumber}`);
  return response.data;
};

export const getExpenseCategory = async (categoryId: string): Promise<ExpenseCategory> => {
  const response = await api.get(`/expensecategories/${categoryId}`);
  return response.data;
};

export const createExpenseCategory = async (category: CreateExpenseCategoryRequest): Promise<ExpenseCategory> => {
  const response = await api.post('/expensecategories', category);
  return response.data;
};

export const updateExpenseCategory = async (categoryId: string, category: UpdateExpenseCategoryRequest): Promise<ExpenseCategory> => {
  const response = await api.put(`/expensecategories/${categoryId}`, category);
  return response.data;
};

export const deleteExpenseCategory = async (categoryId: string): Promise<void> => {
  await api.delete(`/expensecategories/${categoryId}`);
}; 