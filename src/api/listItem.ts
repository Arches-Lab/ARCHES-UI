import api from './index';
import { ListItem, CreateListItemRequest, UpdateListItemRequest } from '../models/ListItem';

// Get all list items for a specific list
export const getListItems = async (listId: string): Promise<ListItem[]> => {
  const { data } = await api.get(`/listitems?listid=${listId}`);
  return data;
};

// Get a specific list item by ID
export const getListItem = async (listItemId: string): Promise<ListItem> => {
  const { data } = await api.get(`/listitems/${listItemId}`);
  return data;
};

// Create a new list item
export const createListItem = async (listItemData: CreateListItemRequest): Promise<ListItem> => {
  const { data } = await api.post('/listitems', listItemData);
  return data;
};

// Update an existing list item
export const updateListItem = async (listItemId: string, listItemData: UpdateListItemRequest): Promise<ListItem> => {
  const { data } = await api.put(`/listitems/${listItemId}`, listItemData);
  return data;
};

// Delete a list item
export const deleteListItem = async (listItemId: string): Promise<void> => {
  await api.delete(`/listitems/${listItemId}`);
}; 