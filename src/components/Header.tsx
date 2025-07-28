import { useAuth } from '../auth/AuthContext';
import StoreSelector from './StoreSelector';

export default function Header() {
  const { logout, user } = useAuth();

  return (
    <header className="flex justify-between items-center bg-white border-b px-6 h-14">
      <h1 className="text-xl font-semibold"></h1>
      
      <div className="flex items-center gap-4">
        {/* Store Selector */}
        <StoreSelector />
        
        {user && (
          <div className="flex items-center gap-3">
            {user.picture && (
              <img 
                src={user.picture} 
                alt={user.user_metadata?.firstname + ' ' + user.user_metadata?.lastname || 'User'} 
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-sm text-gray-700">
              {user.user_metadata?.firstname + ' ' + user.user_metadata?.lastname || user.email}
            </span>
          </div>
        )}
        <button 
          onClick={logout} 
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
