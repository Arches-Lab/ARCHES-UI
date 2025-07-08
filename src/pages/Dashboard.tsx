import { useEffect, useState } from 'react';
import { getDashboardData } from '../api';
import StoreInfo from '../components/StoreInfo';
import DebugInfo from '../components/DebugInfo';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getDashboardData().then(setData).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
      
      {/* Debug Information Section */}
      <DebugInfo />
      
      {/* Store Information Section */}
      <StoreInfo />
      
      {/* API Data Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API Data</h3>
        {data ? (
          <pre className="text-sm bg-gray-100 p-4 rounded border overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-500">Loading API data...</p>
        )}
      </div>
    </div>
  );
}
