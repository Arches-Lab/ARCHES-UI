import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      login();
      navigate('/');
    }, 500);
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <button
        onClick={handleLogin}
        className="px-6 py-3 bg-blue-600 text-white rounded"
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
}
