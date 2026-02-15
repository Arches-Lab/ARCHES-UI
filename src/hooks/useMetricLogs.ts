import { useCallback, useEffect, useState } from 'react';
import { MetricLog } from '../models/MetricLog';
import { getMetricLogs } from '../api/metricLog';

export function useMetricLogs(metricId?: string, from?: string, to?: string) {
  const [logs, setLogs] = useState<MetricLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    if (!metricId) {
      setLogs([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getMetricLogs(metricId, { from, to });
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading metric logs:', err);
      setError('Failed to load metric logs.');
    } finally {
      setLoading(false);
    }
  }, [metricId, from, to]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return { logs, loading, error, reload: loadLogs };
}
