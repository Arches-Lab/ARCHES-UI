import { useState, useEffect } from 'react';
import { FaCalendar, FaClock, FaPlus, FaSpinner, FaExclamationTriangle, FaChevronLeft, FaChevronRight, FaEye, FaEdit, FaTrash, FaUpload } from 'react-icons/fa';
import { getEmployees } from '../api/employee';
import { getSchedules, updateSchedule, deleteSchedule } from '../api/schedule';
import { createScheduleDraft, updateScheduleDraft, getScheduleDrafts, publishScheduleDrafts, deleteScheduleDraft } from '../api/scheduleDraft';
import { Schedule } from '../models/Schedule';
import { CreateScheduleDraftRequest, ScheduleDraft } from '../models/ScheduleDraft';
import { Employee } from '../models/Employee';
import { useStore } from '../auth/StoreContext';
import ScheduleModal from '../components/ScheduleModal';
import ScheduleDayView from '../components/ScheduleDayView';
import ScheduleWeekView from '../components/ScheduleWeekView';

type ViewMode = 'day' | 'week';

export default function SchedulePage() {
  const { selectedStore } = useStore();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [scheduleDrafts, setScheduleDrafts] = useState<ScheduleDraft[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [selectedScheduleDraft, setSelectedScheduleDraft] = useState<ScheduleDraft | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Time slots from 7 AM to 8 PM
  const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7);

  useEffect(() => {
    if (selectedStore) {
      loadData();
    }
  }, [selectedStore, currentDate, viewMode]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range based on view mode
      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);
      
      if (viewMode === 'week') {
        // Start from Monday of the current week
        const dayOfWeek = startDate.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate.setDate(startDate.getDate() - daysToMonday);
        
        // End on Sunday
        endDate.setDate(startDate.getDate() + 6);
      }

      // Set time to start and end of day
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);



      // Load real data from API
      try {
        const [schedulesData, employeesData, draftsData] = await Promise.all([
          getSchedules(startDate.toISOString(), endDate.toISOString()),
          getEmployees(true),
          getScheduleDrafts(startDate.toISOString(), endDate.toISOString())
        ]);
        console.log('schedulesData', schedulesData);
        console.log('draftsData', draftsData);
        setSchedules(schedulesData || []);
        setEmployees(employeesData || []);
        setScheduleDrafts(draftsData || []);
      } catch (apiError) {
        console.error('API call failed:', apiError);
        setSchedules([]);
        setEmployees([]);
        setScheduleDrafts([]);
      }
    } catch (err) {
      console.error('Error loading schedule data:', err);
      setError('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  const handleCellClick = (date: Date, hour: number, employeeId?: string) => {
    const clickedDateTime = new Date(date);
    clickedDateTime.setHours(hour, 0, 0, 0);
    setSelectedDateTime(clickedDateTime);
    setSelectedEmployeeId(employeeId || null);
    setSelectedSchedule(null);
    setShowModal(true);
  };

  const handleWeekCellClick = (date: Date, hour: number, employeeId?: string) => {
    const clickedDateTime = new Date(date);
    clickedDateTime.setHours(hour, 0, 0, 0);
    setSelectedDateTime(clickedDateTime);
    setSelectedEmployeeId(employeeId || null);
    setSelectedSchedule(null);
    setShowModal(true);
  };

  const handleScheduleClick = (schedule: Schedule, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSchedule(schedule);
    setSelectedScheduleDraft(null);
    setShowModal(true);
  };

  const handleScheduleDraftClick = (draft: ScheduleDraft, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedScheduleDraft(draft);
    setSelectedSchedule(null);
    setShowModal(true);
  };

  const handleScheduleDrop = async (itemId: string, newEmployeeId: string, newStartTimeMinutes: number) => {
    try {
      // Check if it's a schedule or draft
      const scheduleToUpdate = schedules.find(s => s.scheduleid === itemId);
      const draftToUpdate = scheduleDrafts.find(d => d.scheduledraftid === itemId);
      
      if (!scheduleToUpdate && !draftToUpdate) {
        console.error('Schedule or draft not found:', itemId);
        return;
      }

      // Find the new employee
      const newEmployee = employees.find(emp => emp.employeeid === newEmployeeId);
      if (!newEmployee) {
        console.error('Employee not found:', newEmployeeId);
        return;
      }

      // Check if the drop position is the same as the original position
      const itemToCheck = scheduleToUpdate || draftToUpdate;
      if (itemToCheck) {
        const originalStartHour = parseInt(itemToCheck.starttime.split(':')[0]);
        const originalStartMinute = parseInt(itemToCheck.starttime.split(':')[1]);
        const originalStartMinutes = originalStartHour * 60 + originalStartMinute;
        
        // If same employee and same start time, no need to update
        if (itemToCheck.employeeid === newEmployeeId && originalStartMinutes === newStartTimeMinutes) {
          console.log('Drop position is the same as original position, skipping update');
          return;
        }
      }

      // Check if the schedule would go beyond 11:59 PM
      const itemToValidate = scheduleToUpdate || draftToUpdate;
      if (itemToValidate) {
        const originalStartHour = parseInt(itemToValidate.starttime.split(':')[0]);
        const originalStartMinute = parseInt(itemToValidate.starttime.split(':')[1]);
        const originalEndHour = parseInt(itemToValidate.endtime.split(':')[0]);
        const originalEndMinute = parseInt(itemToValidate.endtime.split(':')[1]);
        
        // Calculate duration in minutes
        const originalStartMinutes = originalStartHour * 60 + originalStartMinute;
        const originalEndMinutes = originalEndHour * 60 + originalEndMinute;
        const durationMinutes = originalEndMinutes - originalStartMinutes;
        
        // Calculate new end time
        const newEndMinutes = newStartTimeMinutes + durationMinutes;
        const newEndHour = Math.floor(newEndMinutes / 60);
        const newEndMinute = newEndMinutes % 60;
        
        // Check if the new end time would be beyond 11:59 PM (23:59)
        if (newEndHour > 23 || (newEndHour === 23 && newEndMinute > 59)) {
          alert('Schedule cannot extend beyond 11:59 PM. Please choose an earlier start time.');
          return;
        }
      }

      if (scheduleToUpdate) {
        // Handle schedule update
        const originalStartHour = parseInt(scheduleToUpdate.starttime.split(':')[0]);
        const originalStartMinute = parseInt(scheduleToUpdate.starttime.split(':')[1]);
        const originalEndHour = parseInt(scheduleToUpdate.endtime.split(':')[0]);
        const originalEndMinute = parseInt(scheduleToUpdate.endtime.split(':')[1]);
        
        // Calculate duration in minutes
        const originalStartMinutes = originalStartHour * 60 + originalStartMinute;
        const originalEndMinutes = originalEndHour * 60 + originalEndMinute;
        const durationMinutes = originalEndMinutes - originalStartMinutes;
        
        // Calculate new end time using the precise drop time
        const newEndMinutes = newStartTimeMinutes + durationMinutes;
        const newStartHour = Math.floor(newStartTimeMinutes / 60);
        const newStartMinute = newStartTimeMinutes % 60;
        const newEndHour = Math.floor(newEndMinutes / 60);
        const newEndMinute = newEndMinutes % 60;
        
        // Format new times
        const newStartTime = `${newStartHour.toString().padStart(2, '0')}:${newStartMinute.toString().padStart(2, '0')}`;
        const newEndTime = `${newEndHour.toString().padStart(2, '0')}:${newEndMinute.toString().padStart(2, '0')}`;

        // // Update the schedule
        // await updateSchedule(itemId, {
        //   employeeid: newEmployeeId,
        //   starttime: newStartTime,
        //   endtime: newEndTime,
        //   scheduledate: scheduleToUpdate.scheduledate
        // });
        const draftData: CreateScheduleDraftRequest = {
          storenumber: scheduleToUpdate.storenumber,
          employeeid: newEmployeeId,
          scheduledate: scheduleToUpdate.scheduledate,
          starttime: newStartTime,
          endtime: newEndTime,
          lunchminutes: scheduleToUpdate.lunchminutes,
          referencescheduleid: scheduleToUpdate.scheduleid,
          action: 'update'
        };
        await createScheduleDraft(draftData);
        
        // Update local state optimistically
        const newDraft: ScheduleDraft = {
          scheduledraftid: `temp-${Date.now()}`, // Temporary ID until we get the real one
          storenumber: scheduleToUpdate.storenumber,
          employeeid: newEmployeeId,
          scheduledate: scheduleToUpdate.scheduledate,
          starttime: newStartTime,
          endtime: newEndTime,
          lunchminutes: scheduleToUpdate.lunchminutes,
          action: 'update',
          referencescheduleid: scheduleToUpdate.scheduleid,
          createdon: new Date().toISOString(),
          createdby: 'current-user' // You might want to get this from auth context
        };
        
        // Add the new draft and remove the original schedule
        setScheduleDrafts(prev => [...prev, newDraft]);
        setSchedules(prev => prev.filter(schedule => schedule.scheduleid !== scheduleToUpdate.scheduleid));

      } else if (draftToUpdate) {
        // Handle draft update - create a new draft with updated data
        const originalStartHour = parseInt(draftToUpdate.starttime.split(':')[0]);
        const originalStartMinute = parseInt(draftToUpdate.starttime.split(':')[1]);
        const originalEndHour = parseInt(draftToUpdate.endtime.split(':')[0]);
        const originalEndMinute = parseInt(draftToUpdate.endtime.split(':')[1]);
        
        // Calculate duration in minutes
        const originalStartMinutes = originalStartHour * 60 + originalStartMinute;
        const originalEndMinutes = originalEndHour * 60 + originalEndMinute;
        const durationMinutes = originalEndMinutes - originalStartMinutes;
        
        // Calculate new end time using the precise drop time
        const newEndMinutes = newStartTimeMinutes + durationMinutes;
        const newStartHour = Math.floor(newStartTimeMinutes / 60);
        const newStartMinute = newStartTimeMinutes % 60;
        const newEndHour = Math.floor(newEndMinutes / 60);
        const newEndMinute = newEndMinutes % 60;
        
        // Format new times
        const newStartTime = `${newStartHour.toString().padStart(2, '0')}:${newStartMinute.toString().padStart(2, '0')}`;
        const newEndTime = `${newEndHour.toString().padStart(2, '0')}:${newEndMinute.toString().padStart(2, '0')}`;

        // Create updated draft
        const updatedDraftData: CreateScheduleDraftRequest = {
          storenumber: draftToUpdate.storenumber,
          employeeid: newEmployeeId,
          scheduledate: draftToUpdate.scheduledate,
          starttime: newStartTime,
          endtime: newEndTime,
          lunchminutes: draftToUpdate.lunchminutes,
          action: 'update',
          referencescheduleid: undefined // New drafts don't have a reference schedule ID
        };

        await updateScheduleDraft(draftToUpdate.scheduledraftid, updatedDraftData);
        
        // Update local state optimistically
        setScheduleDrafts(prev => prev.map(draft => 
          draft.scheduledraftid === draftToUpdate.scheduledraftid 
            ? {
                ...draft,
                employeeid: newEmployeeId,
                starttime: newStartTime,
                endtime: newEndTime
              }
            : draft
        ));
      }

      // No need to reload data - we've updated the local state optimistically
    } catch (err: any) {
      console.error('Error updating schedule/draft:', err);
      
      // Revert optimistic updates by reloading data
      loadData();
      
      // Handle API error response
      if (err.response && err.response.data && err.response.data.error) {
        alert(`Failed to move schedule/draft: ${err.response.data.error}`);
      } else if (err.message) {
        alert(`Failed to move schedule/draft: ${err.message}`);
      } else {
        alert('Failed to move schedule/draft. Please try again.');
      }
    }
  };

  const handleWeekScheduleDrop = async (itemId: string, newEmployeeId: string, newDate: Date) => {
    try {
      // Check if it's a schedule or draft
      const scheduleToUpdate = schedules.find(s => s.scheduleid === itemId);
      const draftToUpdate = scheduleDrafts.find(d => d.scheduledraftid === itemId);
      
      if (!scheduleToUpdate && !draftToUpdate) {
        console.error('Schedule or draft not found:', itemId);
        return;
      }

      // Format the new date - avoid timezone conversion
      const year = newDate.getFullYear();
      const month = (newDate.getMonth() + 1).toString().padStart(2, '0');
      const day = newDate.getDate().toString().padStart(2, '0');
      const newDateStr = `${year}-${month}-${day}`;

      // Find the new employee
      const newEmployee = employees.find(emp => emp.employeeid === newEmployeeId);
      if (!newEmployee) {
        console.error('Employee not found:', newEmployeeId);
        return;
      }

      // Check if the drop position is the same as the original position
      const itemToCheck = scheduleToUpdate || draftToUpdate;
      if (itemToCheck) {
        // Parse the original date
        const originalDateParts = itemToCheck.scheduledate.split('T')[0].split('-');
        const originalYear = parseInt(originalDateParts[0]);
        const originalMonth = parseInt(originalDateParts[1]) - 1;
        const originalDay = parseInt(originalDateParts[2]);
        const originalDate = new Date(originalYear, originalMonth, originalDay);
        
        // If same employee and same date, no need to update
        if (itemToCheck.employeeid === newEmployeeId && 
            originalDate.getTime() === newDate.getTime()) {
          console.log('Week drop position is the same as original position, skipping update');
          return;
        }
      }

      if (scheduleToUpdate) {
        // Create a draft for the schedule update
        const draftData: CreateScheduleDraftRequest = {
          storenumber: scheduleToUpdate.storenumber,
          employeeid: newEmployeeId,
          scheduledate: newDateStr,
          starttime: scheduleToUpdate.starttime,
          endtime: scheduleToUpdate.endtime,
          lunchminutes: scheduleToUpdate.lunchminutes || 0,
          referencescheduleid: scheduleToUpdate.scheduleid,
          action: 'update'
        };
        await createScheduleDraft(draftData);
        
        // Update local state optimistically
        const newDraft: ScheduleDraft = {
          scheduledraftid: `temp-${Date.now()}`, // Temporary ID until we get the real one
          storenumber: scheduleToUpdate.storenumber,
          employeeid: newEmployeeId,
          scheduledate: newDateStr,
          starttime: scheduleToUpdate.starttime,
          endtime: scheduleToUpdate.endtime,
          lunchminutes: scheduleToUpdate.lunchminutes || 0,
          action: 'update',
          referencescheduleid: scheduleToUpdate.scheduleid,
          createdon: new Date().toISOString(),
          createdby: 'current-user' // You might want to get this from auth context
        };
        
        // Add the new draft and remove the original schedule
        setScheduleDrafts(prev => [...prev, newDraft]);
        setSchedules(prev => prev.filter(schedule => schedule.scheduleid !== scheduleToUpdate.scheduleid));
        
      } else if (draftToUpdate) {
        // Create updated draft
        const updatedDraftData: CreateScheduleDraftRequest = {
          storenumber: draftToUpdate.storenumber,
          employeeid: newEmployeeId,
          scheduledate: newDateStr,
          starttime: draftToUpdate.starttime,
          endtime: draftToUpdate.endtime,
          lunchminutes: draftToUpdate.lunchminutes,
          action: 'update',
          referencescheduleid: undefined // New drafts don't have a reference schedule ID
        };

        await updateScheduleDraft(draftToUpdate.scheduledraftid, updatedDraftData);
        
        // Update local state optimistically
        setScheduleDrafts(prev => prev.map(draft => 
          draft.scheduledraftid === draftToUpdate.scheduledraftid 
            ? {
                ...draft,
                employeeid: newEmployeeId,
                scheduledate: newDateStr
              }
            : draft
        ));
      }

      // No need to reload data - we've updated the local state optimistically
    } catch (err: any) {
      console.error('Error updating schedule/draft:', err);
      
      // Revert optimistic updates by reloading data
      loadData();
      
      // Handle API error response
      if (err.response && err.response.data && err.response.data.error) {
        alert(`Failed to move schedule/draft: ${err.response.data.error}`);
      } else if (err.message) {
        alert(`Failed to move schedule/draft: ${err.message}`);
      } else {
        alert('Failed to move schedule/draft. Please try again.');
      }
    }
  };

  const handleSaveSchedule = async (draftData: CreateScheduleDraftRequest) => {
    try {
      // Check if we're editing an existing draft
      if (selectedScheduleDraft) {
        // Update existing draft
        await updateScheduleDraft(selectedScheduleDraft.scheduledraftid, draftData);
      } else {
        // Create new schedule draft
        await createScheduleDraft(draftData);
      }
      
      setShowModal(false);
      setSelectedSchedule(null);
      setSelectedScheduleDraft(null);
      setSelectedDateTime(null);
      setSelectedEmployeeId(null);
      loadData();
    } catch (err: any) {
      console.error('Error saving schedule:', err);
      
      // Handle API error response
      if (err.response && err.response.data && err.response.data.error) {
        // Display the specific error message from the API
        alert(`Failed to save schedule: ${err.response.data.error}`);
      } else if (err.message) {
        // Display generic error message
        alert(`Failed to save schedule: ${err.message}`);
      } else {
        // Fallback error message
        alert('Failed to save schedule. Please try again.');
      }
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      // Create a draft with delete action
      if (selectedSchedule) {
        const deleteDraftData: CreateScheduleDraftRequest = {
          storenumber: selectedSchedule.storenumber,
          employeeid: selectedSchedule.employeeid,
          scheduledate: selectedSchedule.scheduledate,
          starttime: selectedSchedule.starttime,
          endtime: selectedSchedule.endtime,
          lunchminutes: selectedSchedule.lunchminutes || 0,
          action: 'delete',
          referencescheduleid: selectedSchedule.scheduleid
        };
        
        await createScheduleDraft(deleteDraftData);
      }
      
      setShowModal(false);
      setSelectedSchedule(null);
      setSelectedScheduleDraft(null);
      setSelectedEmployeeId(null);
      loadData();
    } catch (err: any) {
      console.error('Error deleting schedule:', err);
      
      // Handle API error response
      if (err.response && err.response.data && err.response.data.error) {
        alert(`Failed to delete schedule: ${err.response.data.error}`);
      } else if (err.message) {
        alert(`Failed to delete schedule: ${err.message}`);
      } else {
        alert('Failed to delete schedule. Please try again.');
      }
    }
  };

  const handleDeleteScheduleDraft = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this schedule draft?')) {
      return;
    }

    try {
      // Delete the draft directly
      await deleteScheduleDraft(draftId);
      
      setShowModal(false);
      setSelectedSchedule(null);
      setSelectedScheduleDraft(null);
      setSelectedEmployeeId(null);
      loadData();
    } catch (err: any) {
      console.error('Error deleting schedule draft:', err);
      
      // Handle API error response
      if (err.response && err.response.data && err.response.data.error) {
        alert(`Failed to delete schedule draft: ${err.response.data.error}`);
      } else if (err.message) {
        alert(`Failed to delete schedule draft: ${err.message}`);
      } else {
        alert('Failed to delete schedule draft. Please try again.');
      }
    }
  };

  const handlePublishDrafts = async () => {
    if (!confirm('Are you sure you want to publish all schedule drafts? This will apply all pending changes.')) {
      return;
    }

    try {
      // Use the same date range calculation as loadData function
      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);

      if (viewMode === 'week') {
        // Start from Monday of the current week
        const dayOfWeek = startDate.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate.setDate(startDate.getDate() - daysToMonday);
        
        // End on Sunday
        endDate.setDate(startDate.getDate() + 6);
      }

      // Set time to start and end of day (same as loadData)
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      // Format dates as YYYY-MM-DD strings to avoid timezone issues
      const startDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
      const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

      await publishScheduleDrafts(startDateStr, endDateStr);
      // Reload data to reflect changes
      loadData();
      
      // alert('Schedule drafts published successfully!');
    } catch (err: any) {
      console.error('Error publishing drafts:', err);
      
      // Handle API error response
      if (err.response && err.response.data && err.response.data.error) {
        alert(`Failed to publish drafts: ${err.response.data.error}`);
      } else if (err.message) {
        alert(`Failed to publish drafts: ${err.message}`);
      } else {
        alert('Failed to publish drafts. Please try again.');
      }
    }
  };

  const getSchedulesForTimeSlot = (date: Date, hour: number) => {
    // Create time boundaries for this hour slot
    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(date);
    slotEnd.setHours(hour + 1, 0, 0, 0);

    console.log('slotStart', slotStart);
    console.log('slotEnd', slotEnd);

    // Debug: Log what we're looking for (for all hours 6-10)
    if (hour >= 6 && hour <= 23) {
      console.log(`Hour ${hour}: Looking for schedules:`, {
        date: date.toISOString(),
        hour,
        slotStart: slotStart.toISOString(),
        slotEnd: slotEnd.toISOString(),
        totalSchedules: safeSchedules.length,
        totalDrafts: safeScheduleDrafts.length,
        schedules: safeSchedules.map(s => ({
          id: s.scheduleid,
          start: s.starttime,
          end: s.endtime
        })),
        drafts: safeScheduleDrafts.map(d => ({
          id: d.scheduledraftid,
          start: d.starttime,
          end: d.endtime
        }))
      });
    }

    // Combine schedules and drafts
    const allSchedules = [
      ...safeSchedules.map(schedule => ({ ...schedule, type: 'schedule' as const })),
      ...safeScheduleDrafts.map(draft => ({ ...draft, type: 'draft' as const }))
    ];

    return allSchedules.filter(item => {
      try {
        console.log('item', item);
        // Parse the date string to get year, month, day
        const dateParts = item.scheduledate.split('T')[0].split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
        const day = parseInt(dateParts[2]);
        
        const itemStart = new Date(year, month, day, parseInt(item.starttime.split(':')[0]), parseInt(item.starttime.split(':')[1]), 0, 0);
        const itemEnd = new Date(year, month, day, parseInt(item.endtime.split(':')[0]), parseInt(item.endtime.split(':')[1]), 0, 0);
        
        // Check if the item overlaps with this time slot
        // An item overlaps if:
        // 1. Item starts before the slot ends AND
        // 2. Item ends after the slot starts

        const overlaps = itemStart < slotEnd && itemEnd > slotStart;
        
        // Debug: Log the first item check for hours 6-10
        if (hour >= 6 && hour <= 19 && allSchedules.indexOf(item) === 0) {
          console.log(`Hour ${hour}: Item check:`, {
            itemId: item.type === 'schedule' ? item.scheduleid : item.scheduledraftid,
            itemStart: item.starttime,
            itemEnd: item.endtime,
            parsedStart: itemStart.toISOString(),
            parsedEnd: itemEnd.toISOString(),
            overlaps,
            type: item.type
          });
        }
        
        return overlaps;
      } catch (error) {
        console.error('Error parsing item dates:', error, item);
        return false;
      }
    });
  };

  const getVisibleDraftsCount = () => {
    // Use the same date range calculation as loadData and publish functions
    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);

    if (viewMode === 'week') {
      // Start from Monday of the current week
      const dayOfWeek = startDate.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate.setDate(startDate.getDate() - daysToMonday);
      
      // End on Sunday
      endDate.setDate(startDate.getDate() + 6);
    }

    // Set time to start and end of day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Format dates as YYYY-MM-DD strings to avoid timezone issues
    const startDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
    const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    // Filter drafts that fall within the current view range
    return safeScheduleDrafts.filter(draft => {
      const draftDate = draft.scheduledate.split('T')[0]; // Get just the date part
      return draftDate >= startDateStr && draftDate <= endDateStr;
    }).length;
  };

  const formatTime = (hour: number) => {
    return hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysToShow = () => {
    if (viewMode === 'day') {
      return [currentDate];
    } else {
      // Week view - show 7 days starting from Monday
      const days = [];
      const startDate = new Date(currentDate);
      const dayOfWeek = startDate.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate.setDate(startDate.getDate() - daysToMonday);

      for (let i = 0; i < 7; i++) {
        const day = new Date(startDate);
        day.setDate(day.getDate() + i);
        days.push(day);
      }
      return days;
    }
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

  // Ensure we have valid data
  const safeSchedules = Array.isArray(schedules) ? schedules : [];
  const safeScheduleDrafts = Array.isArray(scheduleDrafts) ? scheduleDrafts : [];
  const safeEmployees = Array.isArray(employees) ? employees : [];

  const daysToShow = getDaysToShow();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaCalendar />
            Schedule
          </h1>
          
          {/* View Mode Toggle */}
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'day' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'week' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Week
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Publish Button - only show if there are drafts in current view */}
          {getVisibleDraftsCount() > 0 && (
            <button
              onClick={handlePublishDrafts}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FaUpload />
              Publish Drafts ({getVisibleDraftsCount()})
            </button>
          )}

          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDateChange('prev')}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <FaChevronLeft />
            </button>
            <span className="text-lg font-medium">
              {viewMode === 'day' 
                ? formatDate(currentDate)
                : `${formatDate(daysToShow[0])} - ${formatDate(daysToShow[6])}`
              }
            </span>
            <button
              onClick={() => handleDateChange('next')}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <FaChevronRight />
            </button>
          </div>

          {/* Today Button */}
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

            {/* Schedule Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {viewMode === 'day' ? (
            <ScheduleDayView
              currentDate={currentDate}
              timeSlots={timeSlots}
              employees={safeEmployees}
              schedules={safeSchedules}
              scheduleDrafts={safeScheduleDrafts}
              onCellClick={handleCellClick}
              onScheduleClick={handleScheduleClick}
              onScheduleDraftClick={handleScheduleDraftClick}
              onScheduleDrop={handleScheduleDrop}
              formatTime={formatTime}
              getSchedulesForTimeSlot={getSchedulesForTimeSlot}
            />
          ) : (
            <ScheduleWeekView
              daysToShow={daysToShow}
              employees={safeEmployees}
              schedules={safeSchedules}
              scheduleDrafts={safeScheduleDrafts}
              onCellClick={handleWeekCellClick}
              onScheduleClick={handleScheduleClick}
              onScheduleDraftClick={handleScheduleDraftClick}
              onScheduleDrop={handleWeekScheduleDrop}
              formatDate={formatDate}
            />
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {showModal && selectedStore && (
        <ScheduleModal
          schedule={selectedSchedule}
          scheduleDraft={selectedScheduleDraft}
          employees={safeEmployees}
          selectedDateTime={selectedDateTime || undefined}
          selectedEmployeeId={selectedEmployeeId || undefined}
          onSave={handleSaveSchedule}
          onDelete={handleDeleteSchedule}
          onDeleteDraft={handleDeleteScheduleDraft}
          onCancel={() => {
            setShowModal(false);
            setSelectedSchedule(null);
            setSelectedScheduleDraft(null);
            setSelectedDateTime(null);
            setSelectedEmployeeId(null);
          }}
          selectedStore={selectedStore}
        />
      )}
    </div>
  );
} 