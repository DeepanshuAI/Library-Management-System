import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Members from './pages/Members';
import Circulation from './pages/Circulation';

// A wrapper to handle useLocation inside Router
const AnimatedRoutes = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Layout embedded here so it can access navigate/location cleanly
  const Layout = () => (
    <>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col min-w-0 z-10 relative md:pl-64">
        <Navbar toggleSidebar={toggleSidebar} handleLogout={handleLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 md:px-8 py-6">
          {/* Animate presence for nested layout routes */}
          <AnimatePresence mode="wait">
             <Routes location={location} key={location.pathname}>
               <Route index element={<Dashboard />} />
               <Route path="books" element={<Books />} />
               <Route path="members" element={<Members />} />
               <Route path="circulation" element={<Circulation />} />
             </Routes>
          </AnimatePresence>
        </main>
      </div>
    </>
  );

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname.split('/')[1]}>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="min-h-screen flex overflow-hidden relative">
              {/* Animated Background Mesh */}
              <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                 <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-sky/20 rounded-full blur-[100px] animate-blob" />
                 <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-primary/20 rounded-full blur-[100px] animate-blob [animation-delay:2000ms]" />
                 <div className="absolute bottom-[-20%] left-[20%] w-[45rem] h-[45rem] bg-indigo-500/10 rounded-full blur-[120px] animate-blob [animation-delay:4000ms]" />
              </div>
              <Layout />
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
