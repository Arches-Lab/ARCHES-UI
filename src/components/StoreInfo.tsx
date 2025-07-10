import { useStore } from '../auth/StoreContext';
import { useStoreNumber } from '../auth/useStoreNumber';

export default function StoreInfo() {
  const { selectedStore } = useStore();
  const { 
    storeNumber, 
    hasStoreNumber, 
    storeNumberCount, 
    firstStoreNumber, 
    allStoreNumbers,
    hasSelectedStoreNumber 
  } = useStoreNumber();

  if (!hasStoreNumber) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="text-sm font-medium text-yellow-800">Store Information</h3>
        <p className="text-sm text-yellow-700 mt-1">No store numbers available in token</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
      <h3 className="text-sm font-medium text-blue-800">Store Information</h3>
      <div className="mt-2 space-y-1 text-sm text-blue-700">
        <div>
          <span className="font-medium">Available Stores:</span> {allStoreNumbers.join(', ')}
        </div>
        <div>
          <span className="font-medium">Store Count:</span> {storeNumberCount}
        </div>
        <div>
          <span className="font-medium">First Store:</span> {firstStoreNumber}
        </div>
        <div>
          <span className="font-medium">Currently Selected Store:</span> {selectedStore || 'Not set'}
        </div>
        <div>
          <span className="font-medium">Has SelectedStoreNumber in Token:</span> {hasSelectedStoreNumber ? 'Yes' : 'No'}
        </div>
        <div className="mt-2 p-2 bg-blue-100 rounded text-xs">
          <span className="font-medium">Note:</span> When you switch stores using the StoreSelector, 
          the SelectedStoreNumber will be automatically updated in your Auth0 app_metadata.
        </div>
      </div>
    </div>
  );
} 