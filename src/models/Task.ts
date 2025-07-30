export interface Task {
  taskid: string;
  storenumber: number;
  taskname: string;
  taskdescription?: string;
  taskstatus?: string;
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