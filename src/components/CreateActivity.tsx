import { useState } from 'react';
import { createActivity } from '../api';
import { FaTimes, FaPlus, FaSpinner, FaPhone, FaVoicemail, FaEnvelope, FaCalendar, FaComment, FaFileAlt, FaHandshake, FaChartLine, FaExclamationCircle, FaListAlt } from 'react-icons/fa';
import { useStore } from '../auth/StoreContext';

interface CreateActivityProps {
  leadId: string;
  leadDescription: string;
  onActivityCreated: () => void;
  onCancel: () => void;
}

const ACTIVITY_TYPES = [
  { code: 'PHONE', icon: FaPhone, color: 'text-green-500' },
  { code: 'VOICEMAIL', icon: FaVoicemail, color: 'text-blue-500' },
  { code: 'EMAIL', icon: FaEnvelope, color: 'text-red-500' },
  { code: 'MEETING', icon: FaCalendar, color: 'text-purple-500' },
  { code: 'NOTE', icon: FaComment, color: 'text-gray-500' },
  { code: 'Document', icon: FaFileAlt, color: 'text-orange-500' },
  { code: 'Follow-up', icon: FaHandshake, color: 'text-teal-500' },
  { code: 'Quote', icon: FaChartLine, color: 'text-indigo-500' },
  { code: 'Issue', icon: FaExclamationCircle, color: 'text-red-500' },
  { code: 'Other', icon: FaListAlt, color: 'text-gray-400' },
];

export default function CreateActivity({ leadId, leadDescription, onActivityCreated, onCancel }: CreateActivityProps) {
  const { selectedStore } = useStore();
  const [activityType, setActivityType] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activityType.trim()) {
      setError('Activity type is required');
      return;
    }

    if (!details.trim()) {
      setError('Activity details are required');
      return;
    }

    if (!selectedStore) {
      setError('Please select a store first');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const activityData = {
        storenumber: selectedStore,
        parentid: leadId,
        parenttypecode: 'LEAD',
        activitytypecode: activityType.trim(),
        details: details.trim()
      };
      console.log("activityData", activityData);
      await createActivity(activityData);
      
      // Reset form
      setActivityType('');
      setDetails('');
      
      // Notify parent component
      onActivityCreated();
    } catch (err) {
      console.error('Error creating activity:', err);
      setError('Failed to create activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Activity</h2>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Lead Info */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-1">Lead</h3>
            <p className="text-sm text-blue-700 line-clamp-2">{leadDescription}</p>
          </div>

          {/* Activity Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ACTIVITY_TYPES.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.code}
                    type="button"
                    onClick={() => setActivityType(type.code)}
                    className={`flex items-center gap-2 p-3 text-sm border rounded-lg transition-colors ${
                      activityType === type.code
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    disabled={isSubmitting}
                  >
                    <IconComponent className={`w-4 h-4 ${type.color}`} />
                    <span>{type.code}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity Details */}
          <div>
            <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
              Activity Details *
            </label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Describe the activity details..."
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !activityType.trim() || !details.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FaPlus className="w-4 h-4" />
                  Add Activity
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 