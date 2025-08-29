import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreNumber } from './useStoreNumber';
import { setSelectedStoreGetter, updateDefaultStore, getDefaultStore } from '../api';
import { useAuth } from './AuthContext';
import { logDebug, logError } from '../utils/logger';

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
  const navigate = useNavigate();
  const { storeNumber, isLoading, isAuthenticated } = useStoreNumber();
  const { user, isLoading: authLoading } = useAuth();
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [defaultStoreLoading, setDefaultStoreLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Set up the selected store getter for API requests
  useEffect(() => {
    logDebug('🔄 Updating store getter to:', selectedStore);
    setSelectedStoreGetter(() => selectedStore);
  }, [selectedStore]);
  
  // fetch default store from API when authenticated
  useEffect(() => {
    const fetchDefaultStore = async () => {
      if (!isAuthenticated) {
        // Only clear store if there was a previously selected store (user was logged in)
        if (selectedStore !== null) {
          logDebug('🔄 StoreContext: User logged out, clearing selectedStore');
          setSelectedStore(null);
        } else {
          logDebug('🔄 StoreContext: User not authenticated yet (initial load)');
        }
        return;
      }

      try {
        setDefaultStoreLoading(true);
        const data = await getDefaultStore();
        logDebug('Default store from API:', data);
        
        // Handle different response formats
        let defaultStoreNumber: number | null = null;
        
        if (typeof data === 'number') {
          defaultStoreNumber = data;
        } else if (data && typeof data === 'object') {
          // Try common property names for store number
          defaultStoreNumber = data.storenumber || data.store_number || data.storeNumber || data.id || null;
        }
        
        if (defaultStoreNumber) {
          setSelectedStore(defaultStoreNumber);
        } else {
          logDebug('🔄 No valid store data from API:', data);
        }
      } catch (error) {
        logError('❌ Error fetching default store from API:', error);
      } finally {
        setDefaultStoreLoading(false);
      }
    };

    fetchDefaultStore();
  }, [isAuthenticated, authLoading, selectedStore]);

  const handleSetSelectedStore = async (storeNumber: number | null) => {
    logDebug("handleSetSelectedStore", storeNumber);
    
    // Update the default store via API first
    if (storeNumber) {
      try {
        const success = await updateDefaultStore(storeNumber);
        if (success) {
          logDebug('✅ Successfully updated default store via API');
          
          // Update the store getter and state only after successful API call
          setSelectedStoreGetter(() => storeNumber);
          setSelectedStore(storeNumber);
          setRefreshTrigger(prev => prev + 1);
          
          // Small delay to ensure state updates are processed before navigation
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 100);
        } else {
          logError('❌ Failed to update default store via API');
        }
      } catch (error) {
        logError('❌ Error updating default store via API:', error);
      }
    } else {
      // If storeNumber is null, update immediately (for logout scenarios)
      setSelectedStoreGetter(() => storeNumber);
      setSelectedStore(storeNumber);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const refreshData = () => {
    logDebug('🔄 Manual data refresh triggered');
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