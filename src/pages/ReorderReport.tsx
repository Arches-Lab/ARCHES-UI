import { useEffect, useState } from 'react';
import { FaFileDownload, FaSpinner, FaExclamationTriangle, FaClipboardList } from 'react-icons/fa';
import { useSelectedStore } from '../auth/useSelectedStore';
import { getReorderReport } from '../api';
import { ReorderReportItem } from '../models/Product';

export default function ReorderReport() {
  const { selectedStore } = useSelectedStore();
  const [reportItems, setReportItems] = useState<ReorderReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getReorderReport(selectedStore ?? undefined);
        setReportItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading reorder report:', err);
        setError('Failed to load reorder report. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (selectedStore !== null && selectedStore !== undefined) {
      loadReport();
    } else {
      setReportItems([]);
      setLoading(false);
      setError(null);
    }
  }, [selectedStore]);

  const exportToCSV = () => {
    if (reportItems.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['SKU', 'Product Name', 'Current Balance', 'Reorder Level', 'Reorder Quantity', 'Store Number'];
    const rows = reportItems.map(item => [
      item.sku,
      item.productname,
      item.currentbalance.toString(),
      item.reorderlevel.toString(),
      item.reorderquantity.toString(),
      item.storenumber.toString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reorder-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading reorder report...</p>
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
            <h2 className="text-2xl font-semibold">Reorder Report</h2>
            <p className="text-sm text-gray-600">Products that need to be reordered</p>
          </div>
        </div>
        <button
          onClick={exportToCSV}
          disabled={reportItems.length === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaFileDownload className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {reportItems.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <FaClipboardList className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Need Reordering</h3>
          <p className="text-gray-600">All products are above their reorder level.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Balance</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Level</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Quantity</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportItems.map((item) => (
                  <tr key={item.productid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.productname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={`font-medium ${item.currentbalance <= item.reorderlevel ? 'text-red-600' : 'text-gray-700'}`}>
                        {item.currentbalance}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                      {item.reorderlevel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-blue-600">
                      {item.reorderquantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      {item.storenumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{reportItems.length}</span> product{reportItems.length !== 1 ? 's' : ''} that need reordering
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
