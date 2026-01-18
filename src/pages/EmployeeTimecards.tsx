import React, { useState, useEffect, useRef } from 'react';
import { FaUsers, FaSpinner, FaUser, FaChevronDown, FaSearch, FaCalendarAlt } from 'react-icons/fa';
import { getEmployees } from '../api/employee';
import { getPayPeriods } from '../api/payPeriod';
import EmployeeTimeCardSummary from '../components/EmployeeTimeCardSummary';
import { Employee } from '../models/Employee';
import { PayPeriod } from '../models/PayPeriod';
import { useAuth } from '../auth/AuthContext';
import { logDebug, logError } from '../utils/logger';

interface EmployeeTimecardsProps {
  useCurrentUser?: boolean;
}

export default function EmployeeTimecards({ useCurrentUser = false }: EmployeeTimecardsProps) {
  const { storeNumber, employeeId, user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [selectedPayPeriod, setSelectedPayPeriod] = useState<PayPeriod | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPayPeriodDropdownOpen, setIsPayPeriodDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const payPeriodDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!useCurrentUser) {
      loadEmployees();
    }
    loadPayPeriods();
  }, [storeNumber, useCurrentUser]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (payPeriodDropdownRef.current && !payPeriodDropdownRef.current.contains(event.target as Node)) {
        setIsPayPeriodDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      logDebug('Loading employees for timecard view');
      const data = await getEmployees(true); // Only get active employees
      logDebug('Received employees:', data);
      setEmployees(data);
    } catch (err: any) {
      logError('Error loading employees:', err);
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const loadPayPeriods = async () => {
    try {
      logDebug('Loading pay periods for store:', storeNumber);
      const data = await getPayPeriods();
      logDebug('Received pay periods:', data);
      setPayPeriods(data);
      // Select the first pay period by default
      if (data.length > 0) {
        setSelectedPayPeriod(data[0]);
      }
    } catch (err: any) {
      logError('Error loading pay periods:', err);
      setError('Failed to load pay periods');
    }
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const handlePayPeriodSelect = (payPeriod: PayPeriod) => {
    setSelectedPayPeriod(payPeriod);
    setIsPayPeriodDropdownOpen(false);
  };

  const getEmployeeDisplayName = (employee: Employee) => {
    return `${employee.firstname} ${employee.lastname}`;
  };

  const formatPayPeriodName = (payPeriod: PayPeriod) => {
    return payPeriod.periodname || `${payPeriod.startdate} - ${payPeriod.enddate}`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Employee Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <FaUsers className="text-2xl text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              {useCurrentUser ? 'My Timecards' : 'Employee Timecards'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Pay Period Dropdown */}
            <div className="relative w-64" ref={payPeriodDropdownRef}>
              <button
                onClick={() => setIsPayPeriodDropdownOpen(!isPayPeriodDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-blue-600" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {selectedPayPeriod ? formatPayPeriodName(selectedPayPeriod) : 'Select pay period...'}
                    </div>
                  </div>
                </div>
                <FaChevronDown className={`text-gray-400 transition-transform duration-200 ${isPayPeriodDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Pay Period Dropdown Menu */}
              {isPayPeriodDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {payPeriods.length > 0 ? (
                    payPeriods.map((payPeriod) => (
                      <button
                        key={payPeriod.payperiodid}
                        onClick={() => handlePayPeriodSelect(payPeriod)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150 text-left"
                      >
                        <FaCalendarAlt className="text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {formatPayPeriodName(payPeriod)}
                          </div>
                          <div className="text-xs text-gray-400">
                            Status: {payPeriod.status}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <FaCalendarAlt className="text-2xl mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No pay periods found</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Employee Dropdown - Only show if not using current user */}
            {!useCurrentUser && (
              <div className="relative w-80" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                {selectedEmployee ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                      {selectedEmployee.firstname.charAt(0)}{selectedEmployee.lastname.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {getEmployeeDisplayName(selectedEmployee)}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <FaUser className="text-gray-500 text-sm" />
                    </div>
                    <span className="text-gray-500">Select an employee...</span>
                  </div>
                )}
              </div>
              <FaChevronDown className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
                {/* Employee List */}
                <div className="max-h-60 overflow-y-auto">
                  {employees.length > 0 ? (
                    employees.map((employee) => (
                      <button
                        key={employee.employeeid}
                        onClick={() => handleEmployeeSelect(employee)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150 text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                          {employee.firstname.charAt(0)}{employee.lastname.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {getEmployeeDisplayName(employee)}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <FaUser className="text-2xl mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No employees found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
              </div>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading && !useCurrentUser && (
          <div className="mt-4 text-center py-4">
            <FaSpinner className="animate-spin text-lg text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading employees...</p>
          </div>
        )}
      </div>

      {/* Timecard Summary */}
      {((useCurrentUser && selectedPayPeriod) || (selectedEmployee && selectedPayPeriod)) && (
        <EmployeeTimeCardSummary
          targetEmployeeId={useCurrentUser ? (employeeId || undefined) : selectedEmployee?.employeeid}
          name={useCurrentUser ? 'My' : getEmployeeDisplayName(selectedEmployee!)}
          startDate={selectedPayPeriod.startdate}
          endDate={selectedPayPeriod.enddate}
        />
      )}

      {/* No Selection Message */}
      {((useCurrentUser && !selectedPayPeriod) || (!useCurrentUser && (!selectedEmployee || !selectedPayPeriod))) && !loading && (!useCurrentUser ? employees.length > 0 : true) && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <FaUser className="text-4xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {useCurrentUser ? 'No Pay Period Selected' : (!selectedEmployee ? 'No Employee Selected' : 'No Pay Period Selected')}
            </h3>
            <p className="text-gray-500">
              {useCurrentUser 
                ? 'Please select a pay period from the header to view your timecard information.'
                : (!selectedEmployee 
                  ? 'Please select an employee from the header to view their timecard information.'
                  : 'Please select a pay period from the header to view timecard information.'
                )
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}