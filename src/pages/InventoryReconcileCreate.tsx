import { useState } from 'react';
import { FaClipboardList, FaSave, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelectedStore } from '../auth/useSelectedStore';
import { createInventoryReconcile } from '../api';

export default function InventoryCountCreate() {
  const { selectedStore } = useSelectedStore();
  const navigate = useNavigate();
  const [reconcileDate, setReconcileDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStore === null || selectedStore === undefined) {
      alert('Please select a store before creating an inventory count.');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await createInventoryReconcile({
        storenumber: selectedStore,
        reconciledate: reconcileDate,
        status: 'OPEN'
      });
      navigate(`/inventory-reconciles/${created.inventoryreconcileid}`);
    } catch (error) {
      console.error('Error creating inventory reconcile:', error);
      alert('Failed to create inventory reconcile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaClipboardList className="text-3xl text-blue-600" />
          <div>
            <h2 className="text-2xl font-semibold">Create Inventory Reconcile</h2>
            <p className="text-sm text-gray-600">Start a new inventory reconcile for the selected store</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/inventory-reconciles')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <FaArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="countDate" className="block text-sm font-medium text-gray-700 mb-2">
              Reconcile Date
            </label>
            <input
              type="date"
              id="reconcileDate"
              value={reconcileDate}
              onChange={(e) => setReconcileDate(e.target.value)}
              className="block w-full max-w-sm px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSave className="w-4 h-4" />
              {isSubmitting ? 'Creating...' : 'Create Reconcile'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/inventory-reconciles')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
