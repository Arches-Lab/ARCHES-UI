export interface PaymentAccountType {
  code: string;
  displayName: string;
  icon: string;
  color: string;
}

export const PAYMENT_ACCOUNT_TYPES: PaymentAccountType[] = [
  { 
    code: 'BUSINESS_CHECKING', 
    displayName: 'Business Checking', 
    icon: '🏢',
    color: 'bg-green-100 text-green-800'
  },
  { 
    code: 'BUSINESS_SAVINGS', 
    displayName: 'Business Savings', 
    icon: '🏦',
    color: 'bg-purple-100 text-purple-800'
  },
  { 
    code: 'BUSINESS_CREDIT_CARD', 
    displayName: 'Business Credit Card', 
    icon: '💳',
    color: 'bg-red-100 text-red-800'
  },
  { 
    code: 'BUSINESS_DEBIT_CARD', 
    displayName: 'Business Debit Card', 
    icon: '💳',
    color: 'bg-orange-100 text-orange-800'
  },
  { 
    code: 'CASH', 
    displayName: 'Cash', 
    icon: '💰',
    color: 'bg-green-100 text-green-800'  
  },
  { 
    code: 'OTHER', 
    displayName: 'Other', 
    icon: '📋',
    color: 'bg-gray-100 text-gray-800'
  },
];

export const getPaymentAccountTypeDisplayName = (code: string): string => {
  const accountType = PAYMENT_ACCOUNT_TYPES.find(type => type.code === code);
  return accountType ? accountType.displayName : code;
};

export const getPaymentAccountTypeIcon = (code: string): string => {
  const accountType = PAYMENT_ACCOUNT_TYPES.find(type => type.code === code);
  return accountType ? accountType.icon : '📋';
};

export const getPaymentAccountTypeColor = (code: string): string => {
  const accountType = PAYMENT_ACCOUNT_TYPES.find(type => type.code === code);
  return accountType ? accountType.color : 'bg-gray-100 text-gray-800';
}; 