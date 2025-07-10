import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useStoreNumber } from './useStoreNumber';
import { setSelectedStoreGetter } from '../api';
import { updateSelectedStore } from './auth0MetadataService';
import { useAuth } from './AuthContext';

type StoreContextType = {
  selectedStore: number | null;
  setSelectedStore: (storeNumber: number | null) => void;
  availableStores: number[];
  isLoading: boolean;
  isAuthenticated: boolean;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { storeNumber, selectedStoreNumber, isLoading, isAuthenticated } = useStoreNumber();
  const { user: auth0User } = useAuth();
  const [selectedStore, setSelectedStore] = useState<number | null>(null);

  // Set up the selected store getter for API requests
  useEffect(() => {
    setSelectedStoreGetter(() => selectedStore);
  }, [selectedStore]);

  // Auto-select store when store numbers become available
  useEffect(() => {
    if (storeNumber && storeNumber.length > 0 && !selectedStore) {
      // First, try to use the SelectedStoreNumber from the token
      if (selectedStoreNumber && storeNumber.includes(selectedStoreNumber)) {
        console.log('🔄 Auto-selecting store from token SelectedStoreNumber:', selectedStoreNumber);
        setSelectedStore(selectedStoreNumber);
      } else {
        // Fall back to the first store if SelectedStoreNumber is not available or not in the list
        console.log('🔄 Auto-selecting first store (fallback):', storeNumber[0]);
        setSelectedStore(storeNumber[0]);
      }
    }
  }, [storeNumber, selectedStoreNumber, selectedStore]);

  // Clear selected store when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setSelectedStore(null);
    }
  }, [isAuthenticated]);

  const handleSetSelectedStore = async (storeNumber: number | null) => {
    console.log('🔄 Switching to store:', storeNumber);
    setSelectedStore(storeNumber);
    
    // Update the SelectedStoreNumber in Auth0 app_metadata
    if (storeNumber && auth0User?.sub) {
      try {
        console.log('🔄 Updating SelectedStoreNumber in Auth0 app_metadata...');
        const success = await updateSelectedStore(auth0User.sub, storeNumber);
        if (success) {
          console.log('✅ Successfully updated SelectedStoreNumber in Auth0 app_metadata');
        } else {
          console.error('❌ Failed to update SelectedStoreNumber in Auth0 app_metadata');
        }
      } catch (error) {
        console.error('❌ Error updating SelectedStoreNumber in Auth0 app_metadata:', error);
      }
    }
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