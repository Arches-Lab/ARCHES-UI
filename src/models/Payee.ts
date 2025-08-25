export interface Payee {
  payeeid?: string;
  storenumber: number;
  payeename: string;
  category: string;
  createdby: string;
  createdon?: string;
}

export interface CreatePayeeRequest {
  storenumber: number;
  payeename: string;
  category: string;
  createdby: string;
}

export interface UpdatePayeeRequest {
  payeename: string;
  category: string;
} 