export interface Expense {
  expenseid?: string;
  storenumber: number;
  expensecategoryid: string;
  expensecategory: {
    expensecategoryid: string;
    expensecategoryname: string;
  }  
  payeeid: string;
  payee: {
    payeeid: string;
    payeename: string;
  }
  paymentaccountid: string;
  paymentaccount: {
    paymentaccountid: string;
    accountname: string;
  }
  expensedescription: string;
  expenseamount: number;
  expensedate: string;
  createdby: string;
  employee: {
    firstname: string;
    lastname: string;
    email: string;
  };
  createdon?: string;
}

export interface CreateExpenseRequest {
  storenumber: number;
  expensecategoryid: string;
  payeeid: string;
  paymentaccountid: string;
  expensedescription: string;
  expenseamount: number;
  expensedate: string;
  createdby: string;
}

export interface UpdateExpenseRequest {
  expensecategoryid: string;
  payeeid: string;
  paymentaccountid: string;
  expensedescription: string;
  expenseamount: number;
  expensedate: string;
} 