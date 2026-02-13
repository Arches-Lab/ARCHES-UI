import { useEffect, useMemo, useState } from 'react';
import { FaExchangeAlt, FaPlus, FaSpinner, FaExclamationTriangle, FaFilter, FaUser, FaClock } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import { useSelectedStore } from '../auth/useSelectedStore';
import { getProductTransactions, createProductTransaction, getProducts } from '../api';
import { ProductTransaction } from '../models/ProductTransaction';
import { Product } from '../models/Product';
import ProductTransactionModal from '../components/ProductTransactionModal';

export default function ProductTransactions() {
  const { selectedStore } = useSelectedStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState<ProductTransaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [productFilter, setProductFilter] = useState<string>(() => searchParams.get('productid') || '');

  useEffect(() => {
    const productid = searchParams.get('productid');
    if (productid) setProductFilter(productid);
  }, [searchParams]);

  const productsSortedByName = useMemo(() => {
    return [...products].sort((a, b) =>
      (a.productname ?? '').localeCompare(b.productname ?? '', undefined, { sensitivity: 'base' })
    );
  }, [products]);

  // When products load and no product is selected, default to first product (by name order)
  useEffect(() => {
    if (productsSortedByName.length > 0 && !productFilter) {
      setProductFilter(productsSortedByName[0].productid);
    }
  }, [productsSortedByName, productFilter]);

  const initialModalData = useMemo(() => {
    const transactionType = searchParams.get('transactionType') || undefined;
    const quantityParam = searchParams.get('quantity');
    const productid = searchParams.get('productid') || undefined;
    const referencetype = searchParams.get('referencetype');
    const referenceid = searchParams.get('referenceid');
    const quantity = quantityParam ? parseInt(quantityParam, 10) : undefined;

    // Only open modal when URL has add-transaction params; productid alone is for filtering only
    const hasModalParams = transactionType || quantity != null || referencetype || referenceid;
    if (!hasModalParams) {
      return undefined;
    }

    return {
      transactiontype: transactionType,
      quantity: quantity,
      productid,
      referencetype: referencetype || undefined,
      referenceid: referenceid || undefined
    };
  }, [searchParams]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts(null);
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading products:', err);
        setProducts([]);
      }
    };

    if (selectedStore !== null && selectedStore !== undefined) {
      loadProducts();
    }
  }, [selectedStore]);

  useEffect(() => {
    if (initialModalData) {
      setShowModal(true);
    }
  }, [initialModalData]);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductTransactions({
          storenumber: selectedStore ?? undefined,
          productid: productFilter || undefined
        });
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading product transactions:', err);
        setError('Failed to load product transactions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (selectedStore !== null && selectedStore !== undefined && productFilter) {
      loadTransactions();
    } else {
      setTransactions([]);
      setLoading(false);
      setError(null);
    }
  }, [selectedStore, productFilter]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.productid === productFilter);
  }, [transactions, productFilter]);

  const totalQuantity = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.quantitychange, 0);
  }, [filteredTransactions]);

  const productLookup = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach(product => map.set(product.productid, product));
    return map;
  }, [products]);

  const handleCreateTransaction = async (data: {
    storenumber: number;
    productid: string;
    transactiontype: string;
    quantitychange: number;
    productprice?: number | null;
    referencetype?: string | null;
    referenceid?: string | null;
    note?: string | null;
  }) => {
    try {
      await createProductTransaction(data);
      setShowModal(false);
      const refreshed = await getProductTransactions({
        storenumber: selectedStore ?? undefined,
        productid: productFilter || undefined
      });
      setTransactions(Array.isArray(refreshed) ? refreshed : []);
    } catch (error) {
      console.error('Error creating product transaction:', error);
      alert('Failed to create transaction');
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '-';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const getProductDisplay = (transaction: ProductTransaction) => {
    if (transaction.product) {
      return `${transaction.product.productname} (${transaction.product.sku})`;
    }
    const product = productLookup.get(transaction.productid);
    if (product) {
      return `${product.productname} (${product.sku})`;
    }
    return transaction.productid;
  };

  const getQuantityDisplay = (quantity: number) => {
    if (quantity > 0) {
      return `+${quantity}`;
    }
    if (quantity < 0) {
      return `${quantity}`;
    }
    return '0';
  };

  const getCreatorDisplay = (transaction: ProductTransaction) => {
    const c = transaction.creator;
    if (c) {
      const name = [c.firstname, c.lastname].filter(Boolean).join(' ').trim();
      return name || c.email || '-';
    }
    return transaction.createdby || '-';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading product transactions...</p>
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
          <FaExchangeAlt className="text-3xl text-blue-600" />
          <div>
            <h2 className="text-2xl font-semibold">Product Transactions</h2>
            <p className="text-sm text-gray-600">Track product activity by product and store</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <FaPlus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            {/* <label className="text-sm text-gray-600">Product</label> */}
            <select
              value={productFilter || (productsSortedByName[0]?.productid ?? '')}
              onChange={(e) => setProductFilter(e.target.value)}
              className="min-w-[340px] px-3 py-2 border border-gray-300 rounded-md text-base text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {productsSortedByName.map(product => (
                <option key={product.productid} value={product.productid}>
                  {product.productname} ({product.sku})
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-500">
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
          </div>
          {productFilter && (
            <div className="ml-auto text-base font-semibold text-gray-800">
              Current Quantity:{' '}
              <span className={`text-lg font-bold ${totalQuantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalQuantity > 0 ? `+${totalQuantity}` : totalQuantity}
              </span>
            </div>
          )}
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <FaExchangeAlt className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions</h3>
          <p className="text-gray-600">No product transactions match the selected filters.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full w-full table-fixed divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '30%' }} />
              </colgroup>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator / Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map(transaction => (
                  <tr key={transaction.producttransactionid} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {transaction.transactiontype}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={transaction.quantitychange >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {getQuantityDisplay(transaction.quantitychange)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 text-left">
                      {transaction.productprice != null
                        ? `$${Number(transaction.productprice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 min-w-0 overflow-hidden">
                      {transaction.note ? (
                        <div className="break-words whitespace-pre-wrap text-sm text-gray-600">
                          {transaction.note}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 min-w-0 overflow-hidden">
                      {transaction.referencetype || transaction.referenceid ? (
                        <div className="truncate" title={[transaction.referencetype, transaction.referenceid].filter(Boolean).join(' ')}>
                          {transaction.referencetype && <div>{transaction.referencetype}</div>}
                          {transaction.referenceid && <div className="text-xs text-gray-400 truncate">{transaction.referenceid}</div>}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="inline-flex items-center gap-3 rounded-md border border-slate-300 bg-slate-100 px-3 py-1.5 text-slate-700 text-sm">
                        <div className="flex items-center gap-1 min-w-0" title={getCreatorDisplay(transaction)}>
                          <FaUser className="w-4 h-4 flex-shrink-0 text-slate-500" />
                          <span className="truncate">{getCreatorDisplay(transaction)}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0" title={formatTimestamp(transaction.createdon)}>
                          <FaClock className="w-4 h-4 text-slate-500" />
                          <span>{formatTimestamp(transaction.createdon)}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <ProductTransactionModal
          products={products}
          initialData={initialModalData ?? (productFilter ? { productid: productFilter } : undefined)}
          onSave={handleCreateTransaction}
          onCancel={() => {
            setShowModal(false);
            if (initialModalData) {
              setSearchParams({});
            }
          }}
          selectedStore={selectedStore || 0}
        />
      )}
    </div>
  );
}
