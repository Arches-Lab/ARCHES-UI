export interface Lead {
  leadid: string;
  storenumber: number;
  description: string;
  contactname: string | null;
  phone: string | null;
  email: string | null;
  createdby: string;
  creator: {
    email: string | null;
    lastname: string;
    firstname: string;
  };
  createdon: string;
  assignedto: string | null;
  assigned: {
    email: string | null;
    lastname: string;
    firstname: string;
  };
  status: string;
} 