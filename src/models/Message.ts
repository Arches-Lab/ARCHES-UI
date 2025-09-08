export interface Message {
  messageid: string;
  storenumber: number;
  message: string;
  createdfor: string | null;
  notification: boolean;
  archivedon: string | null;
  readon: string | null;
  createdby: string;
  createdon: string;
  creator: {
    email: string | null;
    lastname: string;
    firstname: string;
  };
  recipient: {
    email: string | null;
    lastname: string;
    firstname: string;
  };
}