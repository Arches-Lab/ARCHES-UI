export interface ScheduleDraft {
  scheduledraftid: string;
  storenumber: number;
  employeeid: string;
  scheduledate: string;
  starttime: string;
  endtime: string;
  lunchminutes?: number;
  action: 'create' | 'update' | 'delete';
  referencescheduleid?: string;
  createdby: string;
  createdon: string;
  updatedby?: string;
  updatedon?: string;
}

export interface CreateScheduleDraftRequest {
  storenumber: number;
  employeeid: string;
  scheduledate: string;
  starttime: string;
  endtime: string;
  lunchminutes?: number;
  action: 'create' | 'update' | 'delete';
  referencescheduleid?: string;
}

export interface UpdateScheduleDraftRequest {
  scheduledate?: string;
  starttime?: string;
  endtime?: string;
  lunchminutes?: number;
  action?: 'create' | 'update' | 'delete';
  referencescheduleid?: string;
  updatedby?: string;
} 