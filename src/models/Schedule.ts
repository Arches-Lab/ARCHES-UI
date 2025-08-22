export interface Schedule {
  scheduleid: string;
  storenumber: number;
  employeeid: string;
  employee: {
    firstname: string;
    lastname: string;
    email: string;
  };
  scheduledate: string;
  starttime: string;
  endtime: string;
  lunchminutes?: number;
  createdby: string;
  creator: {
    firstname: string;
    lastname: string;
    email: string;
  };
  createdon: string;
}

export interface CreateScheduleRequest {
  storenumber: number;
  employeeid: string;
  scheduledate: string;
  starttime: string;
  endtime: string;
  lunchminutes?: number;
}

export interface UpdateScheduleRequest {
  employeeid?: string;
  scheduledate?: string;
  starttime?: string;
  endtime?: string;
  lunchminutes?: number;
} 