import { useState } from 'react';
import { FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';

interface PinAuthProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PinAuth({ onSuccess, onCancel }: PinAuthProps) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  // You can change this PIN to whatever you want
  const CORRECT_PIN = '79022033';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pin.trim()) {
      setError('Please enter a PIN');
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate a small delay for security
    await new Promise(resolve => setTimeout(resolve, 500));

    if (pin === CORRECT_PIN) {
      setLoading(false);
      onSuccess();
    } else {
      setAttempts(prev => prev + 1);
      setError(`Incorrect PIN. Attempts remaining: ${3 - attempts}`);
      setPin('');
      
      if (attempts >= 2) {
        setError('Too many failed attempts. Please try again later.');
        setLoading(false);
        return;
      }
      
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPin('');
    setError(null);
    setAttempts(0);
    onCancel();
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 justify-normal mt-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <FaLock className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Authentication Required
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the admin PIN to access the New User page
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
              Admin PIN
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="pin"
                name="pin"
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter PIN"
                maxLength={8}
                pattern="[0-9]*"
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPin ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin w-4 h-4" />
                  Verifying...
                </>
              ) : (
                'Verify PIN'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Contact your administrator for the PIN
          </p>
        </div>
      </div>
    </div>
  );
} 