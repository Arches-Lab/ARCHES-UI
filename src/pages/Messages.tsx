import { useEffect, useState } from 'react';
import { getMessages, archiveMessage } from '../api';
import { FaEnvelope, FaSpinner, FaExclamationTriangle, FaClock, FaUser, FaStore, FaBell, FaPlus, FaArchive } from 'react-icons/fa';
import CreateMessage from '../components/CreateMessage';

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

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
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

  useEffect(() => {
    fetchMessages();
  }, []);

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

  const handleArchiveMessage = async (messageId: string) => {
    try {
      await archiveMessage(messageId);
      // Refresh the messages list to show updated archive status
      fetchMessages();
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
          <div className="text-sm text-gray-600">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
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

      {messages.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <FaEnvelope className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages</h3>
          <p className="text-gray-600">You don't have any messages at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.messageid}
              className={`bg-white border rounded-lg shadow-sm p-6 transition-all hover:shadow-md ${
                isArchived(message) 
                  ? 'border-gray-200 bg-gray-50 opacity-75' 
                  : 'border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <FaStore className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Store {message.storenumber}
                    </span>
                  </div>
                  {message.notification && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      <FaBell className="w-3 h-3" />
                      Notification
                    </span>
                  )}
                  {isArchived(message) && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      Archived
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <FaClock className="w-3 h-3" />
                    <span>{formatTimestamp(message.createdon)}</span>
                  </div>
                  {!isArchived(message) && (
                    <button
                      onClick={() => handleArchiveMessage(message.messageid)}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                      title="Archive message"
                    >
                      <FaArchive className="w-3 h-3" />
                      Archive
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <FaUser className="w-3 h-3" />
                    <span>Created by: {message.creator.firstname} {message.creator.lastname}</span>
                  </div>
                  {message.createdfor && (
                    <div className="flex items-center gap-1">
                      <span>For: {message.recipient.firstname} {message.recipient.lastname}</span>
                    </div>
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
      )}

      {/* Create Message Modal */}
      {showCreateModal && (
        <CreateMessage
          onMessageCreated={() => {
            setShowCreateModal(false);
            fetchMessages(); // Refresh the messages list
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
} 