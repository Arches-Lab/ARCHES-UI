import { useAuth } from '../auth/AuthContext';

export default function StoreInfo() {
  const { storeNumber, metadata, refreshStoreNumber, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please log in to view store information.</p>
      </div>
    );
  }

  const renderStoreNumbers = () => {
    if (!storeNumber) {
      return <p className="text-gray-500 italic">No store numbers found in token</p>;
    }

    if (Array.isArray(storeNumber)) {
      if (storeNumber.length === 0) {
        return <p className="text-gray-500 italic">Store number array is empty</p>;
      }

      return (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Store Numbers ({storeNumber.length}):</p>
          <div className="flex flex-wrap gap-2">
            {storeNumber.map((number, index) => (
              <span
                key={index}
                className="inline-block px-3 py-2 bg-blue-100 text-blue-800 font-mono text-lg rounded border"
              >
                {number}
              </span>
            ))}
          </div>
        </div>
      );
    }

    // Fallback for single number (shouldn't happen with current implementation)
    return (
      <p className="text-lg font-mono bg-gray-100 px-3 py-2 rounded border">
        {storeNumber}
      </p>
    );
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Store Information</h3>
        <button
          onClick={refreshStoreNumber}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Store Numbers
          </label>
          {renderStoreNumbers()}
        </div>

        {metadata.app_metadata && Object.keys(metadata.app_metadata).length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              App Metadata
            </label>
            <pre className="text-sm bg-gray-100 p-3 rounded border overflow-x-auto">
              {JSON.stringify(metadata.app_metadata, null, 2)}
            </pre>
          </div>
        )}

        {metadata.user_metadata && Object.keys(metadata.user_metadata).length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Metadata
            </label>
            <pre className="text-sm bg-gray-100 p-3 rounded border overflow-x-auto">
              {JSON.stringify(metadata.user_metadata, null, 2)}
            </pre>
          </div>
        )}

        {!metadata.app_metadata && !metadata.user_metadata && (
          <div className="text-gray-500 italic">
            No metadata found in token. Make sure your Auth0 Action is properly configured.
          </div>
        )}
      </div>
    </div>
  );
} 