import { useState } from 'react';
import { FaFingerprint, FaSpinner, FaPlus, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { getLoginOptions, verifyLogin, base64urlToBuffer, bufferToBase64url, isUserVerifyingPlatformAuthenticatorAvailable, getRegistrationOptions, sendRegistrationResponse } from '../api/webauthn';
import { useAuth } from '../auth/AuthContext';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

interface FingerPrintComponentProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function FingerPrintComponent({ onSuccess, onError }: FingerPrintComponentProps) {
  const { user } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [registrationStep, setRegistrationStep] = useState<'initial' | 'registering' | 'success' | 'error'>('initial');
  const [registrationError, setRegistrationError] = useState<string>('');


  
  // Initialize fingerprint authentication
  const initiateFingerprintAuth = async () => {
    try {
      setIsAuthenticating(true);
      
      // Check if WebAuthn is supported
      const supported = await isUserVerifyingPlatformAuthenticatorAvailable();
      setIsSupported(supported);
      
      if (!supported) {
        onError?.('Fingerprint authentication is not supported on this device.');
        return;
      }

      // Get login options from server
      console.log('Getting login options...');
      const loginOptions = await getLoginOptions('mk@uppals.com');
      console.log('Login options:', loginOptions);
      console.log('Challenge type:', typeof loginOptions.challenge);
      console.log('Challenge value:', loginOptions.challenge);

      // Convert challenge from base64 to ArrayBuffer
      let challenge: ArrayBuffer;
      try {
        if (typeof loginOptions.challenge === 'string') {
          // Check if it's base64 encoded or just a plain string
          const isBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(loginOptions.challenge);
          
          if (isBase64) {
            // Handle potential URL-unsafe base64 characters
            const safeChallenge = loginOptions.challenge.replace(/-/g, '+').replace(/_/g, '/');
            
            // Add padding if needed
            const paddedChallenge = safeChallenge + '='.repeat((4 - safeChallenge.length % 4) % 4);
            
            // Try to decode as base64
            const uint8Array = Uint8Array.from(atob(paddedChallenge), c => c.charCodeAt(0));
            challenge = uint8Array.buffer;
          } else {
            // Convert plain string to Uint8Array using TextEncoder
            const encoder = new TextEncoder();
            const uint8Array = encoder.encode(loginOptions.challenge);
            challenge = uint8Array.buffer;
          }
        } else if (Array.isArray(loginOptions.challenge)) {
          // If it's already an array of numbers
          const uint8Array = new Uint8Array(loginOptions.challenge);
          challenge = uint8Array.buffer;
        } else {
          throw new Error(`Unexpected challenge format: ${typeof loginOptions.challenge}`);
        }
      } catch (error) {
        console.error('Error converting challenge:', error);
        console.error('Challenge value:', loginOptions.challenge);
        throw new Error(`Failed to convert challenge: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      console.log('Challenge converted successfully:', challenge);

      // Create authentication options
      // const authOptions: PublicKeyCredentialRequestOptions = {
      //   challenge: challenge,
      //   rpId: loginOptions.rpId,
      //   userVerification: loginOptions.userVerification as UserVerificationRequirement,
      //   timeout: loginOptions.timeout,
      // };
      const authOptions: PublicKeyCredentialRequestOptions = {
        challenge: base64urlToBuffer(loginOptions.challenge), // ✅ clean conversion
        rpId: loginOptions.rpId,
        userVerification: loginOptions.userVerification as UserVerificationRequirement,
        timeout: loginOptions.timeout,
      };

      // Request authentication
      console.log('Requesting authentication...');
      const credential = await navigator.credentials.get({
        publicKey: authOptions
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('No credential returned from authenticator');
      }

      // Prepare credential data for server
      // const credentialJSON = {
      //   id: credential.id,
      //   rawId: bufferToBase64url(credential.rawId),
      //   type: credential.type,
      //   response: {
      //     attestationObject: bufferToBase64url((credential.response as AuthenticatorAttestationResponse).attestationObject),
      //     clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
      //   }
      // };
      const authResp = credential.response as AuthenticatorAssertionResponse;
      const credentialJSON = {
        id: credential.id,
        rawId: bufferToBase64url(credential.rawId),
        type: credential.type,
        response: {
          authenticatorData: bufferToBase64url(authResp.authenticatorData),
          clientDataJSON: bufferToBase64url(authResp.clientDataJSON),
          signature: bufferToBase64url(authResp.signature),
          userHandle: authResp.userHandle ? bufferToBase64url(authResp.userHandle) : null,
        },
      };
      
      // Verify the authentication with the server
      const verificationResult = await verifyLogin('mk@uppals.com', credentialJSON);
      console.log('Verification result:', verificationResult.magicLink);
      if (verificationResult.success) {
        console.log('Authentication successful:', verificationResult.user);
        window.location.href = verificationResult.magicLink || '';
        onSuccess?.();
      } else {
        throw new Error(verificationResult.error || 'Authentication verification failed');
      }

    } catch (error) {
      console.error('Fingerprint authentication error:', error);
      onError?.(error instanceof Error ? error.message : 'Fingerprint authentication failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const login = async () => {
    try {
      setIsAuthenticating(true);
      
      console.log('Logging in...');
      const loginOptions = await getLoginOptions('mk@uppals.com');
      console.log('Login options:', loginOptions);
      
      const authOptions: PublicKeyCredentialRequestOptions = {
        challenge: base64urlToBuffer(loginOptions.challenge), // ✅ clean conversion
        rpId: loginOptions.rpId,
        userVerification: loginOptions.userVerification as UserVerificationRequirement,
        timeout: loginOptions.timeout,
        allowCredentials: loginOptions.allowCredentials?.map(cred => ({
          id: base64urlToBuffer(cred.id),
          type: cred.type as PublicKeyCredentialType
        })) || []
      };

      console.log('Requesting authentication...');
      // This must be called directly in response to user gesture
      const credential = await navigator.credentials.get({
        publicKey: authOptions
      }) as PublicKeyCredential;
      
      console.log('Credential:', credential);

      if (!credential) {
        throw new Error('No credential returned from authenticator');
      }
      
      const authResp = credential.response as AuthenticatorAssertionResponse;
      const credentialJSON = {
        id: credential.id,
        rawId: bufferToBase64url(credential.rawId),
        type: credential.type,
        response: {
          authenticatorData: bufferToBase64url(authResp.authenticatorData),
          clientDataJSON: bufferToBase64url(authResp.clientDataJSON),
          signature: bufferToBase64url(authResp.signature),
          userHandle: authResp.userHandle ? bufferToBase64url(authResp.userHandle) : null,
        },
      };    
      console.log('Credential JSON:', credentialJSON);

      // Verify the authentication with the server
      const verificationResult = await verifyLogin('mk@uppals.com', credentialJSON);
      if (verificationResult.success) {
        console.log('Authentication successful:', verificationResult.user);
        window.location.href = verificationResult.magicLink || '';
      } else {
        throw new Error(verificationResult.error || 'Authentication verification failed');
      }

    } catch (error) {
      console.error('Login error:', error);
      onError?.(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsAuthenticating(false);
    }
  }
  
  // Check if WebAuthn is supported
  const isWebAuthnSupported = () => {
    return window.PublicKeyCredential && 
           typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
  };

  // Check if platform authenticator is available
  const checkPlatformAuthenticator = async () => {
    try {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (error) {
      console.error('Error checking platform authenticator:', error);
      return false;
    }
  };

  const handleStartRegistration = async () => {
    // if (!user?.id) {
    if (!user?.email) {
      setRegistrationError('User ID not available');
      setRegistrationStep('error');
      return;
    }

    if (!isWebAuthnSupported()) {
      setRegistrationError('WebAuthn is not supported in this browser');
      setRegistrationStep('error');
      return;
    }

    const hasPlatformAuthenticator = await checkPlatformAuthenticator();
    if (!hasPlatformAuthenticator) {
      setRegistrationError('No biometric authenticator found on this device');
      setRegistrationStep('error');
      return;
    }

    setIsRegistering(true);
    setRegistrationStep('registering');

    try {
      // Get registration options from server
      console.log('Getting registration options...');
      console.log('User email:', user.email);
      const options = await getRegistrationOptions(user.email);

      console.log('Registration options:', options);
      console.log('Login options:', options);
      console.log('Challenge type:', typeof options.challenge);
      console.log('Challenge value:', options.challenge);

      // Convert base64 → ArrayBuffers for WebAuthn API
      try {
        if (typeof options.challenge === 'string') {
          // Handle potential URL-unsafe base64 characters
          const safeChallenge = options.challenge.replace(/-/g, '+').replace(/_/g, '/');
          
          // Add padding if needed
          const paddedChallenge = safeChallenge + '='.repeat((4 - safeChallenge.length % 4) % 4);
          
          options.challenge = Uint8Array.from(atob(paddedChallenge), c => c.charCodeAt(0));
          console.log('Safe challenge:', options.challenge);
        } else if (Array.isArray(options.challenge)) {
          // If it's already an array of numbers
          options.challenge = new Uint8Array(options.challenge);
        } else {
          throw new Error(`Unexpected challenge format: ${typeof options.challenge}`);
        }

        if (typeof options.user.id === 'string') {
          // Check if it's base64 encoded or just a plain string
          const isBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(options.user.id);
          
          if (isBase64) {
            // Handle potential URL-unsafe base64 characters
            const safeUserId = options.user.id.replace(/-/g, '+').replace(/_/g, '/');
            console.log('Safe user ID:', safeUserId);
            // Add padding if needed
            const paddedUserId = safeUserId + '='.repeat((4 - safeUserId.length % 4) % 4);
            console.log('Padded user ID:', paddedUserId);
            options.user.id = Uint8Array.from(atob(paddedUserId), c => c.charCodeAt(0));
            console.log('Decoded user ID:', options.user.id);
          } else {
            // Convert plain string to Uint8Array using TextEncoder
            const encoder = new TextEncoder();
            options.user.id = encoder.encode(options.user.id);
            console.log('Encoded user ID:', options.user.id);
          }
        } else if (Array.isArray(options.user.id)) {
          // If it's already an array of numbers
          options.user.id = new Uint8Array(options.user.id);
        } else {
          throw new Error(`Unexpected user ID format: ${typeof options.user.id}`);
        }
      } catch (error) {
        console.error('Error decoding base64:', error);
        console.error('Challenge:', options.challenge);
        console.error('User email:', options.user.email);
        throw new Error(`Failed to decode base64 data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Create credential using WebAuthn API
      const credential = await navigator.credentials.create({ publicKey: options });
      console.log('Credential:', credential);
      if (!credential) {
        throw new Error('Failed to create credential');
      }

      // Type assertion to PublicKeyCredential
      const publicKeyCredential = credential as PublicKeyCredential;

      // Prepare credential data for server
      const credentialJSON = {
        id: publicKeyCredential.id,
        rawId: bufferToBase64url(publicKeyCredential.rawId),
        type: publicKeyCredential.type,
        response: {
          attestationObject: bufferToBase64url((publicKeyCredential.response as AuthenticatorAttestationResponse).attestationObject),
          clientDataJSON: bufferToBase64url(publicKeyCredential.response.clientDataJSON),
        }
      };
      console.log('Credential JSON:', credentialJSON);
      // Send registration response to server
      const response = await sendRegistrationResponse(user.email,credentialJSON);
      
      console.log('Registration response:', response);
      setRegistrationStep('success');
    } catch (error) {
      console.error('Fingerprint registration failed:', error);
      setRegistrationError(error instanceof Error ? error.message : 'Registration failed');
      setRegistrationStep('error');
    } finally {
      setIsRegistering(false);
    }
  };


  const initiateRegistration = async () => {
    try {
      setIsRegistering(true);
      setRegistrationStep('registering');
      
      // Get options first
      const options = await getRegistrationOptions(user?.email || '');
      console.log('Options:', options);
      
      // Convert the options to the format expected by WebAuthn
      let challengeBuffer;
      try {
        challengeBuffer = typeof options.challenge === 'string' ? base64urlToBuffer(options.challenge) : options.challenge;
      } catch (error) {
        console.error('Error converting challenge:', error);
        console.error('Challenge value:', options.challenge);
        throw error;
      }
      
      console.log('User object:', options.user);
      console.log('User.id type:', typeof options.user.id, 'value:', options.user.id);
      
      const publicKeyOptions = {
        ...options,
        challenge: challengeBuffer,
        user: {
          ...options.user,
          id: new TextEncoder().encode(options.user.id).buffer
        }
      };
    
      // Use native WebAuthn API - this must be called directly in response to user gesture
      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions
      });
      
      if (!credential) {
        throw new Error('Failed to create credential');
      }
      
      const publicKeyCredential = credential as PublicKeyCredential;
      const attResp = {
        id: publicKeyCredential.id,
        rawId: bufferToBase64url(publicKeyCredential.rawId),
        type: publicKeyCredential.type,
        response: {
          attestationObject: bufferToBase64url((publicKeyCredential.response as AuthenticatorAttestationResponse).attestationObject),
          clientDataJSON: bufferToBase64url(publicKeyCredential.response.clientDataJSON),
        }
      };
      console.log('Attestation response:', attResp);
      
      // Send the response to the server
      const response = await sendRegistrationResponse(user?.email || '', attResp);
      console.log('Registration response:', response);
      
      setRegistrationStep('success');
      
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationError(error instanceof Error ? error.message : 'Registration failed');
      setRegistrationStep('error');
    } finally {
      setIsRegistering(false);
    }
  }
  
  const resetRegistration = () => {
    setRegistrationStep('initial');
    setRegistrationError('');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-4">
        <FaFingerprint className="text-2xl text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Fingerprint Authentication</h3>
      </div>
      
      <div className="space-y-4">
        {registrationStep === 'initial' && (
          <>
            <p className="text-sm text-gray-600">
              Use your fingerprint to quickly and securely log into your account.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={login}
                // onClick={initiateFingerprintAuth}
                disabled={isAuthenticating}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-colors ${
                  isAuthenticating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isAuthenticating ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <FaFingerprint className="w-4 h-4" />
                    Login with Fingerprint
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <button
                // onClick={handleStartRegistration}
                onClick={initiateRegistration}
                disabled={isRegistering}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-colors ${
                  isRegistering
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isRegistering ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <FaPlus className="w-4 h-4" />
                    Register New Fingerprint
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {registrationStep === 'registering' && (
          <div className="text-center">
            <FaSpinner className="mx-auto text-4xl text-blue-500 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Registering Fingerprint
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please follow the prompts on your device to register your fingerprint.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Tip:</strong> Make sure your finger covers the entire sensor area and follow the device's instructions carefully.
              </p>
            </div>
          </div>
        )}

        {registrationStep === 'success' && (
          <div className="text-center">
            <FaCheckCircle className="mx-auto text-4xl text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Registration Successful!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Your fingerprint has been successfully registered. You can now use biometric authentication to log in.
            </p>
            <button
              onClick={resetRegistration}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Done
            </button>
          </div>
        )}

        {registrationStep === 'error' && (
          <div className="text-center">
            <FaExclamationTriangle className="mx-auto text-4xl text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Registration Failed
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {registrationError || 'An error occurred during fingerprint registration.'}
            </p>
            <div className="space-y-2">
              <button
                onClick={resetRegistration}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {isSupported === false && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            ⚠️ Fingerprint authentication is not supported on this device or browser.
          </div>
        )}
        
        <div className="text-xs text-gray-500 text-center">
          Your fingerprint data is stored securely on your device and never shared.
        </div>
      </div>
    </div>
  );
} 