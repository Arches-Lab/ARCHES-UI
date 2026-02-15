import { useCallback, useEffect, useState } from 'react';
import { Metric } from '../models/Metric';
import { getMetrics } from '../api/metric';

export function useMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMetrics();
      setMetrics(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading metrics:', err);
      setError('Failed to load metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return { metrics, loading, error, reload: loadMetrics };
}
