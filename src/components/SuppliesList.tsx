import { useEffect, useState } from 'react';
import { getSupplies } from '../api';
import { FaBoxes, FaSpinner } from 'react-icons/fa';
import { useStore } from '../auth/StoreContext';
import { Supply } from '../models/Supply';

export default function SuppliesList() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedStore } = useStore();

  useEffect(() => {
    const fetchSupplies = async () => {
      try {
        setLoading(true);
        const data = await getSupplies(false); // Only non-archived supplies
        const nonArchivedSupplies = Array.isArray(data) 
          ? data.filter(supply => !supply.archivedon)
          : [];
        setSupplies(nonArchivedSupplies);
      } catch (err) {
        console.error('Error fetching supplies:', err);
        setSupplies([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedStore !== null && selectedStore !== undefined) {
      fetchSupplies();
    } else {
      setSupplies([]);
      setLoading(false);
    }
  }, [selectedStore]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <FaSpinner className="animate-spin text-2xl text-blue-600" />
      </div>
    );
  }

  if (supplies.length === 0) {
    return (
      <div className="text-center p-6">
        <FaBoxes className="text-4xl text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500 text-lg">No supplies needed at this time.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Supplies List</h3>
          <span className="text-sm text-gray-500">
            {supplies.length} item{supplies.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Items List */}
      <div className="divide-y divide-gray-200">
        {supplies.map((supply) => (
          <div key={supply.supplyid} className="px-4 py-3 hover:bg-gray-50">
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {supply.supplyname}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-600 truncate">
                  {supply.quantity}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 