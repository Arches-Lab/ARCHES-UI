import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaTrash, FaClock, FaSpinner, FaFingerprint } from 'react-icons/fa';
import { SavedUser, emailStorage } from '../utils/emailStorage';

interface SavedUsersListProps {
  onSelectUser: (email: string) => void;
  onSendOtp: (email: string) => void;
  onFingerprintAuth: (email: string) => void;
  isSendingOtp: boolean;
  isFingerprintAuth: boolean;
}

export default function SavedUsersList({ onSelectUser, onSendOtp, onFingerprintAuth, isSendingOtp, isFingerprintAuth }: SavedUsersListProps) {
  const [savedUsers, setSavedUsers] = useState<SavedUser[]>([]);
  const [removingUser, setRemovingUser] = useState<string | null>(null);

  useEffect(() => {
    // Load saved users on component mount
    setSavedUsers(emailStorage.getSavedUsers());
  }, []);

  const handleRemoveUser = (email: string) => {
    setRemovingUser(email);
    emailStorage.removeUser(email);
    setSavedUsers(emailStorage.getSavedUsers());
    setTimeout(() => setRemovingUser(null), 500);
  };

  const handleSendOtp = (email: string) => {
    onSendOtp(email);
  };

  const handleFingerprintAuth = (email: string) => {
    onFingerprintAuth(email);
  };

  const formatLastLogin = (lastLogin: string) => {
    const date = new Date(lastLogin);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (savedUsers.length === 0) {
    return (
      <div className="w-80 bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
        <div className="text-center py-8">
          <FaUser className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 text-sm">No recent users</p>
          <p className="text-gray-400 text-xs mt-1">Users will appear here after login</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
      <div className="space-y-3">
        {savedUsers.map((user) => (
          <div
            key={user.email}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <FaUser className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <FaClock className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-400">
                  {formatLastLogin(user.lastLogin)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-3">
              <button
                onClick={() => handleFingerprintAuth(user.email)}
                disabled={isFingerprintAuth}
                className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                title="Login with Fingerprint"
              >
                {isFingerprintAuth ? (
                  <FaSpinner className="h-4 w-4 animate-spin" />
                ) : (
                  <FaFingerprint className="h-4 w-4" />
                )}
              </button>
              
              <button
                onClick={() => handleSendOtp(user.email)}
                disabled={isSendingOtp}
                className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                title="Send OTP"
              >
                {isSendingOtp ? (
                  <FaSpinner className="h-4 w-4 animate-spin" />
                ) : (
                  <FaEnvelope className="h-4 w-4" />
                )}
              </button>
              
              <button
                onClick={() => handleRemoveUser(user.email)}
                disabled={removingUser === user.email}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                title="Remove user"
              >
                {removingUser === user.email ? (
                  <FaSpinner className="h-4 w-4 animate-spin" />
                ) : (
                  <FaTrash className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => {
            emailStorage.clearAll();
            setSavedUsers([]);
          }}
          className="w-full text-xs text-gray-500 hover:text-red-600 transition-colors"
        >
          Clear all users
        </button>
      </div>
    </div>
  );
} 