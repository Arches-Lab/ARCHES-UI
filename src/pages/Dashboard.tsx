import { useEffect, useState } from 'react';
import { getDashboardData } from '../api';
import { useStore } from '../auth/StoreContext';
import SuppliesList from '../components/SuppliesList';
import TaskSummary from '../components/TaskSummary';
import IncidentSummary from '../components/IncidentSummary';
import LeadSummary from '../components/LeadSummary';
import MySchedule from '../components/MySchedule';
import ListItemsDisplay from '../components/ListItemsDisplay';
import MyTimeCard from '../components/MyTimeCard';
// import FingerPrintComponent from '../components/FingerPrintComponent';
import config from '../config/env';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const { selectedStore, availableStores } = useStore();

  // const handleFingerprintSuccess = () => {
  //   console.log('Fingerprint authentication successful!');
  //   // Add your success logic here
  // };

  // const handleFingerprintError = (error: string) => {
  //   console.error('Fingerprint authentication error:', error);
  //   // Add your error handling logic here
  // };

  useEffect(() => {
    // Only fetch if selectedStore is a valid number (not null, undefined, or 0)
    if (selectedStore !== null && selectedStore !== undefined) {
      console.log(`🔄 Loading dashboard data for store: ${selectedStore}`);
      //getDashboardData().then(setData).catch(console.error);
    } else {
      // Clear data only when no store is selected
      setData(null);
    }
  }, [selectedStore]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
      </div>

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
            <MyTimeCard />
            {/* <EmployeeTimeCardSummary /> */}
            {/* <FingerPrintComponent 
              onSuccess={handleFingerprintSuccess}
              onError={handleFingerprintError}
            /> */}
            <MySchedule />
            <ListItemsDisplay 
              // listId="dc882cc8-c0a5-464a-9297-63205b31e51f" 
              listId={config.contactListId} 
              maxItems={10}
            />
            </div>
        </div>
      )}
    </div>
  );
}
