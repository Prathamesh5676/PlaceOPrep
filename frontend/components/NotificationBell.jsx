import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';
import api from '../services/api';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 60000); // poll every minute
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications?limit=10');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) { /* silent */ }
  };

  const sendTestNotification = async () => {
    try {
      await api.post('/notifications/test');
      await fetchNotifications();
    } catch (err) { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/all/read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) { /* silent */ }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
    } catch (err) { /* silent */ }
  };

  const typeColors = {
    achievement: 'text-yellow-400',
    streak: 'text-orange-400',
    daily_challenge: 'text-blue-400',
    reminder: 'text-purple-400',
    system: 'text-gray-400'
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed z-[9999] w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden" style={{top: ref.current ? ref.current.getBoundingClientRect().bottom + 8 : 0, left: ref.current ? ref.current.getBoundingClientRect().right + 8 : 0}}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <h3 className="text-white font-semibold text-sm">Notifications</h3>
            <div className="flex items-center space-x-2">
              <button onClick={sendTestNotification} className="text-gray-500 hover:text-gray-300 text-xs px-1.5 py-0.5 rounded border border-gray-700 hover:border-gray-500 transition-colors" title="Send a sample notification">
                Test
              </button>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 text-xs">
                  <CheckCheck className="w-3 h-3" /><span>Mark all read</span>
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No notifications</p>
            ) : (
              notifications.map(n => (
                <div key={n._id} className={`flex items-start space-x-3 px-4 py-3 border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${!n.read ? 'bg-purple-500/5' : ''}`}>
                  <span className="text-lg shrink-0 mt-0.5">{n.icon || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    {n.title && <p className={`text-xs font-medium ${typeColors[n.type] || 'text-gray-400'}`}>{n.title}</p>}
                    <p className="text-gray-300 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-gray-600 text-xs mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={(e) => deleteNotification(n._id, e)} className="p-1 text-gray-600 hover:text-red-400 transition-colors shrink-0">
                    <X className="w-3 h-3" />
                  </button>
                  {!n.read && <div className="w-2 h-2 bg-purple-500 rounded-full shrink-0 mt-2" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
