import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Repeat, Search, Edit2, Users, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import PageTransition from '../components/PageTransition';
import axios from 'axios';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // New Book Form State
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);

  // Assignment Modal State
  const [assignBookId, setAssignBookId] = useState(null);
  const [targetUserId, setTargetUserId] = useState('');

  // Circulation Manifest State
  const [expandedRowId, setExpandedRowId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchBooks = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/books`, getAuthHeader());
      setBooks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/users`, getAuthHeader());
      // Only show non-admin members in the assignment list
      setMembers(data.filter(u => u.role !== 'admin'));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchMembers();
  }, []);

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!newTitle || !newAuthor || !newGenre) return;
    try {
      await axios.post(`${API_URL}/api/books`, {
        title: newTitle,
        author: newAuthor,
        genre: newGenre,
        imageUrl: newImageUrl,
        quantity: Number(newQuantity)
      }, getAuthHeader());
      setShowForm(false);
      setNewTitle(''); setNewAuthor(''); setNewGenre(''); setNewImageUrl(''); setNewQuantity(1);
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding book');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await axios.delete(`${API_URL}/api/books/${id}`, getAuthHeader());
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting book');
    }
  };

  const handleIssue = async (bookId, memberId) => {
    if (!memberId) return alert('Please select a member first.');
    try {
      await axios.put(`${API_URL}/api/books/issue/${bookId}`, { targetUserId: memberId }, getAuthHeader());
      setAssignBookId(null);
      setTargetUserId('');
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error issuing book');
    }
  };

  const handleReturn = async (bookId, memberId) => {
    try {
      const res = await axios.put(`${API_URL}/api/books/return/${bookId}`, { targetUserId: memberId }, getAuthHeader());
      if (res.data.fineAdded > 0) {
        alert(`Book returned. A late fine of ₹${res.data.fineAdded} has been added to the member's account.`);
      }
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error returning book');
    }
  };

  const handleUpdateQuantity = async (id, currentQty) => {
    const qty = prompt('Enter the new total quantity for this book:', currentQty);
    if (qty !== null && !isNaN(qty) && Number(qty) > 0) {
      try {
        await axios.put(`${API_URL}/api/books/${id}`, { quantity: Number(qty) }, getAuthHeader());
        fetchBooks();
      } catch (err) {
        alert(err.response?.data?.message || 'Error updating quantity');
      }
    }
  };

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.genre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">Book Management</h1>
          <p className="text-gray-400">Manage your library inventory, assign books to members, and track returns.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="sky" className="w-auto px-6">
          <Plus size={18} />
          <span>{showForm ? 'Cancel' : 'Add New Book'}</span>
        </Button>
      </div>

      {/* Add Book Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <Card className="p-6 border-sky/30 shadow-[0_0_20px_rgba(53,167,255,0.1)]">
              <h3 className="text-lg font-bold text-white mb-4">Register New Book</h3>
              <form onSubmit={handleAddBook} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                <Input label="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} required placeholder="e.g. Dune" />
                <Input label="Author" value={newAuthor} onChange={e => setNewAuthor(e.target.value)} required placeholder="e.g. Frank Herbert" />
                <Input label="Genre" value={newGenre} onChange={e => setNewGenre(e.target.value)} required placeholder="e.g. Sci-Fi" />
                <Input label="Quantity" type="number" min="1" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} required />
                <div className="md:col-span-2">
                  <Input label="Cover Image URL (Optional)" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="https://..." />
                </div>
                <Button type="submit" variant="primary" className="h-[50px] w-full md:col-span-6 mt-2">Add to Library</Button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Books Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center gap-3 bg-white/5">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, author, or genre..."
            className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500 font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="p-12 text-center text-sky animate-pulse">Loading books...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-sm border-b border-white/10">
                  <th className="p-5 font-semibold">Cover</th>
                  <th className="p-5 font-semibold">Title</th>
                  <th className="p-5 font-semibold">Author</th>
                  <th className="p-5 font-semibold">Copies Available</th>
                  <th className="p-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <AnimatePresence>
                  {filteredBooks.map((book) => {
                    const availableCopies = book.quantity - book.checkedOutBy.length;
                    const isAvailable = availableCopies > 0;

                    return (
                      <React.Fragment key={book._id}>
                        <motion.tr
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group"
                        >
                          <td className="p-5">
                            <img
                              src={book.imageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200'}
                              alt={book.title}
                              className="w-10 h-14 object-cover rounded-md border border-white/10 shadow-sm"
                            />
                          </td>
                          <td className="p-5 text-white font-medium">
                            {book.title}
                            <span className="text-[10px] text-gray-500 ml-2 font-mono bg-white/5 px-2 py-1 rounded">({book.genre})</span>
                          </td>
                          <td className="p-5 text-gray-400">{book.author}</td>
                          <td className="p-5">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-inner ${isAvailable ? 'bg-primary/10 text-primary border-primary/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                {availableCopies} / {book.quantity} available
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(book._id, book.quantity)}
                                className="text-gray-500 hover:text-white p-1 rounded transition-colors"
                                title="Edit Total Quantity"
                              >
                                <Edit2 size={14} />
                              </button>
                              {book.checkedOutBy.length > 0 && (
                                <button
                                  onClick={() => setExpandedRowId(expandedRowId === book._id ? null : book._id)}
                                  className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold border bg-sky/10 text-sky border-sky/20 hover:bg-sky/20 hover:text-white transition-colors"
                                >
                                  <Users size={12} /> Holders ({book.checkedOutBy.length})
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-2 justify-end">
                              {/* Assign to Member */}
                              <div className="relative">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => isAvailable && setAssignBookId(assignBookId === book._id ? null : book._id)}
                                  disabled={!isAvailable}
                                  className={`px-3 py-1.5 flex items-center gap-2 rounded-lg transition-colors text-xs font-bold border ${isAvailable ? 'bg-sky/10 text-sky hover:bg-sky/20 border-sky/20' : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'}`}
                                  title={isAvailable ? 'Issue book to a member' : 'No copies available'}
                                >
                                  <Repeat size={14} /> Issue Book
                                </motion.button>

                                <AnimatePresence>
                                  {assignBookId === book._id && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                      className="absolute right-0 top-full mt-2 w-64 bg-[#0f172a] border border-white/20 shadow-2xl p-4 rounded-xl z-50 flex flex-col gap-3"
                                    >
                                      <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Issue To Member</h4>
                                        <button onClick={() => setAssignBookId(null)} className="text-gray-400 hover:text-white">
                                          <X size={14} />
                                        </button>
                                      </div>
                                      <select
                                        value={targetUserId}
                                        onChange={(e) => setTargetUserId(e.target.value)}
                                        className="w-full bg-[#1e293b] border border-white/10 text-white text-sm rounded-lg p-2 focus:border-sky outline-none transition-colors"
                                      >
                                        <option value="">-- Select Member --</option>
                                        {members.map(u => (
                                          <option key={u._id} value={u._id}>{u.name}</option>
                                        ))}
                                      </select>
                                      <Button
                                        onClick={() => handleIssue(book._id, targetUserId)}
                                        disabled={!targetUserId}
                                        variant="sky"
                                        className="w-full h-9 text-xs"
                                      >
                                        Confirm Issue
                                      </Button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              {/* Delete */}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(book._id)}
                                className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
                                title="Delete Book"
                              >
                                <Trash2 size={16} />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>

                        {/* Expandable Circulation Manifest */}
                        <AnimatePresence>
                          {expandedRowId === book._id && (
                            <motion.tr
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="bg-[#1e293b]/50 border-b border-white/5"
                            >
                              <td colSpan="5" className="px-16 py-4">
                                <h4 className="flex items-center gap-2 text-xs font-bold text-sky uppercase tracking-wider mb-3">
                                  <AlertCircle size={14} /> Currently Issued To
                                </h4>
                                <div className="flex flex-col gap-2">
                                  {book.checkedOutBy.map((checkout, idx) => {
                                    const isOverdue = new Date() > new Date(checkout.dueDate);
                                    const memberName = checkout.user?.name || 'Unknown Member';
                                    const memberId = checkout.user?._id || checkout.user;
                                    return (
                                      <div key={idx} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3 hover:bg-white/10 transition-colors group">
                                        <div className="flex items-center gap-4">
                                          <div className="w-8 h-8 rounded-full bg-sky/20 text-sky flex items-center justify-center font-bold text-xs uppercase">
                                            {memberName.substring(0, 2)}
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium text-white">{memberName}</p>
                                            <p className={`text-xs ${isOverdue ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                                              Due: {new Date(checkout.dueDate).toLocaleDateString('en-IN')}
                                              {isOverdue && ' ⚠ Overdue'}
                                            </p>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => handleReturn(book._id, memberId)}
                                          className="text-xs px-3 py-1.5 rounded bg-primary/20 hover:bg-primary hover:text-black border border-primary/40 font-bold text-primary transition-colors"
                                        >
                                          Mark Returned
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })}
                </AnimatePresence>

                {filteredBooks.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-12 text-center">
                      <div className="flex flex-col items-center text-gray-500 gap-3">
                        <Search size={32} className="opacity-50" />
                        <p className="font-medium">No books found.</p>
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

export default Books;
