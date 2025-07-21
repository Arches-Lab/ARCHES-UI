import { useState } from 'react';
import { FaSpinner, FaPlus, FaPhone, FaVoicemail, FaEnvelope, FaCalendar, FaComment, FaFileAlt, FaHandshake, FaChartLine, FaExclamationCircle, FaTimes } from 'react-icons/fa';
import { createActivity } from '../api';

interface ActivityCreationProps {
  parentId: string;
  parentType: 'LEAD' | 'MAILBOX';
  parentName?: string;
  storeNumber: number;
  onActivityCreated: () => void;
  showCannedButton?: boolean;
  showCustomButton?: boolean;
}

// Activity types for custom activities
const ACTIVITY_TYPES = [
  { type: 'PHONE', label: 'Phone', icon: <FaPhone className="text-green-500" /> },
  { type: 'VOICEMAIL', label: 'Voicemail', icon: <FaVoicemail className="text-blue-500" /> },
  { type: 'EMAIL', label: 'Email', icon: <FaEnvelope className="text-red-500" /> },
  { type: 'FAX', label: 'Fax', icon: <FaEnvelope className="text-orange-500" /> },
  { type: 'FOLLOWUP', label: 'Follow Up', icon: <FaHandshake className="text-teal-500" /> },
  { type: 'MEETING', label: 'Meeting', icon: <FaCalendar className="text-purple-500" /> },
  { type: 'NOTE', label: 'Note', icon: <FaComment className="text-gray-500" /> },
  { type: 'QUOTE', label: 'Quote', icon: <FaChartLine className="text-indigo-500" /> },
  { type: 'OTHER', label: 'Other', icon: <FaComment className="text-gray-400" /> },
];

// Canned activities for quick selection
const CANNED_ACTIVITIES = [
  { type: 'VOICEMAIL', details: 'Left voicemail', icon: <FaVoicemail className="text-blue-500" /> },
  { type: 'EMAIL', details: 'Emailed customer', icon: <FaEnvelope className="text-red-500" /> },
  { type: 'PHONE', details: 'Called customer', icon: <FaPhone className="text-green-500" /> },
];

export default function ActivityCreation({ 
  parentId, 
  parentType, 
  parentName,
  storeNumber,
  onActivityCreated,
  showCannedButton = true,
  showCustomButton = true
}: ActivityCreationProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState('');
  const [activityDetails, setActivityDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCannedDropdown, setShowCannedDropdown] = useState(false);

  const handleCannedActivitySelect = async (activityType: string, details: string) => {
    try {
      setSubmitting(true);
      
      await createActivity({
        storenumber: storeNumber,
        parentid: parentId,
        parenttypecode: parentType,
        activitytypecode: activityType.trim(),
        details: details.trim()
      });

      // Refresh activities
      await onActivityCreated();

      // Close dropdown and modal
      setShowCannedDropdown(false);
      setShowCreateModal(false);
      
      console.log('Canned activity created successfully');
      
    } catch (error) {
      console.error('Error creating canned activity:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedActivityType || !activityDetails.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      
      await createActivity({
        storenumber: storeNumber,
        parentid: parentId,
        parenttypecode: parentType,
        activitytypecode: selectedActivityType.trim(),
        details: activityDetails.trim()
      });

      // Refresh activities
      await onActivityCreated();

      // Reset form and close modal
      setSelectedActivityType('');
      setActivityDetails('');
      setShowCreateModal(false);
      setShowCannedDropdown(false);
      
      console.log('Custom activity created successfully');
      
    } catch (error) {
      console.error('Error creating activity:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setSelectedActivityType('');
    setActivityDetails('');
    setShowCannedDropdown(false);
  };

  return (
    <>
      {/* Activity Creation Buttons */}
      <div className="flex items-center gap-2">
        {showCannedButton && (
          <div className="relative">
            <button
              onClick={() => setShowCannedDropdown(!showCannedDropdown)}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            > 
              <span>Add Canned Activity</span>
            </button>
            
            {showCannedDropdown && (
              <div className="absolute right-0 top-full mt-1 z-10 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto min-w-[250px]">
                {CANNED_ACTIVITIES.map((activity) => (
                  <button
                    key={activity.type + activity.details}
                    type="button"
                    onClick={() => handleCannedActivitySelect(activity.type, activity.details)}
                    disabled={submitting}
                    className="w-full p-3 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{activity.icon}</span>
                      <span className="text-sm">{activity.details}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        {showCustomButton && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            Add Activity
          </button>
        )}
      </div>

      {/* Create Activity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                New Activity
                {parentName && <span className="text-gray-500"> for {parentName}</span>}
              </h3>

              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4">
              {/* Custom Activity Section */}
              <div>
                {/* Activity Type Icons */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Select Activity Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {ACTIVITY_TYPES.map((type) => (
                      <button
                        key={type.type}
                        type="button"
                        onClick={() => setSelectedActivityType(type.type)}
                        className={`p-3 border rounded-md transition-colors text-left ${
                          selectedActivityType === type.type
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        disabled={submitting}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{type.icon}</span>
                          <span className="text-xs">{type.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activity Details */}
                <div>
                  <label htmlFor="activityDetails" className="block text-xs font-medium text-gray-600 mb-2">
                    Description
                  </label>
                  <textarea
                    id="activityDetails"
                    value={activityDetails}
                    onChange={(e) => setActivityDetails(e.target.value)}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the activity..."
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting || !selectedActivityType || !activityDetails.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin w-4 h-4" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaPlus className="w-4 h-4" />
                      Create Activity
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 