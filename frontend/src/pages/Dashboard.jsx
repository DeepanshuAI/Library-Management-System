import React, { useState, useEffect } from 'react';
import { Book, Users, Repeat, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import PageTransition from '../components/PageTransition';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } }
  };

  if (loading) {
    return (
      <PageTransition>
         <div className="flex items-center justify-center h-64 text-sky">Loading Analytics...</div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
         <div className="text-red-400 text-center py-10 bg-red-500/10 rounded-xl border border-red-500/20">{error}</div>
      </PageTransition>
    );
  }

  const statCards = [
    { title: 'Total Books', value: data?.totalBooks || 0, icon: <Book size={24} className="text-sky" />, bg: 'from-sky/20 to-sky/5', border: 'border-sky/20' },
    { title: 'Active Books', value: data?.availableBooks || 0, icon: <CheckCircle size={24} className="text-primary" />, bg: 'from-primary/20 to-primary/5', border: 'border-primary/20' },
    { title: 'Books Issued', value: data?.issuedBooks || 0, icon: <Repeat size={24} className="text-purple-400" />, bg: 'from-purple-400/20 to-purple-400/5', border: 'border-purple-400/20' },
    { title: 'Total Members', value: data?.totalMembers || 0, icon: <Users size={24} className="text-gray-400" />, bg: 'from-gray-400/20 to-gray-400/5', border: 'border-gray-500/20' },
  ];

  const pieData = [
    { name: 'Available', value: data?.availableBooks || 0 },
    { name: 'Issued', value: data?.issuedBooks || 0 },
  ];
  const COLORS = ['#34d399', '#a78bfa']; // primary emerald, purple

  return (
    <PageTransition>
      <div className="mb-8 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#66beff] text-xs font-medium mb-3 shadow-inner"
          >
            {/* <span className="w-2 h-2 rounded-full bg-[#35A7FF] animate-pulse" /> */}
           
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">Dashboard</h1>
          <p className="text-gray-400"></p>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
      >
        {statCards.map((stat, index) => (
          <motion.div key={index} variants={item}>
            <Card hoverEffect className="p-6 flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br border shadow-inner ${stat.bg} ${stat.border}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
        >
          <Card className="p-6 h-full flex flex-col">
            <h2 className="text-lg font-bold text-white mb-6">Inventory Status</h2>
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              {(data?.totalBooks === 0) ? (
                <p className="text-gray-500">No books tracked yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="rgba(255,255,255,0.1)"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* Custom Legend */}
            <div className="flex justify-center gap-6 mt-4">
               {pieData.map((entry, i) => (
                 <div key={i} className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: COLORS[i] }} />
                   <span className="text-sm font-medium text-gray-400">{entry.name} ({entry.value})</span>
                 </div>
               ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
        >
          <Card className="p-6 h-full flex flex-col">
            <h2 className="text-lg font-bold text-white mb-6">Books by Genre</h2>
            <div className="flex-1 w-full min-h-[300px]">
               {(!data?.booksByGenre || data.booksByGenre.length === 0) ? (
                 <div className="flex items-center justify-center h-full text-gray-500">No genre data available</div>
               ) : (
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.booksByGenre}
                      margin={{ top: 20, right: 30, left: -10, bottom: 5 }}
                    >
                      <XAxis 
                        dataKey="name" 
                        stroke="rgba(255,255,255,0.3)" 
                        tick={{ fill: '#94a3b8', fontSize: 13 }} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.1)" 
                        tick={{ fill: '#94a3b8', fontSize: 13 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#35A7FF" 
                        radius={[6, 6, 0, 0]} 
                        barSize={40}
                      />
                    </BarChart>
                 </ResponsiveContainer>
               )}
            </div>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
