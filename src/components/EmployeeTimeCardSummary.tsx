import React, { useState, useEffect } from 'react';
import { FaClock, FaSpinner, FaCalendarAlt, FaChartLine, FaFilter, FaEdit } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';
import { TimeCardSummary, TimeCard } from '../models/TimeCard';
import { getEmployeeTimeCardSummary, getTimeCardsForDate, updateTimeCard } from '../api/timeCard';
import { logDebug, logError } from '../utils/logger';

interface EmployeeTimeCardSummaryProps {
  className?: string;
  startDate?: string;
  endDate?: string;
  targetEmployeeId?: string;
  name?: string;
}

export default function EmployeeTimeCardSummary({ className = '', startDate, endDate, targetEmployeeId, name }: EmployeeTimeCardSummaryProps) {
  const { user, employeeId } = useAuth();
  
  // Use provided targetEmployeeId or fallback to logged-in user's employeeId
  const finalEmployeeId = targetEmployeeId || employeeId;
  const displayName = name || 'My';
  const [summaryData, setSummaryData] = useState<TimeCardSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateTimeCards, setSelectedDateTimeCards] = useState<TimeCard[]>([]);
  const [showTimeCardModal, setShowTimeCardModal] = useState(false);
  const [loadingTimeCards, setLoadingTimeCards] = useState(false);
  const [editingTimeCard, setEditingTimeCard] = useState<TimeCard | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    clockin: '',
    clockout: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  // Helper function to get date ranges
  const getDateRange = (period: 'thisMonth' | 'lastMonth' | 'priorMonth') => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    switch (period) {
      case 'thisMonth':
        return {
          start: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0],
          end: new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
        };
      case 'lastMonth':
        return {
          start: new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0],
          end: new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]
        };
      case 'priorMonth':
        return {
          start: new Date(currentYear, currentMonth - 2, 1).toISOString().split('T')[0],
          end: new Date(currentYear, currentMonth - 1, 0).toISOString().split('T')[0]
        };
      default:
        return { start: undefined, end: undefined };
    }
  };

  const defaultThisMonth = getDateRange('thisMonth');
  const [filterStartDate, setFilterStartDate] = useState<string | undefined>(startDate || defaultThisMonth.start);
  const [filterEndDate, setFilterEndDate] = useState<string | undefined>(endDate || defaultThisMonth.end);

  // Load summary data on component mount and when dates change
  useEffect(() => {
    if (user) {
      loadSummaryData();
    }
  }, [user, filterStartDate, filterEndDate, finalEmployeeId]);

  // Update filter dates when props change
  useEffect(() => {
    setFilterStartDate(startDate || defaultThisMonth.start);
    setFilterEndDate(endDate || defaultThisMonth.end);
  }, [startDate, endDate, defaultThisMonth.start, defaultThisMonth.end]);

  const loadSummaryData = async () => {
    if (!user || !finalEmployeeId) return;
    
    try {
      setLoading(true);
      setError(null);
      logDebug('Loading timecard summary with dates:', { filterStartDate, filterEndDate, finalEmployeeId });
      
      // Always use getEmployeeTimeCardSummary with finalEmployeeId
      const data = await getEmployeeTimeCardSummary(finalEmployeeId, filterStartDate, filterEndDate);
        
      logDebug('Received data:', data);
      setSummaryData(data);
    } catch (err: any) {
      logError('Error loading timecard summary:', err);
      setError('Failed to load timecard summary');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    // Display the date as-is without timezone conversion
    // Assuming dateString is in YYYY-MM-DD format
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatHours = (hours: number) => {
    return hours.toFixed(2);
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateTotals = () => {
    if (summaryData.length === 0) return { workHours: 0, breakHours: 0, netHours: 0 };
    
    return summaryData.reduce((totals, record) => ({
      workHours: totals.workHours + record.workhours,
      breakHours: totals.breakHours + record.breakhours,
      netHours: totals.netHours + record.nethours
    }), { workHours: 0, breakHours: 0, netHours: 0 });
  };

  const handleFilterChange = (period: 'thisMonth' | 'lastMonth' | 'priorMonth') => {
    const { start, end } = getDateRange(period);
    setFilterStartDate(start);
    setFilterEndDate(end);
  };


  const handleDateClick = async (timecardDate: string) => {
    if (!finalEmployeeId) return;
    
    try {
      setLoadingTimeCards(true);
      setSelectedDate(timecardDate);
      const timeCards = await getTimeCardsForDate(finalEmployeeId, timecardDate);
      setSelectedDateTimeCards(timeCards);
      setShowTimeCardModal(true);
    } catch (err: any) {
      logError('Error loading timecards for date:', err);
      setError('Failed to load timecard details');
    } finally {
      setLoadingTimeCards(false);
    }
  };

  const closeTimeCardModal = () => {
    setShowTimeCardModal(false);
    setSelectedDate(null);
    setSelectedDateTimeCards([]);
  };

  const handleEditTimeCard = (timeCard: TimeCard) => {
    setEditingTimeCard(timeCard);
    setEditFormData({
      clockin: timeCard.clockin,
      clockout: timeCard.clockout || '',
      notes: timeCard.notes || ''
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingTimeCard(null);
    setEditFormData({
      clockin: '',
      clockout: '',
      notes: ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTimeCard) return;

    try {
      setSaving(true);
      setError(null);
      
      await updateTimeCard(editingTimeCard.timecardid, {
        clockin: editFormData.clockin,
        clockout: editFormData.clockout,
        notes: editFormData.notes
      });

      // Refresh the timecard data
      if (selectedDate && finalEmployeeId) {
        const updatedTimeCards = await getTimeCardsForDate(finalEmployeeId, selectedDate);
        setSelectedDateTimeCards(updatedTimeCards);
      }

      // Refresh the summary data
      await loadSummaryData();

      closeEditModal();
      alert('Timecard updated successfully');
    } catch (err: any) {
      logError('Error updating timecard:', err);
      setError('Failed to update timecard');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <FaClock className="mx-auto text-4xl mb-2" />
          <p>Please log in to view your timecard summary</p>
        </div>
      </div>
    );
  }


  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <FaSpinner className="animate-spin text-2xl text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Loading summary...</p>
        </div>
      ) : summaryData.length === 0 ? (
        <div className="text-center py-8">
          <FaCalendarAlt className="text-4xl text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No timecard records found</p>
        </div>
      ) : (
        <>
          {/* Time Records Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Break
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summaryData.map((record, index) => (
                  <tr key={`${record.timecarddate}-${index}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {formatDate(record.timecarddate)}
                        <button
                          onClick={() => handleDateClick(record.timecarddate)}
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                          disabled={loadingTimeCards}
                        >
                          <FaEdit className="text-xs" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600 font-medium">
                      {formatHours(record.workhours)}h
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-yellow-600 font-medium">
                      {formatHours(record.breakhours)}h
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">
                      {formatHours(record.nethours)}h
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr className="border-t-2 border-gray-300">
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">
                    TOTALS
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-600">
                    {formatHours(calculateTotals().workHours)}h
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-yellow-600">
                    {formatHours(calculateTotals().breakHours)}h
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-green-600">
                    {formatHours(calculateTotals().netHours)}h
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {/* TimeCard Details Modal */}
      {showTimeCardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Timecard Details - {selectedDate && formatDate(selectedDate)}
              </h3>
              <button
                onClick={closeTimeCardModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaClock className="text-xl" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingTimeCards ? (
                <div className="text-center py-8">
                  <FaSpinner className="animate-spin text-2xl text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Loading timecard details...</p>
                </div>
              ) : selectedDateTimeCards.length === 0 ? (
                <div className="text-center py-8">
                  <FaCalendarAlt className="text-4xl text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No timecard records found for this date</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Clock In
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Clock Out
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Session Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedDateTimeCards.map((timeCard, index) => (
                        <tr key={timeCard.timecardid} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {formatTime(timeCard.clockin)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {formatTime(timeCard.clockout)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              timeCard.sessiontype === 'REGULAR' 
                                ? 'bg-blue-100 text-blue-800'
                                : timeCard.sessiontype === 'BREAK'
                                ? 'bg-yellow-100 text-yellow-800'
                                : timeCard.sessiontype === 'OVERTIME'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {timeCard.sessiontype}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {timeCard.durationhours}h 
                            {/* {timeCard.durationminutes}m */}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                            <div className="truncate" title={timeCard.notes || ''}>
                              {timeCard.notes || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <button 
                              onClick={() => handleEditTimeCard(timeCard)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit TimeCard Modal */}
      {showEditModal && editingTimeCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Timecard
              </h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaClock className="text-xl" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clock In Time
                  </label>
                  <input
                    type="time"
                    value={editFormData.clockin}
                    onChange={(e) => setEditFormData({...editFormData, clockin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clock Out Time
                  </label>
                  <input
                    type="time"
                    value={editFormData.clockout}
                    onChange={(e) => setEditFormData({...editFormData, clockout: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                    placeholder="Add notes..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeEditModal}
                  disabled={saving}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}