import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUser } from 'react-icons/fa';
import { Payee, CreatePayeeRequest, UpdatePayeeRequest } from '../models/Payee';
import { getPayees, createPayee, updatePayee, deletePayee } from '../api/payee';
import PayeeModal from '../components/PayeeModal';
import { useSelectedStore } from '../auth/useSelectedStore';
import { getPayeeCategoryDisplayName } from '../models/PayeeCategoryTypes';

export default function Payees() {
  const { selectedStore } = useSelectedStore();
  const [payees, setPayees] = useState<Payee[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPayee, setEditingPayee] = useState<Payee | null>(null);

  // Load payees when store changes
  useEffect(() => {
    if (selectedStore !== null) {
      loadPayees();
    }
  }, [selectedStore]);

  const loadPayees = async () => {
    if (selectedStore === null) return;
    
    try {
      setLoading(true);
      const payeesData = await getPayees(selectedStore);
      setPayees(payeesData || []);
    } catch (error) {
      console.error('Error loading payees:', error);
      setPayees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayee = () => {
    setEditingPayee(null);
    setShowModal(true);
  };

  const handleEditPayee = (payee: Payee) => {
    setEditingPayee(payee);
    setShowModal(true);
  };

  const handleDeletePayee = async (payeeId: string) => {
    if (!confirm('Are you sure you want to delete this payee? This will affect all expenses using this payee.')) {
      return;
    }

    try {
      await deletePayee(payeeId);
      await loadPayees();
    } catch (error) {
      console.error('Error deleting payee:', error);
      alert('Failed to delete payee');
    }
  };

  const handleSavePayee = async (data: CreatePayeeRequest | UpdatePayeeRequest) => {
    try {
      if (editingPayee) {
        // Update existing payee
        await updatePayee(editingPayee.payeeid!, data as UpdatePayeeRequest);
      } else {
        // Create new payee
        await createPayee(data as CreatePayeeRequest);
      }
      
      setShowModal(false);
      setEditingPayee(null);
      await loadPayees();
    } catch (error) {
      console.error('Error saving payee:', error);
      alert('Failed to save payee');
    }
  };

  const handleCancelModal = () => {
    setShowModal(false);
    setEditingPayee(null);
  };

  // Format timestamp
  const formatTimestamp = (dateStr: string): string => {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${month}/${day}/${year} ${displayHours}:${minutes}:${seconds} ${ampm}`;
  };

  if (selectedStore === null) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Please select a store to manage payees.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payees</h1>
          <p className="text-gray-600">Manage payees for your store</p>
        </div>
        <button
          onClick={handleAddPayee}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus />
          Add Payee
        </button>
      </div>

      {/* Payees Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Payee List</h2>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaUser className="text-blue-600 text-xl" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Payees</p>
              <p className="text-lg font-bold text-gray-900">{payees.length}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading payees...
          </div>
        ) : payees.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No payees found. Click "Add Payee" to create your first payee.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                    Payee Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payees.map((payee) => (
                  <tr key={payee.payeeid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/3">
                      {payee.payeename}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-1/4">
                      {getPayeeCategoryDisplayName(payee.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-1/4">
                      {payee.createdon ? formatTimestamp(payee.createdon) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium w-1/6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditPayee(payee)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePayee(payee.payeeid!)}
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

      {/* Payee Modal */}
      {showModal && selectedStore !== null && (
        <PayeeModal
          payee={editingPayee}
          storeNumber={selectedStore}
          onSave={handleSavePayee}
          onDelete={handleDeletePayee}
          onCancel={handleCancelModal}
        />
      )}
    </div>
  );
} 