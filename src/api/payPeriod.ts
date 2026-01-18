import api from './index';
import { PayPeriod } from '../models/PayPeriod';

// Get pay periods for a store
export const getPayPeriods = async (): Promise<PayPeriod[]> => {
  const params = new URLSearchParams();
  
  const queryString = params.toString();
  const url = queryString ? `/payperiods?${queryString}` : '/payperiods';
  
  console.log('API call URL:', url);
  
  const { data } = await api.get(url);
  console.log('API response:', data);
  return data;
};

// Get current open pay period for a store
export const getCurrentPayPeriod = async (storeNumber?: number): Promise<PayPeriod | null> => {
  const params = new URLSearchParams();
  if (storeNumber) {
    params.append('storenumber', storeNumber.toString());
  }
  params.append('status', 'OPEN');
  
  const queryString = params.toString();
  const url = `/payperiods/current?${queryString}`;
  
  console.log('API call URL:', url);
  console.log('API call params:', { storeNumber });
  
  const { data } = await api.get(url);
  console.log('API response:', data);
  return data;
};