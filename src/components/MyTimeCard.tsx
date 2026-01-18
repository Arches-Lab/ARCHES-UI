import React, { useState, useEffect } from 'react';
import { FaClock, FaSignInAlt, FaSignOutAlt, FaHistory, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';
import { useStore } from '../auth/StoreContext';
import { TimeCard, TimeCardStatus } from '../models/TimeCard';
import { clockIn, clockMeIn, clockMeOut, clockOut, endMyBreak, getCurrentTimeCard, getMyTimeCardStatus, getTimeCardStatus, startMyBreak } from '../api/timeCard';

interface MyTimeCardProps {
  className?: string;
}

export default function MyTimeCard({ className = '' }: MyTimeCardProps) {
  const { user, employeeId } = useAuth();
  const { selectedStore } = useStore();
  const [timeCardStatus, setTimeCardStatus] = useState<TimeCardStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState('REGULAR');
  const [notes, setNotes] = useState('');

  // Load current timecard on component mount
  useEffect(() => {
    if (user && employeeId && selectedStore) {
      loadTimeCardStatus();
    }
  }, [user, employeeId, selectedStore]);

  const loadTimeCardStatus = async () => {
    if (!user || !employeeId || !selectedStore) return;
    
    try {
      setLoading(true);
      setError(null);
      const status = await getMyTimeCardStatus();
      console.log('Timecard status:', status);
      setTimeCardStatus(status);
    } catch (err: any) {
      console.error('Error loading timecard status:', err);
      setError('Failed to load timecard status');
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    if (!user || !employeeId || !selectedStore) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await clockMeIn();
      console.log('Response from clockMeIn:', response);
      await loadTimeCardStatus();
      
      const actionText = timeCardStatus?.status === 'on_break' ? 'Returned from break' : 'Clocked in';
      alert(`${actionText} successfully at ${formatTime(response.timecard.clockin)}`);
    } catch (err: any) {
      console.error('Error clocking in:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to clock in';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!timeCardStatus?.isClockedIn) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await clockMeOut();
      await loadTimeCardStatus();
      alert(`Clocked out successfully at ${formatTime(response.timecard.clockout)}`);
    } catch (err: any) {
      console.error('Error clocking out:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to clock out';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartBreak = async () => {
    if (!timeCardStatus?.isClockedIn) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await startMyBreak();
      console.log('Response from startMyBreak:', response);
      await loadTimeCardStatus();
    } catch (err: any) {
      console.error('Error starting break:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to start break';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEndBreak = async () => {
    if (timeCardStatus?.sessionType !== 'BREAK') return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await endMyBreak();
      console.log('Response from endMyBreak:', response);
      await loadTimeCardStatus();
      alert('Break ended successfully');
    } catch (err: any) {
      console.error('Error ending break:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to end break';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDuration = (hours: number, minutes: number) => {
    const totalHours = Math.floor(hours + minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${totalHours}h ${remainingMinutes}m`;
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (!user || !employeeId || !selectedStore) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <FaClock className="mx-auto text-4xl mb-2" />
          <p>Please log in and select a store to use time tracking</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FaClock className="text-blue-600" />
          Time Tracking
        </h2>
        <div className="text-sm text-gray-500">
          Current Time: {getCurrentTime()}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {timeCardStatus?.isClockedIn ? (
        // Clocked In State
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-green-800">
                  {timeCardStatus?.sessionType === 'BREAK' ? 'Currently On Break' : 'Currently Clocked In'}
                </h3>
                {/* {timeCardStatus.currentDuration && (
                  <p className="text-sm text-green-600">
                    Duration: {timeCardStatus.currentDuration.hours} hours {timeCardStatus.currentDuration.minutes} minutes
                  </p>
                )}
                {timeCardStatus.sessionType && (
                  <p className="text-sm text-green-600">
                    Session: {timeCardStatus.sessionType}
                  </p>
                )} */}
              </div>
              <div className="text-right">
                {timeCardStatus.currentDuration && (
                  <>
                    <div className="text-2xl font-bold text-green-800">
                      {timeCardStatus.currentDuration.hours}h {timeCardStatus.currentDuration.minutes}m
                    </div>
                    <div className="text-xs text-green-600">Total Time</div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {timeCardStatus?.sessionType === 'BREAK' ? (
              // Break State - Show End Break button
              <button
                onClick={handleEndBreak}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaClock />
                )}
                End Break
              </button>
            ) : (
              // Regular Clocked In State - Show Clock Out and Start Break buttons
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleClockOut}
                  disabled={loading}
                  className="bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaSignOutAlt />
                  )}
                  Clock Out
                </button>

                <button
                  onClick={handleStartBreak}
                  disabled={loading}
                  className="bg-yellow-600 text-white py-3 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaClock />
                  )}
                  Start Break
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Clocked Out State
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {timeCardStatus?.sessionType === 'BREAK' ? 'On Break' : 'Ready to Clock In'}
              </h3>
              <p className="text-sm text-gray-600">
                {timeCardStatus?.sessionType === 'BREAK' 
                  ? 'You are currently on break' 
                  : 'You are currently clocked out'
                }
              </p>
              {timeCardStatus?.lastClockIn && (
                <p className="text-sm text-gray-500 mt-1">
                  Last clock in: {formatTime(timeCardStatus.lastClockIn)}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleClockIn}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaSignInAlt />
            )}
            {timeCardStatus?.sessionType === 'BREAK' ? 'Return from Break' : 'Clock In'}
          </button>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={loadTimeCardStatus}
          disabled={loading}
          className="w-full text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2"
        >
          <FaHistory />
          Refresh Status
        </button>
      </div>
    </div>
  );
}