import { useState, useRef, useEffect } from 'react';
import { Bell, Search, X } from 'lucide-react';
import useStore from '../store/useStore';

export default function Header({ title, subtitle }) {
  const { notifications, markNotificationRead, markAllRead, user } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const typeColors = {
    warning: 'bg-warning-400',
    success: 'bg-success-500',
    danger: 'bg-danger-500',
    info: 'bg-primary-500',
  };

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-dark-400 dark:text-dark-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            placeholder="Search workers, claims..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 pr-4 py-2 w-64 text-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
          >
            <Bell className="w-5 h-5 text-dark-500 dark:text-dark-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-dark-200 dark:border-dark-700 z-50 animate-scale-in overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-dark-100 dark:border-dark-700">
                <h3 className="font-semibold text-dark-900 dark:text-white">Notifications</h3>
                <button onClick={markAllRead} className="text-xs text-primary-500 hover:text-primary-600 font-medium">
                  Mark all read
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto scrollbar-thin">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationRead(notif.id)}
                    className={`flex gap-3 p-4 border-b border-dark-50 dark:border-dark-700/50 cursor-pointer transition-colors hover:bg-dark-50 dark:hover:bg-dark-700/50 ${!notif.read ? 'bg-primary-50/50 dark:bg-primary-500/5' : ''}`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${typeColors[notif.type]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-800 dark:text-dark-200">{notif.title}</p>
                      <p className="text-xs text-dark-400 dark:text-dark-500 mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-dark-300 dark:text-dark-600 mt-1">{notif.time}</p>
                    </div>
                    {!notif.read && <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-dark-200 dark:border-dark-700">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-500/20">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-dark-800 dark:text-dark-200">{user?.name || 'Admin'}</p>
            <p className="text-[10px] text-dark-400 dark:text-dark-500">{user?.role || 'Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
