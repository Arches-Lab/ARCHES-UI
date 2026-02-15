import { useEffect, useState } from 'react';
import { FaTimes, FaSave, FaExchangeAlt, FaHashtag, FaTag, FaBoxOpen, FaDollarSign, FaStickyNote } from 'react-icons/fa';
import { Product } from '../models/Product';
import { ProductTransactionType } from '../models/ProductTransaction';

interface ProductTransactionModalProps {
  products: Product[];
  initialData?: {
    productid?: string;
    transactiontype?: ProductTransactionType;
    quantity?: number;
    productprice?: number | null;
    referencetype?: string | null;
    referenceid?: string | null;
    note?: string | null;
  };
  onSave: (transactionData: {
    storenumber: number;
    productid: string;
    transactiontype: ProductTransactionType;
    quantitychange: number;
    productprice?: number | null;
    referencetype?: string | null;
    referenceid?: string | null;
    note?: string | null;
  }) => Promise<void>;
  onCancel: () => void;
  selectedStore: number;
}

export default function ProductTransactionModal({
  products,
  initialData,
  onSave,
  onCancel,
  selectedStore
}: ProductTransactionModalProps) {
  const [formData, setFormData] = useState({
    productid: '',
    transactiontype: 'PURCHASE' as ProductTransactionType,
    quantity: 0,
    productprice: '' as number | '',
    referencetype: '',
    referenceid: '',
    note: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (products.length === 0) return;
    setFormData(prev => ({
      ...prev,
      productid: initialData?.productid || prev.productid || products[0].productid,
      transactiontype: initialData?.transactiontype || prev.transactiontype,
      quantity: initialData?.quantity ?? prev.quantity,
      productprice: initialData?.productprice != null ? initialData.productprice : (prev.productprice ?? ''),
      referencetype: initialData?.referencetype ?? prev.referencetype,
      referenceid: initialData?.referenceid ?? prev.referenceid,
      note: initialData?.note ?? prev.note
    }));
  }, [products, initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'quantity') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    } else if (name === 'productprice') {
      const num = value === '' ? '' : parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: num === '' || !Number.isNaN(num) ? num : prev.productprice }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productid) {
      alert('Please select a product');
      return;
    }

    if (!formData.transactiontype) {
      alert('Please select a transaction type');
      return;
    }

    if (!formData.quantity || formData.quantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    setIsSubmitting(true);

    try {
      const quantitychange = formData.transactiontype === 'SALE'
        ? -Math.abs(formData.quantity)
        : Math.abs(formData.quantity);

      const productprice =
        formData.productprice === '' || formData.productprice == null
          ? null
          : Number(formData.productprice);

      await onSave({
        storenumber: selectedStore,
        productid: formData.productid,
        transactiontype: formData.transactiontype,
        quantitychange,
        productprice: productprice ?? null,
        referencetype: formData.referencetype.trim() || null,
        referenceid: formData.referenceid.trim() || null,
        note: formData.note.trim() || null
      });
    } catch (error) {
      console.error('Error saving product transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Transaction</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="productid" className="block text-sm font-medium text-gray-700 mb-2">
              Product
            </label>
            <div className="relative">
              <select
                id="productid"
                name="productid"
                value={formData.productid}
                onChange={handleInputChange}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {products.length === 0 ? (
                  <option value="">No products available</option>
                ) : (
                  products.map(product => (
                    <option key={product.productid} value={product.productid}>
                      {product.productname} ({product.sku})
                    </option>
                  ))
                )}
              </select>
              <FaBoxOpen className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div>
            <label htmlFor="transactiontype" className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <div className="relative">
              <select
                id="transactiontype"
                name="transactiontype"
                value={formData.transactiontype}
                onChange={handleInputChange}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="PURCHASE">Purchase</option>
                <option value="SALE">Sale</option>
              </select>
              <FaExchangeAlt className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 min-w-0">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  step="1"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <FaHashtag className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Sale transactions will be saved as a negative quantity.
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <label htmlFor="productprice" className="block text-sm font-medium text-gray-700 mb-2">
                Product Price (Optional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="productprice"
                  name="productprice"
                  value={formData.productprice === '' ? '' : formData.productprice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
                <FaDollarSign className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 min-w-0">
              <label htmlFor="referencetype" className="block text-sm font-medium text-gray-700 mb-2">
                Reference Type (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="referencetype"
                  name="referencetype"
                  value={formData.referencetype}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="PO, Invoice, Adjustment"
                />
                <FaTag className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <label htmlFor="referenceid" className="block text-sm font-medium text-gray-700 mb-2">
                Reference ID (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="referenceid"
                  name="referenceid"
                  value={formData.referenceid}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Reference ID"
                />
                <FaTag className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
              Note (Optional)
            </label>
            <div className="relative">
              <textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                rows={3}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                placeholder="Add a note..."
              />
              <FaStickyNote className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
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
              {isSubmitting ? 'Saving...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
