import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaDollarSign, FaCalendar, FaTag, FaFilter } from 'react-icons/fa';
import { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../models/Expense';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../api/expense';
import ExpenseModal from '../components/ExpenseModal';
import { useSelectedStore } from '../auth/useSelectedStore';

export default function Expenses() {
  const { selectedStore } = useSelectedStore();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [dateFilter, setDateFilter] = useState('current-month');

  // Load expenses when store or date filter changes
  useEffect(() => {
    if (selectedStore !== null) {
      loadExpenses();
    }
  }, [selectedStore, dateFilter]);

  const loadExpenses = async () => {
    if (selectedStore === null) return;
    
    try {
      setLoading(true);
      const { start, end } = getDateRange(dateFilter);
      
      // Convert dates to YYYY-MM-DD format
      const startDate = start.toISOString().split('T')[0];
      const endDate = end.toISOString().split('T')[0];
      
      // Debug logging
      console.log('Date Filter:', dateFilter);
      console.log('Start Date:', startDate);
      console.log('End Date:', endDate);
      
      const expensesData = await getExpenses(selectedStore, startDate, endDate);
      setExpenses(expensesData || []);
      console.log('expensesData', expensesData);
    } catch (error) {
      console.error('Error loading expenses:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };



  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowModal(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await deleteExpense(expenseId);
      await loadExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  const handleSaveExpense = async (data: CreateExpenseRequest | UpdateExpenseRequest) => {
    try {
      if (editingExpense) {
        // Update existing expense
        await updateExpense(editingExpense.expenseid!, data as UpdateExpenseRequest);
      } else {
        // Create new expense
        await createExpense(data as CreateExpenseRequest);
      }
      
      setShowModal(false);
      setEditingExpense(null);
      await loadExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense');
    }
  };

  const handleCancelModal = () => {
    setShowModal(false);
    setEditingExpense(null);
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format expense date - no timezone conversion, mm/dd/yyyy format
  const formatExpenseDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return `${month}/${day}/${year}`;
  };

  // Format created date - with timezone conversion, date and time
  const formatCreatedDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Date filter functions
  const getDateRange = (filter: string) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    console.log('Current date:', now);
    console.log('Current year:', currentYear);
    console.log('Current month (0-based):', currentMonth);
    
    switch (filter) {
      case 'current-month':
        const currentMonthStart = new Date(currentYear, currentMonth, 1);
        const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0);
        console.log('Current month start:', currentMonthStart);
        console.log('Current month end:', currentMonthEnd);
        return {
          start: currentMonthStart,
          end: currentMonthEnd
        };
      case 'last-month':
        return {
          start: new Date(currentYear, currentMonth - 1, 1),
          end: new Date(currentYear, currentMonth, 0)
        };
      case 'last-quarter':
        const quarterStart = Math.floor(currentMonth / 3) * 3;
        return {
          start: new Date(currentYear, quarterStart - 3, 1),
          end: new Date(currentYear, quarterStart, 0)
        };
      case 'ytd':
        return {
          start: new Date(currentYear, 0, 1),
          end: now
        };
      case 'last-year':
        return {
          start: new Date(currentYear - 1, 0, 1),
          end: new Date(currentYear - 1, 11, 31)
        };
      default:
        return {
          start: new Date(currentYear, currentMonth, 1),
          end: new Date(currentYear, currentMonth + 1, 0)
        };
    }
  };

  const getFilteredExpenses = () => {
    // Since we're now getting filtered data from the server, just return the expenses
    return expenses;
  };

  const getFilteredTotal = () => {
    return getFilteredExpenses().reduce((sum, expense) => sum + expense.expenseamount, 0);
  };

  // Calculate total expenses (now using filtered data)
  const totalExpenses = getFilteredTotal();

  if (selectedStore === null) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Please select a store to manage expenses.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
          <p className="text-gray-600">Track and manage store expenses</p>

        </div>
        <div className="flex items-center gap-4">
          {/* Date Filter */}
          <div className="relative">
            <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 transition-colors duration-200">
              <div className="flex items-center gap-2 px-4 py-2 border-r border-gray-200">
                <FaFilter className="text-blue-500 text-sm" />
                <span className="text-sm font-medium text-gray-700">Period</span>
              </div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-gray-900 cursor-pointer appearance-none pr-8"
                style={{ fontFamily: 'inherit' }}
              >
                <option value="current-month" style={{ fontFamily: 'inherit', fontWeight: 'normal' }}>📅 Current Month</option>
                <option value="last-month" style={{ fontFamily: 'inherit', fontWeight: 'normal' }}>📅 Last Month</option>
                <option value="last-quarter" style={{ fontFamily: 'inherit', fontWeight: 'normal' }}>📊 Last Quarter</option>
                <option value="ytd" style={{ fontFamily: 'inherit', fontWeight: 'normal' }}>📈 YTD</option>
                <option value="last-year" style={{ fontFamily: 'inherit', fontWeight: 'normal' }}>📅 Last Year</option>
              </select>
              <div className="absolute right-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <button
            onClick={handleAddExpense}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus />
            Add Expense
          </button>
        </div>
      </div>





      {/* Expenses Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Expense Records</h2>
          <p className="text-lg font-semibold text-green-600">
            Total: {formatCurrency(getFilteredTotal())}
          </p>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading expenses...
          </div>
        ) : getFilteredExpenses().length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No expenses found for the selected period. Try changing the date filter or add new expenses.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payee / Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By / Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredExpenses().map((expense) => (
                  <tr key={expense.expenseid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatExpenseDate(expense.expensedate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={expense.expensedescription}>
                        {expense.expensedescription || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {formatCurrency(expense.expenseamount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {expense.expensecategory?.expensecategoryname || 'Unknown Category'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {expense.payee?.payeename || 'Unknown Payee'}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {expense.paymentaccount?.accountname || 'Unknown Account'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {expense.employee?.firstname + ' ' + expense.employee?.lastname || '-'}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {expense.createdon ? formatCreatedDate(expense.createdon) : '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.expenseid!)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expense Modal */}
      {showModal && selectedStore !== null && (
        <ExpenseModal
          expense={editingExpense}
          storeNumber={selectedStore}
          onSave={handleSaveExpense}
          onDelete={handleDeleteExpense}
          onCancel={handleCancelModal}
        />
      )}


    </div>
  );
} 