import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaUser, FaCog, FaUsers, FaEnvelope, FaLightbulb, FaInbox, FaUserPlus, FaTasks, FaExclamationTriangle, FaBoxes, FaCalendarAlt, FaStore, FaSms, FaClock, FaCalendarCheck, FaList, FaDollarSign, FaTag, FaUserFriends, FaCreditCard } from 'react-icons/fa';

const links = [
  { to: '/', label: 'Dashboard', icon: <FaTachometerAlt /> },
  { to: '/recent-activities', label: 'Recent Activities', icon: <FaCalendarAlt /> },
  { to: '/employees', label: 'Employees', icon: <FaUsers /> },
  { to: '/messages', label: 'Message Board', icon: <FaEnvelope /> },
  { to: '/store-operations', label: 'Operations', icon: <FaStore /> },
  { to: '/supplies', label: 'Supplies', icon: <FaBoxes /> },
  { to: '/leads', label: 'Leads', icon: <FaLightbulb /> },
  { to: '/tasks', label: 'Tasks', icon: <FaTasks /> },
  { to: '/incidents', label: 'Incidents', icon: <FaExclamationTriangle /> },
  { to: '/mailboxes', label: 'Mailboxes', icon: <FaInbox /> },
  { to: '/list-items', label: 'Lists', icon: <FaList /> },
  { to: '/texts', label: 'Dropoffs', icon: <FaSms /> },

  { to: '/schedule', label: 'Schedule', icon: <FaClock /> },
  { to: '/my-schedule', label: 'My Schedule', icon: <FaCalendarCheck /> },
  { to: '/expenses', label: 'Expenses', icon: <FaDollarSign /> },
  { to: '/expense-categories', label: 'Categories', icon: <FaTag /> },
  { to: '/payees', label: 'Payees', icon: <FaUserFriends /> },
  { to: '/payment-accounts', label: 'Payment Accounts', icon: <FaCreditCard /> },
  { to: '/profile', label: 'Profile', icon: <FaUser /> },
  // { to: '/settings', label: 'Settings', icon: <FaCog /> },
  { to: '/newuser', label: 'User Accounts', icon: <FaUserPlus /> },
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
