import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import { createMetric, getMetric, updateMetric } from '../api/metric';
import { useSelectedStore } from '../auth/useSelectedStore';
import { useAuth } from '../auth/AuthContext';

const VALUE_TYPES = [
  { label: 'Number', value: 'NUMBER' },
  { label: 'Percent', value: 'PERCENT' },
  { label: 'Currency', value: 'CURRENCY' }
];

const AGGREGATION_TYPES = [
  { label: 'Sum', value: 'SUM' },
  { label: 'Average', value: 'AVERAGE' },
  { label: 'Minimum', value: 'MIN' },
  { label: 'Maximum', value: 'MAX' }
];

export default function MetricForm() {
  const { metricId } = useParams<{ metricId: string }>();
  const navigate = useNavigate();
  const { selectedStore } = useSelectedStore();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: '',
    valuetype: '',
    aggregationtype: '',
    isactive: true
  });

  useEffect(() => {
    if (!metricId) return;

    const loadMetric = async () => {
      try {
        setLoading(true);
        const data = await getMetric(metricId);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          unit: data.unit || '',
          valuetype: data.valuetype || '',
          aggregationtype: data.aggregationtype || '',
          isactive: data.isactive
        });
      } catch (error) {
        console.error('Error loading metric:', error);
        alert('Failed to load metric');
      } finally {
        setLoading(false);
      }
    };

    loadMetric();
  }, [metricId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const name = target.name;
    const value = target instanceof HTMLInputElement && target.type === 'checkbox'
      ? target.checked
      : target.value;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.unit || !formData.valuetype || !formData.aggregationtype) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      if (metricId) {
        await updateMetric(metricId, {
          name: formData.name,
          description: formData.description,
          unit: formData.unit,
          valuetype: formData.valuetype,
          aggregationtype: formData.aggregationtype,
          storenumber: selectedStore ?? 0,
          isactive: formData.isactive
        });
      } else {
        await createMetric({
          name: formData.name,
          description: formData.description,
          unit: formData.unit,
          valuetype: formData.valuetype,
          aggregationtype: formData.aggregationtype,
          storenumber: selectedStore ?? 0,
          createdby: user?.id ?? user?.email ?? 'current-user',
          isactive: formData.isactive
        });
      }

      navigate('/metrics');
    } catch (error) {
      console.error('Error saving metric:', error);
      alert('Failed to save metric');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={metricId ? 'Edit Metric' : 'Create Metric'}
        subtitle="Define how the metric should be tracked"
        actions={
          <button
            onClick={() => navigate('/metrics')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
        <FormField
          label="Metric Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter metric name"
        />
        <FormField
          label="Description"
          name="description"
          type="textarea"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe how this metric is used"
        />
        <FormField
          label="Unit"
          name="unit"
          value={formData.unit}
          onChange={handleChange}
          required
          placeholder="e.g. dollars, units"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Value Type"
            name="valuetype"
            type="select"
            value={formData.valuetype}
            onChange={handleChange}
            required
            options={VALUE_TYPES}
          />
          <FormField
            label="Aggregation Type"
            name="aggregationtype"
            type="select"
            value={formData.aggregationtype}
            onChange={handleChange}
            required
            options={AGGREGATION_TYPES}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="isactive"
            name="isactive"
            type="checkbox"
            checked={formData.isactive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="isactive" className="text-sm text-gray-700">Active</label>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <FaSave className="w-4 h-4" />
            {loading ? 'Saving...' : metricId ? 'Update Metric' : 'Create Metric'}
          </button>
        </div>
      </form>
    </div>
  );
}
