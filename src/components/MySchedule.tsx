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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaCalendar />
          My Upcoming Schedule
        </h1>
      </div>

      {/* Schedules List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {schedules.length === 0 ? (
          <div className="p-8 text-center">
            <FaCalendar className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No upcoming schedules found</p>
            <p className="text-sm text-gray-500 mt-2">Your schedule will appear here once assigned</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {schedules.map((schedule) => (
              <div key={schedule.scheduleid} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        isToday(schedule.scheduledate) 
                          ? 'bg-green-500' 
                          : isTomorrow(schedule.scheduledate)
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-gray-900">
                          {getDateLabel(schedule.scheduledate)}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <FaClock className="text-gray-400" />
                          <span>
                            {formatTime(schedule.starttime)} - {formatTime(schedule.endtime)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {calculateHours(schedule.starttime, schedule.endtime, schedule.lunchminutes || 0)}h
                          {(schedule.lunchminutes || 0) > 0 && (
                            <span className="text-gray-400 ml-1">
                              (includes {schedule.lunchminutes || 0}min lunch)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {schedules.length > 0 && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{schedules.length}</span> upcoming shifts
            </div>
            <div className="text-sm text-gray-600">
              Total hours: <span className="font-medium">
                {schedules.reduce((total, schedule) => 
                  total + calculateHours(schedule.starttime, schedule.endtime, schedule.lunchminutes), 0
                ).toFixed(1)}h
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 