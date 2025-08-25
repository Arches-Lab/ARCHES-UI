import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaTrash, FaCreditCard } from 'react-icons/fa';
import { PaymentAccount, CreatePaymentAccountRequest, UpdatePaymentAccountRequest } from '../models/PaymentAccount';
import { PAYMENT_ACCOUNT_TYPES } from '../models/PaymentAccountTypes';

interface PaymentAccountModalProps {
  paymentAccount?: PaymentAccount | null;
  storeNumber: number;
  onSave: (data: CreatePaymentAccountRequest | UpdatePaymentAccountRequest) => void;
  onDelete?: (paymentAccountId: string) => void;
  onCancel: () => void;
}

export default function PaymentAccountModal({ 
  paymentAccount, 
  storeNumber,
  onSave, 
  onDelete, 
  onCancel 
}: PaymentAccountModalProps) {
  const [formData, setFormData] = useState({
    accountname: '',
    accounttype: ''
  });

  const isEditing = !!paymentAccount;

  useEffect(() => {
    if (paymentAccount) {
      setFormData({
        accountname: paymentAccount.accountname,
        accounttype: paymentAccount.accounttype
      });
    } else {
      setFormData({
        accountname: '',
        accounttype: ''
      });
    }
  }, [paymentAccount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountname.trim()) {
      alert('Please enter an account name');
      return;
    }

    if (!formData.accounttype.trim()) {
      alert('Please select an account type');
      return;
    }

    if (isEditing) {
      // Update existing payment account
      const updateData: UpdatePaymentAccountRequest = {
        accountname: formData.accountname.trim(),
        accounttype: formData.accounttype.trim()
      };
      onSave(updateData);
    } else {
      // Create new payment account
      const createData: CreatePaymentAccountRequest = {
        storenumber: storeNumber,
        accountname: formData.accountname.trim(),
        accounttype: formData.accounttype.trim(),
        createdby: 'current-user' // This should come from auth context
      };
      onSave(createData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Edit Payment Account' : 'Add Payment Account'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Name *
              </label>
              <input
                type="text"
                name="accountname"
                value={formData.accountname}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter account name"
                required
              />
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type *
              </label>
              <select
                name="accounttype"
                value={formData.accounttype}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select an account type</option>
                {PAYMENT_ACCOUNT_TYPES.map((type) => (
                  <option key={type.code} value={type.code}>
                    {type.icon} {type.displayName}
                  </option>
                ))}
              </select>
            </div>


          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(paymentAccount!.paymentaccountid!)}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaTrash />
                Delete
              </button>
            )}
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <FaSave />
              {isEditing ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 