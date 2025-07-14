import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaUser, FaCog, FaUsers, FaEnvelope } from 'react-icons/fa';

const links = [
  { to: '/', label: 'Dashboard', icon: <FaTachometerAlt /> },
  { to: '/employees', label: 'Employees', icon: <FaUsers /> },
  { to: '/messages', label: 'Messages', icon: <FaEnvelope /> },
  { to: '/profile', label: 'Profile', icon: <FaUser /> },
  { to: '/settings', label: 'Settings', icon: <FaCog /> },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-60 bg-gray-800 text-white min-h-screen">
      <div className="p-4 text-xl font-bold">ARCHES UI</div>
      <nav className="flex flex-col">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-700 ${
              location.pathname === link.to ? 'bg-gray-700' : ''
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
