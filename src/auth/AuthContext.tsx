import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { extractStoreNumber, extractMetadata, TokenMetadata } from './tokenUtils';
import { setTokenGetter } from '../api';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  login: () => void;
  logout: () => void;
  getAccessTokenSilently: () => Promise<string>;
  getIdTokenClaims: () => Promise<any>;
  storeNumber: number[] | null;
  metadata: {
    app_metadata?: TokenMetadata;
    user_metadata?: any;
  };
  refreshStoreNumber: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
    getIdTokenClaims
  } = useAuth0();

  const [storeNumber, setStoreNumber] = useState<number[] | null>(null);
  const [metadata, setMetadata] = useState<{
    app_metadata?: TokenMetadata;
    user_metadata?: any;
  }>({});

  const domain = import.meta.env.VITE_AUTH0_DOMAIN;

  // Set up the token getter for API requests
  useEffect(() => {
    setTokenGetter(getAccessTokenSilently);
  }, [getAccessTokenSilently]);

  const extractStoreNumberFromToken = async () => {
    try {
      if (!isAuthenticated || !domain) {
        console.log('❌ Cannot extract StoreNumber: not authenticated or no domain');
        console.log('🔍 isAuthenticated:', isAuthenticated);
        console.log('🔍 domain:', domain);
        return;
      }
      
      console.log('🔍 Getting access token...');
      const accessToken = await getAccessTokenSilently();
      console.log('✅ Got access token, length:', accessToken.length);
      
      console.log('🔍 Getting ID token claims...');
      const idTokenClaims = await getIdTokenClaims();
      console.log('✅ Got ID token claims:', idTokenClaims);
      
      console.log('🔍 Extracting StoreNumber from access token...');
      const extractedStoreNumberFromAccess = extractStoreNumber(accessToken, domain);
      
      console.log('🔍 Extracting StoreNumber from ID token...');
      const extractedStoreNumberFromId = extractStoreNumber(JSON.stringify(idTokenClaims), domain);
      
      console.log('🔍 Extracting metadata from access token...');
      const extractedMetadata = extractMetadata(accessToken, domain);
      
      console.log('📊 Extraction results:');
      console.log('  - StoreNumber from access token:', extractedStoreNumberFromAccess);
      console.log('  - StoreNumber from ID token:', extractedStoreNumberFromId);
      console.log('  - Metadata:', extractedMetadata);
      
      // Use the first available StoreNumber
      const finalStoreNumber = extractedStoreNumberFromAccess || extractedStoreNumberFromId;
      
      setStoreNumber(finalStoreNumber);
      setMetadata(extractedMetadata);
      
      console.log('✅ StoreNumber extraction completed');
      console.log('  - Final storeNumber state:', finalStoreNumber);
      console.log('  - Final metadata state:', extractedMetadata);
    } catch (error) {
      console.error('❌ Error extracting StoreNumber from token:', error);
      setStoreNumber(null);
      setMetadata({});
    }
  };

  const refreshStoreNumber = async () => {
    await extractStoreNumberFromToken();
  };

  // Extract StoreNumber when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      extractStoreNumberFromToken();
    } else if (!isAuthenticated) {
      setStoreNumber(null);
      setMetadata({});
    }
  }, [isAuthenticated, isLoading, domain]);

  const login = () => {
    loginWithRedirect();
  };

  const logout = () => {
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        isLoading, 
        user, 
        login, 
        logout, 
        getAccessTokenSilently,
        getIdTokenClaims,
        storeNumber,
        metadata,
        refreshStoreNumber
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
