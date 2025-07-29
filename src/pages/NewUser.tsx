import { useState } from 'react';
import { FaUserPlus, FaSpinner, FaExclamationTriangle, FaCheck, FaEnvelope, FaLock, FaUser, FaPhone, FaBuilding } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import PinAuth from '../components/PinAuth';

interface NewUserForm {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
}

export default function NewUser() {
  const [formData, setFormData] = useState<NewUserForm>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    company: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPinAuthenticated, setIsPinAuthenticated] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError(null);

    try {
      // Create user account using Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: 'Welcome123!', // Temporary password that user will change
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            company: formData.company
          }
        }
      });

      if (error) {
        throw error;
      }

      console.log('User created successfully:', data);

      setSuccess(true);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        company: ''
      });

    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || err.error_description || 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show PIN authentication if not authenticated
  if (!isPinAuthenticated) {
    return (
      <PinAuth
        onSuccess={() => setIsPinAuthenticated(true)}
        onCancel={() => window.history.back()}
      />
    );
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <FaUserPlus className="text-3xl text-blue-600" />
          <h2 className="text-2xl font-semibold">New User</h2>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <FaCheck className="text-4xl text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-green-900 mb-2">User Account Created!</h3>
          <p className="text-green-700 mb-4">The user account has been created successfully. The user can now log in with their email address and the temporary password: <strong>Welcome123!</strong></p>
          <p className="text-sm text-green-600 mt-2">The user should change their password upon first login.</p>
          <button
            onClick={() => setSuccess(false)}
            className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 transition-colors"
          >
            Create Another User
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FaUserPlus className="text-3xl text-blue-600" />
        <h2 className="text-2xl font-semibold">New User</h2>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter first name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <div className="relative">
                  <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter company name"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email address"
                  />
                </div>
              </div>


            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="text-red-500 w-4 h-4" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin w-4 h-4" />
                  Creating User...
                </>
              ) : (
                <>
                  <FaUserPlus className="w-4 h-4" />
                  Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 