import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, X, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navLinks = [
    { name: 'Dashboard',   path: '/',            icon: <LayoutDashboard size={20} /> },
    { name: 'Books',       path: '/books',        icon: <BookOpen size={20} /> },
    { name: 'Members',     path: '/members',      icon: <Users size={20} /> },
    { name: 'Circulation', path: '/circulation',  icon: <ClipboardList size={20} /> },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 shadow-xl z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 md:hidden">
          <span className="font-bold text-sky">Menu</span>
          <button onClick={toggleSidebar} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 py-6 flex flex-col gap-2 relative">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => 
                `relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                  isActive 
                    ? 'text-white shadow-[0_0_20px_rgba(53,167,255,0.2)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div 
                      layoutId="active-nav"
                      className="absolute inset-0 bg-gradient-to-r from-sky/20 to-primary/10 border border-white/10 rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {React.cloneElement(link.icon, { 
                    className: isActive ? 'text-sky' : 'text-gray-400 group-hover:text-white' 
                  })}
                  <span>{link.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
