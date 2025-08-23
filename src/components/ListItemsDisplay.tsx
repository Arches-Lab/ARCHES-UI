import { useState, useEffect } from 'react';
import { ListItem } from '../models/ListItem';
import { List } from '../models/List';
import { getListItems } from '../api/listItem';
import { getList } from '../api/list';

interface ListItemsDisplayProps {
  listId: string;
  title?: string;
  maxItems?: number;
  showCount?: boolean;
  className?: string;
}

export default function ListItemsDisplay({ 
  listId, 
  title, 
  maxItems = 10, 
  showCount = true,
  className = ""
}: ListItemsDisplayProps) {
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [list, setList] = useState<List | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadListAndItems();
  }, [listId]);

  const loadListAndItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load list details and items in parallel
      const [listData, itemsData] = await Promise.all([
        getList(listId),
        getListItems(listId)
      ]);
      
      setList(listData);
      setListItems(itemsData || []);
    } catch (error) {
      console.error('Error loading list items:', error);
      setError('Failed to load list items');
      setListItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Format phone number function
  const formatPhoneNumber = (phoneNumber: string): string => {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a valid US phone number (10 or 11 digits)
    if (cleaned.length === 10) {
      // Format as (XXX) XXX-XXXX
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      // Format as 1 (XXX) XXX-XXXX
      return `1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 7) {
      // Format as XXX-XXXX
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }
    
    // If it doesn't match standard formats, return as is
    return phoneNumber;
  };

  // Get display value based on datatype
  const getDisplayValue = (item: ListItem): string => {
    if (list?.datatype === 'PHONE') {
      return formatPhoneNumber(item.itemvalue);
    }
    return item.itemvalue;
  };

  // Limit items to maxItems
  const displayedItems = listItems.slice(0, maxItems);
  const hasMoreItems = listItems.length > maxItems;

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (listItems.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <p className="text-sm">No items found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {title || list?.listname || 'List Items'}
          </h3>
          {showCount && (
            <span className="text-sm text-gray-500">
              {listItems.length} item{listItems.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {list?.datatype && (
          <p className="text-xs text-gray-500 mt-1">{list.datatype}</p>
        )}
      </div>

      {/* Items List */}
      <div className="divide-y divide-gray-200">
        {displayedItems.map((item) => (
          <div key={item.listitemid} className="px-4 py-3 hover:bg-gray-50">
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.itemname}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-600 truncate">
                  {getDisplayValue(item)}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Show more indicator */}
        {hasMoreItems && (
          <div className="px-4 py-2 text-center">
            <p className="text-xs text-gray-500">
              +{listItems.length - maxItems} more item{(listItems.length - maxItems) !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 