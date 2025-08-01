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
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FaBoxes className="text-2xl text-blue-600" />
        <h3 className="text-xl font-semibold">Supplies List</h3>
      </div>
      
      <div className="space-y-0">
        {supplies.map((supply) => (
          <div key={supply.supplyid} className="bg-white border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-gray-900">
                  {supply.supplyname} ({supply.quantity})
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 