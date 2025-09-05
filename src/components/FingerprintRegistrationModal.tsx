import React, { useState } from 'react';
import { FaTimes, FaFingerprint, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';
import { base64urlToBuffer, bufferToBase64url, isUserVerifyingPlatformAuthenticatorAvailable, getRegistrationOptions, sendRegistrationResponse } from '../api/webauthn';

interface FingerprintRegistrationModalProps {
  onClose: () => void;
}

export default function FingerprintRegistrationModal({ onClose }: FingerprintRegistrationModalProps) {
  const { user } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [step, setStep] = useState<'initial' | 'registering' | 'success' | 'error'>('initial');
  const [errorMessage, setErrorMessage] = useState<string>('');

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

  // Start registration process
  const startRegistration = async (email: string) => {
    console.log(`startRegistration: ${email}`);
    try {
      const options = await getRegistrationOptions(email);
      console.log('Registration options:', options);
      if (options.error) {
        throw new Error(options.error);
      }

      options.challenge = new Uint8Array(base64urlToBuffer(options.challenge));
      console.log('Safe challenge:', options.challenge);
      
      console.log('User ID:', options.user.id); 
      // Check if it's base64 encoded or just a plain string
      const isBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(options.user.id);
      if (isBase64) {
        options.user.id = new Uint8Array(base64urlToBuffer(options.user.id));
        console.log('Decoded user ID:', options.user.id);
      } else {
        // Convert plain string to Uint8Array using TextEncoder
        const encoder = new TextEncoder();
        options.user.id = encoder.encode(options.user.id);
        console.log('Encoded user ID:', options.user.id);
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
      const response = await sendRegistrationResponse(email, credentialJSON);
      if (response.error) {
        throw new Error(options.error);
      }      
      console.log('Registration response:', response);
      setStep('success');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const handleStartRegistration = async () => {
    console.log(`handleStartRegistration: ${user?.email}`);
    if (!user?.email) {
      setErrorMessage('User ID not available');
      setStep('error');
      return;
    }

    if (!isWebAuthnSupported()) {
      setErrorMessage('WebAuthn is not supported in this browser');
      setStep('error');
      return;
    }

    const hasPlatformAuthenticator = await checkPlatformAuthenticator();
    if (!hasPlatformAuthenticator) {
      setErrorMessage('No biometric authenticator found on this device');
      setStep('error');
      return;
    }

    setIsRegistering(true);
    setStep('registering');

    try {
      await startRegistration(user.email);
      setStep('success');
    } catch (error) {
      console.error('Fingerprint registration failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Registration failed');
      setStep('error');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleClose = () => {
    if (step === 'registering') {
      return; // Prevent closing during registration
    }
    onClose();
  };

  const renderContent = () => {
    switch (step) {
      case 'initial':
        return (
          <div className="text-center">
            <FaFingerprint className="mx-auto text-6xl text-green-500 mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Register Fingerprint
            </h3>
            <p className="text-gray-600 mb-6">
              Set up biometric authentication for quick and secure login to your account.
            </p>
            <div className="space-y-3 text-sm text-gray-500">
              <p>• Touch your fingerprint sensor when prompted</p>
              <p>• Follow the on-screen instructions</p>
              <p>• This process takes only a few seconds</p>
            </div>
            <button
              onClick={handleStartRegistration}
              disabled={isRegistering}
              className="mt-6 w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Start Registration
            </button>
          </div>
        );

      case 'registering':
        return (
          <div className="text-center">
            <FaSpinner className="mx-auto text-6xl text-blue-500 animate-spin mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Registering Fingerprint
            </h3>
            <p className="text-gray-600 mb-4">
              Please follow the prompts on your device to register your fingerprint.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Make sure your finger covers the entire sensor area and follow the device's instructions carefully.
              </p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <FaCheckCircle className="mx-auto text-6xl text-green-500 mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Registration Successful!
            </h3>
            <p className="text-gray-600 mb-6">
              Your fingerprint has been successfully registered. You can now use biometric authentication to log in.
            </p>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Done
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <FaExclamationTriangle className="mx-auto text-6xl text-red-500 mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Registration Failed
            </h3>
            <p className="text-gray-600 mb-4">
              {errorMessage || 'An error occurred during fingerprint registration.'}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setStep('initial');
                  setErrorMessage('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-2"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Fingerprint Registration
          </h2>
          {step !== 'registering' && (
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
} 