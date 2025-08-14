import api from './index';
import { Text } from '../models';

export const getTexts = async (): Promise<Text[]> => {
  const response = await api.get('/text/texts');
  console.log('🔍 API Response:', response);
  console.log('🔍 API Response data:', response.data);
  
  // Handle different possible response structures
  let textsData = response.data;
  
  // If data is nested in a 'data' property
  if (response.data && response.data.data && Array.isArray(response.data.data)) {
    textsData = response.data.data;
  }
  // If data is nested in a 'texts' property
  else if (response.data && response.data.texts && Array.isArray(response.data.texts)) {
    textsData = response.data.texts;
  }
  // If data is nested in an 'items' property
  else if (response.data && response.data.items && Array.isArray(response.data.items)) {
    textsData = response.data.items;
  }
  
  console.log('🔍 Processed texts data:', textsData);
  return textsData || [];
};

export const createText = async (text: Omit<Text, 'textid' | 'createdon'>): Promise<Text> => {
  const { data } = await api.post('/texts', text);
  return data;
};

export const archiveText = async (textId: string): Promise<Text> => {
  const { data } = await api.put(`/text/texts/${textId}/archive`);
  return data;
}; 