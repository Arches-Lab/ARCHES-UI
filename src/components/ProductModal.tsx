import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaBarcode, FaBoxOpen, FaSortAmountDown, FaSortAmountUp, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { Product } from '../models/Product';

interface ProductModalProps {
  product?: Product;
  onSave: (productData: {
    storenumber: number;
    sku: string;
    productname: string;
    reorderlevel: number;
    reorderquantity: number;
    isactive: boolean;
  }) => Promise<void>;
  onCancel: () => void;
  selectedStore: number;
}

export default function ProductModal({ product, onSave, onCancel, selectedStore }: ProductModalProps) {
  const [formData, setFormData] = useState({
    sku: '',
    productname: '',
    reorderlevel: 0,
    reorderquantity: 0,
    isactive: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || '',
        productname: product.productname || '',
        reorderlevel: product.reorderlevel ?? 0,
        reorderquantity: product.reorderquantity ?? 0,
        isactive: product.isactive
      });
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'reorderlevel' || name === 'reorderquantity') ? parseInt(value, 10) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave({
        ...formData,
        storenumber: selectedStore
      });
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
              SKU
            </label>
            <div className="relative">
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="SKU"
              />
              <FaBarcode className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div>
            <label htmlFor="productname" className="block text-sm font-medium text-gray-700 mb-2">
              Product Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="productname"
                name="productname"
                value={formData.productname}
                onChange={handleInputChange}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Product name"
              />
              <FaBoxOpen className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="reorderlevel" className="block text-sm font-medium text-gray-700 mb-2">
                Reorder Level
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="reorderlevel"
                  name="reorderlevel"
                  value={formData.reorderlevel}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <FaSortAmountDown className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              </div>
            </div>
            <div>
              <label htmlFor="reorderquantity" className="block text-sm font-medium text-gray-700 mb-2">
                Reorder Quantity
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="reorderquantity"
                  name="reorderquantity"
                  value={formData.reorderquantity}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <FaSortAmountUp className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4">
            <div className="flex items-center gap-1">
              {product && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isactive: !prev.isactive }))}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  title={formData.isactive ? 'Deactivate product' : 'Activate product'}
                >
                  {formData.isactive ? <FaToggleOff className="w-3 h-3" /> : <FaToggleOn className="w-3 h-3" />}
                  {formData.isactive ? 'Deactivate' : 'Activate'}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSave className="w-4 h-4" />
                {isSubmitting ? 'Saving...' : (product ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
