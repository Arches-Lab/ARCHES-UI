import { FaChartLine, FaEdit, FaEye, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import DataTable, { DataTableColumn } from '../components/DataTable';
import { Metric } from '../models/Metric';
import { useMetrics } from '../hooks/useMetrics';

export default function Metrics() {
  const navigate = useNavigate();
  const { metrics, loading, error, reload } = useMetrics();

  const columns: DataTableColumn<Metric>[] = [
    { header: 'Name', accessor: 'name', className: 'text-gray-900 font-medium' },
    { header: 'Unit', accessor: 'unit' },
    { header: 'Value Type', accessor: 'valuetype' },
    { header: 'Aggregation', accessor: 'aggregationtype' },
    {
      header: 'Created On',
      cell: (row) => (row.createdon ? new Date(row.createdon).toLocaleString() : '-')
    },
    {
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate(`/metrics/${row.metricid}`)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <FaEye className="w-3 h-3" />
            View
          </button>
          <button
            onClick={() => navigate(`/metrics/${row.metricid}/edit`)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
          >
            <FaEdit className="w-3 h-3" />
            Edit
          </button>
          <button
            onClick={() => navigate(`/metrics/${row.metricid}/trend`)}
            className="flex items-center gap-1 text-green-600 hover:text-green-800"
          >
            <FaChartLine className="w-3 h-3" />
            Trend
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Metrics"
        subtitle="Manage store metrics and monitoring"
        actions={
          <button
              onClick={() => navigate('/metrics/new')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              <FaPlus className="w-4 h-4" />
              Add Metric
            </button>
        }
      />

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading metrics...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">
            {error}
            <button onClick={reload} className="block mx-auto mt-3 text-sm text-blue-600">Retry</button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={metrics}
            emptyMessage="No metrics found. Click 'Add Metric' to create one."
          />
        )}
      </div>
    </div>
  );
}
