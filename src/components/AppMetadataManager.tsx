import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { saveCustomValue, getUserAppMetadata } from '../auth/auth0MetadataService';

export default function AppMetadataManager() {
  const { user, isAuthenticated } = useAuth0();
  const [metadataKey, setMetadataKey] = useState<string>('');
  const [metadataValue, setMetadataValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [currentMetadata, setCurrentMetadata] = useState<any>(null);

  // Load current metadata when component mounts
  useEffect(() => {
    if (isAuthenticated && user?.sub) {
      loadCurrentMetadata();
    }
  }, [isAuthenticated, user?.sub]);

  const loadCurrentMetadata = async () => {
    if (!user?.sub) return;

    setIsLoading(true);
    try {
      const metadata = await getUserAppMetadata(user.sub);
      setCurrentMetadata(metadata);
      setResult('✅ Current metadata loaded');
    } catch (error) {
      setResult(`❌ Error loading metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMetadata = async () => {
    if (!user?.sub) {
      setResult('❌ No user ID available');
      return;
    }

    if (!metadataKey.trim()) {
      setResult('❌ Please enter a metadata key');
      return;
    }

    if (!metadataValue.trim()) {
      setResult('❌ Please enter a metadata value');
      return;
    }

    setIsSaving(true);
    setResult('🔄 Saving metadata...');

    try {
      const success = await saveCustomValue(user.sub, metadataKey.trim(), metadataValue.trim());
      
      if (success) {
        setResult(`✅ Successfully saved "${metadataKey}" = "${metadataValue}" to app_metadata!`);
        // Clear the form
        setMetadataKey('');
        setMetadataValue('');
        // Reload current metadata
        await loadCurrentMetadata();
      } else {
        setResult('❌ Failed to save metadata');
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshMetadata = async () => {
    await loadCurrentMetadata();
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Please log in to manage app metadata</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        📝 App Metadata Manager
      </h3>
      
      <div className="space-y-6">
        {/* Current User Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Current User</h4>
          <div className="text-sm text-blue-700">
            <p><strong>User ID:</strong> {user?.sub}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Name:</strong> {user?.name}</p>
          </div>
        </div>

        {/* Save New Metadata */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-3">Save New Metadata</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metadata Key:
              </label>
              <input
                type="text"
                value={metadataKey}
                onChange={(e) => setMetadataKey(e.target.value)}
                placeholder="e.g., favoriteColor, userPreference, customSetting"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metadata Value:
              </label>
              <input
                type="text"
                value={metadataValue}
                onChange={(e) => setMetadataValue(e.target.value)}
                placeholder="e.g., blue, darkMode, true"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={handleSaveMetadata}
              disabled={isSaving || !metadataKey.trim() || !metadataValue.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSaving ? '🔄 Saving...' : '💾 Save to App Metadata'}
            </button>
          </div>
        </div>

        {/* Result Message */}
        {result && (
          <div className={`p-3 rounded-lg text-sm ${
            result.startsWith('✅') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : result.startsWith('❌')
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
          }`}>
            {result}
          </div>
        )}

        {/* Current Metadata Display */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-800">Current App Metadata</h4>
            <button
              onClick={handleRefreshMetadata}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
            </button>
          </div>
          
          {currentMetadata ? (
            <div className="space-y-2">
              {Object.keys(currentMetadata).length > 0 ? (
                Object.entries(currentMetadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="font-medium text-gray-700">{key}:</span>
                    <span className="text-gray-600">{String(value)}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No metadata found</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              {isLoading ? 'Loading metadata...' : 'Click "Refresh" to load current metadata'}
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">💡 How to Use</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Enter a key (e.g., "favoriteColor") and value (e.g., "blue")</li>
            <li>• Click "Save to App Metadata" to store it in Auth0</li>
            <li>• The metadata will be available in your user's app_metadata</li>
            <li>• Use "Refresh" to see the current metadata</li>
            <li>• This data persists across sessions and can be accessed in tokens</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 