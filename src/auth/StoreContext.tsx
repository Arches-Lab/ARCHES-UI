import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useStoreNumber } from './useStoreNumber';
import { setSelectedStoreGetter, updateDefaultStore, getDefaultStore } from '../api';
import { useAuth } from './AuthContext';

type StoreContextType = {
  selectedStore: number | null;
  setSelectedStore: (storeNumber: number | null) => void;
  availableStores: number[];
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshData: () => void;
  refreshTrigger: number;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { storeNumber, isLoading, isAuthenticated } = useStoreNumber();
  const { user } = useAuth();
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [defaultStoreLoading, setDefaultStoreLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Set up the selected store getter for API requests
  useEffect(() => {
    console.log('🔄 Updating store getter to:', selectedStore);
    setSelectedStoreGetter(() => selectedStore);
  }, [selectedStore]);

  // Fetch default store from API when authenticated
  useEffect(() => {
    const fetchDefaultStore = async () => {
      if (!isAuthenticated) {
        setSelectedStore(null);
        return;
      }

      try {
        setDefaultStoreLoading(true);
        const data = await getDefaultStore();
        console.log('Default store from API:', data);
        
        // Handle different response formats
        let defaultStoreNumber: number | null = null;
        if (data && typeof data.storeNumber === 'number') {
          defaultStoreNumber = data.storeNumber;
        } else if (data && typeof data.defaultStore === 'number') {
          defaultStoreNumber = data.defaultStore;
        } else if (data && typeof data.storenumber === 'number') {
          defaultStoreNumber = data.storenumber;
        } else if (typeof data === 'number') {
          defaultStoreNumber = data;
        }
        
        if (defaultStoreNumber) {
          console.log('🔄 Setting default store from API:', defaultStoreNumber);
          setSelectedStore(defaultStoreNumber);
        }
      } catch (error) {
        console.error('❌ Error fetching default store from API:', error);
        // Don't set selectedStore to null here, let the fallback logic handle it
      } finally {
        setDefaultStoreLoading(false);
      }
    };

    fetchDefaultStore();
  }, [isAuthenticated]);

  // Auto-select store when store numbers become available (fallback logic)
  useEffect(() => {
    if (storeNumber && storeNumber.length > 0 && !selectedStore && !defaultStoreLoading) {
      // Fall back to the first store if no default store is set
      console.log('🔄 Auto-selecting first store (fallback):', storeNumber[0]);
      setSelectedStore(storeNumber[0]);
    }
  }, [storeNumber, selectedStore, defaultStoreLoading]);

  // Clear selected store when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setSelectedStore(null);
    }
  }, [isAuthenticated]);

  const handleSetSelectedStore = async (storeNumber: number | null) => {
    console.log('🔄 Switching to store:', storeNumber);
    
    // Update the store getter immediately to ensure API calls use the new store
    setSelectedStoreGetter(() => storeNumber);
    
    // Set the store state and trigger refresh immediately
    setSelectedStore(storeNumber);
    setRefreshTrigger(prev => prev + 1);
    
    // Update the default store via API
    if (storeNumber) {
      try {
        console.log('🔄 Updating default store via API...');
        const success = await updateDefaultStore(storeNumber);
        if (success) {
          console.log('✅ Successfully updated default store via API');
        } else {
          console.error('❌ Failed to update default store via API');
        }
      } catch (error) {
        console.error('❌ Error updating default store via API:', error);
      }
    }
  };

  const refreshData = () => {
    console.log('🔄 Manual data refresh triggered');
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <StoreContext.Provider
      value={{
        selectedStore,
        setSelectedStore: handleSetSelectedStore,
        availableStores: storeNumber || [],
        isLoading: isLoading || defaultStoreLoading,
        isAuthenticated,
        refreshData,
        refreshTrigger
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