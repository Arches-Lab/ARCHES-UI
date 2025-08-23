import React, { useState, useEffect } from 'react';
import { FaCalendar, FaClock, FaUser, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { Schedule } from '../models/Schedule';
import { getSchedules } from '../api/schedule';
import { useStore } from '../auth/StoreContext';
import { useAuth } from '../auth/AuthContext';

interface MyScheduleProps {
  currentEmployeeId?: string;
}

export default function MySchedule({ currentEmployeeId }: MyScheduleProps) {
  const { selectedStore } = useStore();
  const { employeeId: authEmployeeId } = useAuth();
  
  // Use provided currentEmployeeId or fall back to authenticated user's employee ID
  const effectiveEmployeeId = currentEmployeeId || authEmployeeId;
  
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('effectiveEmployeeId', effectiveEmployeeId);
    if (selectedStore && effectiveEmployeeId) {
      loadMySchedules();
    }
  }, [selectedStore, effectiveEmployeeId]);

  const loadMySchedules = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get schedules from today forward
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // Get next 30 days
      endDate.setHours(23, 59, 59, 999);

      // Format dates as YYYY-MM-DD to avoid timezone issues
      const formatDateForAPI = (date: Date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const startDateStr = formatDateForAPI(today);
      const endDateStr = formatDateForAPI(endDate);

      if (!effectiveEmployeeId) {
        setSchedules([]);
        return;
      }

      const schedulesData = await getSchedules(startDateStr, endDateStr, effectiveEmployeeId);
      
    //   // Filter schedules for current employee
    //   const mySchedules = schedulesData.filter((schedule: Schedule) => 
    //     schedule.employeeid === currentEmployeeId
    //   );

      // Sort by date and time
      schedulesData.sort((a: Schedule, b: Schedule) => {
        const dateA = new Date(`${a.scheduledate}T${a.starttime}`);
        const dateB = new Date(`${b.scheduledate}T${b.starttime}`);
        return dateA.getTime() - dateB.getTime();
      });

      setSchedules(schedulesData);
    } catch (err) {
      console.error('Error loading my schedules:', err);
      setError('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    // Parse date string directly without timezone conversion
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  const calculateHours = (startTime: string, endTime: string, lunchMinutes: number = 0) => {
    const startHour = parseInt(startTime.split(':')[0]);
    const startMinute = parseInt(startTime.split(':')[1]);
    const endHour = parseInt(endTime.split(':')[0]);
    const endMinute = parseInt(endTime.split(':')[1]);
    
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;
    const durationInMinutes = endTimeInMinutes - startTimeInMinutes;
    const actualWorkMinutes = durationInMinutes - lunchMinutes;
    
    return Math.round((actualWorkMinutes / 60) * 100) / 100;
  };

  const isToday = (dateStr: string) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const scheduleDate = dateStr.split('T')[0]; // Get just the date part
    return todayStr === scheduleDate;
  };

  const isTomorrow = (dateStr: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    const scheduleDate = dateStr.split('T')[0]; // Get just the date part
    return tomorrowStr === scheduleDate;
  };

  const getDateLabel = (dateStr: string) => {
    if (isToday(dateStr)) return 'Today';
    if (isTomorrow(dateStr)) return 'Tomorrow';
    return formatDate(dateStr);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!effectiveEmployeeId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaUser className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please log in to view your schedule</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">My Schedule</h3>
          <span className="text-sm text-gray-500">
            {schedules.length} shift{schedules.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Schedules List */}
      {schedules.length === 0 ? (
        <div className="p-6 text-center">
          <FaCalendar className="text-2xl text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No upcoming schedules</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {schedules.map((schedule) => (
            <div key={schedule.scheduleid} className="px-4 py-3 hover:bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isToday(schedule.scheduledate) 
                        ? 'bg-green-500' 
                        : isTomorrow(schedule.scheduledate)
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                    }`} />
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {getDateLabel(schedule.scheduledate)}
                    </p>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-600 truncate">
                    {formatTime(schedule.starttime)} - {formatTime(schedule.endtime)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 