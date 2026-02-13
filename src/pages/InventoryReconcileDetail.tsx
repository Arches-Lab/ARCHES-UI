import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaClipboardList, FaArrowLeft, FaSave, FaCheckCircle, FaSpinner, FaExclamationTriangle, FaExchangeAlt } from 'react-icons/fa';
import { useSelectedStore } from '../auth/useSelectedStore';
import { getInventoryReconcile, getInventoryReconcileItems, getProducts, upsertInventoryReconcileItem, completeInventoryReconcile, getProductTransactions } from '../api';
import { InventoryReconcile } from '../models/InventoryReconcile';
import { InventoryReconcileItem } from '../models/InventoryReconcileItem';
import { Product } from '../models/Product';
import { ProductTransaction } from '../models/ProductTransaction';

export default function InventoryCountDetail() {
  const { inventoryReconcileId } = useParams<{ inventoryReconcileId: string }>();
  const { selectedStore } = useSelectedStore();
  const navigate = useNavigate();
  const [reconcile, setReconcile] = useState<InventoryReconcile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<InventoryReconcileItem[]>([]);
  const [reconcileItemsByProduct, setReconcileItemsByProduct] = useState<Record<string, number | ''>>({});
  const [dirtyProducts, setDirtyProducts] = useState<Set<string>>(new Set());
  const [systemQuantities, setSystemQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('inventoryReconcileId', inventoryReconcileId);
        if (!inventoryReconcileId) {
          setError('Inventory reconcile ID is required');
          return;
        }

        const [reconcileData, productsData, itemsData, transactionsData] = await Promise.all([
          getInventoryReconcile(inventoryReconcileId),
          getProducts(true),
          getInventoryReconcileItems(inventoryReconcileId),
          getProductTransactions({ storenumber: selectedStore || undefined })
        ]);

        setReconcile(reconcileData);
        setProducts(Array.isArray(productsData) ? productsData : []);
        setItems(Array.isArray(itemsData) ? itemsData : []);
        const transactions = Array.isArray(transactionsData) ? transactionsData : [];
        const quantityMap: Record<string, number> = {};
        transactions.forEach((transaction: ProductTransaction) => {
          if (!transaction.productid) return;
          quantityMap[transaction.productid] = (quantityMap[transaction.productid] || 0) + (transaction.quantitychange || 0);
        });
        setSystemQuantities(quantityMap);

        const initialCounts: Record<string, number | ''> = {};
        (Array.isArray(productsData) ? productsData : []).forEach((product: Product) => {
          initialCounts[product.productid] = '';
        });

        (Array.isArray(itemsData) ? itemsData : []).forEach((item: InventoryReconcileItem) => {
          initialCounts[item.productid] = item.countedquantity ?? '';
        });

        setReconcileItemsByProduct(initialCounts);
        setDirtyProducts(new Set());
      } catch (err) {
        console.error('Error loading inventory reconcile detail:', err);
        setError('Failed to load inventory reconcile detail. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (selectedStore !== null && selectedStore !== undefined) {
      loadData();
    } else {
      setReconcile(null);
      setProducts([]);
      setItems([]);
      setReconcileItemsByProduct({});
      setDirtyProducts(new Set());
      setSystemQuantities({});
      setLoading(false);
      setError(null);
    }
  }, [selectedStore, inventoryReconcileId]);

  const itemIdLookup = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach(item => {
      if (item.inventoryreconcileitemid) {
        map.set(item.productid, item.inventoryreconcileitemid);
      }
    });
    return map;
  }, [items]);

  const productsSortedByName = useMemo(() => {
    return [...products].sort((a, b) =>
      (a.productname ?? '').localeCompare(b.productname ?? '', undefined, { sensitivity: 'base' })
    );
  }, [products]);

  const handleQuantityChange = (productId: string, value: string) => {
    const parsed = value === '' ? '' : parseInt(value, 10) || 0;
    setReconcileItemsByProduct(prev => ({
      ...prev,
      [productId]: parsed
    }));
    setDirtyProducts(prev => new Set(prev).add(productId));
  };

  const handleSave = async () => {
    if (!reconcile || dirtyProducts.size === 0) return;

    setSaving(true);
    try {
      const updates = Array.from(dirtyProducts).map(productId => {
        const quantity = reconcileItemsByProduct[productId];
        if (quantity === '' || quantity === undefined || quantity === null) {
          return null;
        }
        return upsertInventoryReconcileItem({
          storenumber: reconcile.storenumber,
          inventoryreconcileid: reconcile.inventoryreconcileid || inventoryReconcileId || '',
          productid: productId,
          countedquantity: quantity as number,
          inventoryreconcileitemid: itemIdLookup.get(productId)
        });
      }).filter(Boolean);

      await Promise.all(updates as Promise<InventoryReconcileItem>[]);

      const refreshedItems = await getInventoryReconcileItems(reconcile.inventoryreconcileid || inventoryReconcileId || '');
      setItems(Array.isArray(refreshedItems) ? refreshedItems : []);
      setDirtyProducts(new Set());
    } catch (error) {
      console.error('Error saving inventory count items:', error);
      alert('Failed to save inventory count items');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!reconcile) return;
    if (!confirm('Are you sure you want to complete this inventory count? This will lock editing.')) {
      return;
    }

    try {
      const updated = await completeInventoryReconcile(reconcile.inventoryreconcileid || inventoryReconcileId || '');
      setReconcile(updated);
    } catch (error) {
      console.error('Error completing inventory count:', error);
      alert('Failed to complete inventory count');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      return `${month}/${day}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const getSystemQuantity = (productId: string) => {
    const value = systemQuantities[productId];
    return value === undefined || value === null ? 0 : value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading inventory count...</p>
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
          <button
            onClick={() => navigate('/inventory-counts')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Counts
          </button>
        </div>
      </div>
    );
  }

  if (!reconcile) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Inventory reconcile not found</p>
          <button
            onClick={() => navigate('/inventory-reconciles')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Reconciles
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = reconcile.status === 'COMPLETED';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaClipboardList className="text-3xl text-blue-600" />
          <div>
            <h2 className="text-2xl font-semibold">Inventory Reconciliation</h2>
            <p className="text-sm text-gray-600">Reconciliation Date: {formatDate(reconcile.reconciledate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
            {reconcile.status}
          </span>
          {!isCompleted && (
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 border border-green-200 rounded-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              <FaCheckCircle className="w-4 h-4" />
              Complete Count
            </button>
          )}
          <button
            onClick={() => navigate('/inventory-reconciles')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Reconciles
          </button>
        </div>
      </div>

      {isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
          This inventory reconcile is completed. Editing is disabled.
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Reconcile Items</h3>
          <button
            onClick={handleSave}
            disabled={isCompleted || saving || dirtyProducts.size === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-56">Current Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Counted Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adjustment</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productsSortedByName.map(product => (
                <tr key={product.productid} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 overflow-hidden text-ellipsis">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 overflow-hidden text-ellipsis">
                    <div className="truncate">{product.productname}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {getSystemQuantity(product.productid)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={reconcileItemsByProduct[product.productid] ?? ''}
                      onChange={(e) => handleQuantityChange(product.productid, e.target.value)}
                      disabled={isCompleted}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm overflow-hidden">
                    <div className="min-w-0">
                      {(() => {
                        const counted = reconcileItemsByProduct[product.productid];
                        const systemQty = getSystemQuantity(product.productid);
                        if (counted === '' || counted === undefined) {
                          return <span className="text-gray-400">-</span>;
                        }
                        const difference = (counted as number) - systemQty;
                        const referenceId = itemIdLookup.get(product.productid) || '';
                        const reconcileId = reconcile?.inventoryreconcileid || inventoryReconcileId || '';
                        if (difference === 0) {
                          return <span className="text-gray-500">No adjustment required</span>;
                        }
                        if ((!referenceId && !reconcileId) || !product.productid) {
                          return <span className="text-gray-400">Missing reference</span>;
                        }
                        const isSale = difference < 0;
                        const quantity = Math.abs(difference);
                        const referenceValue = referenceId || reconcileId;
                        return (
                          <button
                            onClick={() => {
                              if (dirtyProducts.has(product.productid)) {
                                alert('Please save your changes first before creating an adjustment.');
                                return;
                              }
                              navigate({
                                pathname: '/product-transactions',
                                search: new URLSearchParams({
                                  transactionType: isSale ? 'SALE' : 'PURCHASE',
                                  quantity: quantity.toString(),
                                  productid: product.productid,
                                  referencetype: referenceId ? 'INVENTORY_RECONCILE_ITEM' : 'INVENTORY_RECONCILE',
                                  referenceid: referenceValue
                                }).toString()
                              });
                            }}
                            className={`flex items-center gap-2 transition-colors whitespace-nowrap ${
                              isCompleted ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'
                            }`}
                            disabled={isCompleted}
                          >
                            <FaExchangeAlt className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{isSale ? 'Create SALE Transaction' : 'Create PURCHASE Transaction'}</span>
                          </button>
                        );
                      })()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
