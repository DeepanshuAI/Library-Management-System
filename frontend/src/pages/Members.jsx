import React, { useState, useEffect } from 'react';
import { Users, Search, CreditCard, CheckCircle, Plus, Trash2, X, Phone, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import PageTransition from '../components/PageTransition';
import axios from 'axios';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Add student form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [formError, setFormError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchMembers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/users`, getAuthHeader());
      setMembers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newName || !newEmail) { setFormError('Name and email are required.'); return; }

    try {
      await axios.post(`${API_URL}/api/users`, {
        name: newName,
        email: newEmail,
        phone: newPhone,
        studentId: newStudentId,
      }, getAuthHeader());
      setShowForm(false);
      setNewName(''); setNewEmail(''); setNewPhone(''); setNewStudentId('');
      fetchMembers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error adding member.');
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Remove this member from the directory?')) return;
    try {
      await axios.delete(`${API_URL}/api/users/${id}`, getAuthHeader());
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error removing member.');
    }
  };

  const handleClearFines = async (id) => {
    try {
      await axios.put(`${API_URL}/api/users/${id}/pay-fines`, {}, getAuthHeader());
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error clearing fines.');
    }
  };

  const filteredMembers = members
    .filter(m => m.role !== 'admin')
    .filter(m =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.studentId || '').toLowerCase().includes(search.toLowerCase())
    );

  const totalFines = members.reduce((sum, m) => sum + (m.finesAmount || 0), 0);

  return (
    <PageTransition>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">Member Directory</h1>
          <p className="text-gray-400">Manage students, assign books, and track fines.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 shadow-inner">
            <Users size={16} className="text-[#10b981]" />
            <span className="text-sm font-medium text-gray-300">{filteredMembers.length} students</span>
          </div>
          {totalFines > 0 && (
            <div className="flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
              <span className="text-sm font-bold text-red-400">₹{totalFines} total fines</span>
            </div>
          )}
          <Button onClick={() => setShowForm(!showForm)} variant="sky" className="w-auto px-5">
            <Plus size={16} />
            <span>{showForm ? 'Cancel' : 'Add Student'}</span>
          </Button>
        </div>
      </div>

      {/* Add Student Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <Card className="p-6 border-sky/30 shadow-[0_0_20px_rgba(53,167,255,0.1)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Register New Student</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              {formError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
                  {formError}
                </div>
              )}
              <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <Input label="Full Name *" value={newName} onChange={e => setNewName(e.target.value)} required placeholder="e.g. John Doe" />
                <Input label="Email Address *" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required placeholder="student@college.edu" />
                <Input label="Phone Number" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="9876543210" />
                <Input label="Student ID" value={newStudentId} onChange={e => setNewStudentId(e.target.value)} placeholder="STU001" />
                <Button type="submit" variant="primary" className="h-[50px] w-full md:col-span-4 mt-1">
                  Register Student
                </Button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Members Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center gap-3 bg-white/5">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or student ID..."
            className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500 font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="p-12 text-center text-[#10b981] animate-pulse">Loading members...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-sm border-b border-white/10">
                  <th className="p-5 font-semibold">Student</th>
                  <th className="p-5 font-semibold">Student ID</th>
                  <th className="p-5 font-semibold">Phone</th>
                  <th className="p-5 font-semibold">Fine</th>
                  <th className="p-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <AnimatePresence>
                  {filteredMembers.map((member) => (
                    <motion.tr
                      key={member._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#10b981]/20 to-[#35A7FF]/20 flex items-center justify-center border border-white/10 text-sm font-bold text-white shadow-inner shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium">{member.name}</p>
                            <p className="text-gray-500 text-xs">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-gray-400 font-mono text-xs">
                        {member.studentId ? (
                          <span className="flex items-center gap-1.5"><Hash size={11} />{member.studentId}</span>
                        ) : '—'}
                      </td>
                      <td className="p-5 text-gray-400 text-xs">
                        {member.phone ? (
                          <span className="flex items-center gap-1.5"><Phone size={11} />{member.phone}</span>
                        ) : '—'}
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono border shadow-inner ${member.finesAmount > 0 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20'}`}>
                          ₹{member.finesAmount || 0}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 justify-end">
                          {member.finesAmount > 0 && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleClearFines(member._id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20 border border-[#10b981]/20 rounded-lg transition-colors text-xs font-medium"
                              title="Clear Fines"
                            >
                              <CreditCard size={13} /> Clear Fine
                            </motion.button>
                          )}
                          {member.finesAmount === 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-gray-600 rounded-lg text-xs font-medium cursor-not-allowed">
                              <CheckCircle size={13} /> No Fine
                            </div>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteMember(member._id)}
                            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
                            title="Remove Member"
                          >
                            <Trash2 size={14} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>

                {filteredMembers.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="p-12 text-center">
                      <div className="flex flex-col items-center text-gray-500 gap-3">
                        <Users size={32} className="opacity-40" />
                        <p className="font-medium">No students found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </PageTransition>
  );
};

export default Members;
