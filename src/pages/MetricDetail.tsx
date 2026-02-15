import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaChartLine, FaPlus, FaUser } from 'react-icons/fa';
import PageHeader from '../components/PageHeader';
import DataTable, { DataTableColumn } from '../components/DataTable';
import DateRangePicker from '../components/DateRangePicker';
import MetricLogModal from '../components/MetricLogModal';
import { Metric } from '../models/Metric';
import { MetricLog } from '../models/MetricLog';
import { getMetric } from '../api/metric';
import { useMetricLogs } from '../hooks/useMetricLogs';
import { useSelectedStore } from '../auth/useSelectedStore';

export default function MetricDetail() {
  const { metricId } = useParams<{ metricId: string }>();
  const navigate = useNavigate();
  const { selectedStore } = useSelectedStore();
  const [metric, setMetric] = useState<Metric | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState({ from: '', to: '' });
  const [showLogModal, setShowLogModal] = useState(false);
  const { logs, loading: logsLoading, error: logsError, reload } = useMetricLogs(metricId, range.from || undefined, range.to || undefined);

  useEffect(() => {
    if (!metricId) return;

    const loadMetric = async () => {
      try {
        setLoading(true);
        const data = await getMetric(metricId);
        setMetric(data);
      } catch (error) {
        console.error('Error loading metric:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetric();
  }, [metricId]);

  const columns: DataTableColumn<MetricLog>[] = [
    { header: 'Log Date', cell: (row) => row.logdate },
    { header: 'Log Value', cell: (row) => row.logvalue },
    {
      header: 'Notes',
      cell: (row) => row.notes || '-',
      className: 'min-w-[280px] max-w-[50%]',
      headerClassName: 'min-w-[280px] max-w-[50%]'
    },
    {
      header: 'Created By',
      className: 'min-w-[20rem]',
      headerClassName: 'min-w-[20rem]',
      cell: (row) => {
        const displayName = row.creator
          ? [row.creator.firstname, row.creator.lastname].filter(Boolean).join(' ').trim() || row.creator.email || row.createdby
          : row.createdby;
        const createdOn = row.createdon
          ? new Date(row.createdon).toLocaleString()
          : null;
        return (
          <div className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-slate-100 px-3 py-1.5 text-slate-700">
            <FaUser className="w-4 h-4 shrink-0 text-slate-500" />
            <span>{displayName || '-'}</span>
            {createdOn && (
              <span className="text-xs text-slate-500">{createdOn}</span>
            )}
          </div>
        );
      }
    }
  ];

  if (loading || !metric) {
    return (
      <div className="p-6 text-center text-gray-500">
        {loading ? 'Loading metric...' : 'Metric not found.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={metric.name}
        subtitle={`Unit: ${metric.unit} | Value Type: ${metric.valuetype}`}
        actions={
          <>
            <button
              onClick={() => navigate('/metrics')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <FaArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => navigate(`/metrics/${metric.metricid}/trend`)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 border border-green-200 rounded-md hover:bg-green-50"
            >
              <FaChartLine className="w-4 h-4" />
              Trend
            </button>
            <button
              onClick={() => setShowLogModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <FaPlus className="w-4 h-4" />
              Add Log
            </button>
          </>
        }
      />

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div><span className="font-medium">Description:</span> {metric.description || '-'}</div>
          <div><span className="font-medium">Aggregation:</span> {metric.aggregationtype}</div>
          <div><span className="font-medium">Store:</span> {metric.storenumber}</div>
          <div><span className="font-medium">Status:</span> {metric.isactive ? 'Active' : 'Inactive'}</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Metric Logs</h3>
          <DateRangePicker
            from={range.from}
            to={range.to}
            onChange={(nextRange) => setRange(nextRange)}
          />
        </div>
        {logsLoading ? (
          <div className="p-6 text-center text-gray-500">Loading logs...</div>
        ) : logsError ? (
          <div className="p-6 text-center text-red-600">{logsError}</div>
        ) : (
          <DataTable columns={columns} data={logs} emptyMessage="No logs found for this metric." />
        )}
      </div>

      {showLogModal && metricId && metric && (
        <MetricLogModal
          metricId={metricId}
          metricName={metric.name}
          selectedStore={selectedStore ?? 0}
          onSuccess={() => {
            setShowLogModal(false);
            reload();
          }}
          onCancel={() => setShowLogModal(false)}
        />
      )}
    </div>
  );
}
