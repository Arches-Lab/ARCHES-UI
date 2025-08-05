import { useEffect, useState } from 'react';
import { getSupplies, createSupply, updateSupply, archiveSupply } from '../api';
import { FaBoxes, FaSpinner, FaExclamationTriangle, FaPlus, FaEdit, FaArchive, FaEye, FaClock, FaUser } from 'react-icons/fa';
import { useStore } from '../auth/StoreContext';
import SupplyModal from '../components/SupplyModal';
import { Supply } from '../models/Supply';

export default function Supplies() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [includeArchived, setIncludeArchived] = useState<boolean | null>(false);
  const { selectedStore } = useStore();

  useEffect(() => {
    const fetchSupplies = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`🔄 Fetching supplies for store: ${selectedStore}`);
        const data = await getSupplies(includeArchived);
        console.log(data);
        setSupplies(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching supplies:', err);
        setError('Failed to load supplies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (selectedStore !== null && selectedStore !== undefined) {
      console.log(`🔄 Loading supplies for store: ${selectedStore}`);
      fetchSupplies();
    } else {
      console.log(`🔄 No store selected, clearing supplies data`);
      setSupplies([]);
      setLoading(false);
      setError(null);
    }
  }, [selectedStore, includeArchived]);

  const handleCreateSupply = () => {
    setShowCreateModal(true);
  };

  const handleEditSupply = (supply: Supply) => {
    setEditingSupply(supply);
  };

  const handleSupplyCreated = async () => {
    setShowCreateModal(false);
    try {
      const suppliesData = await getSupplies(includeArchived);
      setSupplies(Array.isArray(suppliesData) ? suppliesData : []);
    } catch (error) {
      console.error('Error refreshing supplies:', error);
    }
  };

  const handleSupplyUpdated = async () => {
    setEditingSupply(null);
    try {
      const suppliesData = await getSupplies(includeArchived);
      setSupplies(Array.isArray(suppliesData) ? suppliesData : []);
    } catch (error) {
      console.error('Error refreshing supplies:', error);
    }
  };

  const handleSaveSupply = async (supplyData: {
    storenumber: number;
    supplyname: string;
    quantity: number;
  }) => {
    try {
      if (editingSupply) {
        await updateSupply(editingSupply.supplyid, supplyData);
        handleSupplyUpdated();
      } else {
        await createSupply(supplyData);
        handleSupplyCreated();
      }
    } catch (error) {
      console.error('Error saving supply:', error);
      alert('Failed to save supply. Please try again.');
    }
  };

  const handleArchiveSupply = async (supply: Supply) => {
    try {
      await archiveSupply(supply.supplyid);
      
      // Refresh supplies list
      const suppliesData = await getSupplies(includeArchived);
      console.log(suppliesData);
      setSupplies(Array.isArray(suppliesData) ? suppliesData : []);
    } catch (error) {
      console.error('Error archiving supply:', error);
      alert('Failed to archive supply. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const isArchived = (supply: Supply) => {
    return supply.archivedon !== null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading supplies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Error</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaBoxes className="text-3xl text-blue-600" />
          <h2 className="text-2xl font-semibold">Supplies</h2>
        </div>
        <div className="flex items-center gap-4">
          {/* Archive Status Filter */}
          <div className="flex items-center gap-1 border-2 border-gray-300 rounded-md p-1 bg-gray-50">
            <button
              onClick={() => setIncludeArchived(null)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                includeArchived === null
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              Include Archived
            </button>
            <button
              onClick={() => setIncludeArchived(false)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                includeArchived === false
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              Exclude Archived
            </button>
          </div>
          <div className="text-sm text-gray-600">
            {supplies.length} suppl{supplies.length !== 1 ? 'ies' : 'y'}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            Add Supply
          </button>
        </div>
      </div>

      {supplies.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <FaBoxes className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Supplies</h3>
          <p className="text-gray-600">
            {includeArchived ? 'You don\'t have any supplies at the moment.' : 'You don\'t have any active supplies at the moment.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supply
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By/On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Archived
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {supplies.map((supply) => (
                  <tr key={supply.supplyid} className={`hover:bg-gray-50 ${
                    isArchived(supply) ? 'bg-gray-50 opacity-75' : ''
                  }`}>
                    <td className="px-6 py-4 w-1/3">
                      <div className="max-w-full">
                        <div className="flex items-start gap-2">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap" title={`${supply.supplyname}: Quantity ${supply.quantity}`}>
                            <span className="font-semibold text-gray-900">{supply.supplyname}:</span> Quantity {supply.quantity}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 min-w-[150px]">
                      <div className="flex items-center gap-4">
                        <FaUser className="w-4 h-4" />
                        <span>
                          {supply.creator ? `${supply.creator.firstname} ${supply.creator.lastname}` : 'N/A'}
                        </span>
                        <FaClock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400">{formatDate(supply.createdon)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium min-w-[100px]">
                      {isArchived(supply) ? (
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500">
                            <div>By: {supply.archiver ? `${supply.archiver.firstname} ${supply.archiver.lastname}` : 'N/A'}</div>
                            <div>On: {supply.archivedon ? formatDate(supply.archivedon) : 'N/A'}</div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleArchiveSupply(supply)}
                          className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors"
                          title="Archive supply"
                        >
                          <FaArchive className="w-3 h-3" />
                          Archive
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium min-w-[100px]">
                      <button
                        onClick={() => handleEditSupply(supply)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit supply"
                      >
                        <FaEdit className="w-3 h-3" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Supply Modal */}
      {showCreateModal && (
        <SupplyModal
          onSave={handleSaveSupply}
          onCancel={() => setShowCreateModal(false)}
          selectedStore={selectedStore || 0}
        />
      )}

      {/* Edit Supply Modal */}
      {editingSupply && (
        <SupplyModal
          supply={editingSupply}
          onSave={handleSaveSupply}
          onCancel={() => setEditingSupply(null)}
          selectedStore={selectedStore || 0}
        />
      )}
    </div>
  );
} 