import { useAuth } from './AuthContext';

/**
 * Custom hook for accessing the StoreNumber from the authenticated user's token
 * @returns Object containing storeNumber array and loading state
 */
export function useStoreNumber() {
  const { storeNumber, selectedStoreNumber, isLoading, isAuthenticated, refreshStoreNumber } = useAuth();

  return {
    storeNumber,
    selectedStoreNumber,
    isLoading,
    isAuthenticated,
    refreshStoreNumber,
    hasStoreNumber: !!storeNumber && storeNumber.length > 0,
    storeNumberCount: storeNumber ? storeNumber.length : 0,
    firstStoreNumber: storeNumber && storeNumber.length > 0 ? storeNumber[0] : null,
    allStoreNumbers: storeNumber || [],
    hasSelectedStoreNumber: selectedStoreNumber !== null
  };
}

/**
 * Custom hook for accessing all metadata from the authenticated user's token
 * @returns Object containing metadata and loading state
 */
export function useMetadata() {
  const { metadata, isLoading, isAuthenticated } = useAuth();

  return {
    metadata,
    isLoading,
    isAuthenticated,
    appMetadata: metadata.app_metadata,
    userMetadata: metadata.user_metadata
  };
} 