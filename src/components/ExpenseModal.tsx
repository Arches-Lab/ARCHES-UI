import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaEdit, FaTrash, FaChevronDown, FaTag, FaUser, FaCreditCard } from 'react-icons/fa';
import { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../models/Expense';
import { ExpenseCategory } from '../models/ExpenseCategory';
import { Payee } from '../models/Payee';
import { PaymentAccount } from '../models/PaymentAccount';
import { getExpenseCategories } from '../api/expenseCategory';
import { getPayees } from '../api/payee';
import { getPaymentAccounts } from '../api/paymentAccount';

interface ExpenseModalProps {
  expense?: Expense | null;
  storeNumber: number;
  onSave: (data: CreateExpenseRequest | UpdateExpenseRequest) => void;
  onDelete?: (expenseId: string) => void;
  onCancel: () => void;
}

export default function ExpenseModal({ 
  expense, 
  storeNumber,
  onSave, 
  onDelete, 
  onCancel 
}: ExpenseModalProps) {
  const [formData, setFormData] = useState({
    expensecategoryid: '',
    payeeid: '',
    paymentaccountid: '',
    expensedescription: '',
    expenseamount: '',
    expensedate: ''
  });

  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [payees, setPayees] = useState<Payee[]>([]);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [loading, setLoading] = useState(false);

  const isEditing = !!expense;

  // Load categories, payees, and payment accounts when modal opens
  useEffect(() => {
    if (storeNumber) {
      loadCategories();
      loadPayees();
      loadPaymentAccounts();
    }
  }, [storeNumber]);

  // Set form data when expense changes
  useEffect(() => {
    if (expense) {
      setFormData({
        expensecategoryid: expense.expensecategoryid,
        payeeid: expense.payeeid,
        paymentaccountid: expense.paymentaccountid,
        expensedescription: expense.expensedescription,
        expenseamount: expense.expenseamount.toString(),
        expensedate: expense.expensedate.split('T')[0] // Convert to YYYY-MM-DD format
      });
    } else {
      setFormData({
        expensecategoryid: '',
        payeeid: '',
        paymentaccountid: '',
        expensedescription: '',
        expenseamount: '',
        expensedate: new Date().toISOString().split('T')[0] // Default to today
      });
    }
  }, [expense]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await getExpenseCategories(storeNumber);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPayees = async () => {
    try {
      const payeesData = await getPayees(storeNumber);
      setPayees(payeesData || []);
    } catch (error) {
      console.error('Error loading payees:', error);
      setPayees([]);
    }
  };

  const loadPaymentAccounts = async () => {
    try {
      const paymentAccountsData = await getPaymentAccounts(storeNumber);
      setPaymentAccounts(paymentAccountsData || []);
    } catch (error) {
      console.error('Error loading payment accounts:', error);
      setPaymentAccounts([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.expensecategoryid.trim()) {
      alert('Please select an expense category');
      return;
    }

    if (!formData.payeeid.trim()) {
      alert('Please select a payee');
      return;
    }

    if (!formData.paymentaccountid.trim()) {
      alert('Please select a payment account');
      return;
    }

    if (!formData.expensedescription.trim()) {
      alert('Please enter an expense description');
      return;
    }

    if (!formData.expenseamount.trim() || isNaN(Number(formData.expenseamount)) || Number(formData.expenseamount) <= 0) {
      alert('Please enter a valid expense amount');
      return;
    }

    if (!formData.expensedate.trim()) {
      alert('Please select an expense date');
      return;
    }



    if (isEditing) {
      // Update existing expense
      const updateData: UpdateExpenseRequest = {
        expensecategoryid: formData.expensecategoryid,
        payeeid: formData.payeeid,
        paymentaccountid: formData.paymentaccountid,
        expensedescription: formData.expensedescription.trim(),
        expenseamount: Number(formData.expenseamount),
        expensedate: formData.expensedate
      };
      onSave(updateData);
    } else {
      // Create new expense
      const createData: CreateExpenseRequest = {
        storenumber: storeNumber,
        expensecategoryid: formData.expensecategoryid,
        payeeid: formData.payeeid,
        paymentaccountid: formData.paymentaccountid,
        expensedescription: formData.expensedescription.trim(),
        expenseamount: Number(formData.expenseamount),
        expensedate: formData.expensedate,
        createdby: 'current-user' // This should come from auth context
      };
      onSave(createData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Custom Dropdown Component
  const CustomDropdown = ({ 
    name, 
    value, 
    onChange, 
    options, 
    placeholder, 
    icon, 
    disabled = false 
  }: {
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    placeholder: string;
    icon: React.ReactNode;
    disabled?: boolean;
  }) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <div className="text-gray-400">
          {icon}
        </div>
      </div>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${
          disabled ? 'bg-gray-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'
        } transition-colors duration-200`}
        disabled={disabled}
      >
        <option value="" className="text-gray-500">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-gray-900">
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <FaChevronDown className="text-gray-400 text-sm" />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Date Row */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                name="expensedate"
                value={formData.expensedate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Amount and Payment Account Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Expense Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="expenseamount"
                    value={formData.expenseamount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Payment Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Account *
                </label>
                <CustomDropdown
                  name="paymentaccountid"
                  value={formData.paymentaccountid}
                  onChange={handleInputChange}
                  options={paymentAccounts.map((account) => ({
                    value: account.paymentaccountid || '',
                    label: `${account.accountname}`
                  }))}
                  placeholder="Select a payment account"
                  icon={<FaCreditCard className="text-sm" />}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Expense Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="expensedescription"
                value={formData.expensedescription}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter expense description"
                rows={3}
                required
              />
            </div>

            {/* Category and Payee Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Expense Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <CustomDropdown
                  name="expensecategoryid"
                  value={formData.expensecategoryid}
                  onChange={handleInputChange}
                  options={categories.map((category) => ({
                    value: category.expensecategoryid || '',
                    label: category.expensecategoryname
                  }))}
                  placeholder="Select a category"
                  icon={<FaTag className="text-sm" />}
                  disabled={loading}
                />
              </div>

              {/* Payee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payee *
                </label>
                <CustomDropdown
                  name="payeeid"
                  value={formData.payeeid}
                  onChange={handleInputChange}
                  options={payees.map((payee) => ({
                    value: payee.payeeid || '',
                    label: `${payee.payeename}`
                  }))}
                  placeholder="Select a payee"
                  icon={<FaUser className="text-sm" />}
                  disabled={loading}
                />
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(expense!.expenseid!)}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaTrash />
                Delete
              </button>
            )}
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <FaSave />
              {isEditing ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 