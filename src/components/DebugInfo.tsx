import { useAuth } from '../auth/AuthContext';
import { useAuth0 } from '@auth0/auth0-react';

export default function DebugInfo() {
  const { storeNumber, metadata, isAuthenticated, isLoading } = useAuth();
  const { user, getAccessTokenSilently, getIdTokenClaims } = useAuth0();

  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  const handleDebugToken = async () => {
    try {
      console.log('🔍 === TOKEN DEBUG START ===');
      
      const accessToken = await getAccessTokenSilently();
      console.log('🔍 Access token:', accessToken);
      
      const idTokenClaims = await getIdTokenClaims();
      console.log('🔍 ID token claims:', idTokenClaims);
      
      // Decode access token
      const base64Url = accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decodedAccessToken = JSON.parse(jsonPayload);
      console.log('🔍 Decoded access token:', decodedAccessToken);
      
      console.log('🔍 === TOKEN DEBUG END ===');
    } catch (error) {
      console.error('❌ Error getting token:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug Information</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Environment Variables</h4>
          <div className="bg-white p-3 rounded border text-sm">
            <p><strong>Domain:</strong> {domain || 'Not set'}</p>
            <p><strong>Client ID:</strong> {clientId || 'Not set'}</p>
            <p><strong>Audience:</strong> {audience || 'Not set'}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Auth State</h4>
          <div className="bg-white p-3 rounded border text-sm">
            <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            <p><strong>Store Numbers:</strong> {
              storeNumber 
                ? Array.isArray(storeNumber) 
                  ? `[${storeNumber.join(', ')}] (${storeNumber.length} stores)`
                  : storeNumber
                : 'Not found'
            }</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">User Info</h4>
          <div className="bg-white p-3 rounded border text-sm">
            <p><strong>Name:</strong> {user?.name || 'Not available'}</p>
            <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
            <p><strong>User ID:</strong> {user?.sub || 'Not available'}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Metadata</h4>
          <div className="bg-white p-3 rounded border text-sm">
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </div>
        </div>

        <div>
          <button
            onClick={handleDebugToken}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Debug Tokens (Check Console)
          </button>
        </div>
      </div>
    </div>
  );
} 