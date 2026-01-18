export enum PayPeriodStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  PROCESSING = 'PROCESSING'
}

// PayPeriod table schema
export interface PayPeriod {
  payperiodid: string;          // UUID PRIMARY KEY
  storenumber: number;          // INTEGER NOT NULL
  startdate: string;            // DATE NOT NULL (YYYY-MM-DD format)
  enddate: string;              // DATE NOT NULL (YYYY-MM-DD format)
  periodname: string;           // TEXT GENERATED - Auto-generated period name
  status: PayPeriodStatus;      // TEXT NOT NULL DEFAULT 'OPEN'
  createdon: string;            // TIMESTAMPTZ NOT NULL
  createdby: string;            // UUID NOT NULL
  closedon: string | null;      // TIMESTAMPTZ (nullable)
}