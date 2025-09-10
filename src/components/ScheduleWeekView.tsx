import React, { useState } from 'react';
import { Schedule } from '../models/Schedule';
import { ScheduleDraft } from '../models/ScheduleDraft';
import { Employee } from '../models/Employee';

interface WeekViewProps {
  daysToShow: Date[];
  employees: Employee[];
  schedules: Schedule[];
  scheduleDrafts: ScheduleDraft[];
  onCellClick: (date: Date, hour: number, employeeId?: string) => void;
  onScheduleClick: (schedule: Schedule, e: React.MouseEvent) => void;
  onScheduleDraftClick: (draft: ScheduleDraft, e: React.MouseEvent) => void;
  onScheduleDrop: (scheduleId: string, newEmployeeId: string, newDate: Date) => void;
  formatDate: (date: Date) => string;
}

export default function WeekView({
  daysToShow,
  employees,
  schedules,
  scheduleDrafts,
  onCellClick,
  onScheduleClick,
  onScheduleDraftClick,
  onScheduleDrop,
  formatDate
}: WeekViewProps) {
  const [draggedItem, setDraggedItem] = useState<Schedule | ScheduleDraft | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ employeeId: string; date: Date } | null>(null);

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

  const handleDragOver = (e: React.DragEvent, employeeId: string, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCell({ employeeId, date });
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDrop = (e: React.DragEvent, employeeId: string, date: Date) => {
    e.preventDefault();
    if (draggedItem) {
      const itemId = 'scheduleid' in draggedItem ? draggedItem.scheduleid : draggedItem.scheduledraftid;
      onScheduleDrop(itemId, employeeId, date);
    }
    setDraggedItem(null);
    setDragOverCell(null);
  };

  const isDropTarget = (employeeId: string, date: Date) => {
    return dragOverCell?.employeeId === employeeId && 
           dragOverCell?.date.getTime() === date.getTime();
  };

  // Calculate total hours for an employee on a specific date
  const calculateEmployeeDayHours = (employeeId: string, date: Date): number => {
    const daySchedules = schedules.filter(schedule => {
      // Parse the date string to avoid timezone issues
      const dateParts = schedule.scheduledate.split('T')[0].split('-');
      const scheduleYear = parseInt(dateParts[0]);
      const scheduleMonth = parseInt(dateParts[1]) - 1; // Month is 0-indexed
      const scheduleDay = parseInt(dateParts[2]);
      
      return schedule.employeeid === employeeId &&
             scheduleYear === date.getFullYear() &&
             scheduleMonth === date.getMonth() &&
             scheduleDay === date.getDate();
    });

    let totalHours = 0;
    daySchedules.forEach(schedule => {
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
      
      totalHours += actualWorkMinutes / 60;
    });

    return Math.round(totalHours * 100) / 100; // Round to 2 decimal places
  };

  // Calculate total hours for an employee for the entire week
  const calculateEmployeeWeekHours = (employeeId: string): number => {
    let totalHours = 0;
    daysToShow.forEach(date => {
      totalHours += calculateEmployeeDayHours(employeeId, date);
    });
    return Math.round(totalHours * 100) / 100;
  };

  // Calculate total hours for a specific day
  const calculateDayTotalHours = (date: Date): number => {
    let totalHours = 0;
    employees.forEach(employee => {
      totalHours += calculateEmployeeDayHours(employee.employeeid, date);
    });
    return Math.round(totalHours * 100) / 100;
  };

  // Calculate total hours for the entire week
  const calculateWeekTotalHours = (): number => {
    let totalHours = 0;
    employees.forEach(employee => {
      totalHours += calculateEmployeeWeekHours(employee.employeeid);
    });
    return Math.round(totalHours * 100) / 100;
  };

  return (
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50 border-b">
          <th className="w-48 p-3 text-left text-sm font-medium text-gray-500 border-r">
            Employee
          </th>
          {daysToShow.map((date, index) => (
            <th key={index} className="p-3 text-center text-sm font-medium text-gray-500 border-r min-w-32">
                            <div className="flex flex-col">
                <span className="font-semibold">{formatDate(date)}</span>
              </div>
            </th>
          ))}

        </tr>
      </thead>
      <tbody>
        {employees.map((employee) => (
          <tr key={employee.employeeid} className="border-b hover:bg-gray-50">
            <td className="w-48 p-3 text-sm text-gray-700 border-r font-medium">
              <div className="flex justify-between items-center">
                <span>{employee.firstname} {employee.lastname}</span>
                <span className="text-xs text-gray-500 font-normal">
                  {calculateEmployeeWeekHours(employee.employeeid)}h
                </span>
              </div>
            </td>
            {daysToShow.map((date, dayIndex) => {
              // Get all schedules and drafts for this employee on this date
              const daySchedules = schedules.filter(schedule => {
                // Parse the date string to get year, month, day
                const dateParts = schedule.scheduledate.split('T')[0].split('-');
                const scheduleYear = parseInt(dateParts[0]);
                const scheduleMonth = parseInt(dateParts[1]) - 1; // Month is 0-indexed
                const scheduleDay = parseInt(dateParts[2]);
                
                return schedule.employeeid === employee.employeeid &&
                       scheduleYear === date.getFullYear() &&
                       scheduleMonth === date.getMonth() &&
                       scheduleDay === date.getDate();
              });

              const dayDrafts = scheduleDrafts.filter(draft => {
                // Parse the date string to get year, month, day
                const dateParts = draft.scheduledate.split('T')[0].split('-');
                const draftYear = parseInt(dateParts[0]);
                const draftMonth = parseInt(dateParts[1]) - 1; // Month is 0-indexed
                const draftDay = parseInt(dateParts[2]);
                
                return draft.employeeid === employee.employeeid &&
                       draftYear === date.getFullYear() &&
                       draftMonth === date.getMonth() &&
                       draftDay === date.getDate();
              });
              
              const dayHours = calculateEmployeeDayHours(employee.employeeid, date);
              
              return (
                <td
                  key={dayIndex}
                  className={`p-1 border-r relative min-h-16 cursor-pointer transition-colors ${
                    isDropTarget(employee.employeeid, date) 
                      ? 'bg-green-100 border-2 border-green-400' 
                      : 'hover:bg-blue-50'
                  }`}
                  onClick={() => onCellClick(date, 9, employee.employeeid)} // Default to 9 AM
                  onDragOver={(e) => handleDragOver(e, employee.employeeid, date)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, employee.employeeid, date)}
                >
                  {/* Render schedules */}
                  {daySchedules.map((schedule) => {
                    const isDragging = draggedItem && 'scheduleid' in draggedItem && draggedItem.scheduleid === schedule.scheduleid;
                    
                    return (
                      <div
                        key={schedule.scheduleid}
                        className={`mb-1 border rounded text-xs transition-all relative ${
                          isDragging 
                            ? 'bg-blue-300 border-blue-400 opacity-50' 
                            : 'bg-blue-100 border-blue-200 hover:bg-blue-200'
                        }`}
                        onClick={(e) => onScheduleClick(schedule, e)}
                      >
                        {/* Drag handle bar on the left */}
                        <div 
                          className="w-3 h-full absolute left-0 top-0 cursor-move active:cursor-move hover:cursor-move bg-blue-400"
                          draggable
                          onDragStart={(e) => handleDragStart(e, schedule)}
                          onDragEnd={handleDragEnd}
                        />
                        
                        {/* Content area */}
                        <div className="p-2 pl-4 cursor-default">
                          <div className="text-blue-600">
                            {schedule.starttime.substring(0, 5)} - {schedule.endtime.substring(0, 5)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Render drafts */}
                  {dayDrafts.map((draft) => {
                    const isDragging = draggedItem && 'scheduledraftid' in draggedItem && draggedItem.scheduledraftid === draft.scheduledraftid;
                    
                    return (
                      <div
                        key={draft.scheduledraftid}
                        className={`mb-1 border rounded text-xs transition-all relative ${
                          isDragging 
                            ? 'bg-yellow-300 border-yellow-400 opacity-50' 
                            : 'bg-yellow-100 border-yellow-200 hover:bg-yellow-200'
                        }`}
                        onClick={(e) => onScheduleDraftClick(draft, e)}
                      >
                        {/* Drag handle bar on the left */}
                        <div 
                          className="w-3 h-full absolute left-0 top-0 cursor-move active:cursor-move hover:cursor-move bg-yellow-400"
                          draggable
                          onDragStart={(e) => handleDragStart(e, draft)}
                          onDragEnd={handleDragEnd}
                        />
                        
                        {/* Content area */}
                        <div className="p-2 pl-4 cursor-default">
                          <div className="text-yellow-700">
                            {draft.starttime.substring(0, 5)} - {draft.endtime.substring(0, 5)}
                            <span className="ml-1 text-xs">(Draft)</span>
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
          <td className="w-48 p-3 text-sm font-bold text-gray-700 border-r">
            <div className="flex justify-between items-center">
              <span>Total Hours</span>
              <span className="text-sm">{calculateWeekTotalHours()}h</span>
            </div>
          </td>
          {daysToShow.map((date, dayIndex) => (
            <td key={dayIndex} className="p-3 text-center text-sm font-bold text-gray-700 border-r">
              {calculateDayTotalHours(date)}h
            </td>
          ))}

        </tr>
      </tbody>
    </table>
  );
} 