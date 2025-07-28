import { useEffect, useState } from 'react';
import { getMailboxes, getActivities } from '../api';
import { FaInbox, FaSpinner, FaExclamationTriangle, FaClock, FaUser, FaStore, FaEnvelope, FaMapMarkerAlt, FaBox, FaFilter, FaChevronLeft, FaListAlt, FaEye, FaWrench, FaLock, FaKey, FaPhone, FaDollarSign, FaVoicemail, FaCalendar, FaComment, FaFileAlt, FaHandshake, FaChartLine, FaExclamationCircle } from 'react-icons/fa';
import { useStore } from '../auth/StoreContext';
import ActivityCreation from '../components/ActivityCreation';

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



export default function Mailboxes() {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [filteredMailboxes, setFilteredMailboxes] = useState<Mailbox[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMailbox, setSelectedMailbox] = useState<Mailbox | null>(null);

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

  const getActivityIcon = (activityType: string) => {
    const type = activityType.toLowerCase();
    
    if (type.includes('phone') || type.includes('call')) {
      return <FaPhone className="w-4 h-4 text-green-500" />;
    }
    if (type.includes('voice') || type.includes('voicemail')) {
      return <FaVoicemail className="w-4 h-4 text-blue-500" />;
    }
    if (type.includes('email') || type.includes('mail')) {
      return <FaEnvelope className="w-4 h-4 text-red-500" />;
    }
    if (type.includes('meeting') || type.includes('appointment')) {
      return <FaCalendar className="w-4 h-4 text-purple-500" />;
    }
    if (type.includes('note') || type.includes('comment')) {
      return <FaComment className="w-4 h-4 text-gray-500" />;
    }
    if (type.includes('document') || type.includes('file')) {
      return <FaFileAlt className="w-4 h-4 text-orange-500" />;
    }
    if (type.includes('follow') || type.includes('follow-up')) {
      return <FaHandshake className="w-4 h-4 text-teal-500" />;
    }
    if (type.includes('quote') || type.includes('proposal')) {
      return <FaChartLine className="w-4 h-4 text-indigo-500" />;
    }
    if (type.includes('issue') || type.includes('problem')) {
      return <FaExclamationCircle className="w-4 h-4 text-red-500" />;
    }
    
    // Default icon
    return <FaListAlt className="w-4 h-4 text-gray-400" />;
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


              {/* Activities List */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FaListAlt className="w-4 h-4 text-purple-500" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Activities ({getActivitiesForMailbox(selectedMailbox.mailboxguid).length})
                      </h3>
                    </div>
                    <ActivityCreation
                      parentId={selectedMailbox.mailboxguid}
                      parentType="MAILBOX"
                      parentName={`Mailbox ${selectedMailbox.mailboxnumber}`}
                      storeNumber={selectedStore || 1}
                      onActivityCreated={async () => {
                        const activitiesData = await getActivities();
                        setActivities(Array.isArray(activitiesData) ? activitiesData : []);
                      }}
                    />
                  </div>
                  
                  {(() => {
                    const mailboxActivities = getActivitiesForMailbox(selectedMailbox.mailboxguid);
                    return (
                      <div>
                        {mailboxActivities.length === 0 ? (
                          <div className="text-center py-8">
                            <FaListAlt className="text-4xl text-gray-400 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">No Activities</h4>
                            <p className="text-gray-600">No activities have been recorded for this mailbox yet.</p>
                          </div>
                        ) : (
                          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                            <div className="divide-y divide-gray-200">
                              {mailboxActivities.map((activity) => (
                                <div key={activity.activityid} className="p-4 transition-all hover:bg-gray-50">
                                  {/* Activity Header */}
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      {getActivityIcon(activity.activitytypecode)}
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

                                  {/* Activity Details */}
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


    </div>
  );
} 