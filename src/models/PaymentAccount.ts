export interface PaymentAccount {
  paymentaccountid?: string;
  storenumber: number;
  accountname: string;
  accounttype: string;
  createdby: string;
  createdon?: string;
}

export interface CreatePaymentAccountRequest {
  storenumber: number;
  accountname: string;
  accounttype: string;
  createdby: string;
}

export interface UpdatePaymentAccountRequest {
  accountname: string;
  accounttype: string;
} 