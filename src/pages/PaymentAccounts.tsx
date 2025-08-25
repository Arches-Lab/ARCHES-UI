import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCreditCard } from 'react-icons/fa';
import { PaymentAccount, CreatePaymentAccountRequest, UpdatePaymentAccountRequest } from '../models/PaymentAccount';
import { getPaymentAccounts, createPaymentAccount, updatePaymentAccount, deletePaymentAccount } from '../api/paymentAccount';
import PaymentAccountModal from '../components/PaymentAccountModal';
import { useSelectedStore } from '../auth/useSelectedStore';
import { getPaymentAccountTypeDisplayName, getPaymentAccountTypeColor, getPaymentAccountTypeIcon } from '../models/PaymentAccountTypes';

export default function PaymentAccounts() {
  const { selectedStore } = useSelectedStore();
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPaymentAccount, setEditingPaymentAccount] = useState<PaymentAccount | null>(null);

  // Load payment accounts when store changes
  useEffect(() => {
    if (selectedStore !== null) {
      loadPaymentAccounts();
    }
  }, [selectedStore]);

  const loadPaymentAccounts = async () => {
    if (selectedStore === null) return;
    
    try {
      setLoading(true);
      const paymentAccountsData = await getPaymentAccounts(selectedStore);
      setPaymentAccounts(paymentAccountsData || []);
    } catch (error) {
      console.error('Error loading payment accounts:', error);
      setPaymentAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentAccount = () => {
    setEditingPaymentAccount(null);
    setShowModal(true);
  };

  const handleEditPaymentAccount = (paymentAccount: PaymentAccount) => {
    setEditingPaymentAccount(paymentAccount);
    setShowModal(true);
  };

  const handleDeletePaymentAccount = async (paymentAccountId: string) => {
    if (!confirm('Are you sure you want to delete this payment account?')) {
      return;
    }

    try {
      await deletePaymentAccount(paymentAccountId);
      await loadPaymentAccounts();
    } catch (error) {
      console.error('Error deleting payment account:', error);
      alert('Failed to delete payment account');
    }
  };

  const handleSavePaymentAccount = async (data: CreatePaymentAccountRequest | UpdatePaymentAccountRequest) => {
    try {
      if (editingPaymentAccount) {
        // Update existing payment account
        await updatePaymentAccount(editingPaymentAccount.paymentaccountid!, data as UpdatePaymentAccountRequest);
      } else {
        // Create new payment account
        await createPaymentAccount(data as CreatePaymentAccountRequest);
      }
      
      setShowModal(false);
      setEditingPaymentAccount(null);
      await loadPaymentAccounts();
    } catch (error) {
      console.error('Error saving payment account:', error);
      alert('Failed to save payment account');
    }
  };

  const handleCancelModal = () => {
    setShowModal(false);
    setEditingPaymentAccount(null);
  };

  // Format date
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };



  if (selectedStore === null) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Please select a store to manage payment accounts.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Accounts</h1>
          <p className="text-gray-600">Manage payment accounts for your store</p>
        </div>
        <button
          onClick={handleAddPaymentAccount}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus />
          Add Account
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaCreditCard className="text-blue-600 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Accounts</p>
            <p className="text-2xl font-bold text-gray-900">{paymentAccounts.length}</p>
          </div>
        </div>
      </div>

      {/* Payment Accounts Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Account List</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading payment accounts...
          </div>
        ) : paymentAccounts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No payment accounts found. Click "Add Account" to create your first payment account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentAccounts.map((account) => (
                  <tr key={account.paymentaccountid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {account.accountname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentAccountTypeColor(account.accounttype)}`}>
                        {getPaymentAccountTypeIcon(account.accounttype)} {getPaymentAccountTypeDisplayName(account.accounttype)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {account.createdon ? formatDate(account.createdon) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditPaymentAccount(account)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePaymentAccount(account.paymentaccountid!)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Account Modal */}
      {showModal && selectedStore !== null && (
        <PaymentAccountModal
          paymentAccount={editingPaymentAccount}
          storeNumber={selectedStore}
          onSave={handleSavePaymentAccount}
          onDelete={handleDeletePaymentAccount}
          onCancel={handleCancelModal}
        />
      )}
    </div>
  );
} 