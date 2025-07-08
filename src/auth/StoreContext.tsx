import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useStoreNumber } from './useStoreNumber';
import { setSelectedStoreGetter } from '../api';

type StoreContextType = {
  selectedStore: number | null;
  setSelectedStore: (storeNumber: number | null) => void;
  availableStores: number[];
  isLoading: boolean;
  isAuthenticated: boolean;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { storeNumber, isLoading, isAuthenticated } = useStoreNumber();
  const [selectedStore, setSelectedStore] = useState<number | null>(null);

  // Set up the selected store getter for API requests
  useEffect(() => {
    setSelectedStoreGetter(() => selectedStore);
  }, [selectedStore]);

  // Auto-select first store when store numbers become available
  useEffect(() => {
    if (storeNumber && storeNumber.length > 0 && !selectedStore) {
      console.log('🔄 Auto-selecting first store:', storeNumber[0]);
      setSelectedStore(storeNumber[0]);
    }
  }, [storeNumber, selectedStore]);

  // Clear selected store when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setSelectedStore(null);
    }
  }, [isAuthenticated]);

  const handleSetSelectedStore = (storeNumber: number | null) => {
    console.log('🔄 Switching to store:', storeNumber);
    setSelectedStore(storeNumber);
  };

  return (
    <StoreContext.Provider
      value={{
        selectedStore,
        setSelectedStore: handleSetSelectedStore,
        availableStores: storeNumber || [],
        isLoading,
        isAuthenticated
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
} 