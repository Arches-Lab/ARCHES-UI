import { useEffect, useState } from 'react';
import { getMailboxes, createActivity } from '../api';
import { FaInbox, FaSpinner, FaExclamationTriangle, FaClock, FaUser, FaStore, FaEnvelope, FaMapMarkerAlt, FaBox, FaPlus, FaTimes, FaFilter, FaChevronLeft } from 'react-icons/fa';
import { useStore } from '../auth/StoreContext';

interface Mailbox {
  mailboxid: string;
  storenumber: number;
  mailboxnumber: string;
  mailboxguid: string;
}

interface RangeFilter {
  label: string;
  min: number;
  max: number;
}

export default function Mailboxes() {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [filteredMailboxes, setFilteredMailboxes] = useState<Mailbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMailbox, setSelectedMailbox] = useState<Mailbox | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityType, setActivityType] = useState('');
  const [activityDetails, setActivityDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔄 Fetching mailboxes for store: ${selectedStore}`);
        
        const mailboxesData = await getMailboxes();
        
        console.log('Mailboxes data:', mailboxesData);
        
        const mailboxesArray = Array.isArray(mailboxesData) ? mailboxesData : [];
        setMailboxes(mailboxesArray);
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
      console.log(`🔄 Loading mailboxes for store: ${selectedStore}`);
      fetchData();
    } else {
      // Clear data only when no store is selected
      setMailboxes([]);
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
    setShowActivityModal(true);
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMailbox || !activityType.trim() || !activityDetails.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      
      await createActivity({
        storenumber: selectedMailbox.storenumber,
        parentid: selectedMailbox.mailboxguid,
        parenttypecode: 'MAILBOX',
        activitytypecode: activityType.trim(),
        details: activityDetails.trim()
      });

      // Reset form and close modal
      setActivityType('');
      setActivityDetails('');
      setShowActivityModal(false);
      setSelectedMailbox(null);
      
      // Show success message (you could add a toast notification here)
      console.log('Activity created successfully');
      
    } catch (error) {
      console.error('Error creating activity:', error);
      setError('Failed to create activity. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowActivityModal(false);
    setSelectedMailbox(null);
    setActivityType('');
    setActivityDetails('');
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaInbox className="text-3xl text-blue-600" />
          <h2 className="text-2xl font-semibold">Mailboxes</h2>
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

      {/* Filter Breadcrumb */}
      {filterHistory.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
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

      {/* Range Filters */}
      {currentRanges.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          {/* <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {currentFilter ? `Select Range in ${currentFilter.label}` : 'Select Mailbox Range'}
          </h3> */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
        <>
          <div className="flex items-center justify-between">
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
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 xl:grid-cols-16 gap-3">
              {filteredMailboxes.map((mailbox) => (
                <div
                  key={mailbox.mailboxid}
                  className="aspect-square bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all hover:bg-gray-50 flex items-center justify-center cursor-pointer"
                  onClick={() => handleMailboxClick(mailbox)}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-700">
                      {mailbox.mailboxnumber}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Activity Modal */}
      {showActivityModal && selectedMailbox && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Add Activity for Mailbox {selectedMailbox.mailboxnumber}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div>
                <label htmlFor="activityType" className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Type
                </label>
                <input
                  id="activityType"
                  type="text"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Mail Check, Maintenance, Issue"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label htmlFor="activityDetails" className="block text-sm font-medium text-gray-700 mb-2">
                  Details
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

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting || !activityType.trim() || !activityDetails.trim()}
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