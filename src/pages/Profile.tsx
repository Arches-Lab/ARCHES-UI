import { useEffect, useState } from 'react';
import { getUserProfile } from '../api';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    getUserProfile().then(setProfile).catch(console.error);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Profile</h2>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
    </div>
  );
}
