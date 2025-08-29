import { useEffect, useState } from 'react';
import { getMessages, archiveMessage } from '../api';
import { FaEnvelope, FaSpinner, FaExclamationTriangle, FaClock, FaUser, FaStore, FaBell, FaPlus, FaArchive, FaFilter } from 'react-icons/fa';
import CreateMessage from '../components/CreateMessage';
import { useStore } from '../auth/StoreContext';
import { useAuth } from '../auth/AuthContext';

interface Message {
  messageid: string;
  storenumber: number;
  message: string;
  createdfor: string | null;
  notification: boolean;
  archivedon: string | null;
  createdby: string;
  createdon: string;
  creator: {
    email: string | null;
    lastname: string;
    firstname: string;
  },
  recipient: {
    email: string | null;
    lastname: string;
    firstname: string;
  }
}

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignedOnly, setShowAssignedOnly] = useState(false);
  const [includeArchived, setIncludeArchived] = useState<boolean | null>(false);
  const { selectedStore } = useStore();
  const { user, employeeId } = useAuth();

  useEffect(() => {
    console.log(`🔄 Messages useEffect - selectedStore: ${selectedStore}`);
    
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`🔄 Fetching messages for store: ${selectedStore}`);
        const data = await getMessages(includeArchived);
        console.log('Messages data:', data);
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if selectedStore is a valid number (not null, undefined, or 0)
    if (selectedStore !== null && selectedStore !== undefined) {
      console.log(`🔄 Loading messages for store: ${selectedStore}`);
      fetchMessages();
    } else {
      // Clear data only when no store is selected
      console.log(`🔄 No store selected, clearing messages data`);
      setMessages([]);
      setLoading(false);
      setError(null);
    }
  }, [selectedStore, includeArchived]);

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const isArchived = (message: Message) => {
    return message.archivedon !== null;
  };

  // Filter messages based on the toggle state
  const filteredMessages = showAssignedOnly 
    ? messages.filter(message => message.createdfor === employeeId)
    : messages;

  const handleArchiveMessage = async (messageId: string) => {
    try {
      await archiveMessage(messageId);
      // Refresh the messages list to show updated archive status
      // Re-fetch messages after archiving
      const data = await getMessages(includeArchived);
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error archiving message:', error);
      // You could add a toast notification here for better UX
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Error</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaEnvelope className="text-3xl text-blue-600" />
          <h2 className="text-2xl font-semibold">Messages</h2>
        </div>
        <div className="flex items-center gap-4">
          {/* Toggle Filters */}
          <div className="flex items-center gap-4">
            
            {/* Message Type Filter */}
            <div className="flex items-center gap-1 border-2 border-gray-300 rounded-md p-1 bg-gray-50">
              <button
                onClick={() => setShowAssignedOnly(false)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  !showAssignedOnly
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                All Messages
              </button>
              <button
                onClick={() => setShowAssignedOnly(true)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  showAssignedOnly
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                My Messages
              </button>
            </div>

            {/* Archive Status Filter */}
            <div className="flex items-center gap-1 border-2 border-gray-300 rounded-md p-1 bg-gray-50">
              <button
                onClick={() => setIncludeArchived(null)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  includeArchived === null
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                Include Archived
              </button>
              <button
                onClick={() => setIncludeArchived(false)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  includeArchived === false
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                Exclude Archived
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            New Message
          </button>
        </div>
      </div>

      {filteredMessages.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <FaEnvelope className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showAssignedOnly ? 'No Messages Assigned to You' : 'No Messages'}
          </h3>
          <p className="text-gray-600">
            {showAssignedOnly 
              ? 'You don\'t have any messages assigned to you at the moment.'
              : 'You don\'t have any messages at the moment.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created For
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By/On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                                  {filteredMessages.map((message) => (
                    <tr key={message.messageid} className={`hover:bg-gray-50 ${
                      isArchived(message) ? 'bg-gray-50 opacity-75' : ''
                    } ${
                      message.notification ? 'bg-red-50' : ''
                    }`}>
                      <td className={`px-6 py-4 w-1/2 ${
                        message.notification ? 'border-l-4 border-red-500' : ''
                      }`}>
                        <div className="max-w-full">
                          <div className="flex items-start gap-2">
                            {message.notification && (
                              <FaBell className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            )}
                            <p className="text-sm text-gray-900 whitespace-pre-wrap" title={message.message}>
                              {message.message}
                            </p>
                          </div>
                        </div>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 min-w-[120px]">
                      {message.createdfor ? (
                        <div className="flex items-center gap-1">
                          <FaUser className="w-4 h-4" />
                          <span>
                            {message.recipient.firstname} {message.recipient.lastname}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 min-w-[150px]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <FaUser className="w-4 h-4" />
                          <span>
                            {message.creator.firstname} {message.creator.lastname}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <FaClock className="w-4 h-4" />
                          <span>{formatTimestamp(message.createdon)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium min-w-[100px]">
                      {isArchived(message) ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          Archived
                        </span>
                      ) : message.createdfor === employeeId ? (
                        <button
                          onClick={() => handleArchiveMessage(message.messageid)}
                          className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors"
                          title="Archive message"
                        >
                          <FaArchive className="w-3 h-3" />
                          Archive
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Message Modal */}
      {showCreateModal && (
        <CreateMessage
          onMessageCreated={async () => {
            setShowCreateModal(false);
            // Re-fetch messages after creating a new message
            try {
              const data = await getMessages(includeArchived);
              setMessages(Array.isArray(data) ? data : []);
            } catch (error) {
              console.error('Error refreshing messages after creation:', error);
            }
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
} 