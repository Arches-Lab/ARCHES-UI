import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FaEnvelope, FaKey, FaSpinner, FaExclamationTriangle, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';

type AuthMethod = 'password' | 'otp';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const { login, loginWithOtp, verifyOtp, authState } = useAuth();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      await loginWithOtp(email.trim());
      setMessage('Check your email for a magic link or OTP code. If you received a magic link, click it to sign in. If you received an OTP code, enter it below.');
      setShowOtpInput(true);
    } catch (error: any) {
      setMessage(`Error: ${error.message || 'Failed to send OTP'}`);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      await login(email.trim(), password);
      setMessage('Login successful!');
    } catch (error: any) {
      setMessage(`Error: ${error.message || 'Login failed'}`);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      await verifyOtp(email.trim(), otp.trim());
      setMessage('Login successful!');
    } catch (error: any) {
      setMessage(`Error: ${error.message || 'OTP verification failed'}`);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setOtp('');
    setShowOtpInput(false);
    setShowPassword(false);
    setMessage('');
  };

  const handleAuthMethodChange = (method: AuthMethod) => {
    setAuthMethod(method);
    setShowOtpInput(false);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in with Password or OTP</p>
        </div>

        {/* Authentication Method Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => handleAuthMethodChange('password')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              authMethod === 'password'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            disabled={authState.isRequestingOtp || authState.isVerifyingOtp}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => handleAuthMethodChange('otp')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              authMethod === 'otp'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            disabled={authState.isRequestingOtp || authState.isVerifyingOtp}
          >
            OTP
          </button>
        </div>

        {/* Password Login Form */}
        {authMethod === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                  required
                  disabled={authState.isRequestingOtp || authState.isVerifyingOtp}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaKey className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  required
                  disabled={authState.isRequestingOtp || authState.isVerifyingOtp}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authState.isRequestingOtp || authState.isVerifyingOtp || !email.trim() || !password.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authState.isRequestingOtp || authState.isVerifyingOtp ? (
                <>
                  <FaSpinner className="animate-spin h-4 w-4" />
                  Signing In...
                </>
              ) : (
                <>
                  <FaKey className="h-4 w-4" />
                  Sign In
                </>
              )}
            </button>
          </form>
        )}

        {/* OTP Login Form */}
        {authMethod === 'otp' && (
          <div className="space-y-6">
            {!showOtpInput ? (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label htmlFor="email-otp" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email-otp"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                      required
                      disabled={authState.isRequestingOtp}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authState.isRequestingOtp || !email.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {authState.isRequestingOtp ? (
                    <>
                      <FaSpinner className="animate-spin h-4 w-4" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <FaEnvelope className="h-4 w-4" />
                      Send OTP
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    OTP Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaKey className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      required
                      disabled={authState.isVerifyingOtp}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authState.isVerifyingOtp || !otp.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {authState.isVerifyingOtp ? (
                    <>
                      <FaSpinner className="animate-spin h-4 w-4" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <FaKey className="h-4 w-4" />
                      Verify OTP
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowOtpInput(false)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={authState.isVerifyingOtp}
                >
                  <FaArrowLeft className="h-4 w-4" />
                  Back to Email
                </button>
              </form>
            )}
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.includes('Error') 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            <div className="flex items-center gap-2">
              {message.includes('Error') ? (
                <FaExclamationTriangle className="h-4 w-4" />
              ) : null}
              <span>{message}</span>
            </div>
          </div>
        )}

        {/* Auth State Error Display */}
        {authState.error && (
          <div className="mt-4 flex items-center gap-2 text-red-600 text-sm">
            <FaExclamationTriangle className="h-4 w-4" />
            <span>{authState.error}</span>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </a>
          </p>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Note:</strong> Supabase may send either a magic link or OTP code depending on your project settings. 
            To ensure OTP codes, disable "Email confirmations" in your Supabase Auth settings.
          </p>
        </div>
      </div>
    </div>
  );
} 