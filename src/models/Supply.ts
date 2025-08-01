export interface Supply {
  supplyid: string;
  storenumber: number;
  supplyname: string;
  quantity: number;
  archivedon?: string;
  archivedby?: string;
  archiver?: { email: string | null; lastname: string; firstname: string; };
  createdby: string;
  creator: { email: string | null; lastname: string; firstname: string; };
  createdon: string;
} 