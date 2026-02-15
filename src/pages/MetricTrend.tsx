import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSyncAlt } from 'react-icons/fa';
import PageHeader from '../components/PageHeader';
import DateRangePicker from '../components/DateRangePicker';
import ChartComponent from '../components/ChartComponent';
import { getMetricTrend, getMetric } from '../api/metric';
import { Metric } from '../models/Metric';

function parseTrendResponse(data: unknown): { labels: string[]; values: number[] } {
  // Response is the array itself: [{ period, value }, ...]
  if (Array.isArray(data) && data.length > 0) {
    const labels = data.map((d: Record<string, unknown>) =>
      d.period != null ? String(d.period) : d.label != null ? String(d.label) : d.date != null ? String(d.date) : ''
    );
    const values = data.map((d: Record<string, unknown>) =>
      Number((d.value ?? d.sum ?? d.total ?? d.count ?? 0)) || 0
    );
    return { labels, values };
  }

  const raw = data as Record<string, unknown>;
  if (!raw || typeof raw !== 'object') return { labels: [], values: [] };

  const takeLabels = (o: Record<string, unknown>): string[] | null => {
    const arr = Array.isArray(o.labels) ? o.labels : Array.isArray(o.periods) ? o.periods : Array.isArray(o.dates) ? o.dates : null;
    return arr ? (arr as unknown[]).map(String) : null;
  };
  const takeValues = (o: Record<string, unknown>): number[] | null => {
    const arr = Array.isArray(o.values) ? o.values : Array.isArray(o.totals) ? o.totals : Array.isArray(o.sums) ? o.sums : Array.isArray(o.counts) ? o.counts : null;
    return arr ? (arr as unknown[]).map((n) => Number(n) || 0) : null;
  };

  // Top-level labels/values
  const topLabels = takeLabels(raw);
  const topValues = takeValues(raw);
  if (topLabels && topValues && topLabels.length === topValues.length && topLabels.length > 0)
    return { labels: topLabels, values: topValues };

  // Nested under data, result, trend, etc.
  for (const key of ['data', 'result', 'trend', 'response']) {
    const inner = raw[key] as Record<string, unknown> | undefined;
    if (inner && typeof inner === 'object') {
      const labels = takeLabels(inner);
      const values = takeValues(inner);
      if (labels && values && labels.length === values.length && labels.length > 0)
        return { labels, values };
    }
  }

  // Any nested object with label/value arrays (arbitrary wrapper keys)
  for (const v of Object.values(raw)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const labels = takeLabels(v as Record<string, unknown>);
      const values = takeValues(v as Record<string, unknown>);
      if (labels && values && labels.length === values.length && labels.length > 0)
        return { labels, values };
    }
  }

  // Array of points: data.data or data.points as [{ label, value }, ...]
  const arr = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.points) ? raw.points : [];
  if (arr.length) {
    const labels = arr.map((d: Record<string, unknown>) =>
      d.label != null ? String(d.label) : d.period != null ? String(d.period) : d.date != null ? String(d.date) : ''
    );
    const values = arr.map((d: Record<string, unknown>) =>
      Number((d.value ?? d.sum ?? d.total ?? d.count ?? 0)) || 0
    );
    if (labels.some(Boolean) || values.some((n) => n !== 0)) return { labels, values };
  }

  return { labels: [], values: [] };
}

function defaultDateRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setFullYear(from.getFullYear() - 1);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10)
  };
}

export default function MetricTrend() {
  const { metricId } = useParams<{ metricId: string }>();
  const navigate = useNavigate();
  const defaultRange = useMemo(defaultDateRange, []);
  const [metric, setMetric] = useState<Metric | null>(null);
  const [groupBy, setGroupBy] = useState<'month' | 'year'>('month');
  const [range, setRange] = useState(defaultRange);
  const [trendData, setTrendData] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!metricId) return;
    const loadMetric = async () => {
      try {
        const data = await getMetric(metricId);
        console.log('data', data);
        setMetric(data);
      } catch (error) {
        console.error('Error loading metric:', error);
      }
    };
    loadMetric();
  }, [metricId]);

  const loadTrend = async () => {
    if (!metricId) return;
    try {
      setLoading(true);
      const data = await getMetricTrend(metricId, {
        groupBy,
        from: range.from || undefined,
        to: range.to || undefined
      });
      console.log('trend data', data);
      const { labels, values } = parseTrendResponse(data);
      setTrendData({ labels, values });
    } catch (error) {
      console.error('Error loading metric trend:', error);
      setTrendData({ labels: [], values: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrend();
  }, [groupBy, range.from, range.to, metricId]);

  return (
    <div className="space-y-6 w-full min-w-0">
      <PageHeader
        title="Metric Trend"
        subtitle={metric ? metric.name : 'Trend overview'}
        actions={
          <button
            onClick={() => navigate(`/metrics/${metricId}`)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back
          </button>
        }
      />

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4 w-full min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Group By</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as 'month' | 'year')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
          <DateRangePicker
            from={range.from}
            to={range.to}
            onChange={(nextRange) => setRange(nextRange)}
          />
          <button
            onClick={loadTrend}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50"
          >
            <FaSyncAlt className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 w-full min-w-0 overflow-hidden">
          {loading ? (
            <div className="text-center text-gray-500">Loading trend data...</div>
          ) : (
            <ChartComponent labels={trendData.labels} values={trendData.values} />
          )}
        </div>
      </div>
    </div>
  );
}
