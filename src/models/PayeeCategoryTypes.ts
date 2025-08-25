export interface PayeeCategoryType {
  code: string;
  displayName: string;
  icon: string;
  color: string;
}

export const PAYEE_CATEGORY_TYPES: PayeeCategoryType[] = [
  { 
    code: 'VENDOR', 
    displayName: 'Vendor', 
    icon: '🏪',
    color: 'bg-blue-100 text-blue-800'
  },
  { 
    code: 'SERVICE_PROVIDER', 
    displayName: 'Service Provider', 
    icon: '🔧',
    color: 'bg-purple-100 text-purple-800'
  },
  { 
    code: 'CONTRACTOR', 
    displayName: 'Contractor', 
    icon: '👷',
    color: 'bg-orange-100 text-orange-800'
  },
  { 
    code: 'SUPPLIER', 
    displayName: 'Supplier', 
    icon: '📦',
    color: 'bg-green-100 text-green-800'
  },
  { 
    code: 'UTILITY_COMPANY', 
    displayName: 'Utility Company', 
    icon: '⚡',
    color: 'bg-yellow-100 text-yellow-800'
  },
  { 
    code: 'INSURANCE_COMPANY', 
    displayName: 'Insurance Company', 
    icon: '🛡️',
    color: 'bg-indigo-100 text-indigo-800'
  },
  { 
    code: 'BANK', 
    displayName: 'Bank', 
    icon: '🏦',
    color: 'bg-green-100 text-green-800'
  },
  { 
    code: 'GOVERNMENT', 
    displayName: 'Government', 
    icon: '🏛️',
    color: 'bg-red-100 text-red-800'
  },
  { 
    code: 'EMPLOYEE', 
    displayName: 'Employee', 
    icon: '👤',
    color: 'bg-gray-100 text-gray-800'
  },
  { 
    code: 'OTHER', 
    displayName: 'Other', 
    icon: '📋',
    color: 'bg-gray-100 text-gray-800'
  },
];

export const getPayeeCategoryDisplayName = (code: string): string => {
  const categoryType = PAYEE_CATEGORY_TYPES.find(type => type.code === code);
  return categoryType ? categoryType.displayName : code;
};

export const getPayeeCategoryIcon = (code: string): string => {
  const categoryType = PAYEE_CATEGORY_TYPES.find(type => type.code === code);
  return categoryType ? categoryType.icon : '📋';
};

export const getPayeeCategoryColor = (code: string): string => {
  const categoryType = PAYEE_CATEGORY_TYPES.find(type => type.code === code);
  return categoryType ? categoryType.color : 'bg-gray-100 text-gray-800';
}; 