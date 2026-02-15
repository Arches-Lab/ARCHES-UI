import { useState } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import FormField from './FormField';
import { createMetricLog } from '../api/metricLog';
import { useAuth } from '../auth/AuthContext';

interface MetricLogModalProps {
  metricId: string;
  metricName: string;
  selectedStore: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MetricLogModal({
  metricId,
  metricName,
  selectedStore,
  onSuccess,
  onCancel
}: MetricLogModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    logdate: new Date().toISOString().split('T')[0],
    logvalue: 0,
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'logvalue' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.logdate) {
      alert('Log date is required.');
      return;
    }

    setLoading(true);
    try {
      await createMetricLog({
        metricid: metricId,
        storenumber: selectedStore,
        logdate: formData.logdate,
        logvalue: formData.logvalue,
        notes: formData.notes,
        createdby: user?.id ?? user?.email ?? 'current-user'
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating metric log:', error);
      alert('Failed to create metric log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add Metric Log</h2>
            {metricName && <p className="text-sm text-gray-500 mt-0.5">Metric: {metricName}</p>}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField
            label="Log Date"
            name="logdate"
            type="date"
            value={formData.logdate}
            onChange={handleChange}
            required
          />
          <FormField
            label="Log Value"
            name="logvalue"
            type="number"
            value={formData.logvalue}
            onChange={handleChange}
            required
          />
          <FormField
            label="Notes"
            name="notes"
            type="textarea"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Optional notes"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <FaSave className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
