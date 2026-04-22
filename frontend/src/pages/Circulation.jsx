import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Clock, AlertTriangle, CheckCircle, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import PageTransition from '../components/PageTransition';
import axios from 'axios';

const Circulation = () => {
  const [allIssues, setAllIssues] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | overdue | ontime

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchData = async () => {
    try {
      const { data: books } = await axios.get(`${API_URL}/api/books`, getAuthHeader());

      // Flatten all checkouts across all books
      const issues = [];
      books.forEach(book => {
        (book.checkedOutBy || []).forEach(checkout => {
          const now = new Date();
          const due = new Date(checkout.dueDate);
          const issued = new Date(checkout.issueDate);
          const isOverdue = now > due;
          const diffMs = Math.abs(now - due);
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          const accruingFine = isOverdue ? diffDays * 4 : 0;

          issues.push({
            bookId: book._id,
            bookTitle: book.title,
            bookAuthor: book.author,
            bookGenre: book.genre,
            bookCover: book.imageUrl,
            memberName: checkout.user?.name || 'Unknown',
            memberEmail: checkout.user?.email || '',
            memberId: checkout.user?._id || checkout.user,
            issueDate: issued,
            dueDate: due,
            isOverdue,
            daysOverdue: isOverdue ? diffDays : 0,
            daysRemaining: !isOverdue ? diffDays : 0,
            accruingFine,
          });
        });
      });

      // Sort overdue first
      issues.sort((a, b) => b.isOverdue - a.isOverdue || b.daysOverdue - a.daysOverdue);
      setAllIssues(issues);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = allIssues.filter(issue => {
    const matchSearch =
      issue.bookTitle.toLowerCase().includes(search.toLowerCase()) ||
      issue.memberName.toLowerCase().includes(search.toLowerCase()) ||
      issue.memberEmail.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === 'all' ||
      (filter === 'overdue' && issue.isOverdue) ||
      (filter === 'ontime' && !issue.isOverdue);

    return matchSearch && matchFilter;
  });

  const totalOverdue = allIssues.filter(i => i.isOverdue).length;
  const totalFineAccruing = allIssues.reduce((s, i) => s + i.accruingFine, 0);

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <PageTransition>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">Circulation Records</h1>
          <p className="text-gray-400">Track all active book issues — issue date, due date, and accruing fines.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <BookOpen size={15} className="text-sky" />
            <span className="text-sm font-medium text-gray-300">{allIssues.length} active issues</span>
          </div>
          {totalOverdue > 0 && (
            <div className="flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
              <AlertTriangle size={15} className="text-red-400" />
              <span className="text-sm font-bold text-red-400">{totalOverdue} overdue</span>
            </div>
          )}
          {totalFineAccruing > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
              <IndianRupee size={15} className="text-amber-400" />
              <span className="text-sm font-bold text-amber-400">₹{totalFineAccruing} accruing</span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5">
        {[
          { key: 'all', label: 'All Issues' },
          { key: 'overdue', label: '⚠ Overdue' },
          { key: 'ontime', label: '✓ On Time' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
              filter === f.key
                ? 'bg-sky/20 text-sky border-sky/40'
                : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        {/* Search */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3 bg-white/5">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by book title or member name..."
            className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500 font-medium"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="p-12 text-center text-sky animate-pulse">Loading circulation records...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-xs border-b border-white/10 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Book</th>
                  <th className="p-4 font-semibold">Issued To</th>
                  <th className="p-4 font-semibold">Issue Date</th>
                  <th className="p-4 font-semibold">Due Date</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Fine Accruing</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <AnimatePresence>
                  {filtered.map((issue, idx) => (
                    <motion.tr
                      key={`${issue.bookId}-${issue.memberId}-${idx}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className={`border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${issue.isOverdue ? 'bg-red-500/3' : ''}`}
                    >
                      {/* Book */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={issue.bookCover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200'}
                            alt={issue.bookTitle}
                            className="w-8 h-11 object-cover rounded border border-white/10 shrink-0"
                          />
                          <div>
                            <p className="text-white font-medium text-sm leading-tight">{issue.bookTitle}</p>
                            <p className="text-gray-500 text-xs">{issue.bookAuthor}</p>
                          </div>
                        </div>
                      </td>

                      {/* Member */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-sky/20 text-sky flex items-center justify-center text-xs font-bold uppercase shrink-0">
                            {issue.memberName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{issue.memberName}</p>
                            <p className="text-gray-500 text-xs">{issue.memberEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Issue Date */}
                      <td className="p-4 text-gray-400 text-xs font-mono">
                        {fmtDate(issue.issueDate)}
                      </td>

                      {/* Due Date */}
                      <td className="p-4 text-xs font-mono">
                        <span className={issue.isOverdue ? 'text-red-400 font-bold' : 'text-gray-400'}>
                          {fmtDate(issue.dueDate)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {issue.isOverdue ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-bold">
                            <AlertTriangle size={11} />
                            {issue.daysOverdue}d overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold">
                            <Clock size={11} />
                            {issue.daysRemaining}d left
                          </span>
                        )}
                      </td>

                      {/* Fine */}
                      <td className="p-4 text-right">
                        {issue.accruingFine > 0 ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-bold font-mono text-sm">
                            <IndianRupee size={13} />{issue.accruingFine}
                          </span>
                        ) : (
                          <span className="flex items-center justify-end gap-1 text-primary text-xs font-medium">
                            <CheckCircle size={13} /> No fine
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>

                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan="6" className="p-14 text-center">
                      <div className="flex flex-col items-center text-gray-500 gap-3">
                        <BookOpen size={36} className="opacity-30" />
                        <p className="font-medium text-base">No circulation records found.</p>
                        <p className="text-xs text-gray-600">Issue books from the Books page to see records here.</p>
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

export default Circulation;
