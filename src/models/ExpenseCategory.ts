export interface ExpenseCategory {
  expensecategoryid?: string;
  storenumber: number;
  expensecategoryname: string;
  expensecategorydescription: string;
  createdby: string;
  createdon?: string;
}

export interface CreateExpenseCategoryRequest {
  storenumber: number;
  expensecategoryname: string;
  expensecategorydescription: string;
  createdby: string;
}

export interface UpdateExpenseCategoryRequest {
  expensecategoryname: string;
  expensecategorydescription: string;
} 