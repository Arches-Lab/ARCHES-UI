import React, { useState } from 'react';
import { Schedule } from '../models/Schedule';
import { ScheduleDraft } from '../models/ScheduleDraft';
import { Employee } from '../models/Employee';

interface DayViewProps {
  currentDate: Date;
  timeSlots: number[];
  employees: Employee[];
  schedules: Schedule[];
  scheduleDrafts: ScheduleDraft[];
  onCellClick: (date: Date, hour: number, employeeId?: string) => void;
  onScheduleClick: (schedule: Schedule, e: React.MouseEvent) => void;
  onScheduleDraftClick: (draft: ScheduleDraft, e: React.MouseEvent) => void;
  onScheduleDrop: (scheduleId: string, newEmployeeId: string, newStartHour: number) => void;
  formatTime: (hour: number) => string;
  getSchedulesForTimeSlot: (date: Date, hour: number) => (Schedule & { type: 'schedule' } | ScheduleDraft & { type: 'draft' })[];
}

export default function DayView({
  currentDate,
  timeSlots,
  employees,
  schedules,
  onCellClick,
  onScheduleClick,
  onScheduleDraftClick,
  onScheduleDrop,
  formatTime,
  getSchedulesForTimeSlot
}: DayViewProps) {
  const [draggedItem, setDraggedItem] = useState<Schedule | ScheduleDraft | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ employeeId: string; hour: number } | null>(null);

  const handleDragStart = (e: React.DragEvent, item: Schedule | ScheduleDraft) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    const itemId = 'scheduleid' in item ? item.scheduleid : item.scheduledraftid;
    e.dataTransfer.setData('text/plain', itemId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverCell(null);
  };

  const handleDragOver = (e: React.DragEvent, employeeId: string, hour: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCell({ employeeId, hour });
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDrop = (e: React.DragEvent, employeeId: string, hour: number) => {
    e.preventDefault();
    if (draggedItem) {
      const itemId = 'scheduleid' in draggedItem ? draggedItem.scheduleid : draggedItem.scheduledraftid;
      onScheduleDrop(itemId, employeeId, hour);
    }
    setDraggedItem(null);
    setDragOverCell(null);
  };

  const isDropTarget = (employeeId: string, hour: number) => {
    return dragOverCell?.employeeId === employeeId && dragOverCell?.hour === hour;
  };

  // Calculate total hours for each employee
  const calculateEmployeeHours = (employeeId: string): number => {
    const employeeSchedules = schedules.filter(schedule => {
      // Check if schedule is for this employee and this date
      // Parse the date string to avoid timezone issues
      const dateParts = schedule.scheduledate.split('T')[0].split('-');
      const scheduleYear = parseInt(dateParts[0]);
      const scheduleMonth = parseInt(dateParts[1]) - 1; // Month is 0-indexed
      const scheduleDay = parseInt(dateParts[2]);
      
      return schedule.employeeid === employeeId &&
             scheduleYear === currentDate.getFullYear() &&
             scheduleMonth === currentDate.getMonth() &&
             scheduleDay === currentDate.getDate();
    });

    let totalHours = 0;
    console.log(`Calculating hours for employee ${employeeId}:`, employeeSchedules);
    
    employeeSchedules.forEach(schedule => {
      const startHour = parseInt(schedule.starttime.split(':')[0]);
      const startMinute = parseInt(schedule.starttime.split(':')[1]);
      const endHour = parseInt(schedule.endtime.split(':')[0]);
      const endMinute = parseInt(schedule.endtime.split(':')[1]);
      
      // Calculate duration in hours
      const startTimeInMinutes = startHour * 60 + startMinute;
      const endTimeInMinutes = endHour * 60 + endMinute;
      const durationInMinutes = endTimeInMinutes - startTimeInMinutes;
      
      // Subtract lunch minutes if specified
      const lunchMinutes = schedule.lunchminutes || 0;
      const actualWorkMinutes = durationInMinutes - lunchMinutes;
      const scheduleHours = actualWorkMinutes / 60;
      
      console.log(`Schedule ${schedule.scheduleid}: ${schedule.starttime}-${schedule.endtime}, lunch: ${lunchMinutes}min, hours: ${scheduleHours}`);
      
      totalHours += scheduleHours;
    });

    const roundedHours = Math.round(totalHours * 100) / 100;
    console.log(`Total hours for ${employeeId}: ${roundedHours}`);
    return roundedHours;
  };

  // Calculate total hours for the day
  const calculateTotalDayHours = (): number => {
    let totalHours = 0;
    employees.forEach(employee => {
      totalHours += calculateEmployeeHours(employee.employeeid);
    });
    return Math.round(totalHours * 100) / 100; // Round to 2 decimal places
  };

  return (
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50 border-b">
          <th className="w-60 p-3 text-left text-sm font-medium text-gray-500 border-r">
            Employee
          </th>
          {timeSlots.map((hour) => (
            <th key={hour} className="p-2 text-center text-xs font-medium text-gray-500 border-r min-w-16">
              {formatTime(hour)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {employees.map((employee) => (
          <tr key={employee.employeeid} className="border-b hover:bg-gray-50">
            <td className="w-60 p-3 text-sm text-gray-700 border-r font-medium">
              <div className="flex justify-between items-center">
                <span>{employee.firstname} {employee.lastname}</span>
                <span className="text-xs text-gray-500 font-normal">
                  {calculateEmployeeHours(employee.employeeid)}h
                </span>
              </div>
            </td>
            {timeSlots.map((hour) => {
              const employeeSchedules = getSchedulesForTimeSlot(currentDate, hour).filter(
                schedule => schedule.employeeid === employee.employeeid
              );
              
              // Check if this is the start of a schedule (not a continuation)
              const isStartOfSchedule = employeeSchedules.some(schedule => {
                const scheduleStartHour = parseInt(schedule.starttime.split(':')[0]);
                return scheduleStartHour === hour;
              });
              
              // If this is not the start of a schedule, render an empty cell
              if (!isStartOfSchedule) {
                return (
                  <td
                    key={hour}
                    className={`p-1 border-r relative min-h-16 cursor-pointer transition-colors ${
                      isDropTarget(employee.employeeid, hour) 
                        ? 'bg-green-100 border-2 border-green-400' 
                        : 'hover:bg-blue-50'
                    }`}
                    onClick={() => onCellClick(currentDate, hour, employee.employeeid)}
                    onDragOver={(e) => handleDragOver(e, employee.employeeid, hour)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, employee.employeeid, hour)}
                  />
                );
              }
              
              return (
                <td
                  key={hour}
                  className={`p-1 border-r relative min-h-16 cursor-pointer transition-colors ${
                    isDropTarget(employee.employeeid, hour) 
                      ? 'bg-green-100 border-2 border-green-400' 
                      : 'hover:bg-blue-50'
                  }`}
                  onClick={() => onCellClick(currentDate, hour, employee.employeeid)}
                  onDragOver={(e) => handleDragOver(e, employee.employeeid, hour)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, employee.employeeid, hour)}
                >
                  {employeeSchedules.map((item) => {
                    // Calculate how many hours this item spans
                    const startHour = parseInt(item.starttime.split(':')[0]);
                    const endHour = parseInt(item.endtime.split(':')[0]);
                    const spanHours = Math.max(1, endHour - startHour);
                    
                    const isSchedule = item.type === 'schedule';
                    const itemId = isSchedule ? item.scheduleid : item.scheduledraftid;
                    const isDragging = draggedItem && (
                      ('scheduleid' in draggedItem && draggedItem.scheduleid === itemId) ||
                      ('scheduledraftid' in draggedItem && draggedItem.scheduledraftid === itemId)
                    );
                    
                    // Different styling for schedules vs drafts
                    const baseClasses = isSchedule 
                      ? 'bg-blue-100 border-blue-200 hover:bg-blue-200 text-blue-600'
                      : 'bg-yellow-100 border-yellow-200 hover:bg-yellow-200 text-yellow-700';
                    
                    const draggingClasses = isDragging 
                      ? 'bg-blue-300 border-blue-400 opacity-50' 
                      : baseClasses;
                    
                    return (
                      <div
                        key={itemId}
                        className={`mb-1 border rounded text-xs transition-all ${draggingClasses}`}
                        style={{
                          width: `${spanHours * 100}%`,
                          position: 'absolute',
                          top: '2px',
                          bottom: '2px',
                          left: '0px',
                          zIndex: isDragging ? 20 : 10
                        }}
                        onClick={isSchedule ? (e) => onScheduleClick(item as Schedule, e) : (e) => onScheduleDraftClick(item as ScheduleDraft, e)}
                      >
                        {/* Drag handle bar on the left */}
                        <div 
                          className={`w-3 h-full absolute left-0 top-0 cursor-grab active:cursor-grabbing hover:cursor-grab ${
                            isSchedule ? 'bg-blue-400' : 'bg-yellow-400'
                          }`}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, item)}
                          onDragEnd={handleDragEnd}
                        />
                        
                        {/* Content area */}
                        <div className="p-2 pl-4 cursor-default">
                          <div className={isSchedule ? 'text-blue-600' : 'text-yellow-700'}>
                            {item.starttime.substring(0, 5)} - {item.endtime.substring(0, 5)}
                            {!isSchedule && <span className="ml-1 text-xs">(Draft)</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </td>
              );
            })}
          </tr>
        ))}
        {/* Summary row */}
        <tr className="bg-gray-100 border-t-2 border-gray-300">
          <td className="w-60 p-3 text-sm font-bold text-gray-700 border-r">
            <div className="flex justify-between items-center">
              <span>Total Hours</span>
              <span className="text-sm">{calculateTotalDayHours()}h</span>
            </div>
          </td>
          {timeSlots.map((hour) => (
            <td key={hour} className="p-2 border-r min-w-16">
              {/* Empty cells for time slots in summary row */}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
} 