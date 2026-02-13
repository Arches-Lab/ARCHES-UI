import { useEffect, useState } from 'react';
import { getMessages, archiveMessage, readMessage } from '../api';
import { FaEnvelope, FaSpinner, FaExclamationTriangle, FaClock, FaUser, FaInbox, FaPlus, FaEye, FaArchive, FaBell } from 'react-icons/fa';
import CreateMessage from '../components/CreateMessage';
import { useStore } from '../auth/StoreContext';
import { useAuth } from '../auth/AuthContext';
import { Message } from '../models';

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [showAssignedOnly, setShowAssignedOnly] = useState(false);
  const [includeArchived, setIncludeArchived] = useState<boolean | null>(false);
  const [collapsedThreadIds, setCollapsedThreadIds] = useState<Record<string, boolean>>({});
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

  type ThreadMessage = {
    messageId: string;
    parentMessageId: string | null;
    content: string;
    createdAt: string;
    senderName: string;
    recipientName: string;
    raw: Message;
  };

  const normalizeMessage = (message: Message): ThreadMessage => {
    // Supports both the new message shape and the existing model fields.
    const messageId = (message as unknown as { messageId?: string }).messageId ?? (message as unknown as { messageid: string }).messageid;
    const parentMessageId =
      (message as unknown as { parentMessageId?: string | null }).parentMessageId ??
      ((message as unknown as { parentmessageid?: number | string | null }).parentmessageid ?? null);
    const content =
      (message as unknown as { content?: string }).content ?? (message as unknown as { message: string }).message ?? '';
    const createdAt =
      (message as unknown as { createdAt?: string }).createdAt ?? (message as unknown as { createdon: string }).createdon ?? '';
    const senderName =
      (message as unknown as { senderName?: string }).senderName ??
      ((message as unknown as { creator?: { firstname?: string; lastname?: string } }).creator
        ? `${(message as unknown as { creator: { firstname?: string } }).creator.firstname ?? ''} ${(message as unknown as {
            creator: { lastname?: string };
          }).creator.lastname ?? ''}`.trim()
        : 'Unknown');
    const recipient =
      (message as unknown as { recipient?: { firstname?: string; lastname?: string } | null }).recipient;
    const recipientName = recipient
      ? `${recipient.firstname ?? ''} ${recipient.lastname ?? ''}`.trim() || 'All'
      : 'All';

    return {
      messageId,
      parentMessageId: parentMessageId ? parentMessageId.toString() : null,
      content,
      createdAt,
      senderName,
      recipientName,
      raw: message,
    };
  };

  const normalizedMessages = filteredMessages.map(normalizeMessage);
  const messagesById = new Map<string, ThreadMessage>();
  const childrenByParentId = new Map<string, ThreadMessage[]>();
  normalizedMessages.forEach((message) => {
    messagesById.set(message.messageId, message);
    const key = message.parentMessageId ?? 'root';
    const siblings = childrenByParentId.get(key);
    if (siblings) {
      siblings.push(message);
    } else {
      childrenByParentId.set(key, [message]);
    }
  });

  const getTimestamp = (timestamp: string) => {
    const parsed = new Date(timestamp).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const rootMessages = normalizedMessages.filter((message) => {
    if (!message.parentMessageId) {
      return true;
    }
    return !messagesById.has(message.parentMessageId);
  });

  const toggleReplies = (messageId: string) => {
    setCollapsedThreadIds((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const handleReply = (message: ThreadMessage) => {
    setReplyToMessage(message.raw);
    setShowCreateModal(true);
  };

  const handleArchiveMessage = async (messageId: string) => {
    try {
      await archiveMessage(messageId);
      const data = await getMessages(includeArchived);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error archiving message:', err);
    }
  };

  const handleReadMessage = async (messageId: string) => {
    try {
      await readMessage(messageId);
      const data = await getMessages(includeArchived);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const renderThread = (message: ThreadMessage, depth: number) => {
    const children = childrenByParentId.get(message.messageId) ?? [];
    const sortedChildren = [...children].sort(
      (a, b) => getTimestamp(a.createdAt) - getTimestamp(b.createdAt)
    );
    const hasReplies = sortedChildren.length > 0;
    const isCollapsed = collapsedThreadIds[message.messageId] ?? false;
    const indent = depth * 24;
    const raw = message.raw;
    const isRecipient = raw.createdfor === employeeId;
    const isCreator = raw.createdby === employeeId;
    const isAllMessage = raw.createdfor === null || message.recipientName === 'All';
    const canManageAsCreator = isCreator && isAllMessage;

    return (
      <div key={message.messageId} style={{ marginLeft: indent }}>
        <div className={`border rounded-lg p-4 border-gray-200 space-y-3 ${raw.notification ? 'bg-red-50 border-l-4 border-l-red-500' : 'bg-white'}`}>
          <div className="flex items-start gap-2">
            {raw.notification && (
              <FaBell className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            )}
            <p className="text-sm text-gray-900 whitespace-pre-wrap" title={message.content}>
              {message.content}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-3 rounded-md border border-slate-300 bg-slate-100 px-3 py-1.5 text-slate-700">
              <div className="flex items-center gap-1">
                <FaInbox className="w-4 h-4 text-indigo-500" />
                <span>{message.recipientName}</span>
              </div>
              {!raw.readon && (isRecipient || canManageAsCreator) && (
                <button
                  onClick={() => handleReadMessage(message.messageId)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                  title="Mark as read"
                >
                  <FaEye className="w-4 h-4" />
                  Mark as read
                </button>
              )}
              {raw.readon && (!isAllMessage || canManageAsCreator) && (
                <div className="flex items-center gap-1 text-green-600" title="Read on">
                  <FaEye className="w-4 h-4" />
                  <span>{formatTimestamp(raw.readon)}</span>
                </div>
              )}
              {raw.archivedon ? (
                <div className="flex items-center gap-1 text-gray-600" title="Archived">
                  <FaArchive className="w-4 h-4" />
                  <span>{formatTimestamp(raw.archivedon)}</span>
                </div>
              ) : depth === 0 && raw.readon && (isRecipient || canManageAsCreator) && (
                <button
                  onClick={() => handleArchiveMessage(message.messageId)}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors"
                  title="Archive message"
                >
                  <FaArchive className="w-4 h-4" />
                  Archive
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 rounded-md border border-slate-300 bg-slate-100 px-3 py-1.5 text-slate-700">
              <div className="flex items-center gap-1">
                <FaUser className="w-4 h-4" />
                <span>{message.senderName}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaClock className="w-4 h-4" />
                <span>{formatTimestamp(message.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isRecipient && (
                <button
                  onClick={() => handleReply(message)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Reply
                </button>
              )}
              {hasReplies && (
                <button
                  onClick={() => toggleReplies(message.messageId)}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {isCollapsed ? 'Show replies' : 'Hide replies'}
                </button>
              )}
            </div>
          </div>
        </div>

        {!isCollapsed && hasReplies && (
          <div className="mt-3 space-y-3">
            {sortedChildren.map((child) => renderThread(child, depth + 1))}
          </div>
        )}
      </div>
    );
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
            onClick={() => {
              setReplyToMessage(null);
              setShowCreateModal(true);
            }}
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
        <div className="space-y-4">
          {rootMessages.map((message) => renderThread(message, 0))}
        </div>
      )}

      {/* Create Message Modal */}
      {showCreateModal && (
        <CreateMessage
          onMessageCreated={async () => {
            setShowCreateModal(false);
            setReplyToMessage(null);
            // Re-fetch messages after creating a new message
            try {
              const data = await getMessages(includeArchived);
              setMessages(Array.isArray(data) ? data : []);
            } catch (error) {
              console.error('Error refreshing messages after creation:', error);
            }
          }}
          onCancel={() => {
            setShowCreateModal(false);
            setReplyToMessage(null);
          }}
          onCancelReply={() => setReplyToMessage(null)}
          parentMessage={replyToMessage}
        />
      )}
    </div>
  );
} 
