import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { extractStoreNumber, extractSelectedStoreNumber, extractMetadata, TokenMetadata } from './tokenUtils';
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
  selectedStoreNumber: number | null;
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
  const [selectedStoreNumber, setSelectedStoreNumber] = useState<number | null>(null);
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
      
      console.log('🔍 Extracting SelectedStoreNumber from access token...');
      const extractedSelectedStoreNumberFromAccess = extractSelectedStoreNumber(accessToken, domain);
      
      console.log('🔍 Extracting SelectedStoreNumber from ID token...');
      const extractedSelectedStoreNumberFromId = extractSelectedStoreNumber(JSON.stringify(idTokenClaims), domain);
      
      console.log('🔍 Extracting metadata from access token...');
      const extractedMetadata = extractMetadata(accessToken, domain);
      
      console.log('📊 Extraction results:');
      console.log('  - StoreNumber from access token:', extractedStoreNumberFromAccess);
      console.log('  - StoreNumber from ID token:', extractedStoreNumberFromId);
      console.log('  - SelectedStoreNumber from access token:', extractedSelectedStoreNumberFromAccess);
      console.log('  - SelectedStoreNumber from ID token:', extractedSelectedStoreNumberFromId);
      console.log('  - Metadata:', extractedMetadata);
      
      // Use the first available StoreNumber
      const finalStoreNumber = extractedStoreNumberFromAccess || extractedStoreNumberFromId;
      
      // Use the first available SelectedStoreNumber
      const finalSelectedStoreNumber = extractedSelectedStoreNumberFromAccess || extractedSelectedStoreNumberFromId;
      
      setStoreNumber(finalStoreNumber);
      setSelectedStoreNumber(finalSelectedStoreNumber);
      setMetadata(extractedMetadata);
      
      console.log('✅ StoreNumber extraction completed');
      console.log('  - Final storeNumber state:', finalStoreNumber);
      console.log('  - Final selectedStoreNumber state:', finalSelectedStoreNumber);
      console.log('  - Final metadata state:', extractedMetadata);
    } catch (error) {
      console.error('❌ Error extracting StoreNumber from token:', error);
      setStoreNumber(null);
      setSelectedStoreNumber(null);
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
      setSelectedStoreNumber(null);
      setMetadata({});
    }
  }, [isAuthenticated, isLoading, domain]);

  const login = () => {    
    try {
      loginWithRedirect();
    } catch (error) {
      console.error('🔐 AuthContext: Error in login():', error);
    }
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
        selectedStoreNumber,
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
