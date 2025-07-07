import { useAuth } from '../auth/AuthContext';

export default function Header() {
  const { logout } = useAuth();

  return (
    <header className="flex justify-between items-center bg-white border-b px-6 h-14">
      <h1 className="text-xl font-semibold">Arches UPS</h1>
      <div className="flex items-center gap-4">
        <span>User</span>
        <button onClick={logout} className="text-blue-500">
          Logout
        </button>
      </div>
    </header>
  );
}
