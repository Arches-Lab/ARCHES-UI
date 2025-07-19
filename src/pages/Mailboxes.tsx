import { useEffect, useState } from 'react';
import { getMailboxes, createActivity, getActivities } from '../api';
import { FaInbox, FaSpinner, FaExclamationTriangle, FaClock, FaUser, FaStore, FaEnvelope, FaMapMarkerAlt, FaBox, FaPlus, FaTimes, FaFilter, FaChevronLeft, FaListAlt, FaEye, FaWrench, FaLock, FaKey, FaPhone, FaChevronDown, FaDollarSign } from 'react-icons/fa';
import { useStore } from '../auth/StoreContext';

interface Mailbox {
  mailboxid: string;
  storenumber: number;
  mailboxnumber: string;
  mailboxguid: string;
}

interface Activity {
  activityid: string;
  storenumber: number;
  parentid: string;
  parenttypecode: string;
  activitytypecode: string;
  details: string;
  createdby: string;
  creator: {
    email: string | null;
    lastname: string;
    firstname: string;
  };
  createdon: string;
}

interface RangeFilter {
  label: string;
  min: number;
  max: number;
}

// Canned activities for quick selection
const CANNED_ACTIVITIES = [
  { type: 'OTHER', details: 'Checked mailbox for mail', icon: <FaInbox /> },
  { type: 'OTHER', details: 'Picked up mail from mailbox', icon: <FaEnvelope /> },
  { type: 'OTHER', details: 'Performed maintenance on mailbox', icon: <FaWrench /> },
  { type: 'OTHER', details: 'Reported issue with mailbox', icon: <FaExclamationTriangle /> },
  { type: 'OTHER', details: 'Checked mailbox lock functionality', icon: <FaLock /> },
  { type: 'OTHER', details: 'Issued new key for mailbox', icon: <FaKey /> },
  { type: 'OTHER', details: 'Returned key for mailbox', icon: <FaKey /> },
  { type: 'VOICEMAIL', details: 'Left voicemail', icon: <FaPhone /> },
  { type: 'EMAIL', details: 'Emailed customer', icon: <FaEnvelope /> },
  { type: 'PHONE', details: 'Called customer', icon: <FaPhone /> },
];

// Activity types for custom activities
const ACTIVITY_TYPES = [
  { type: 'PHONE', label: 'Phone', icon: <FaPhone /> },
  { type: 'VOICEMAIL', label: 'Voicemail', icon: <FaPhone /> },
  { type: 'EMAIL', label: 'Email', icon: <FaEnvelope /> },
  { type: 'FAX', label: 'Fax', icon: <FaEnvelope /> },
  { type: 'FOLLOWUP', label: 'Follow Up', icon: <FaClock /> },
  { type: 'MEETING', label: 'Meeting', icon: <FaUser /> },
  { type: 'NOTE', label: 'Note', icon: <FaListAlt /> },
  { type: 'QUOTE', label: 'Quote', icon: <FaDollarSign /> },
  { type: 'OTHER', label: 'Other', icon: <FaInbox /> },
];

export default function Mailboxes() {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [filteredMailboxes, setFilteredMailboxes] = useState<Mailbox[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMailbox, setSelectedMailbox] = useState<Mailbox | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedCannedActivity, setSelectedCannedActivity] = useState<string>('');
  const [customActivityType, setCustomActivityType] = useState('');
  const [activityDetails, setActivityDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCannedDropdown, setShowCannedDropdown] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<RangeFilter | null>(null);
  const [filterHistory, setFilterHistory] = useState<RangeFilter[]>([]);
  const { selectedStore } = useStore();

  // Define the initial range filters
  const getInitialRanges = (): RangeFilter[] => {
    return [
      { label: '100-199', min: 100, max: 199 },
      { label: '200-299', min: 200, max: 299 },
      { label: '300-399', min: 300, max: 399 },
      { label: '400-499', min: 400, max: 499 },
    ];
  };

  // Generate sub-ranges for a given range
  const getSubRanges = (parentRange: RangeFilter): RangeFilter[] => {
    const subRanges: RangeFilter[] = [];
    const rangeSize = 50; // 50 boxes per sub-range
    
    for (let i = parentRange.min; i <= parentRange.max; i += rangeSize) {
      const end = Math.min(i + rangeSize - 1, parentRange.max);
      subRanges.push({
        label: `${i}-${end}`,
        min: i,
        max: end
      });
    }
    
    return subRanges;
  };

  // Filter mailboxes based on current filter
  const filterMailboxes = (mailboxes: Mailbox[], filter: RangeFilter | null): Mailbox[] => {
    if (!filter) return mailboxes;
    
    return mailboxes.filter(mailbox => {
      const mailboxNum = parseInt(mailbox.mailboxnumber);
      return mailboxNum >= filter.min && mailboxNum <= filter.max;
    });
  };

  // Get activities for a specific mailbox
  const getActivitiesForMailbox = (mailboxId: string) => {
    return activities.filter(activity => 
      activity.parenttypecode === 'MAILBOX' && activity.parentid === mailboxId
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔄 Fetching mailboxes and activities for store: ${selectedStore}`);
        
        // Fetch mailboxes and activities in parallel
        const [mailboxesData, activitiesData] = await Promise.all([
          getMailboxes(),
          getActivities()
        ]);
        
        console.log('Mailboxes data:', mailboxesData);
        console.log('Activities data:', activitiesData);
        
        const mailboxesArray = Array.isArray(mailboxesData) ? mailboxesData : [];
        const activitiesArray = Array.isArray(activitiesData) ? activitiesData : [];
        
        setMailboxes(mailboxesArray);
        setActivities(activitiesArray);
        setFilteredMailboxes(filterMailboxes(mailboxesArray, currentFilter));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if selectedStore is a valid number (not null, undefined, or 0)
    if (selectedStore !== null && selectedStore !== undefined) {
      console.log(`🔄 Loading mailboxes and activities for store: ${selectedStore}`);
      fetchData();
    } else {
      // Clear data only when no store is selected
      setMailboxes([]);
      setActivities([]);
      setFilteredMailboxes([]);
      setLoading(false);
      setError(null);
    }
  }, [selectedStore]);

  // Update filtered mailboxes when filter changes
  useEffect(() => {
    setFilteredMailboxes(filterMailboxes(mailboxes, currentFilter));
  }, [mailboxes, currentFilter]);

  const handleRangeSelect = (range: RangeFilter) => {
    setCurrentFilter(range);
    setFilterHistory(prev => [...prev, range]);
  };

  const handleBackToParent = () => {
    const newHistory = [...filterHistory];
    newHistory.pop(); // Remove current filter
    const parentFilter = newHistory.length > 0 ? newHistory[newHistory.length - 1] : null;
    
    setFilterHistory(newHistory);
    setCurrentFilter(parentFilter);
  };

  const handleClearFilters = () => {
    setCurrentFilter(null);
    setFilterHistory([]);
  };

  const handleMailboxClick = (mailbox: Mailbox) => {
    setSelectedMailbox(mailbox);
  };

  const handleAddActivity = (mailbox: Mailbox) => {
    setSelectedMailbox(mailbox);
    setShowActivityModal(true);
  };

  const handleCannedActivitySelect = async (activityType: string, activityDetails: string) => {
    if (!selectedMailbox) return;

    try {
      setSubmitting(true);
      
      await createActivity({
        storenumber: selectedMailbox.storenumber,
        parentid: selectedMailbox.mailboxguid,
        parenttypecode: 'MAILBOX',
        activitytypecode: activityType.trim(),
        details: activityDetails.trim()
      });

      // Refresh activities
      const activitiesData = await getActivities();
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);

      // Close dropdown and modal
      setShowCannedDropdown(false);
      setShowActivityModal(false);
      
      console.log('Canned activity created successfully');
      
    } catch (error) {
      console.error('Error creating canned activity:', error);
      setError('Failed to create activity. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMailbox || !selectedCannedActivity) return;
    
    if (!activityDetails.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      
      await createActivity({
        storenumber: selectedMailbox.storenumber,
        parentid: selectedMailbox.mailboxguid,
        parenttypecode: 'MAILBOX',
        activitytypecode: selectedCannedActivity.trim(),
        details: activityDetails.trim()
      });

      // Refresh activities
      const activitiesData = await getActivities();
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);

      // Reset form and close modal
      setSelectedCannedActivity('');
      setActivityDetails('');
      setShowActivityModal(false);
      setShowCannedDropdown(false);
      
      console.log('Custom activity created successfully');
      
    } catch (error) {
      console.error('Error creating activity:', error);
      setError('Failed to create activity. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowActivityModal(false);
    setSelectedCannedActivity('');
    setActivityDetails('');
    setShowCannedDropdown(false);
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('empty') || statusLower.includes('checked')) {
      return 'text-green-600 bg-green-100';
    }
    if (statusLower.includes('full') || statusLower.includes('mail')) {
      return 'text-blue-600 bg-blue-100';
    }
    if (statusLower.includes('out') || statusLower.includes('service')) {
      return 'text-red-600 bg-red-100';
    }
    return 'text-gray-600 bg-gray-100';
  };

  const getCurrentRanges = (): RangeFilter[] => {
    if (!currentFilter) {
      return getInitialRanges();
    }
    
    // If we're at a 100-range, show 50-range sub-ranges
    if (currentFilter.max - currentFilter.min >= 99) {
      return getSubRanges(currentFilter);
    }
    
    // If we're at a 50-range, show individual mailboxes (no more filtering)
    return [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading mailboxes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Error</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const currentRanges = getCurrentRanges();
  const showMailboxes = currentRanges.length === 0 && currentFilter;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <FaInbox className="text-3xl text-blue-600" />
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold">Mailboxes</h2>
            {/* Filter Breadcrumb */}
            {filterHistory.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-gray-400">/</span>
                <button
                  onClick={handleBackToParent}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <FaChevronLeft className="w-3 h-3" />
                  Back
                </button>
                <span>/</span>
                {filterHistory.map((filter, index) => (
                  <span key={index} className="text-gray-900 font-medium">
                    {filter.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {showMailboxes ? filteredMailboxes.length : mailboxes.length} mailbox{showMailboxes ? (filteredMailboxes.length !== 1 ? 'es' : '') : (mailboxes.length !== 1 ? 'es' : '')}
          </div>
          {(currentFilter || filterHistory.length > 0) && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              <FaFilter className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content - Split Screen */}
      <div className="flex-1 flex">
        {/* Left Panel - Mailboxes */}
        <div className="w-1/2 border-r border-gray-200 flex flex-col">
          {/* Range Filters */}
          {currentRanges.length > 0 && (
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentRanges.map((range) => {
                  const rangeMailboxes = filterMailboxes(mailboxes, range);
                  return (
                    <button
                      key={range.label}
                      onClick={() => handleRangeSelect(range)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-center"
                    >
                      <div className="text-lg font-semibold text-gray-900">{range.label}</div>
                      <div className="text-sm text-gray-600">{rangeMailboxes.length} mailboxes</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mailboxes Grid */}
          {showMailboxes && (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Mailboxes {currentFilter?.label}
                </h3>
                <div className="text-sm text-gray-600">
                  {filteredMailboxes.length} mailbox{filteredMailboxes.length !== 1 ? 'es' : ''}
                </div>
              </div>

              {filteredMailboxes.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
                  <FaInbox className="text-4xl text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Mailboxes</h3>
                  <p className="text-gray-600">No mailboxes found in the selected range.</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                  {filteredMailboxes.map((mailbox) => {
                    const mailboxActivities = getActivitiesForMailbox(mailbox.mailboxguid);
                    const isSelected = selectedMailbox?.mailboxid === mailbox.mailboxid;
                    return (
                      <div
                        key={mailbox.mailboxid}
                        className={`aspect-square bg-white border rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center cursor-pointer relative ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => handleMailboxClick(mailbox)}
                      >
                        <div className="text-center flex-1 flex items-center justify-center">
                          <div className="text-lg font-bold text-gray-700">
                            {mailbox.mailboxnumber}
                          </div>
                        </div>
                        {mailboxActivities.length > 0 && (
                          <div className="absolute top-1 right-1">
                            <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {mailboxActivities.length}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Activities */}
        <div className="w-1/2 flex flex-col">
          {selectedMailbox ? (
            <>
              {/* Activities Header */}
              <div className="p-6 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaListAlt className="text-2xl text-blue-600" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Mailbox {selectedMailbox.mailboxnumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {getActivitiesForMailbox(selectedMailbox.mailboxguid).length} activities
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <button
                        onClick={() => setShowCannedDropdown(!showCannedDropdown)}
                        disabled={submitting}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      > 
                        <span>Add Canned Activity</span>
                        <FaChevronDown className={`w-4 h-4 transition-transform ${showCannedDropdown ? 'rotate-180' : ''}`} />
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
                    <button
                      onClick={() => handleAddActivity(selectedMailbox)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <FaPlus className="w-4 h-4" />
                        New Activity
                    </button>
                  </div>
                </div>
              </div>

              {/* Activities List */}
              <div className="flex-1 p-6 overflow-y-auto">
                {(() => {
                  const mailboxActivities = getActivitiesForMailbox(selectedMailbox.mailboxguid);
                  return (
                    <div>
                      {mailboxActivities.length === 0 ? (
                        <div className="text-center py-8">
                          <FaListAlt className="text-4xl text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-900 mb-2">No Activities</h4>
                          <p className="text-gray-600">No activities have been recorded for this mailbox yet.</p>
                          <button
                            onClick={() => handleAddActivity(selectedMailbox)}
                            className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                          >
                            <FaPlus className="w-4 h-4" />
                            Add First Activity
                          </button>
                        </div>
                      ) : (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                          <div className="divide-y divide-gray-200">
                            {mailboxActivities.map((activity) => (
                              <div key={activity.activityid} className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <FaListAlt className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-medium text-gray-700">
                                      {activity.activitytypecode}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <FaUser className="w-3 h-3" />
                                      <span>{activity.creator.firstname} {activity.creator.lastname}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <FaClock className="w-3 h-3" />
                                      <span>{formatTimestamp(activity.createdon)}</span>
                                    </div>
                                  </div>
                                </div>
                                {activity.details && (
                                  <div>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{activity.details}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FaInbox className="text-4xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Mailbox</h3>
                <p className="text-gray-600">Click on a mailbox to view its activities</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity Modal */}
      {showActivityModal && selectedMailbox && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                New Activity for Mailbox {selectedMailbox.mailboxnumber}
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
                {/* <label className="block text-sm font-medium text-gray-700 mb-3">
                  Create New Activity
                </label> */}
                
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
                        onClick={() => setSelectedCannedActivity(type.type)}
                        className={`p-3 border rounded-md transition-colors text-left ${
                          selectedCannedActivity === type.type
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
                  disabled={submitting || !selectedCannedActivity || !activityDetails.trim()}
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
    </div>
  );
} 