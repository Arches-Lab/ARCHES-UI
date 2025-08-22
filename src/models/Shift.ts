export interface Shift {
  shiftid: string;
  storenumber: number;
  starttime: string;
  endtime: string;
  totalhours: number;
  lunchminutes: number;
  createdby: string;
  createdon: string;
}

export interface CreateShiftRequest {
  storenumber: number;
  starttime: string;
  endtime: string;
  lunchminutes: number;
}

export interface UpdateShiftRequest {
  starttime?: string;
  endtime?: string;
  lunchminutes?: number;
} 