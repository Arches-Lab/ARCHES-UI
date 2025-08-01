export interface EmployeeRole {
  code: string;
  displayName: string;
}

export const EMPLOYEE_ROLES: EmployeeRole[] = [
  { code: 'OWNER', displayName: 'Owner' },
  { code: 'ADMIN', displayName: 'Admin' },
  { code: 'MANAGER', displayName: 'Manager' },
  { code: 'ASSOCIATE', displayName: 'Associate' },
];

export const getEmployeeRoleDisplayName = (code: string): string => {
  const employeeRole = EMPLOYEE_ROLES.find(role => role.code === code);
  return employeeRole ? employeeRole.displayName : code;
}; 
 