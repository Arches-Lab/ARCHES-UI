import api from './index';

// WebAuthn API functions for fingerprint authentication

export interface LoginOptions {
  challenge: string;
  rpId: string;
  userVerification: string;
  timeout: number;
  allowCredentials?: Array<{
    id: string;
    type: string;
  }>;
}

export interface VerificationResult {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  error?: string;
  magicLink?: string;
}

/**
 * Get login options from the server for WebAuthn authentication
 */
export const getLoginOptions = async (email: string): Promise<LoginOptions> => {
  const { data } = await api.post('/webauthn/login/options', {email: email});
  console.log('Login options:', data);
  return data;
};

/**
 * Verify the WebAuthn authentication response
 */
export const verifyLogin = async (email: string, credentialJSON: any): Promise<VerificationResult> => {
  console.log('Verifying login...', credentialJSON);
  const { data } = await api.post('/webauthn/login/verify', {
    email: email,
    credential: credentialJSON,    
    // credential: credential,
    // credential: {
    //   id: credential.id,
    //   type: credential.type,
    //   response: {
    //     authenticatorData: Array.from(new Uint8Array(credential.response.authenticatorData)),
    //     clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
    //     signature: Array.from(new Uint8Array(credential.response.signature)),
    //     userHandle: credential.response.userHandle ? Array.from(new Uint8Array(credential.response.userHandle)) : null,
    //   },
    // },
  });
  return data;
};

/**
 * Check if WebAuthn is supported on the current device/browser
 */
export const isWebAuthnSupported = (): boolean => {
  return typeof window !== 'undefined' && 
         window.PublicKeyCredential !== undefined &&
         typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
};

/**
 * Check if user verification is available (fingerprint, face ID, etc.)
 */
export const isUserVerifyingPlatformAuthenticatorAvailable = async (): Promise<boolean> => {
  if (!isWebAuthnSupported()) {
    return false;
  }

  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (error) {
    console.error('Error checking platform authenticator availability:', error);
    return false;
  }
};

/**
 * Get registration options from the server
 */
export const getRegistrationOptions = async (email: string) => {
  console.log(`Getting registration options for user: ${email}`);
  try {
    const { data } = await api.post('/webauthn/register/options', {email: email});
    return data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      return { error: error.response.data.error };
    }
    throw error;
  }
};

/**
 * Send registration response to the server
 */
export const sendRegistrationResponse = async (email: string, credentialJSON: any): Promise<any> => {
  console.log('Sending registration response to server');
  try {
    const { data } = await api.post('/webauthn/register/verify', {
      email: email,
      credential: credentialJSON,
    });
    return data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      return { error: error.response.data.error };
    }
    throw error;
  }
}; 

export const bufferToBase64url = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
export const base64urlToBuffer = (base64url: string): ArrayBuffer => {
  const padding = '='.repeat((4 - base64url.length % 4) % 4);
  const base64 = (base64url.replace(/-/g, '+').replace(/_/g, '/')) + padding;
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    view[i] = rawData.charCodeAt(i);
  }
  return buffer;
}