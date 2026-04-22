import express from 'express';
import {
  getBooks,
  addBook,
  updateBook,
  deleteBook,
  issueBook,
  returnBook,
} from '../controllers/bookController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getBooks).post(protect, addBook);
router.route('/issue/:id').put(protect, issueBook);
router.route('/return/:id').put(protect, returnBook);
router.route('/:id').put(protect, updateBook).delete(protect, deleteBook);

export default router;
