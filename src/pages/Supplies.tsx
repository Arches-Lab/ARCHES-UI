import { useEffect, useState } from 'react';
import { getSupplies, createSupply, updateSupply, archiveSupply } from '../api';
import { FaBoxes, FaSpinner, FaExclamationTriangle, FaPlus, FaEdit, FaArchive, FaEye } from 'react-icons/fa';
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
      fetchSupplies();
    } else {
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
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
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
          <div className="text-sm text-gray-600">
            {supplies.length} suppl{supplies.length !== 1 ? 'ies' : 'y'}
          </div>
          <button
            onClick={handleCreateSupply}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            Add Supply
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex gap-4">
        <div className="border-2 border-gray-300 rounded-md p-1 bg-gray-50">
          <button
            onClick={() => setIncludeArchived(false)}
            className={`px-3 py-1 text-sm font-medium rounded ${
              includeArchived === false
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Exclude Archived
          </button>
          <button
            onClick={() => setIncludeArchived(null)}
            className={`px-3 py-1 text-sm font-medium rounded ${
              includeArchived === null
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Include Archived
          </button>
        </div>
      </div>

      {supplies.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <FaBoxes className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500">
            {includeArchived ? 'No supplies found' : 'No active supplies found'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="divide-y divide-gray-200">
            {supplies.map((supply) => (
              <div key={supply.supplyid} className="p-4 hover:bg-gray-50 transition-colors">
                {/* Row 1: Supply Name, Quantity, Archived Info, Edit Button */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Supply Name */}
                    <div className="flex items-center gap-2">
                      <FaBoxes className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-gray-900">{supply.supplyname}</span>
                    </div>
                    
                    {/* Quantity */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Quantity: {supply.quantity}</span>
                    </div>
                  </div>
                  
                  {/* Archive Button, Archived Info, and Edit Button */}
                  <div className="flex items-center gap-2">
                    {!supply.archivedon ? (
                      <button
                        onClick={() => handleArchiveSupply(supply)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                        title="Archive supply"
                      >
                        <FaArchive className="w-3 h-3" />
                        <span>Archive</span>
                      </button>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <FaEye className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-500">Archived: {formatDate(supply.archivedon)}</span>
                        {supply.archiver && (
                          <span className="text-xs text-gray-500">({supply.archiver.firstname} {supply.archiver.lastname})</span>
                        )}
                        </div>
                        {/* {supply.archiver && (
                          <div className="flex items-center gap-2">
                            <FaEye className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-500">By: {supply.archiver.firstname} {supply.archiver.lastname}</span>
                          </div>
                        )} */}
                      </>
                    )}
                    
                    <button
                      onClick={() => handleEditSupply(supply)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                      title="Edit supply"
                    >
                      <FaEdit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
                
                {/* Row 2: Supply Name: Quantity, Created Info, Archive Button */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                      <span className="font-semibold text-gray-900">{supply.supplyname}:</span> Quantity {supply.quantity}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 min-w-[200px] flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <FaEye className="w-3 h-3" />
                      <span>Created: {formatDate(supply.createdon)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaEye className="w-3 h-3" />
                      <span>By: {supply.creator.firstname} {supply.creator.lastname}</span>
                    </div>
                  </div>
                </div>
                

              </div>
            ))}
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