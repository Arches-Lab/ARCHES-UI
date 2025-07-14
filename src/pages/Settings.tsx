import { useState } from 'react';
import { updateSettings } from '../api';

export default function Settings() {
  const [message, setMessage] = useState('');

  const handleSave = () => {
    updateSettings({}).then(() => setMessage('Saved!')).catch(console.error);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Settings</h2>
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Save
      </button>
      {message && <p className="mt-2 text-green-600">{message}</p>}
    </div>
  );
}
