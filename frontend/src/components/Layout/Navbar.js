import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellIcon, 
  Cog6ToothIcon, 
  UserCircleIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Mock system status and notifications for now
  const systemStatus = { status: 'operational', lastUpdate: new Date() };
  const notifications = [];
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusIcon = () => {
    switch (systemStatus) {
      case 'online':
        return <CheckCircleIcon className="w-4 h-4 text-neon-green" />;
      case 'degraded':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />;
      case 'offline':
        return <XMarkIcon className="w-4 h-4 text-red-400" />;
      default:
        return <SignalIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (systemStatus) {
      case 'online':
        return 'All Systems Operational';
      case 'degraded':
        return 'Degraded Performance';
      case 'offline':
        return 'System Offline';
      default:
        return 'Checking Status...';
    }
  };

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'online':
        return 'text-neon-green';
      case 'degraded':
        return 'text-yellow-400';
      case 'offline':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="bg-dark-card/80 backdrop-blur-xl border-b border-neon-blue/20 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-dark-lighter/50 hover:bg-dark-lighter transition-colors"
          >
            {sidebarOpen ? (
              <XMarkIcon className="w-5 h-5 text-gray-300" />
            ) : (
              <Bars3Icon className="w-5 h-5 text-gray-300" />
            )}
          </button>

          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">OrbitOPS</h1>
              <p className="text-xs text-gray-400">Space Debris Monitoring</p>
            </div>
          </div>
        </div>

        {/* Center Section - System Status */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-dark-lighter/50">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          <div className={`w-2 h-2 rounded-full ${
            systemStatus === 'online' ? 'bg-neon-green animate-pulse' :
            systemStatus === 'degraded' ? 'bg-yellow-400 animate-pulse' :
            'bg-red-400 animate-pulse'
          }`} />
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-dark-lighter/50 hover:bg-dark-lighter transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <SunIcon className="w-5 h-5 text-yellow-400" />
            ) : (
              <MoonIcon className="w-5 h-5 text-blue-400" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-dark-lighter/50 hover:bg-dark-lighter transition-colors"
            >
              <BellIcon className="w-5 h-5 text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-dark-card border border-neon-blue/20 rounded-xl shadow-xl z-50"
                >
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Notifications</h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={() => {/* Clear notifications logic */}}
                          className="text-sm text-neon-blue hover:text-neon-purple transition-colors"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">
                        <BellIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-700 last:border-b-0 hover:bg-dark-lighter/50 transition-colors ${
                            !notification.read ? 'bg-neon-blue/5' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.type === 'alert' ? 'bg-red-400' :
                              notification.type === 'warning' ? 'bg-yellow-400' :
                              'bg-neon-blue'
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm text-white font-medium">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg bg-dark-lighter/50 hover:bg-dark-lighter transition-colors"
            >
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="hidden md:block text-sm text-white font-medium">
                {user?.name}
              </span>
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-dark-card border border-neon-blue/20 rounded-xl shadow-xl z-50"
                >
                  <div className="p-4 border-b border-gray-700">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                    <span className={`inline-block px-2 py-1 mt-2 text-xs rounded-full ${
                      user?.role === 'admin' 
                        ? 'bg-neon-purple/20 text-neon-purple' 
                        : 'bg-neon-blue/20 text-neon-blue'
                    }`}>
                      {user?.role?.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="p-2">
                    <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:bg-dark-lighter rounded-lg transition-colors">
                      <UserCircleIcon className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:bg-dark-lighter rounded-lg transition-colors">
                      <Cog6ToothIcon className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <hr className="my-2 border-gray-700" />
                    <button
                      onClick={logout}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;