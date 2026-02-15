export interface Creator {
  firstname?: string;
  lastname?: string;
  email?: string;
}

export interface MetricLog {
  metriclogid?: string;
  metricid: string;
  storenumber: number;
  logdate: string;
  logvalue: number;
  notes?: string;
  createdby: string;
  createdon?: string;
  creator?: Creator;
}

export interface CreateMetricLogRequest {
  metricid: string;
  storenumber: number;
  logdate: string;
  logvalue: number;
  notes?: string | null;
  createdby?: string;
}

export interface MetricTrendResponse {
  labels: string[];
  values: number[];
}
