import { useStore } from './StoreContext';

/**
 * Custom hook for accessing the currently selected store
 * @returns Object containing selected store and related utilities
 */
export function useSelectedStore() {
  const { selectedStore, setSelectedStore, availableStores, isLoading, isAuthenticated } = useStore();

  return {
    selectedStore,
    setSelectedStore,
    availableStores,
    isLoading,
    isAuthenticated,
    hasSelectedStore: selectedStore !== null,
    canSwitchStores: availableStores.length > 1,
    switchToStore: (storeNumber: number) => {
      if (availableStores.includes(storeNumber)) {
        setSelectedStore(storeNumber);
      } else {
        console.warn(`Store ${storeNumber} is not available`);
      }
    }
  };
} 