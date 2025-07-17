import { useEffect, useState } from 'react';
import { getMailboxes } from '../api';
import { FaInbox, FaSpinner, FaExclamationTriangle, FaClock, FaUser, FaStore, FaEnvelope, FaMapMarkerAlt, FaBox, FaPlus } from 'react-icons/fa';
import { useStore } from '../auth/StoreContext';

interface Mailbox {
  mailboxid: string;
  storenumber: number;
  mailboxnumber: string;
  mailboxguid: string;
}

export default function Mailboxes() {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedStore } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔄 Fetching mailboxes for store: ${selectedStore}`);
        
        const mailboxesData = await getMailboxes();
        
        console.log('Mailboxes data:', mailboxesData);
        
        setMailboxes(Array.isArray(mailboxesData) ? mailboxesData : []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if selectedStore is a valid number (not null, undefined, or 0)
    if (selectedStore !== null && selectedStore !== undefined) {
      console.log(`🔄 Loading mailboxes for store: ${selectedStore}`);
      fetchData();
    } else {
      // Clear data only when no store is selected
      setMailboxes([]);
      setLoading(false);
      setError(null);
    }
  }, [selectedStore]);

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('empty') || statusLower.includes('checked')) {
      return 'text-green-600 bg-green-100';
    }
    if (statusLower.includes('full') || statusLower.includes('mail')) {
      return 'text-blue-600 bg-blue-100';
    }
    if (statusLower.includes('out') || statusLower.includes('service')) {
      return 'text-red-600 bg-red-100';
    }
    return 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading mailboxes...</p>
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
          <FaInbox className="text-3xl text-blue-600" />
          <h2 className="text-2xl font-semibold">Mailboxes</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {mailboxes.length} mailbox{mailboxes.length !== 1 ? 'es' : ''}
          </div>
        </div>
      </div>

      {mailboxes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <FaInbox className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Mailboxes</h3>
          <p className="text-gray-600">You don't have any mailboxes configured at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {mailboxes.map((mailbox) => (
            <div
              key={mailbox.mailboxid}
              className="aspect-square bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all hover:bg-gray-50 flex items-center justify-center cursor-pointer"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700">
                  {mailbox.mailboxnumber}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 