import { useEffect, useState } from 'react';
import { getDashboardData } from '../api';
import StoreInfo from '../components/StoreInfo';
import DebugInfo from '../components/DebugInfo';
import AppMetadataManager from '../components/AppMetadataManager';
import TokenScopeTest from '../components/TokenScopeTest';
import { useStore } from '../auth/StoreContext';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const { selectedStore, availableStores } = useStore();

  useEffect(() => {
    if (selectedStore) {
      console.log(`🔄 Loading data for store: ${selectedStore}`);
      getDashboardData().then(setData).catch(console.error);
    }
  }, [selectedStore]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
        {selectedStore && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Currently viewing:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 font-medium rounded">
              Store {selectedStore}
            </span>
          </div>
        )}
      </div>
      
      {/* Store Selection Info */}
      {selectedStore && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Store Context</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-700 mb-1">Selected Store:</p>
              <p className="font-mono text-lg font-semibold text-blue-900">Store {selectedStore}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700 mb-1">Available Stores:</p>
              <div className="flex gap-2">
                {availableStores.map((store) => (
                  <span
                    key={store}
                    className={`px-2 py-1 text-sm rounded ${
                      store === selectedStore
                        ? 'bg-blue-600 text-white font-medium'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {store}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm text-blue-600 mt-3">
            💡 Use the store selector in the header to switch between stores. All data will update automatically.
          </p>
        </div>
      )}

      {/* App Metadata Manager */}
      <AppMetadataManager />
      
      {/* Debug Information Section */}
      <DebugInfo />
      
      {/* Store Information Section */}
      <StoreInfo />
      
      {/* API Data Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          API Data {selectedStore && `(Store ${selectedStore})`}
        </h3>
        {data ? (
          <pre className="text-sm bg-gray-100 p-4 rounded border overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : selectedStore ? (
          <p className="text-gray-500">Loading API data for Store {selectedStore}...</p>
        ) : (
          <p className="text-gray-500">Select a store to load data</p>
        )}
      </div>
    </div>
  );
}
