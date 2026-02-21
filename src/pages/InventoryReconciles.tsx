import { useEffect, useState } from 'react';
import { FaClipboardList, FaPlus, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaEye, FaUser, FaClock, FaPrint } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelectedStore } from '../auth/useSelectedStore';
import { getInventoryReconciles, completeInventoryReconcile, getProducts } from '../api';
import { InventoryReconcile } from '../models/InventoryReconcile';
import InventoryCheckPrintView, { InventoryCheckItem } from '../components/InventoryCheckPrintView';

export default function InventoryCounts() {
  const { selectedStore } = useSelectedStore();
  const navigate = useNavigate();
  const [reconciles, setReconciles] = useState<InventoryReconcile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInventoryPrintView, setShowInventoryPrintView] = useState(false);
  const [inventoryListProducts, setInventoryListProducts] = useState<InventoryCheckItem[]>([]);

  const getReconcileId = (reconcile: InventoryReconcile): string => reconcile.inventoryreconcileid ?? '';
  // Prevent creating multiple open counts for the same store
  const hasOpenReconcile = reconciles.some(reconcile => (reconcile.status || '').toUpperCase() === 'OPEN');

  useEffect(() => {
    const loadReconciles = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getInventoryReconciles(selectedStore || undefined);
        console.log('data', data);
        setReconciles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading inventory reconciles:', err);
        setError('Failed to load inventory reconciles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (selectedStore !== null && selectedStore !== undefined) {
      loadReconciles();
    } else {
      setReconciles([]);
      setLoading(false);
      setError(null);
    }
  }, [selectedStore]);

  const handleCompleteReconcile = async (reconcile: InventoryReconcile, reconcileId: string) => {
    if (!confirm('Are you sure you want to complete this inventory reconcile? This will lock editing.')) {
      return;
    }

    try {
      await completeInventoryReconcile(reconcileId);
      const refreshed = await getInventoryReconciles(selectedStore || undefined);
      setReconciles(Array.isArray(refreshed) ? refreshed : []);
    } catch (error) {
      console.error('Error completing inventory reconcile:', error);
      alert('Failed to complete inventory reconcile');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      return `${month}/${day}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const getCreatedByDisplay = (reconcile: InventoryReconcile): string => {
    if (reconcile.creator) {
      const { firstname, lastname, email } = reconcile.creator;
      const name = [firstname, lastname].filter(Boolean).join(' ').trim();
      return name || email || reconcile.createdby || '-';
    }
    return reconcile.createdby || '-';
  };

  const getCompletedByDisplay = (reconcile: InventoryReconcile): string => {
    if (reconcile.completer) {
      const { firstname, lastname, email } = reconcile.completer;
      const name = [firstname, lastname].filter(Boolean).join(' ').trim();
      return name || email || reconcile.completedby || '-';
    }
    return reconcile.completedby || '-';
  };

  const handleOpenPrintInventoryList = async () => {
    try {
      const data = await getProducts(true);
      setInventoryListProducts(
        (Array.isArray(data) ? data : []).map((p) => ({
          productid: p.productid,
          sku: p.sku,
          productname: p.productname
        }))
      );
      setShowInventoryPrintView(true);
    } catch (err) {
      console.error('Error loading products for inventory list:', err);
      alert('Failed to load products for inventory list');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading inventory counts...</p>
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
          <FaClipboardList className="text-3xl text-blue-600" />
          <div>
            <h2 className="text-2xl font-semibold">Inventory Reconciliations</h2>
            <p className="text-sm text-gray-600">Create and manage inventory reconciliations</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-row items-center gap-2">
            <button
              onClick={handleOpenPrintInventoryList}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <FaPrint className="w-4 h-4" />
              Print inventory list
            </button>
            <button
              onClick={() => !hasOpenReconcile && navigate('/inventory-reconciles/new')}
              disabled={hasOpenReconcile}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border border-transparent rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                hasOpenReconcile
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'text-white bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <FaPlus className="w-4 h-4" />
              New Reconcile
            </button>
          </div>
          {hasOpenReconcile && (
            <p className="text-xs text-gray-600 text-right">
              You already have an open inventory reconcile. Complete it before creating a new one.
            </p>
          )}
        </div>
      </div>

      {reconciles.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <FaClipboardList className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Inventory Reconciles</h3>
          <p className="text-gray-600">Create your first inventory reconcile to get started.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed By / On</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reconciles.map((reconcile, index) => {
                  const reconcileId = getReconcileId(reconcile);
                  return (
                  <tr key={reconcileId || reconcile.inventoryreconcileid || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(reconcile.reconciledate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {getCreatedByDisplay(reconcile)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${reconcile.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {reconcile.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {reconcile.status === 'COMPLETED' ? (
                        <div className="inline-flex items-center gap-3 rounded-md border border-slate-300 bg-slate-100 px-3 py-1.5 text-slate-700 text-sm">
                          <div className="flex items-center gap-1 min-w-0" title={getCompletedByDisplay(reconcile)}>
                            <FaUser className="w-4 h-4 flex-shrink-0 text-slate-500" />
                            <span className="truncate">{getCompletedByDisplay(reconcile)}</span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0" title={formatDateTime(reconcile.completedon)}>
                            <FaClock className="w-4 h-4 text-slate-500" />
                            <span>{formatDateTime(reconcile.completedon)}</span>
                          </div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => reconcileId && navigate(`/inventory-reconciles/${reconcileId}`)}
                          className={`flex items-center gap-1 transition-colors ${
                            reconcileId ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400 cursor-not-allowed'
                          }`}
                          disabled={!reconcileId}
                          title={reconcileId ? 'View' : 'Missing inventory reconcile id'}
                        >
                          <FaEye className="w-3 h-3" />
                          View
                        </button>
                        {reconcile.status !== 'COMPLETED' && (
                          <button
                            onClick={() => reconcileId && handleCompleteReconcile(reconcile, reconcileId)}
                            className={`flex items-center gap-1 transition-colors ${
                              reconcileId ? 'text-green-600 hover:text-green-800' : 'text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={!reconcileId}
                            title={reconcileId ? 'Complete' : 'Missing inventory reconcile id'}
                          >
                            <FaCheckCircle className="w-3 h-3" />
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <InventoryCheckPrintView
        open={showInventoryPrintView}
        onClose={() => setShowInventoryPrintView(false)}
        items={inventoryListProducts}
        title="Inventory check list"
        subtitle={`${new Date().toLocaleDateString(undefined, { dateStyle: 'long' })} — Active products. Write counts in the Count column.`}
        emptyMessage="No active products to list."
        sortBy="productname"
      />
    </div>
  );
}
