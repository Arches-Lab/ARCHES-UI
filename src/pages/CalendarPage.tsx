import { useCallback, useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, DateSelectArg } from '@fullcalendar/core';
import { FaTimes, FaCalendarPlus } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';
import { useSelectedStore } from '../auth/useSelectedStore';
import { getCalendarEvents, createCalendarEvent, updateCalendarEvent } from '../api/calendar';
import type { CalendarEventResponse } from '../api/calendar';

const SOURCE_COLORS: Record<string, string> = {
  Calendar: '#3b82f6',
  Task: '#f97316',
  InventoryCount: '#22c55e',
  EmployeeReview: '#a855f7',
  StoreOperation: '#ef4444',
  ApplicantInterview: '#22c55e'
};

const EVENT_TYPES = ['MEETING', 'REMINDER', 'NOTE'] as const;
const EVENT_TYPE_COLORS: Record<string, string> = {
  MEETING: '#3b82f6',
  REMINDER: '#f97316',
  NOTE: '#22c55e'
};
const defaultColor = '#6b7280';

function mapToFullCalendarEvents(rows: CalendarEventResponse[]) {
  return rows.map((ev) => ({
    id: ev.id,
    title: ev.title,
    start: ev.start,
    end: ev.end,
    allDay: ev.allday ?? false,
    backgroundColor:
      SOURCE_COLORS[ev.source] ?? EVENT_TYPE_COLORS[ev.eventType] ?? defaultColor,
    extendedProps: { eventType: ev.eventType }
  }));
}

type EventModalState =
  | { open: true; mode: 'add'; start: string; end: string; allDay?: boolean }
  | { open: true; mode: 'edit'; id: string; title: string; start: string; end: string; allDay: boolean; eventType: string }
  | null;

export default function CalendarPage() {
  const { getAccessToken } = useAuth();
  const { selectedStore, isLoading: storeLoading } = useSelectedStore();
  const storeNumber = selectedStore ?? 1;
  const [error, setError] = useState<string | null>(null);
  const [tokenReady, setTokenReady] = useState(false);
  const [eventModal, setEventModal] = useState<EventModalState>(null);
  const [eventSaving, setEventSaving] = useState(false);
  const setErrorRef = useRef(setError);
  const calendarRef = useRef<FullCalendar>(null);
  setErrorRef.current = setError;

  useEffect(() => {
    getAccessToken().then((token) => setTokenReady(!!token));
  }, [getAccessToken]);

  const handleEventClick = useCallback((info: EventClickArg) => {
    const ev = info.event;
    const eventType = (ev.extendedProps as { eventType?: string })?.eventType ?? 'MEETING';
    setEventModal({
      open: true,
      mode: 'edit',
      id: ev.id,
      title: ev.title,
      start: ev.startStr ?? ev.start?.toISOString() ?? '',
      end: ev.endStr ?? ev.end?.toISOString() ?? '',
      allDay: ev.allDay ?? false,
      eventType
    });
  }, []);

  const handleDateSelect = useCallback((arg: DateSelectArg) => {
    setEventModal({
      open: true,
      mode: 'add',
      start: arg.startStr,
      end: arg.endStr,
      allDay: arg.allDay ?? false
    });
  }, []);

  const closeEventModal = useCallback(() => setEventModal(null), []);

  const handleEventSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!eventModal) return;
      const form = e.currentTarget;
      const title = (form.elements.namedItem('event-title') as HTMLInputElement)?.value?.trim();
      let start = (form.elements.namedItem('event-start') as HTMLInputElement)?.value ?? '';
      let end = (form.elements.namedItem('event-end') as HTMLInputElement)?.value ?? '';
      const eventType = (form.elements.namedItem('event-type') as HTMLSelectElement)?.value as 'MEETING' | 'REMINDER' | 'NOTE';
      const allday = (form.elements.namedItem('event-allday') as HTMLInputElement)?.checked ?? false;
      if (!title) {
        alert('Title is required');
        return;
      }
      if (allday) {
        start = start.slice(0, 10);
        end = end.slice(0, 10);
      }
      const payload = { title, startdate: start, enddate: end, eventtype: eventType, allday };
      setEventSaving(true);
      try {
        if (eventModal.mode === 'edit') {
          await updateCalendarEvent(eventModal.id, storeNumber, payload);
        } else {
          await createCalendarEvent(storeNumber, { storenumber: storeNumber, ...payload });
        }
        calendarRef.current?.getApi().refetchEvents();
        closeEventModal();
      } catch (err) {
        console.error('Failed to save event:', err);
        setErrorRef.current('Failed to save event.');
      } finally {
        setEventSaving(false);
      }
    },
    [eventModal, storeNumber, closeEventModal]
  );

  if (error) {
    return (
      <div className="p-4">
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!tokenReady || storeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="-m-4 w-[calc(100%+2rem)] min-h-full bg-white pl-4 pr-4">
      <div className="flex items-center justify-between px-4 pt-4 pb-0">
        {/* <h2 className="text-2xl font-semibold">Calendar</h2> */}
      </div>
      <div className="w-full overflow-hidden mt-0">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
          }}
          buttonText={{
            today: 'Today',
            month: 'Month',
            week: 'Week'
          }}
          timeZone="UTC"
          events={(fetchInfo, successCallback, failureCallback) => {
            setErrorRef.current(null);
            const startStr = fetchInfo.startStr.slice(0, 10);
            const endStr = fetchInfo.endStr.slice(0, 10);
            const fetchOnce = () => getCalendarEvents(storeNumber, startStr, endStr);
            const fetchWithRetry = (): Promise<CalendarEventResponse[]> =>
              fetchOnce().catch((err) => {
                if (err?.response?.status === 403) {
                  return new Promise((resolve, reject) => {
                    setTimeout(() => fetchOnce().then(resolve).catch(reject), 500);
                  });
                }
                throw err;
              });
            fetchWithRetry()
              .then((data) => successCallback(mapToFullCalendarEvents(data)))
              .catch((err) => {
                console.error('Calendar fetch error:', err);
                setErrorRef.current('Failed to load calendar events.');
                failureCallback(err instanceof Error ? err : new Error(String(err)));
              });
          }}
          eventClick={handleEventClick}
          selectable={true}
          select={handleDateSelect}
          editable={false}
          height="auto"
          ref={calendarRef}
        />
      </div>

      {eventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaCalendarPlus className="text-blue-600" />
                {eventModal.mode === 'edit' ? 'Edit event' : 'Add event'}
              </h3>
              <button
                type="button"
                onClick={closeEventModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEventSubmit} className="p-4 space-y-4">
              <div>
                <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  id="event-title"
                  name="event-title"
                  type="text"
                  required
                  defaultValue={eventModal.mode === 'edit' ? eventModal.title : undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Event title"
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                <input
                  id="event-allday"
                  name="event-allday"
                  type="checkbox"
                  defaultChecked={eventModal.mode === 'edit' ? eventModal.allDay : (eventModal.mode === 'add' && eventModal.allDay)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="event-allday" className="text-base font-semibold text-gray-800 cursor-pointer select-none">
                  All day
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="event-start" className="block text-sm font-medium text-gray-700 mb-1">
                    Start
                  </label>
                  <input
                    id="event-start"
                    name="event-start"
                    type="datetime-local"
                    required
                    defaultValue={(() => {
                      const s = eventModal.mode === 'edit' ? eventModal.start : eventModal.start;
                      return s.length <= 10 ? `${s}T00:00` : s.slice(0, 16).replace('Z', '');
                    })()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="event-end" className="block text-sm font-medium text-gray-700 mb-1">
                    End
                  </label>
                  <input
                    id="event-end"
                    name="event-end"
                    type="datetime-local"
                    required
                    defaultValue={(() => {
                      const e = eventModal.mode === 'edit' ? eventModal.end : eventModal.end;
                      return e.length <= 10 ? `${e}T00:00` : e.slice(0, 16).replace('Z', '');
                    })()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="event-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Event type
                </label>
                <select
                  id="event-type"
                  name="event-type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={eventModal.mode === 'edit' ? eventModal.eventType : 'MEETING'}
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEventModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={eventSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {eventSaving ? 'Saving…' : eventModal.mode === 'edit' ? 'Update event' : 'Add event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
