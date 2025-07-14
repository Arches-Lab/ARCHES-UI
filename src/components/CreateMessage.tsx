import { useState, useEffect } from 'react';
import { createMessage, getEmployees } from '../api';
import { FaPlus, FaSpinner, FaTimes, FaBell, FaStore, FaUser } from 'react-icons/fa';
import { useStore } from '../auth/StoreContext';

interface Employee {
  id: string;
  employeeid: string;
  firstname: string;
  lastname: string;
  email: string;
  active: boolean;
}

interface CreateMessageProps {
  onMessageCreated: () => void;
  onCancel: () => void;
}

export default function CreateMessage({ onMessageCreated, onCancel }: CreateMessageProps) {
  const { selectedStore } = useStore();
  const [message, setMessage] = useState('');
  const [notification, setNotification] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch employees for recipient selection
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setEmployeesLoading(true);
        const data = await getEmployees();
        // Filter to only active employees
        const activeEmployees = Array.isArray(data) ? data.filter((emp: Employee) => emp.active) : [];
        setEmployees(activeEmployees);
        console.log("employees", activeEmployees);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employees for recipient selection');
      } finally {
        setEmployeesLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Message content is required');
      return;
    }

    if (!selectedStore) {
      setError('Please select a store first');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const messageData = {
        storenumber: selectedStore,
        message: message.trim(),
        notification,
        ...(selectedRecipient && { createdfor: selectedRecipient })
      };

      await createMessage(messageData);
      
      // Reset form
      setMessage('');
      setNotification(false);
      setSelectedRecipient('');
      
      // Notify parent component
      onMessageCreated();
    } catch (err) {
      console.error('Error creating message:', err);
      setError('Failed to create message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Message</h2>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Store Selection */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <FaStore className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Store {selectedStore}
            </span>
          </div>

          {/* Message Content */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Enter your message here..."
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Recipient Selection */}
          <div>
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
              Recipient (optional)
            </label>
            <select
              id="recipient"
              value={selectedRecipient}
              onChange={(e) => setSelectedRecipient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting || employeesLoading}
            >
              <option value="">Select a recipient</option>
              {employeesLoading ? (
                <option value="">Loading recipients...</option>
              ) : employees.length === 0 ? (
                <option value="">No active employees found.</option>
              ) : (
                employees.map((employee) => (
                  <option key={employee.employeeid} value={employee.employeeid}>
                    {employee.firstname} {employee.lastname}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Notification Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="notification"
              checked={notification}
              onChange={(e) => setNotification(e.target.checked)}
              disabled={isSubmitting}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="notification" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FaBell className="w-4 h-4 text-red-500" />
              Mark as notification
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FaPlus className="w-4 h-4" />
                  Create Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 