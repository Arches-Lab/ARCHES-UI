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
  const { selectedStore } = useStore();
  const { user, employeeId } = useAuth();

  useEffect(() => {
    console.log(`🔄 Messages useEffect - selectedStore: ${selectedStore}`);
    
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`🔄 Fetching messages for store: ${selectedStore}`);
        const data = await getMessages();
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
  }, [selectedStore]);

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
      const data = await getMessages();
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
          {/* Toggle Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="w-4 h-4 text-gray-500" />
            <button
              onClick={() => setShowAssignedOnly(!showAssignedOnly)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                showAssignedOnly
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {showAssignedOnly ? 'My Messages' : 'All Messages'}
            </button>
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
          <div className="divide-y divide-gray-200">
            {filteredMessages.map((message) => (
              <div
                key={message.messageid}
                className={`p-6 transition-all hover:bg-gray-50 ${
                  isArchived(message) 
                    ? 'bg-gray-50 opacity-75' 
                    : 'bg-white'
                }`}
              >
                <div className="flex items-top justify-between mb-3">
                  <div className="flex-1 pr-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs text-gray-500 min-w-[200px]">
                    {message.notification && (
                      <button className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        <FaBell className="w-3 h-3" />
                        <span>Notification</span>
                      </button>
                    )}
                    <div className="flex items-center gap-1">
                      <FaClock className="w-3 h-3" />
                      <span>Created On: {formatTimestamp(message.createdon)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaUser className="w-3 h-3" />
                      <span>Created By: {message.creator.firstname} {message.creator.lastname}</span>
                    </div>
                    {message.createdfor && (
                      <div className="flex items-center gap-1">
                        <FaUser className="w-3 h-3" />
                        <span>Created For: {message.recipient.firstname} {message.recipient.lastname}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    {isArchived(message) && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        Archived
                      </span>
                    )}
                  </div>
                  {message.archivedon && (
                    <div className="flex items-center gap-1">
                      <span>Archived: {formatTimestamp(message.archivedon)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
              const data = await getMessages();
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