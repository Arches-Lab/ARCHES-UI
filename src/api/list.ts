import api from './index';
import { List } from '../models/List';

// Get all lists for a store
export const getLists = async (storeNumber: number): Promise<List[]> => {
  try {
    const { data } = await api.get(`/lists?storenumber=${storeNumber}`);
    return data || [];
  } catch (error) {
    console.error('Error fetching lists:', error);
    return [];
  }
};

// Get a specific list by ID
export const getList = async (listId: string): Promise<List> => {
  const { data } = await api.get(`/lists/${listId}`);
  return data;
};

// Create a new list
export const createList = async (listData: {
  storenumber: number;
  listname: string;
  description?: string;
  datatype?: string;
  createdby: string;
}): Promise<List> => {
  const { data } = await api.post('/lists', listData);
  return data;
}; 