import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { Training } from '../models/Training';
import { CreateTrainingRequest, UpdateTrainingRequest } from '../models/Training';

interface TrainingModalProps {
  training?: Training | null;
  onSave: (data: CreateTrainingRequest | UpdateTrainingRequest) => Promise<void>;
  onCancel: () => void;
  selectedStore: number;
}

const TITLE_MAX_LENGTH = 200;

export default function TrainingModal({ training, onSave, onCancel, selectedStore }: TrainingModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    estimatedminutes: 0,
    isactive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (training) {
      setFormData({
        title: training.title ?? '',
        description: training.description ?? '',
        category: training.category ?? '',
        estimatedminutes: training.estimatedminutes ?? 0,
        isactive: training.isactive ?? true
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: '',
        estimatedminutes: 0,
        isactive: true
      });
    }
    setValidationError(null);
  }, [training]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : undefined;
    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox' && checked !== undefined
          ? checked
          : name === 'estimatedminutes'
            ? Math.max(0, parseInt(String(value), 10) || 0)
            : value
    }));
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    const titleTrim = formData.title.trim();
    if (!titleTrim) {
      setValidationError('Title is required.');
      return;
    }
    if (titleTrim.length > TITLE_MAX_LENGTH) {
      setValidationError(`Title must be at most ${TITLE_MAX_LENGTH} characters.`);
      return;
    }
    if (formData.estimatedminutes < 0) {
      setValidationError('Estimated minutes must be 0 or greater.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        title: titleTrim,
        storenumber: selectedStore
      });
    } catch (err) {
      console.error('Error saving training:', err);
      setValidationError('Failed to save training.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {training ? 'Edit Training' : 'Add Training'}
          </h2>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {validationError}
            </div>
          )}

          <div>
            <label htmlFor="training-title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="training-title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              maxLength={TITLE_MAX_LENGTH}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Training title"
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.title.length}/{TITLE_MAX_LENGTH}
            </p>
          </div>

          <div>
            <label htmlFor="training-description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="training-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description"
            />
          </div>

          <div>
            <label htmlFor="training-category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <input
              type="text"
              id="training-category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Category"
            />
          </div>

          <div>
            <label htmlFor="training-estimatedminutes" className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Minutes *
            </label>
            <input
              type="number"
              id="training-estimatedminutes"
              name="estimatedminutes"
              value={formData.estimatedminutes}
              onChange={handleInputChange}
              min={0}
              step={1}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isactive: !prev.isactive }))}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              {formData.isactive ? <FaToggleOff className="w-3 h-3" /> : <FaToggleOn className="w-3 h-3" />}
              {formData.isactive ? 'Active' : 'Inactive'}
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSave className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : training ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
