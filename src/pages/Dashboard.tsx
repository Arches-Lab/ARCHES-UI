import { useEffect, useState } from 'react';
import { getDashboardData } from '../api';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getDashboardData().then(setData).catch(console.error);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
