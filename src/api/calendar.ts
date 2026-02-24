import api from './index';

export interface CalendarEventResponse {
  id: string;
  title: string;
  start: string;
  end: string;
  eventType: string;
  source: string;
  allday?: boolean;
}

export const getCalendarEvents = async (
  storeNumber: number,
  start: string,
  end: string
): Promise<CalendarEventResponse[]> => {
  const params = new URLSearchParams({
    storeNumber: String(storeNumber),
    start,
    end
  });
  const { data } = await api.get(`/calendar?${params.toString()}`);
  return Array.isArray(data) ? data : [];
};

export interface CreateCalendarEventRequest {
  storenumber: number;
  title: string;
  startdate: string;
  enddate: string;
  eventtype: 'MEETING' | 'REMINDER' | 'NOTE';
  allday: boolean;
}

export const createCalendarEvent = async (
  storeNumber: number,
  payload: CreateCalendarEventRequest
): Promise<CalendarEventResponse> => {
  alert(JSON.stringify({ storeNumber, ...payload }));
  const { data } = await api.post('/calendar', { storeNumber, ...payload });
  return data;
};

export interface UpdateCalendarEventRequest {
  title: string;
  startdate: string;
  enddate: string;
  eventtype: 'MEETING' | 'REMINDER' | 'NOTE';
  allday: boolean;
}

export const updateCalendarEvent = async (
  id: string,
  storeNumber: number,
  payload: UpdateCalendarEventRequest
): Promise<CalendarEventResponse> => {
  const { data } = await api.put(`/calendar/${id}`, { storeNumber, ...payload });
  return data;
};
