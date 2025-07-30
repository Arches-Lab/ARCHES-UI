export interface Activity {
  activityid: string;
  storenumber: number;
  parentid: string;
  parenttypecode: string;
  activitytypecode: string;
  details: string;
  createdby: string;
  creator: {
    email: string | null;
    lastname: string;
    firstname: string;
  };
  createdon: string;
} 