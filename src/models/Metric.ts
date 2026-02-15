export interface Metric {
  metricid: string;
  storenumber: number;
  name: string;
  description?: string | null;
  unit: string;
  valuetype: string;
  aggregationtype: string;
  isactive: boolean;
  createdby?: string;
  createdon?: string;
}

export interface CreateMetricRequest {
  storenumber: number;
  name: string;
  description?: string | null;
  unit: string;
  valuetype: string;
  aggregationtype: string;
  isactive: boolean;
  createdby?: string;
}

export interface UpdateMetricRequest {
  storenumber?: number;
  name?: string;
  description?: string | null;
  unit?: string;
  valuetype?: string;
  aggregationtype?: string;
  isactive?: boolean;
}
