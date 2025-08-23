import { useEffect, useState } from 'react';
import { getDashboardData } from '../api';
import { useStore } from '../auth/StoreContext';
import SuppliesList from '../components/SuppliesList';
import TaskSummary from '../components/TaskSummary';
import IncidentSummary from '../components/IncidentSummary';
import LeadSummary from '../components/LeadSummary';
import MySchedule from '../components/MySchedule';
import ListItemsDisplay from '../components/ListItemsDisplay';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const { selectedStore, availableStores } = useStore();

  useEffect(() => {
    // Only fetch if selectedStore is a valid number (not null, undefined, or 0)
    if (selectedStore !== null && selectedStore !== undefined) {
      console.log(`🔄 Loading dashboard data for store: ${selectedStore}`);
      getDashboardData().then(setData).catch(console.error);
    } else {
      // Clear data only when no store is selected
      setData(null);
    }
  }, [selectedStore]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
        {/* {selectedStore && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Currently viewing:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 font-medium rounded">
              Store {selectedStore}
            </span>
          </div>
        )} */}
      </div>
      
      {/* Store Selection Info */}
      {/* {selectedStore && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Store Context</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-700 mb-1">Selected Store:</p>
              <p className="font-mono text-lg font-semibold text-blue-900">Store {selectedStore}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700 mb-1">Available Stores:</p>
              <div className="flex gap-2">
                {availableStores.map((store) => (
                  <span
                    key={store}
                    className={`px-2 py-1 text-sm rounded ${
                      store === selectedStore
                        ? 'bg-blue-600 text-white font-medium'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {store}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm text-blue-600 mt-3">
            💡 Use the store selector in the header to switch between stores. All data will update automatically.
          </p>
        </div>
      )} */}
      
      {/* Dashboard Widgets */}
      {selectedStore && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <TaskSummary />
            <IncidentSummary />
            <LeadSummary />
            <SuppliesList />
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <MySchedule />
            <ListItemsDisplay 
              // listId="dc882cc8-c0a5-464a-9297-63205b31e51f" 
              listId="f62014a2-c905-46fd-b6a5-2b8f0eafcb9f" 
              maxItems={10}
            />
            </div>
        </div>
      )}
    </div>
  );
}
