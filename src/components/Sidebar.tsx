import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaUser, FaCog, FaUsers, FaEnvelope, FaLightbulb, FaInbox, FaUserPlus, FaTasks, FaExclamationTriangle } from 'react-icons/fa';

const links = [
  { to: '/', label: 'Dashboard', icon: <FaTachometerAlt /> },
  { to: '/employees', label: 'Employees', icon: <FaUsers /> },
  { to: '/messages', label: 'Message Board', icon: <FaEnvelope /> },
  { to: '/mailboxes', label: 'Mailboxes', icon: <FaInbox /> },
  { to: '/leads', label: 'Leads', icon: <FaLightbulb /> },
  { to: '/tasks', label: 'Tasks', icon: <FaTasks /> },
  { to: '/incidents', label: 'Incidents', icon: <FaExclamationTriangle /> },
  { to: '/profile', label: 'Profile', icon: <FaUser /> },
  // { to: '/settings', label: 'Settings', icon: <FaCog /> },
  { to: '/newuser', label: 'New User', icon: <FaUserPlus /> },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-60 bg-gray-800 text-white min-h-screen">
      <div className="w-full">
        <img 
          src="/images/logos/Logo5.jpg" 
          alt="Arches Logo" 
          className="w-full h-auto"
        />
      </div>
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
