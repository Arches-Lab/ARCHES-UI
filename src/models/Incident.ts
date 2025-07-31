export interface Incident {
  incidentid: string;
  storenumber: number;
  incidenttypecode: string;
  title: string;
  description: string;
  status: string;
  casenumber?: string;
  assignedto?: string;
  assignee: {
    email: string | null;
    lastname: string;
    firstname: string;
  };
  createdby: string;
  creator: {
    email: string | null;
    lastname: string;
    firstname: string;
  };
  createdon: string;
} 