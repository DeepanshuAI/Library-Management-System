import Book from '../models/Book.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Get all books
// @route   GET /api/books
// @access  Public or Private (depending on preference)
const getBooks = async (req, res) => {
  try {
    const books = await Book.find().populate('checkedOutBy.user', 'name email');
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new book
// @route   POST /api/books
// @access  Private
const addBook = async (req, res) => {
  try {
    const { title, author, genre, imageUrl, quantity } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      imageUrl: imageUrl || undefined,
      quantity: quantity || 1
    });

    const createdBook = await book.save();
    res.status(201).json(createdBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a book's quantity
// @route   PUT /api/books/:id
// @access  Private
const updateBook = async (req, res) => {
  try {
    const { quantity } = req.body;
    const book = await Book.findById(req.params.id);

    if (book) {
      if (quantity !== undefined) book.quantity = quantity;
      const updatedBook = await book.save();
      await updatedBook.populate('checkedOutBy.user', 'name email');
      res.json(updatedBook);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      await Book.deleteOne({ _id: book._id });
      res.json({ message: 'Book removed' });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Issue a book
// @route   PUT /api/books/issue/:id
// @access  Private
const issueBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      if (book.checkedOutBy.length >= book.quantity) {
        return res.status(400).json({ message: 'No copies available currently' });
      }

      // If Admin sets targetUserId manually, otherwise default to logged in user natively!
      const targetUserId = req.user.role === 'admin' && req.body.targetUserId 
        ? req.body.targetUserId 
        : req.user._id;

      // Check if user already holds a copy
      const alreadyHolds = book.checkedOutBy.find(c => c.user.toString() === targetUserId.toString());
      if (alreadyHolds) {
        return res.status(400).json({ message: 'Target explicitly already has a mapped checkout instance.' });
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      book.checkedOutBy.push({
        user: targetUserId,
        issueDate: new Date(),
        dueDate: dueDate
      });

      const updatedBook = await book.save();
      await updatedBook.populate('checkedOutBy.user', 'name email');
      res.json(updatedBook);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Return a book
// @route   PUT /api/books/return/:id
// @access  Private
const returnBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      const targetUserId = req.user.role === 'admin' && req.body.targetUserId 
        ? req.body.targetUserId 
        : req.user._id;

      const checkoutIndex = book.checkedOutBy.findIndex(c => c.user.toString() === targetUserId.toString());
      
      if (checkoutIndex === -1) {
        return res.status(400).json({ message: 'Valid checkout context uniquely missing natively.' });
      }

      const checkout = book.checkedOutBy[checkoutIndex];
      let fineAdded = 0;

      // Fine Calculation
      if (checkout.dueDate && new Date() > checkout.dueDate) {
        const diffTime = Math.abs(new Date() - checkout.dueDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        fineAdded = diffDays * 4; 

        const user = await User.findById(targetUserId);
        if (user) {
          user.finesAmount = (user.finesAmount || 0) + fineAdded;
          await user.save();

          // Create Notification
          await Notification.create({
            user: user._id,
            message: `You were fined ₹${fineAdded} for returning "${book.title}" ${diffDays} days late.`
          });
        }
      }

      // Remove the checkout from the array
      book.checkedOutBy.splice(checkoutIndex, 1);

      const updatedBook = await book.save();
      await updatedBook.populate('checkedOutBy.user', 'name email');
      res.json({ updatedBook, fineAdded });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getBooks, addBook, updateBook, deleteBook, issueBook, returnBook };
