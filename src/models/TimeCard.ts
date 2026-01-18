export interface TimeCard {
  timecardid: string;           // UUID PRIMARY KEY
  storenumber: number;          // INT NOT NULL
  employeeid: string;           // UUID NOT NULL
  timecarddate: string;         // DATE NOT NULL (YYYY-MM-DD format)
  clockin: string;              // TIME NOT NULL (HH:MM:SS format)
  clockout: string;             // TIME NOT NULL (HH:MM:SS format)
  durationhours: number;         // NUMERIC(10,2) - Generated field
  durationminutes: number;      // NUMERIC(10,2) - Generated field
  sessiontype: string;          // TEXT NOT NULL
  notes: string | null;         // TEXT (nullable)
  createdby: string;            // UUID NOT NULL
  createdon: string;            // TIMESTAMPTZ NOT NULL
  updatedby: string;            // UUID NOT NULL
  updatedon: string;            // TIMESTAMPTZ NOT NULL
}

export interface TimeCardStatus {
  isClockedIn: boolean;
  currentDuration: {
    hours: number;
    minutes: number;
  } | null;
  status: string;
  lastClockIn: string | null;
  sessionType: string | null;
}

// TimeCard Summary View (v_timecardsummary)
export interface TimeCardSummary {
  employeeid: string;           // UUID - Employee ID
  storenumber: number;          // INT - Store number
  timecarddate: string;         // DATE - Date of the timecard (YYYY-MM-DD format)
  firstname: string;            // TEXT - Employee first name
  lastname: string;             // TEXT - Employee last name
  email: string;                // TEXT - Employee email
  workhours: number;            // NUMERIC - Total work hours
  breakhours: number;           // NUMERIC - Total break hours
  nethours: number;             // NUMERIC - Net hours (work - break)
}