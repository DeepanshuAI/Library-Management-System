import Book from '../models/Book.js';
import User from '../models/User.js';

// @desc    Get dashboard advanced statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    // Total unique book titles
    const totalBooks = await Book.countDocuments();
    const totalMembers = await User.countDocuments({ role: 'user' });

    // Count issued copies (sum of all checkedOutBy array lengths across all books)
    const issuedResult = await Book.aggregate([
      { $project: { checkedOutCount: { $size: '$checkedOutBy' }, quantity: 1 } },
      { $group: { _id: null, totalIssued: { $sum: '$checkedOutCount' }, totalQuantity: { $sum: '$quantity' } } }
    ]);
    const issuedBooks    = issuedResult[0]?.totalIssued   || 0;
    const availableBooks = (issuedResult[0]?.totalQuantity || 0) - issuedBooks;

    // Dynamic Genre Aggregation using MongoDB pipelines
    // Maps exactly to { name: "Sci-Fi", value: 12 } for Recharts UI
    const booksByGenre = await Book.aggregate([
      {
        $group: {
          _id: '$genre',
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          name: '$_id',
          value: 1,
          _id: 0,
        },
      },
      {
        $sort: { value: -1 } // Optional: highest genre first
      }
    ]);

    res.json({
      totalBooks,
      issuedBooks,
      availableBooks,
      booksByGenre,
      totalMembers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getDashboardStats };
