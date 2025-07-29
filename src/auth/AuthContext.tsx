import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, AuthUser, AuthSession } from '../lib/supabase';
import { setTokenGetter } from '../api';
import { emailStorage } from '../utils/emailStorage';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (email: string, password?: string) => Promise<void>;
  loginWithOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  storeNumber: number[] | null;
  selectedStoreNumber: number | null;
  metadata: {
    app_metadata?: any;
    user_metadata?: any;
  };
  refreshStoreNumber: () => Promise<void>;
  authState: {
    isRequestingOtp: boolean;
    isVerifyingOtp: boolean;
    otpSent: boolean;
    error: string | null;
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [storeNumber, setStoreNumber] = useState<number[] | null>(null);
  const [selectedStoreNumber, setSelectedStoreNumber] = useState<number | null>(null);
  const [metadata, setMetadata] = useState<{
    app_metadata?: any;
    user_metadata?: any;
  }>({});

  // Auth state for OTP flow
  const [authState, setAuthState] = useState({
    isRequestingOtp: false,
    isVerifyingOtp: false,
    otpSent: false,
    error: null as string | null
  });

  // Set up the token getter for API requests
  useEffect(() => {
    setTokenGetter(async () => {
      const token = await getAccessToken();
      if (!token) throw new Error('No access token available');
      return token;
    });
  }, []);

  // Get access token for API requests
  const getAccessToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  // Extract store number from user metadata
  const extractStoreNumberFromUser = async () => {
    try {
      if (!user) {
        console.log('❌ Cannot extract StoreNumber: no user');
        return;
      }
      
      console.log('🔍 Extracting StoreNumber from user metadata...');
      const userMetadata = user.user_metadata;
      
      // Extract store numbers from metadata (adjust based on your data structure)
      const storeNumbers = userMetadata?.store_numbers || [];
      const selectedStore = userMetadata?.selected_store || null;
      
      setStoreNumber(storeNumbers);
      setSelectedStoreNumber(selectedStore);
      setMetadata({
        app_metadata: userMetadata?.app_metadata,
        user_metadata: userMetadata
      });
      
      console.log('✅ StoreNumber extraction completed');
      console.log('  - Store numbers:', storeNumbers);
      console.log('  - Selected store:', selectedStore);
    } catch (error) {
      console.error('❌ Error extracting StoreNumber from user:', error);
      setStoreNumber(null);
      setSelectedStoreNumber(null);
      setMetadata({});
    }
  };

  const refreshStoreNumber = async () => {
    await extractStoreNumberFromUser();
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user as AuthUser);
      }
      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user as AuthUser);
        } else {
          setUser(null);
          setStoreNumber(null);
          setSelectedStoreNumber(null);
          setMetadata({});
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Extract store number when user changes
  useEffect(() => {
    if (user) {
      extractStoreNumberFromUser();
    }
  }, [user]);

  // Email/Password login
  const login = async (email: string, password?: string) => {
    try {
      console.log('🔐 Starting email/password login...');
      
      if (!password) {
        throw new Error('Password is required for email/password login');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Login failed:', error);
        throw error;
      }

      console.log('✅ Login successful:', data.user?.email);
      
      // Save user to local storage
      const userName = data.user?.user_metadata?.first_name && data.user?.user_metadata?.last_name
        ? `${data.user.user_metadata.first_name} ${data.user.user_metadata.last_name}`
        : data.user?.email?.split('@')[0] || data.user?.email || '';
      
      emailStorage.saveUser(data.user?.email || '', userName);
      
      // Redirect to dashboard after successful login
      navigate('/');
    } catch (error) {
      console.error('🔐 AuthContext: Error in login():', error);
      throw error;
    }
  };

  // OTP login
  const loginWithOtp = async (email: string) => {
    try {
      console.log('🔐 Starting OTP login...');
      setAuthState(prev => ({
        ...prev,
        isRequestingOtp: true,
        error: null
      }));

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('❌ OTP send failed:', error);
        setAuthState(prev => ({
          ...prev,
          isRequestingOtp: false,
          error: error.message
        }));
        throw error;
      }

      console.log('✅ OTP sent successfully');
      setAuthState(prev => ({
        ...prev,
        isRequestingOtp: false,
        otpSent: true
      }));
    } catch (error) {
      console.error('🔐 AuthContext: Error in loginWithOtp():', error);
      setAuthState(prev => ({
        ...prev,
        isRequestingOtp: false,
        error: 'Failed to send OTP'
      }));
      throw error;
    }
  };

  // Verify OTP
  const verifyOtp = async (email: string, token: string) => {
    try {
      console.log('🔐 Verifying OTP...');
      setAuthState(prev => ({
        ...prev,
        isVerifyingOtp: true,
        error: null
      }));

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) {
        console.error('❌ OTP verification failed:', error);
        setAuthState(prev => ({
          ...prev,
          isVerifyingOtp: false,
          error: error.message
        }));
        throw error;
      }

      console.log('✅ OTP verified successfully');
      setAuthState(prev => ({
        ...prev,
        isVerifyingOtp: false,
        otpSent: false
      }));
      
      // Save user to local storage
      const userName = data.user?.user_metadata?.first_name && data.user?.user_metadata?.last_name
        ? `${data.user.user_metadata.first_name} ${data.user.user_metadata.last_name}`
        : data.user?.email?.split('@')[0] || data.user?.email || '';
      
      emailStorage.saveUser(data.user?.email || '', userName);
      
      // Redirect to dashboard after successful OTP verification
      navigate('/');
    } catch (error) {
      console.error('🔐 AuthContext: Error in verifyOtp():', error);
      setAuthState(prev => ({
        ...prev,
        isVerifyingOtp: false,
        error: 'Failed to verify OTP'
      }));
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Logout failed:', error);
        throw error;
      }
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('🔐 AuthContext: Error in logout():', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated: !!user, 
        isLoading, 
        user, 
        login, 
        loginWithOtp,
        verifyOtp,
        logout, 
        getAccessToken,
        storeNumber,
        selectedStoreNumber,
        metadata,
        refreshStoreNumber,
        authState
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
