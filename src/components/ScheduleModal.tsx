import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaUser, FaCalendar, FaClock, FaStickyNote, FaTrash, FaList, FaChevronDown } from 'react-icons/fa';
import { Schedule } from '../models/Schedule';
import { Employee } from '../models/Employee';
import { Shift } from '../models/Shift';
import { ScheduleDraft, CreateScheduleDraftRequest } from '../models/ScheduleDraft';
import { getShifts, createShift } from '../api/shift';

interface ScheduleModalProps {
  schedule?: Schedule | null;
  scheduleDraft?: ScheduleDraft | null;
  employees: Employee[];
  selectedDateTime?: Date;
  selectedEmployeeId?: string;
  onSave: (draftData: CreateScheduleDraftRequest) => void;
  onDelete?: (scheduleId: string) => void;
  onDeleteDraft?: (draftId: string) => void;
  onCancel: () => void;
  selectedStore: number;
}

// Custom Dropdown Component
interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  label: string;
  icon: React.ReactNode;
}

function CustomDropdown({ value, onChange, options, placeholder, label, icon }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {icon}
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm flex items-center justify-between"
        >
          <span className={value ? 'text-gray-900' : 'text-gray-500'}>
            {value || placeholder}
          </span>
          <FaChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${
                  value === option ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ScheduleModal({ 
  schedule, 
  scheduleDraft, 
  employees, 
  selectedDateTime, 
  selectedEmployeeId,
  onSave, 
  onDelete, 
  onDeleteDraft, 
  onCancel, 
  selectedStore 
}: ScheduleModalProps) {
  const [formData, setFormData] = useState<CreateScheduleDraftRequest>({
    employeeid: '',
    scheduledate: '',
    starttime: '',
    endtime: '',
    lunchminutes: 0,
    storenumber: selectedStore,
    action: 'create'
  });


  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(false);

  const isEditing = !!schedule || !!scheduleDraft;

  // Load shifts for the store
  useEffect(() => {
    const loadShifts = async () => {
      try {
        setLoadingShifts(true);
        const shiftsData = await getShifts(selectedStore);
        
        // Add dummy shifts if no shifts from database or as fallback
        const dummyShifts: Shift[] = [
          // {
          //   shiftid: 'dummy-1',
          //   storenumber: selectedStore,
          //   starttime: '09:00',
          //   endtime: '17:00',
          //   totalhours: 8.0,
          //   lunchminutes: 30,
          //   createdby: 'system',
          //   createdon: new Date().toISOString()
          // },
          // {
          //   shiftid: 'dummy-2',
          //   storenumber: selectedStore,
          //   starttime: '10:00',
          //   endtime: '18:00',
          //   totalhours: 8.0,
          //   lunchminutes: 0,
          //   createdby: 'system',
          //   createdon: new Date().toISOString()
          // },
          // {
          //   shiftid: 'dummy-3',
          //   storenumber: selectedStore,
          //   starttime: '08:00',
          //   endtime: '16:00',
          //   totalhours: 8.0,
          //   lunchminutes: 45,
          //   createdby: 'system',
          //   createdon: new Date().toISOString()
          // },
          // {
          //   shiftid: 'dummy-4',
          //   storenumber: selectedStore,
          //   starttime: '12:00',
          //   endtime: '20:00',
          //   totalhours: 8.0,
          //   lunchminutes: 30,
          //   createdby: 'system',
          //   createdon: new Date().toISOString()
          // }
        ];
        
        // Combine database shifts with dummy shifts
        const allShifts = [...(shiftsData || []), ...dummyShifts];
        setShifts(allShifts);
      } catch (err) {
        console.error('Error loading shifts:', err);
        // Use dummy shifts as fallback
        const fallbackShifts: Shift[] = [
          {
            shiftid: 'fallback-1',
            storenumber: selectedStore,
            starttime: '09:00',
            endtime: '17:00',
            totalhours: 8.0,
            lunchminutes: 30,
            createdby: 'system',
            createdon: new Date().toISOString()
          },
          {
            shiftid: 'fallback-2',
            storenumber: selectedStore,
            starttime: '10:00',
            endtime: '18:00',
            totalhours: 8.0,
            lunchminutes: 0,
            createdby: 'system',
            createdon: new Date().toISOString()
          }
        ];
        setShifts(fallbackShifts);
      } finally {
        setLoadingShifts(false);
      }
    };

    if (selectedStore) {
      loadShifts();
    }
  }, [selectedStore]);

  useEffect(() => {
    if (schedule) {
      console.log('Editing schedule:', schedule);
      // Ensure times are in HH:MM format for dropdown compatibility
      const formatTimeForDropdown = (timeStr: string) => {
        if (!timeStr) return '';
        // If time includes seconds, remove them
        return timeStr.substring(0, 5);
      };
      
      setFormData({
        employeeid: schedule.employeeid,
        scheduledate: schedule.scheduledate,
        starttime: formatTimeForDropdown(schedule.starttime),
        endtime: formatTimeForDropdown(schedule.endtime),
        lunchminutes: schedule.lunchminutes || 0,
        storenumber: schedule.storenumber,
        action: 'update',
        referencescheduleid: schedule.scheduleid
      });
          } else if (scheduleDraft) {
        console.log('Editing schedule draft:', scheduleDraft);
        // Ensure times are in HH:MM format for dropdown compatibility
        const formatTimeForDropdown = (timeStr: string) => {
          if (!timeStr) return '';
          // If time includes seconds, remove them
          return timeStr.substring(0, 5);
        };
        
        setFormData({
          employeeid: scheduleDraft.employeeid,
          scheduledate: scheduleDraft.scheduledate,
          starttime: formatTimeForDropdown(scheduleDraft.starttime),
          endtime: formatTimeForDropdown(scheduleDraft.endtime),
          lunchminutes: scheduleDraft.lunchminutes || 0,
          storenumber: scheduleDraft.storenumber,
          action: scheduleDraft.action,
          referencescheduleid: scheduleDraft.referencescheduleid
        });
    } else if (selectedDateTime) {
      // Set default start time to the selected cell time
      const startTime = new Date(selectedDateTime);
      const endTime = new Date(selectedDateTime);
      endTime.setHours(endTime.getHours() + 1); // Default 1 hour duration
      
      // Format date and time strings
      const dateStr = startTime.toISOString().split('T')[0];
      const startTimeStr = startTime.toTimeString().substring(0, 5);
      const endTimeStr = endTime.toTimeString().substring(0, 5);
      
      setFormData({
        employeeid: selectedEmployeeId || '',
        scheduledate: dateStr,
        starttime: startTimeStr,
        endtime: endTimeStr,
        lunchminutes: 0,
        storenumber: selectedStore,
        action: 'create'
      });
    }
  }, [schedule, scheduleDraft, selectedDateTime, selectedStore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeid) {
      alert('Please select an employee');
      return;
    }

    if (!formData.starttime) {
      alert('Start time is required');
      return;
    }

    if (!formData.endtime) {
      alert('End time is required');
      return;
    }

    // Convert time strings to Date objects for comparison
    const startTime = new Date(`2000-01-01T${formData.starttime}:00`);
    const endTime = new Date(`2000-01-01T${formData.endtime}:00`);

    if (endTime <= startTime) {
      alert('End time must be after start time');
      return;
    }

    // The action is already set in formData based on what we're editing
    const draftDataWithAction: CreateScheduleDraftRequest = {
      ...formData
    };

    // Call onSave with draft data
    onSave(draftDataWithAction);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDropdownChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'lunchminutes' ? parseInt(value) || 0 : value
    }));
  };

  const handleShiftSelect = (shift: Shift) => {
    // Update form data with shift details
    // Preserve the current action from formData
    const updatedFormData: CreateScheduleDraftRequest = {
      ...formData,
      starttime: shift.starttime,
      endtime: shift.endtime,
      lunchminutes: shift.lunchminutes
    };
    
    // Save the record immediately
    onSave(updatedFormData);
  };

  const handleSaveAsTemplate = async () => {
    if (!formData.starttime || !formData.endtime) {
      alert('Please select start and end times before saving as template');
      return;
    }

    try {
      // Calculate total hours
      const startTime = new Date(`2000-01-01T${formData.starttime}:00`);
      const endTime = new Date(`2000-01-01T${formData.endtime}:00`);
      const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      const lunchMinutes = formData.lunchminutes || 0;
      const totalHours = (totalMinutes - lunchMinutes) / 60;

      const shiftData = {
        storenumber: selectedStore,
        starttime: formData.starttime,
        endtime: formData.endtime,
        totalhours: totalHours,
        lunchminutes: lunchMinutes,
        createdby: 'user' // This should ideally come from the current user context
      };

      await createShift(shiftData);
      
      // Refresh the shifts list
      const shiftsData = await getShifts(selectedStore);
      setShifts(shiftsData || []);
      
      alert('Shift template saved successfully!');
    } catch (error) {
      console.error('Error saving shift template:', error);
      alert('Failed to save shift template. Please try again.');
    }
  };

  const generateTimeOptions = (): string[] => {
    const times: string[] = [];
    for (let hour = 6; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Edit Schedule' : 'Create Schedule'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {/* Employee and Date Labels - Full Width */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">
                <FaUser className="inline mr-2" />
                {employees.find(emp => emp.employeeid === formData.employeeid)?.firstname} {employees.find(emp => emp.employeeid === formData.employeeid)?.lastname}
              </span>
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">
                <FaCalendar className="inline mr-2" />
                {(() => {
                  const [year, month, day] = formData.scheduledate.split('-').map(Number);
                  const date = new Date(year, month - 1, day);
                  return date.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  });
                })()}
              </span>
            </div>
          </div>

          {/* Blank row for spacing */}
          <div className="h-4"></div>

          <div className="flex gap-6">
            {/* Left Half - Form Fields */}
            <div className="w-1/2 space-y-4">

              {/* Start Time */}
              <CustomDropdown
                value={formData.starttime}
                onChange={(value) => handleDropdownChange('starttime', value)}
                options={generateTimeOptions()}
                placeholder="Select start time"
                label="Start Time"
                icon={<FaClock className="inline mr-2" />}
              />

              {/* End Time */}
              <CustomDropdown
                value={formData.endtime}
                onChange={(value) => handleDropdownChange('endtime', value)}
                options={generateTimeOptions()}
                placeholder="Select end time"
                label="End Time"
                icon={<FaClock className="inline mr-2" />}
              />

              {/* Lunch Minutes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaClock className="inline mr-2" />
                  Unpaid Meal Break (minutes)
                </label>
                <input
                  type="number"
                  name="lunchminutes"
                  value={formData.lunchminutes}
                  onChange={handleInputChange}
                  min="0"
                  max="120"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="0"
                />
              </div>

              {/* Save as Template Shift Button */}
              {!isEditing && (
                <div>
                  <button
                    type="button"
                    onClick={handleSaveAsTemplate}
                    className="w-full px-4 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors flex items-center justify-center gap-2"
                    disabled={!formData.starttime || !formData.endtime}
                  >
                    <FaSave />
                    Save Shift as Template
                  </button>
                </div>
              )}
            </div>

            {/* Right Half - Saved Shifts (only show when creating new schedule) */}
            {!isEditing && shifts.length > 0 && (
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaList className="inline mr-2" />
                  Select from Saved Shifts
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {loadingShifts ? (
                    <div className="text-center text-sm text-gray-500 py-4">Loading shifts...</div>
                  ) : (
                    shifts.map((shift) => (
                      <button
                        key={shift.shiftid}
                        type="button"
                        onClick={() => handleShiftSelect(shift)}
                        className="w-full text-left p-3 hover:bg-blue-50 rounded border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {shift.starttime.substring(0, 5)} - {shift.endtime.substring(0, 5)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {shift.totalhours}h • {shift.lunchminutes}m break
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {isEditing && schedule && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(schedule.scheduleid)}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaTrash />
                Delete
              </button>
            )}
            {isEditing && scheduleDraft && onDeleteDraft && (
              <button
                type="button"
                onClick={() => onDeleteDraft(scheduleDraft.scheduledraftid)}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaTrash />
                Delete Draft
              </button>
            )}
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <FaSave />
              {isEditing ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 