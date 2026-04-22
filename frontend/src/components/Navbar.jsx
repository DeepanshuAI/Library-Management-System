import React, { useState, useEffect } from 'react';
import { LogOut, User, Menu, Bell, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Navbar = ({ toggleSidebar, handleLogout }) => {
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Admin User' };
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if(token) {
        const { data } = await axios.get(`${API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl border-b h-16 flex items-center justify-between px-6 sticky top-0 z-30"
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar} 
          className="text-gray-400 hover:text-white md:hidden transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="text-xl font-bold bg-gradient-to-r from-sky to-primary-light bg-clip-text text-transparent tracking-tight">
          Library<span className="font-light text-white ml-1 text-lg"></span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        
        {/* Notifications Engine */}
        <div className="relative">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative text-gray-400 hover:text-sky transition-colors flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0f172a] shadow-sm animate-pulse"></span>
            )}
          </motion.button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-xl overflow-hidden z-50"
              >
                <div className="p-3 border-b border-white/10 bg-white/5">
                  <h4 className="text-sm font-bold text-white">Live Notifications</h4>
                </div>
                <div className="max-h-60 overflow-y-auto w-full custom-scrollbar">
                   {notifications.length === 0 ? (
                     <div className="p-4 text-center text-xs text-gray-500 font-medium">No alerts triggered yet.</div>
                   ) : (
                     notifications.map(n => (
                       <div key={n._id} className={`p-3 border-b border-white/5 flex items-start gap-3 transition-colors ${!n.isRead ? 'bg-sky/5' : 'opacity-60 grayscale'}`}>
                         <div className={`w-2 h-2 mt-1.5 rounded-full ${!n.isRead ? 'bg-sky' : 'bg-transparent'}`} />
                         <div className="flex-1">
                           <p className="text-xs text-gray-300 font-medium leading-relaxed">{n.message}</p>
                           <p className="text-[10px] text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                         </div>
                         {!n.isRead && (
                           <button onClick={() => handleMarkAsRead(n._id)} className="text-[#10b981] hover:text-white p-1 rounded hover:bg-white/10 transition-colors">
                             <Check size={14} />
                           </button>
                         )}
                       </div>
                     ))
                   )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 text-gray-300">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky/20 to-primary/20 flex items-center justify-center border border-white/10 shadow-inner">
            <User size={16} className="text-sky" />
          </div>
          <span className="hidden sm:block text-sm font-medium">{user.name}</span>
        </div>
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLogout}
          className="text-gray-400 hover:text-red-400 transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
