import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUser, FaEnvelope, FaCog } from 'react-icons/fa';
import { getUserProfile } from '../api';
import { useAuth } from '../auth/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    getUserProfile().then(setProfile).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaUser className="text-3xl text-blue-600" />
          <h2 className="text-2xl font-semibold">Profile</h2>
        </div>
      </div>

      {/* User Information */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Information</h3>
        {user && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FaEnvelope className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{user.email}</span>
            </div>
            {user.user_metadata?.first_name && (
              <div className="flex items-center gap-3">
                <FaUser className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">
                  {user.user_metadata.first_name} {user.user_metadata.last_name}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Actions */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/change-password')}
            className="flex items-center gap-3 w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaLock className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Change Password</div>
              <div className="text-sm text-gray-500">Update your account password</div>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-3 w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaCog className="w-5 h-5 text-gray-600" />
            <div>
              <div className="font-medium text-gray-900">Settings</div>
              <div className="text-sm text-gray-500">Manage your account settings</div>
            </div>
          </button>
        </div>
      </div>

      {/* Profile Data (for debugging) */}
      {profile && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Data</h3>
          <pre className="text-sm text-gray-600 overflow-auto">{JSON.stringify(profile, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
