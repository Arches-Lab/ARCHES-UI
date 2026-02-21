import { FaPrint, FaTimes } from 'react-icons/fa';

export interface InventoryCheckItem {
  productid: string;
  sku: string;
  productname: string;
}

interface InventoryCheckPrintViewProps {
  open: boolean;
  onClose: () => void;
  items: InventoryCheckItem[];
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  /** Sort by this field; default 'productname' */
  sortBy?: 'sku' | 'productname';
}

export default function InventoryCheckPrintView({
  open,
  onClose,
  items,
  title = 'Inventory check list',
  subtitle,
  emptyMessage = 'No items to list.',
  sortBy = 'productname'
}: InventoryCheckPrintViewProps) {
  if (!open) return null;

  const defaultSubtitle = `${new Date().toLocaleDateString(undefined, { dateStyle: 'long' })} — Write counts in the Count column.`;
  const sorted = [...items].sort((a, b) =>
    (a[sortBy] ?? '').toString().localeCompare((b[sortBy] ?? '').toString())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .inventory-check-print, .inventory-check-print * { visibility: visible; }
          .inventory-check-print { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; max-width: none !important; height: auto !important; max-height: none !important; background: white; box-shadow: none; border-radius: 0; padding: 1rem; }
          .inventory-check-print .no-print { display: none !important; }
        }
      `}</style>
      <div className="inventory-check-print flex flex-col bg-gray-50 rounded-lg shadow-xl w-full max-w-2xl h-[90vh] min-h-[24rem]" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 sm:p-6 shrink-0">
          <div className="no-print flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <FaPrint className="w-4 h-4" />
                Print
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <FaTimes className="w-4 h-4" />
                Close
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500">{subtitle ?? defaultSubtitle}</p>
        </div>
        <div className="flex-1 min-h-0 overflow-auto px-4 sm:px-6 pb-4 sm:pb-6">
          {sorted.length === 0 ? (
            <p className="text-gray-600">{emptyMessage}</p>
          ) : (
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">#</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">SKU</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">Product name</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700 w-24">Count</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((item, index) => (
                  <tr key={item.productid} className="border-b border-gray-200">
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600">{index + 1}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900">{item.sku}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">{item.productname}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-400">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
