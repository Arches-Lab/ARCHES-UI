import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { FaTachometerAlt, FaUser, FaCog, FaUsers, FaEnvelope, FaLightbulb, FaInbox, FaUserPlus, FaTasks, FaExclamationTriangle, FaBoxes, FaCalendarAlt, FaStore, FaSms, FaClock, FaCalendarCheck, FaList, FaDollarSign, FaTag, FaUserFriends, FaCreditCard, FaChevronDown, FaChevronRight } from 'react-icons/fa';

const menuGroups = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { to: '/', label: 'Dashboard', icon: <FaTachometerAlt /> },
      { to: '/recent-activities', label: 'Recent Activities', icon: <FaCalendarAlt /> },
    ]
  },
  {
    id: 'management',
    label: 'Management',
    items: [
      { to: '/employees', label: 'Employees', icon: <FaUsers /> },
      { to: '/supplies', label: 'Supplies', icon: <FaBoxes /> },
      { to: '/list-items', label: 'Lists', icon: <FaList /> },
    ]
  },
  {
    id: 'business',
    label: 'Business',
    items: [
      { to: '/messages', label: 'Message Board', icon: <FaEnvelope /> },
      { to: '/mailboxes', label: 'Mailboxes', icon: <FaInbox /> },
      { to: '/store-operations', label: 'Operations', icon: <FaStore /> },
      { to: '/leads', label: 'Leads', icon: <FaLightbulb /> },
      { to: '/tasks', label: 'Tasks', icon: <FaTasks /> },
      { to: '/incidents', label: 'Incidents', icon: <FaExclamationTriangle /> },
      { to: '/texts', label: 'Dropoffs', icon: <FaSms /> },
    ]
  },
  // {
  //   id: 'communication',
  //   label: 'Communication',
  //   items: [
  //   ]
  // },
  {
    id: 'scheduling',
    label: 'Scheduling',
    items: [
      { to: '/schedule', label: 'Schedule', icon: <FaClock /> },
      { to: '/my-schedule', label: 'My Schedule', icon: <FaCalendarCheck /> },
    ]
  },
  {
    id: 'finance',
    label: 'Finance',
    items: [
      { to: '/expenses', label: 'Expenses', icon: <FaDollarSign /> },
      { to: '/expense-categories', label: 'Categories', icon: <FaTag /> },
      { to: '/payees', label: 'Payees', icon: <FaUserFriends /> },
      { to: '/payment-accounts', label: 'Payment Accounts', icon: <FaCreditCard /> },
    ]
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      { to: '/profile', label: 'Profile', icon: <FaUser /> },
      { to: '/newuser', label: 'User Accounts', icon: <FaUserPlus /> },
    ]
  },
];

export default function Sidebar() {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['main', 'management', 'business']);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const isGroupExpanded = (groupId: string) => expandedGroups.includes(groupId);

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
        {menuGroups.map((group, index) => (
          <div key={group.id}>
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.id)}
              className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-700 text-left"
            >
              <span className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                {group.label}
              </span>
              {isGroupExpanded(group.id) ? (
                <FaChevronDown className="w-3 h-3 text-gray-400" />
              ) : (
                <FaChevronRight className="w-3 h-3 text-gray-400" />
              )}
            </button>
            
            {/* Group Items */}
            {isGroupExpanded(group.id) && (
              <div className="bg-gray-900">
                {group.items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 px-6 py-2 hover:bg-gray-700 text-sm ${
                      location.pathname === item.to ? 'bg-gray-700 text-white' : 'text-gray-300'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
            
            {/* Horizontal Partition (except for last group) */}
            {index < menuGroups.length - 1 && (
              <div className="border-t border-gray-600 mx-4 my-2"></div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
