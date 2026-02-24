import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaPlus, FaEdit, FaExchangeAlt, FaSpinner, FaExclamationTriangle, FaSort, FaSortUp, FaSortDown, FaInfoCircle } from 'react-icons/fa';
import { getProducts, createProduct, updateProduct } from '../api';
import { Product, CreateProductRequest, UpdateProductRequest } from '../models/Product';
import { useSelectedStore } from '../auth/useSelectedStore';
import ProductModal from '../components/ProductModal';

export default function Products() {
  const { selectedStore } = useSelectedStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<boolean | null>(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<'sku' | 'productname'>('productname');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [descriptionPopoverId, setDescriptionPopoverId] = useState<string | null>(null);

  const sortedProducts = [...products].sort((a, b) => {
    const key = sortBy;
    const aVal = (a[key] ?? '').toString().toLowerCase();
    const bVal = (b[key] ?? '').toString().toLowerCase();
    const cmp = aVal.localeCompare(bVal);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProducts(activeFilter);
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (selectedStore !== null && selectedStore !== undefined) {
      loadProducts();
    } else {
      setProducts([]);
      setLoading(false);
      setError(null);
    }
  }, [selectedStore, activeFilter]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleSaveProduct = async (data: CreateProductRequest | UpdateProductRequest) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.productid, data as UpdateProductRequest);
      } else {
        await createProduct(data as CreateProductRequest);
      }
      setShowModal(false);
      setEditingProduct(null);
      const refreshed = await getProducts(activeFilter);
      setProducts(Array.isArray(refreshed) ? refreshed : []);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
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
          <FaBoxOpen className="text-3xl text-blue-600" />
          <h2 className="text-2xl font-semibold">Products</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 border-2 border-gray-300 rounded-md p-1 bg-gray-50">
            <button
              onClick={() => setActiveFilter(null)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeFilter === null
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter(true)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeFilter === true
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveFilter(false)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeFilter === false
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              Inactive
            </button>
          </div>
          <div className="text-sm text-gray-600">
            {products.length} product{products.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={handleAddProduct}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <FaBoxOpen className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Products</h3>
          <p className="text-gray-600">No products found for the selected filter.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-28 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => {
                        if (sortBy === 'sku') {
                          setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                        } else {
                          setSortBy('sku');
                          setSortDir('asc');
                        }
                      }}
                      className="flex items-center gap-1 group hover:text-gray-700"
                    >
                      SKU
                      {sortBy === 'sku' ? (sortDir === 'asc' ? <FaSortUp className="w-3 h-3" /> : <FaSortDown className="w-3 h-3" />) : <FaSort className="w-3 h-3 opacity-40 group-hover:opacity-70" />}
                    </button>
                  </th>
                  <th className="w-96 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => {
                        if (sortBy === 'productname') {
                          setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                        } else {
                          setSortBy('productname');
                          setSortDir('asc');
                        }
                      }}
                      className="flex items-center gap-1 group hover:text-gray-700"
                    >
                      Product
                      {sortBy === 'productname' ? (sortDir === 'asc' ? <FaSortUp className="w-3 h-3" /> : <FaSortDown className="w-3 h-3" />) : <FaSort className="w-3 h-3 opacity-40 group-hover:opacity-70" />}
                    </button>
                  </th>
                  <th className="w-20 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Level</th>
                  <th className="w-20 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Qty</th>
                  <th className="w-24 pl-4 pr-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="w-48 pl-2 pr-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedProducts.map((product) => (
                  <tr key={product.productid} className={product.isactive ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-80'}>
                    <td className="w-28 px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate" title={product.sku}>
                      {product.sku}
                    </td>
                    <td className="w-96 px-4 py-4 break-words relative">
                      <div className="flex items-start gap-1.5">
                        <span className="text-sm text-gray-900">{product.productname}</span>
                        {product.description && (
                          <>
                            <button
                              type="button"
                              onClick={() => setDescriptionPopoverId((id) => (id === product.productid ? null : product.productid))}
                              className="flex-shrink-0 mt-0.5 p-0.5 text-blue-500 hover:text-blue-600 transition-colors"
                              title="View description"
                            >
                              <FaInfoCircle className="w-3.5 h-3.5" />
                            </button>
                            {descriptionPopoverId === product.productid && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  aria-hidden
                                  onClick={() => setDescriptionPopoverId(null)}
                                />
                                <div className="absolute left-4 top-full mt-1 z-20 min-w-[200px] max-w-[24rem] rounded-md border border-gray-200 bg-white px-3 py-2 shadow-lg text-left text-xs text-gray-600">
                                  {product.description}
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="w-20 px-2 py-4 whitespace-nowrap text-xs text-gray-700 text-center">
                      {product.reorderlevel}
                    </td>
                    <td className="w-20 px-2 py-4 whitespace-nowrap text-xs text-gray-700 text-center">
                      {product.reorderquantity}
                    </td>
                    <td className="w-24 pl-4 pr-2 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.isactive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {product.isactive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="w-48 pl-2 pr-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-4">
                        <Link
                          to={`/product-transactions?productid=${encodeURIComponent(product.productid)}`}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="View transactions for this product"
                        >
                          <FaExchangeAlt className="w-3 h-3" />
                          Transactions
                        </Link>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit product"
                        >
                          <FaEdit className="w-3 h-3" />
                          Edit
                        </button>
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
        <ProductModal
          product={editingProduct || undefined}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
          selectedStore={selectedStore || 0}
        />
      )}
    </div>
  );
}
