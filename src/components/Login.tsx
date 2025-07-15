import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FaEnvelope, FaKey, FaSpinner, FaExclamationTriangle, FaEye, FaEyeSlash } from 'react-icons/fa';

type LoginMode = 'email-password' | 'otp';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [mode, setMode] = useState<LoginMode>('email-password');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithOtp, verifyOtp, authState } = useAuth();

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      try {
        await login(email.trim(), password);
      } catch (error) {
        console.error('Login failed:', error);
      }
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      try {
        await loginWithOtp(email.trim());
      } catch (error) {
        console.error('OTP send failed:', error);
      }
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && otp.trim()) {
      try {
        await verifyOtp(email.trim(), otp.trim());
      } catch (error) {
        console.error('OTP verification failed:', error);
      }
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setOtp('');
    setMode('email-password');
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Login Mode Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => {
              setMode('email-password');
              resetForm();
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === 'email-password'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Email & Password
          </button>
          <button
            onClick={() => {
              setMode('otp');
              resetForm();
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === 'otp'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Magic Link
          </button>
        </div>

        {mode === 'email-password' ? (
          // Email/Password Login Form
          <form onSubmit={handleEmailPasswordLogin} className="space-y-6">
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
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaKey className="h-4 w-4" />
              Sign In
            </button>
          </form>
        ) : (
          // OTP Login Form
          <div className="space-y-6">
            {!authState.otpSent ? (
              <form onSubmit={handleOtpLogin} className="space-y-6">
                <div>
                  <label htmlFor="otp-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="otp-email"
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaEnvelope className="h-4 w-4" />
                      Send Magic Link
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                    <FaEnvelope className="h-5 w-5" />
                    <span className="font-medium">Magic Link Sent!</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    We've sent a magic link to <span className="font-medium">{email}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Check your email and click the link to sign in.
                  </p>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => {
                      // setAuthState(prev => ({ ...prev, otpSent: false })); // This line was commented out in the original file
                      setEmail('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Send to a different email
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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
      </div>
    </div>
  );
} 